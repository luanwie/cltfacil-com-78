import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é o especialista em cálculos trabalhistas do CLT Fácil. Sua função é identificar qual calculadora o usuário precisa e executar o cálculo corretamente.

CALCULADORAS DISPONÍVEIS NO CLT FÁCIL:

1. **Adicional Noturno** - Campos: salário_base, horas_noturnas_mes, UF, cargo
   - Percentual: 20% (geral), pode variar por categoria/UF
   - Inclui reflexos em DSR, 13º e férias

2. **Aviso Prévio** - Campos: salário_base, data_admissao, data_demissao, tipo_aviso
   - Fórmula: 30 dias + 3 dias por ano trabalhado (máx 90 dias)

3. **Banco de Horas** - Campos: saldo_horas, salário_base, carga_horaria_mensal
   - Conversão de horas em valor monetário

4. **Custo do Funcionário** - Campos: salário_base, encargos_sociais, beneficios
   - Total de custos para o empregador

5. **DSR** - Campos: remuneracao_variavel, dias_uteis_trabalhados, domingos_feriados
   - Fórmula: (remuneração variável / dias úteis) × domingos e feriados

6. **DSR sobre Comissões** - Campos: valor_comissoes, periodo, dias_uteis, domingos_feriados
   - DSR específico para comissionados

7. **Décimo Terceiro** - Campos: salário_base, meses_trabalhados_ano
   - Fórmula: salário_base × meses trabalhados / 12

8. **FGTS** - Campos: salário_base, tempo_servico, tipo_contrato
   - 8% CLT, 2% aprendiz, inclui multa rescisória

9. **Férias com Abono** - Campos: salário_base, dias_ferias, valor_abono
   - Férias + 1/3 + abono pecuniário

10. **Férias em Dobro** - Campos: salário_base, dias_vencimento
    - Quando férias vencem sem gozo

11. **Férias Proporcionais** - Campos: salário_base, meses_trabalhados, abono_pecuniario
    - Proporcional ao tempo trabalhado + 1/3

12. **Horas Extras** - Campos: salário_base, horas_extras_50%, horas_extras_100%, dias_trabalhados
    - 50% (dia útil), 100% (domingo/feriado), inclui reflexos

13. **INSS** - Campos: salário_base, ano_vigencia
    - Tabela progressiva INSS vigente

14. **IRRF** - Campos: salário_base, dependentes, deducoes, ano_vigencia
    - Tabela progressiva IRRF vigente

15. **Insalubridade** - Campos: salário_base, grau_insalubridade, base_calculo
    - Mínimo (10%), Médio (20%), Máximo (40%)

16. **Periculosidade** - Campos: salário_base, percentual
    - Geralmente 30% do salário base

17. **Rescisão** - Campos: tipo_rescisao, salário_base, data_admissao, data_demissao, ferias_vencidas, aviso_previo
    - Verbas conforme tipo de rescisão

18. **Salário Líquido** - Campos: salário_bruto, deducoes_inss, deducoes_irrf, outros_descontos
    - Salário bruto menos todos os descontos

19. **Vale Transporte** - Campos: salário_base, custo_transporte_mensal
    - Desconto máximo 6% do salário

INSTRUÇÕES RÍGIDAS:
1. SEMPRE responder em JSON no formato exato definido abaixo
2. Identificar qual calculadora o usuário quer usar baseado na solicitação
3. Se faltar dados obrigatórios, status="need_more_info" e listar perguntas específicas
4. Se tiver todos os dados, status="ok" e executar o cálculo usando as fórmulas do CLT Fácil
5. Usar valores brasileiros (R$) com duas casas decimais
6. Incluir explicação didática de como chegou no resultado
7. Nunca inventar valores - sempre pedir dados faltantes

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "calculator": "nome_da_calculadora",
  "status": "ok" | "need_more_info" | "cannot_compute",
  "questions": ["pergunta específica 1", "pergunta específica 2"],
  "inputs_received": {"campo": "valor normalizado"},
  "inputs_missing": ["campo_faltante_1", "campo_faltante_2"],
  "assumptions": ["hipótese assumida 1"],
  "results": {"valor_principal": 1500.00, "valor_secundario": 200.00},
  "breakdown": [{"label": "Item do cálculo", "value": 100.00}],
  "legal_refs": ["CLT art. 58", "Lei 123/2006"],
  "explanation_markdown": "**Explicação clara:** Como chegamos neste resultado...",
  "disclaimer": "Resultado estimado. Consulte um profissional para casos específicos."
}

EXEMPLOS DE USO:
- "Calcular adicional noturno para vendedor no RS, salário 3000, 40 horas noturnas"
- "Quanto vou gastar para demitir funcionário que ganha 2500 há 2 anos"
- "Calcular horas extras: salário 2800, 20 horas extras 50%, 5 horas 100%"

SEMPRE mantenha o foco em ser preciso, didático e seguir as regras do CLT e das calculadoras do CLT Fácil.`;

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
      // Modo conversacional tradicional para compatibilidade
      systemPrompt = `Você é um especialista em Consolidação das Leis do Trabalho (CLT) brasileira. 
      Você deve responder apenas perguntas relacionadas ao direito trabalhista brasileiro.
      Seja preciso, didático e cite artigos da CLT quando relevante.
      Se a pergunta não for sobre CLT, responda educadamente que só pode ajudar com questões trabalhistas.`;
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