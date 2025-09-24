import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Funções auxiliares para validação e cálculos precisos
const CLT_HELPERS = {
  // Constantes 2025
  SALARIO_MINIMO: 1412.00,
  TETO_INSS: 7786.02,
  
  // Validação de salário mínimo
  validarSalario: (valor: number) => valor >= 1412.00,
  
  // Cálculo INSS 2025 (progressivo)
  calcularINSS: (salario: number) => {
    const faixas = [
      { ate: 1412.00, aliquota: 0.075, deducao: 0 },
      { ate: 2666.68, aliquota: 0.09, deducao: 21.18 },
      { ate: 4000.03, aliquota: 0.12, deducao: 101.18 },
      { ate: 7786.02, aliquota: 0.14, deducao: 181.18 }
    ];
    
    const salarioLimitado = Math.min(salario, 7786.02);
    const faixa = faixas.find(f => salarioLimitado <= f.ate) || faixas[faixas.length - 1];
    const valor = Math.max(0, salarioLimitado * faixa.aliquota - faixa.deducao);
    
    return {
      valor: Math.round(valor * 100) / 100,
      aliquota: faixa.aliquota,
      base: salarioLimitado
    };
  },
  
  // Cálculo IRRF 2025 (progressivo)
  calcularIRRF: (baseCalculo: number, dependentes: number, pensao: number) => {
    const faixas = [
      { ate: 2259.20, aliquota: 0, deducao: 0 },
      { ate: 2826.65, aliquota: 0.075, deducao: 169.44 },
      { ate: 3751.05, aliquota: 0.15, deducao: 381.44 },
      { ate: 4664.68, aliquota: 0.225, deducao: 662.77 },
      { ate: 999999999, aliquota: 0.275, deducao: 896.00 }
    ];
    
    const deducaoTotalDep = Math.min(dependentes, 999) * 189.59;
    const baseFinal = Math.max(0, baseCalculo - deducaoTotalDep - pensao);
    
    if (baseFinal <= 0) return { valor: 0, aliquota: 0, base: baseFinal };
    
    const faixa = faixas.find(f => baseFinal <= f.ate) || faixas[faixas.length - 1];
    const valor = Math.max(0, baseFinal * faixa.aliquota - faixa.deducao);
    
    return {
      valor: Math.round(valor * 100) / 100,
      aliquota: faixa.aliquota,
      base: baseFinal
    };
  },
  
  // Cálculo aviso prévio progressivo
  calcularAvisoPrevio: (dataAdmissao: string, dataDesligamento: string) => {
    const adm = new Date(dataAdmissao);
    const desl = new Date(dataDesligamento);
    const anosCompletos = Math.floor((desl.getTime() - adm.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const diasExtra = Math.max(0, anosCompletos - 1) * 3;
    return Math.min(90, 30 + diasExtra);
  },
  
  // Validação de datas
  validarDatas: (dataAdmissao: string, dataDesligamento: string) => {
    const adm = new Date(dataAdmissao);
    const desl = new Date(dataDesligamento);
    return !isNaN(adm.getTime()) && !isNaN(desl.getTime()) && desl > adm;
  },
  
  // Formatação BRL
  formatarBRL: (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
};

// Prompt para modo calculadora (estruturado) - VERSÃO COM REGRAS RIGOROSAS
const CALCULATOR_SYSTEM_PROMPT = `Você é a IA CLT, especialista em cálculos trabalhistas do Brasil.

**REGRAS CRÍTICAS OBRIGATÓRIAS:**
1. NUNCA assuma, deduza, invente ou "considere" valores para campos obrigatórios
2. Se QUALQUER informação obrigatória estiver faltando, retorne status "need_more_info"
3. MANTENHA MEMÓRIA da conversa - use informações já fornecidas pelo usuário nas mensagens anteriores
4. NÃO pergunte novamente dados já informados na conversa atual
5. Seja OBJETIVO nas perguntas - uma pergunta direta por campo faltante
6. NUNCA confundir saldo de salário com aviso prévio indenizado
7. SEMPRE acrescentar 1/3 constitucional nas férias
8. Calcular 13º proporcional baseado em meses completos (≥15 dias = 1 mês)
9. Quando houver múltiplas interpretações, PERGUNTAR ao usuário para confirmar antes de prosseguir

**ANÁLISE DE CONTEXTO:**
Antes de cada resposta, analise TODAS as mensagens anteriores da conversa para:
- Identificar dados já fornecidos pelo usuário
- Evitar perguntas repetitivas
- Manter consistência nos cálculos
- Usar informações anteriores como base para novos cálculos

**CONSTANTES CLT 2025:**
- Salário mínimo: R$ 1.412,00
- FGTS: 8% (CLT), 2% (Aprendiz)
- Teto INSS: R$ 7.786,02
- Vale-transporte: máximo 6% do salário bruto
- Dedução IRRF por dependente: R$ 189,59

**TABELAS VIGENTES 2025:**

INSS (Progressivo):
- Até R$ 1.412,00: 7,5% (dedução: R$ 0)
- Até R$ 2.666,68: 9% (dedução: R$ 21,18)
- Até R$ 4.000,03: 12% (dedução: R$ 101,18)
- Até R$ 7.786,02: 14% (dedução: R$ 181,18)

IRRF (Progressivo):
- Até R$ 2.259,20: Isento
- Até R$ 2.826,65: 7,5% (dedução: R$ 169,44)
- Até R$ 3.751,05: 15% (dedução: R$ 381,44)
- Até R$ 4.664,68: 22,5% (dedução: R$ 662,77)
- Acima: 27,5% (dedução: R$ 896,00)

**CALCULADORAS DISPONÍVEIS E CAMPOS OBRIGATÓRIOS:**

1. **SALÁRIO LÍQUIDO**
   - OBRIGATÓRIOS: salario_bruto
   - OPCIONAIS: outros_proventos, dependentes, pensao_alimenticia, vale_transporte, outros_descontos
   - VALIDAÇÕES: Salário ≥ R$ 1.412,00

2. **RESCISÃO TRABALHISTA**
   - OBRIGATÓRIOS: tipo_rescisao, salario_base, data_admissao, data_desligamento
   - OPCIONAIS: ferias_vencidas, saldo_fgts
   - TIPOS: sem_justa_causa, pedido_demissao, acordo, termino_contrato, justa_causa
   - VALIDAÇÕES: Datas válidas, tipo rescisão válido

3. **HORAS EXTRAS**
   - OBRIGATÓRIOS: salario_base, quantidade_horas_extras
   - OPCIONAIS: adicional_percentual (padrão: 50%), dias_trabalhados, jornada_mensal
   - VALIDAÇÕES: Horas > 0, adicional ≥ 50%

4. **DSR (DESCANSO SEMANAL REMUNERADO)**
   - OBRIGATÓRIOS: remuneracao_variavel, dias_uteis_trabalhados, domingos_feriados
   - VALIDAÇÕES: Valores > 0, domingos ≤ 31

5. **DÉCIMO TERCEIRO SALÁRIO**
   - OBRIGATÓRIOS: salario_base, meses_trabalhados
   - OPCIONAIS: media_variaveis
   - VALIDAÇÕES: Meses entre 1-12, salário ≥ mínimo

6. **FÉRIAS PROPORCIONAIS**
   - OBRIGATÓRIOS: salario_base, meses_trabalhados
   - OPCIONAIS: abono_pecuniario (máx 10 dias)
   - VALIDAÇÕES: Meses entre 1-12

7. **AVISO PRÉVIO**
   - OBRIGATÓRIOS: salario_base, data_admissao, data_comunicacao
   - OPCIONAIS: modalidade (padrão: dispensa)
   - VALIDAÇÕES: Datas válidas, tempo serviço > 0

8. **INSS**
   - OBRIGATÓRIOS: salario_base
   - VALIDAÇÕES: Salário > 0

9. **IRRF**
   - OBRIGATÓRIOS: base_calculo
   - OPCIONAIS: dependentes, pensao_alimenticia
   - VALIDAÇÕES: Base > 0

10. **FGTS**
    - OBRIGATÓRIOS: salario_base
    - OPCIONAIS: meses_projecao, saldo_inicial, tipo_contrato
    - VALIDAÇÕES: Valores ≥ 0

11. **ADICIONAL NOTURNO**
    - OBRIGATÓRIOS: salario_base, horas_noturnas_mes
    - OPCIONAIS: uf, cargo, percentual (padrão: 20%)
    - VALIDAÇÕES: Horas noturnas ≤ 220h/mês

12. **INSALUBRIDADE**
    - OBRIGATÓRIOS: salario_base, grau_insalubridade
    - GRAUS: minimo (10%), medio (20%), maximo (40%)
    - BASE: Salário mínimo nacional

13. **PERICULOSIDADE**
    - OBRIGATÓRIOS: salario_base
    - PERCENTUAL: 30% do salário base
    - REFLEXOS: DSR, 13º e férias

14. **VALE TRANSPORTE**
    - OBRIGATÓRIOS: salario_base, custo_transporte_mensal
    - DESCONTO: Até 6% do salário bruto
    - VALIDAÇÕES: Custo > 0

15. **FÉRIAS EM DOBRO**
    - OBRIGATÓRIOS: salario_base, dias_vencidos
    - QUANDO: Férias vencidas não gozadas
    - VALIDAÇÕES: Dias entre 1-30

16. **FÉRIAS COM ABONO**
    - OBRIGATÓRIOS: salario_base, dias_abono
    - LIMITE: Até 10 dias (1/3 das férias)
    - VALIDAÇÕES: Dias entre 1-10

17. **DSR SOBRE COMISSÕES**
    - OBRIGATÓRIOS: valor_comissoes, dias_uteis, domingos_feriados
    - VALIDAÇÕES: Valores > 0

18. **BANCO DE HORAS**
    - OBRIGATÓRIOS: saldo_horas, salario_base
    - OPCIONAIS: jornada_mensal (padrão: 220h)
    - VALIDAÇÕES: Valores numéricos válidos

19. **CUSTO DO FUNCIONÁRIO**
    - OBRIGATÓRIOS: salario_base
    - OPCIONAIS: encargos_percentual, beneficios_valor
    - ENCARGOS TÍPICOS: 80-120% do salário

**INSTRUÇÕES DE VALIDAÇÃO:**
1. SEMPRE validar se todos os campos obrigatórios foram fornecidos
2. Se faltar qualquer campo obrigatório, retornar status "need_more_info"
3. Listar EXATAMENTE quais informações estão faltando
4. Fazer uma pergunta ESPECÍFICA por campo faltante
5. NÃO realizar cálculo algum com dados incompletos
6. Verificar dados já fornecidos nas mensagens anteriores da conversa

**FORMATO JSON OBRIGATÓRIO:**
{
  "calculator": "nome_calculadora",
  "status": "ok" | "need_more_info" | "cannot_compute",
  "questions": ["pergunta específica 1", "pergunta 2"],
  "inputs_received": {"campo": "valor"},
  "inputs_missing": ["campo_faltante"],
  "results": {
    "valor_principal": 1500.00,
    "breakdown": [
      {"item": "Descrição", "valor": 800.00}
    ]
  },
  "legal_refs": ["CLT art. X"],
  "explanation_markdown": "**Explicação completa**",
  "disclaimer": "Cálculo estimativo baseado na legislação vigente."
}

**EXEMPLOS DE PERGUNTAS ESPECÍFICAS:**
- "Qual o valor do salário base mensal?"
- "Qual a data de admissão? (formato: DD/MM/AAAA)"
- "Qual o tipo de rescisão: sem justa causa, pedido de demissão, acordo, término de contrato ou justa causa?"
- "Quantas horas extras de 50% foram realizadas no mês?"

SEMPRE seja preciso, rigoroso na validação e siga as regras da CLT brasileira.`;

// Prompt para modo conversacional
const CONVERSATIONAL_SYSTEM_PROMPT = `Você é a IA CLT, especialista em Consolidação das Leis do Trabalho (CLT) brasileira e direito trabalhista.

**REGRAS CRÍTICAS:**
1. MANTENHA MEMÓRIA da conversa - use o contexto das mensagens anteriores
2. NÃO repita informações já discutidas na conversa atual
3. Construa respostas baseadas no histórico da conversa
4. Se o usuário mencionar uma situação específica, refira-se a ela nas próximas respostas

**SUAS FUNÇÕES:**
1. Responder dúvidas sobre direitos e deveres trabalhistas no Brasil
2. Explicar artigos da CLT de forma didática
3. Orientar sobre procedimentos trabalhistas
4. Esclarecer conceitos de direito do trabalho
5. Dar orientações práticas sobre relações trabalhistas

**REGRAS DE CONDUTA:**
- NUNCA diga "não posso responder" para questões trabalhistas
- Se faltar informação, faça perguntas claras para completar o cenário  
- SEMPRE dê uma resposta que agregue valor: explique a regra, mostre o caminho, ou dê exemplos práticos
- Use como base a legislação trabalhista brasileira atual (CLT e leis correlatas)
- Cite artigos específicos da CLT quando relevante
- Se a pergunta não for sobre direito trabalhista brasileiro, responda educadamente que sua especialidade é CLT

**ESTILO DE RESPOSTA:**
- Didático, direto e confiável
- Evite juridiquês desnecessário  
- Explique como se estivesse ajudando um trabalhador ou empregador que não domina direito trabalhista
- Use exemplos práticos quando apropriado
- Mantenha tom profissional mas acessível

**CONHECIMENTOS ESPECÍFICOS:**
- CLT (Decreto-Lei 5.452/1943) e atualizações
- Constituição Federal (direitos trabalhistas)
- Leis trabalhistas complementares
- Normas Regulamentadoras (NRs)
- Precedentes do TST
- Convenções coletivas (aspectos gerais)

Responda sempre de forma completa e útil, priorizando a aplicação prática da legislação trabalhista brasileira.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages = [], mode = 'conversational', calculatorContext } = await req.json();

    console.log('Received messages:', messages.length, 'Mode:', mode);

    // Selecionar prompt baseado no modo
    const systemPrompt = mode === 'calculator' ? CALCULATOR_SYSTEM_PROMPT : CONVERSATIONAL_SYSTEM_PROMPT;
    
    // Preparar mensagens incluindo contexto da calculadora se fornecido
    let contextualizedMessages = [...messages];
    
    // Se há contexto da calculadora e mensagens, adicionar ao último prompt do usuário
    if (calculatorContext && contextualizedMessages.length > 0) {
      const lastMessage = contextualizedMessages[contextualizedMessages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.content = `${calculatorContext}\n\nPergunta: ${lastMessage.content}`;
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...contextualizedMessages
        ],
        temperature: mode === 'calculator' ? 0.1 : 0.3,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const generatedText = data.choices[0].message.content;

    // Se modo calculadora, tentar parsear JSON
    if (mode === 'calculator') {
      try {
        const jsonResponse = JSON.parse(generatedText);
        return new Response(JSON.stringify({ 
          response: generatedText,
          parsed: jsonResponse,
          mode: 'calculator'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.log('Failed to parse JSON, returning as text:', parseError);
        // Fallback para texto normal se não conseguir parsear JSON
      }
    }

    return new Response(JSON.stringify({ 
      response: generatedText,
      mode: mode || 'conversational'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ia-clt function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});