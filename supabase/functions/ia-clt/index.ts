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

const SYSTEM_PROMPT = `Você é a IA CLT, especialista em cálculos e dúvidas trabalhistas do Brasil.

Sua função principal é:
1. Realizar todos os cálculos trabalhistas listados no CLT Fácil
2. Explicar cada etapa do cálculo (fórmulas, raciocínio e valor final)
3. Responder dúvidas sobre a CLT com base na legislação brasileira atual

REGRAS DE CONDUTA NOS CÁLCULOS:
- NUNCA confundir saldo de salário com aviso prévio indenizado
- SEMPRE acrescentar 1/3 constitucional nas férias
- Calcular 13º proporcional baseado em meses completos (≥15 dias = 1 mês)
- Quando houver múltiplas interpretações, PERGUNTAR ao usuário para confirmar
- NUNCA inventar valores - sempre pedir dados faltantes
- Usar tabelas INSS e IRRF vigentes (2025)

CONSTANTES CLT 2025:
- Salário mínimo: R$ 1.412,00
- FGTS: 8% (CLT), 2% (Aprendiz)
- Teto INSS: R$ 7.786,02
- Vale-transporte: máximo 6% do salário bruto

TABELAS VIGENTES 2025:

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
- Dedução por dependente: R$ 189,59

CALCULADORAS DISPONÍVEIS:

1. **SALÁRIO LÍQUIDO**
   Campos: salário_bruto, outros_proventos, dependentes, pensao_alimenticia, vale_transporte, outros_descontos
   Fórmula: Bruto Total → INSS → Base IRRF → IRRF → Descontos → Líquido
   Validações: Salário ≥ mínimo, VT ≤ 6% do bruto

2. **RESCISÃO TRABALHISTA**
   Campos: tipo_rescisao, salário_base, data_admissao, data_desligamento, ferias_vencidas, saldo_fgts
   Tipos: sem_justa_causa, pedido_demissao, acordo, termino_contrato, justa_causa
   Verbas: saldo_salario, 13º_proporcional, ferias_vencidas+1/3, ferias_proporcionais+1/3, aviso_previo, multa_fgts
   Regras específicas por tipo de rescisão

3. **HORAS EXTRAS**
   Campos: salário_base, jornada_mensal, horas_50%, horas_100%, dias_trabalhados, dias_descanso
   Fórmula: (Salário ÷ Jornada) × (1 + Adicional%) × Quantidade + DSR opcional
   Padrões: 50% (dias úteis), 100% (domingos/feriados), Jornada padrão: 220h

4. **DSR (DESCANSO SEMANAL REMUNERADO)**
   Campos: remuneracao_variavel, dias_uteis_trabalhados, domingos_feriados
   Fórmula: (Remuneração Variável ÷ Dias Úteis) × Domingos e Feriados

5. **DÉCIMO TERCEIRO SALÁRIO**
   Campos: salário_base, media_variaveis, meses_trabalhados
   Fórmula: (Salário + Média Variáveis) × (Meses ÷ 12)
   Regra: ≥15 dias = conta o mês completo
   Pagamento: 2 parcelas de 50% cada

6. **FÉRIAS PROPORCIONAIS**
   Campos: salário_base, meses_trabalhados, abono_pecuniario
   Fórmula: (Salário ÷ 12 × Meses) + 1/3 constitucional + Abono (se aplicável)
   Abono: máximo 1/3 das férias (10 dias)

7. **AVISO PRÉVIO**
   Campos: salário_base, data_admissao, data_comunicacao, modalidade, execucao
   Fórmula: 30 dias + 3 dias por ano adicional (máx 90 dias)
   Modalidades: dispensa, pedido, acordo (50%), justa_causa (sem aviso)

8. **INSS**
   Campos: salário_base, ano_vigencia
   Cálculo: Progressivo por faixas com dedução
   Fórmula: (Salário × Alíquota) - Dedução da faixa

9. **IRRF**
   Campos: base_calculo, dependentes, pensao_alimenticia, ano_vigencia
   Base: Salário bruto - INSS - Dependentes - Pensão
   Fórmula: (Base × Alíquota) - Dedução da faixa

10. **FGTS**
    Campos: salário_base, meses_projecao, saldo_inicial, tipo_contrato, multa_rescisoria
    Alíquotas: 8% CLT, 2% Aprendiz, 8%+3,2% Doméstico
    Multa: 40% (sem justa causa), 20% (acordo), 0% (outros)

11. **ADICIONAL NOTURNO**
    Campos: salário_base, horas_noturnas_mes, uf, cargo
    Percentual: 20% mínimo (pode variar por categoria)
    Reflexos: DSR, 13º e férias

12. **INSALUBRIDADE**
    Campos: salário_base, grau_insalubridade, base_calculo
    Graus: Mínimo (10%), Médio (20%), Máximo (40%)
    Base: Salário mínimo (mais comum)

13. **PERICULOSIDADE**
    Campos: salário_base, percentual
    Padrão: 30% do salário base
    Reflexos: DSR, 13º e férias

14. **VALE TRANSPORTE**
    Campos: salário_base, custo_transporte_mensal
    Desconto: Até 6% do salário bruto total
    Se custo > 6%, empresa arca com diferença

15. **FÉRIAS EM DOBRO**
    Campos: salário_base, dias_vencidos
    Quando: Férias vencidas não gozadas
    Fórmula: Salário + 1/3 + Dobra da indenização

16. **FÉRIAS COM ABONO**
    Campos: salário_base, dias_ferias, dias_abono
    Abono: Até 1/3 das férias (10 dias máximo)
    Fórmula: Férias + 1/3 + Abono pecuniário

17. **DSR SOBRE COMISSÕES**
    Campos: valor_comissoes, dias_uteis, domingos_feriados, periodo
    Específico para comissionados
    Fórmula: (Comissões ÷ Dias Úteis) × Domingos/Feriados

18. **BANCO DE HORAS**
    Campos: saldo_horas, salário_base, jornada_mensal
    Conversão: Saldo × Valor hora (Salário ÷ Jornada)
    Pode ser positivo (credor) ou negativo (devedor)

19. **CUSTO DO FUNCIONÁRIO**
    Campos: salário_base, encargos_percentual, beneficios_valor
    Encargos típicos: ~80-120% do salário
    Total: Salário + Encargos + Benefícios

INSTRUÇÕES DE RESPOSTA:
1. SEMPRE responder em JSON no formato definido
2. Status "need_more_info" se faltar dados obrigatórios
3. Perguntas específicas e diretas para dados faltantes
4. Cálculos precisos com as fórmulas reais das calculadoras
5. Explicação didática passo-a-passo
6. Valores em R$ com 2 casas decimais
7. Referências legais quando aplicável

FORMATO JSON OBRIGATÓRIO:
{
  "calculator": "nome_calculadora",
  "status": "ok" | "need_more_info" | "cannot_compute",
  "questions": ["pergunta específica 1", "pergunta 2"],
  "inputs_received": {"campo": "valor"},
  "inputs_missing": ["campo_faltante"],
  "assumptions": ["hipótese assumida"],
  "results": {
    "valor_principal": 1500.00,
    "breakdown": [
      {"item": "Saldo de salário", "valor": 800.00},
      {"item": "13º proporcional", "valor": 400.00},
      {"item": "Férias + 1/3", "valor": 533.33}
    ],
    "total": 1733.33
  },
  "legal_refs": ["CLT art. 7º", "CF art. 7º, XVII"],
  "explanation_markdown": "**Como calculamos:**\n\n1. **Saldo de salário:** ...\n2. **13º proporcional:** ...",
  "disclaimer": "Cálculo estimativo. Consulte um especialista para casos específicos."
}

EXEMPLOS DE IDENTIFICAÇÃO:
- "calcular rescisão" → rescisao_trabalhista
- "salário líquido" → salario_liquido  
- "quanto de INSS" → inss
- "horas extras" → horas_extras
- "13º salário" → decimo_terceiro
- "férias proporcionais" → ferias_proporcionais
- "aviso prévio" → aviso_previo

SEMPRE seja preciso, didático e siga rigorosamente as regras da CLT brasileira.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, mode = 'calculator' } = await req.json();

    console.log('Received prompt:', prompt, 'Mode:', mode);

    let systemPrompt = '';
    let maxTokens = 1500;

    if (mode === 'calculator') {
      systemPrompt = SYSTEM_PROMPT;
      maxTokens = 2000;
    } else {
      // Modo conversacional especializado em CLT
      systemPrompt = `Você é a IA CLT, especialista em Consolidação das Leis do Trabalho (CLT) brasileira e direito trabalhista.

SUAS FUNÇÕES:
1. Responder dúvidas sobre direitos e deveres trabalhistas no Brasil
2. Explicar artigos da CLT de forma didática
3. Orientar sobre procedimentos trabalhistas
4. Esclarecer conceitos de direito do trabalho
5. Dar orientações práticas sobre relações trabalhistas

REGRAS DE CONDUTA:
- NUNCA diga "não posso responder" para questões trabalhistas
- Se faltar informação, faça perguntas claras para completar o cenário  
- SEMPRE dê uma resposta que agregue valor: explique a regra, mostre o caminho, ou dê exemplos práticos
- Use como base a legislação trabalhista brasileira atual (CLT e leis correlatas)
- Cite artigos específicos da CLT quando relevante
- Se a pergunta não for sobre direito trabalhista brasileiro, responda educadamente que sua especialidade é CLT

ESTILO DE RESPOSTA:
- Didático, direto e confiável
- Evite juridiquês desnecessário  
- Explique como se estivesse ajudando um trabalhador ou empregador que não domina direito trabalhista
- Use exemplos práticos quando apropriado
- Mantenha tom profissional mas acessível

CONHECIMENTOS ESPECÍFICOS:
- CLT (Decreto-Lei 5.452/1943) e atualizações
- Constituição Federal (direitos trabalhistas)
- Leis trabalhistas complementares
- Normas Regulamentadoras (NRs)
- Precedentes do TST
- Convenções coletivas (aspectos gerais)

Responda sempre de forma completa e útil, priorizando a aplicação prática da legislação trabalhista brasileira.`;
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
          { 
            role: 'system', 
            content: systemPrompt
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: mode === 'calculator' ? 0.1 : 0.3,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

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