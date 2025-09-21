import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Loader2, Sparkles, ArrowRight, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useIAUsage } from '@/hooks/useIAUsage';

interface MiniChatPromptProps {
  calculatorName: string;
  calculatorContext?: string;
}

export const MiniChatPrompt = ({ calculatorName, calculatorContext }: MiniChatPromptProps) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [parsedResponse, setParsedResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canUseIA, incrementIAUsage } = useIAUsage();

  const handleSendQuestion = async () => {
    if (!input.trim() || loading || !canUseIA) return;

    setLoading(true);
    setResponse('');
    setParsedResponse(null);

    try {
      await incrementIAUsage();

      // Usar modo calculadora com contexto específico
      const contextualPrompt = calculatorContext 
        ? `Contexto: O usuário está usando a calculadora de ${calculatorName}. ${calculatorContext}\n\nPergunta/Solicitação: ${input}`
        : `Contexto: O usuário está usando a calculadora de ${calculatorName}.\n\nPergunta/Solicitação: ${input}`;

      const { data, error } = await supabase.functions.invoke('ia-clt', {
        body: { 
          prompt: contextualPrompt,
          mode: 'calculator' // Usar o novo modo estruturado
        }
      });

      if (error) throw error;

      setResponse(data.response);
      setParsedResponse(data.parsed);
    } catch (error) {
      console.error('Error sending question:', error);
      toast.error('Erro ao enviar pergunta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFullChat = () => {
    navigate('/ia-clt');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const renderCalculatorResponse = (parsed: any) => {
    if (!parsed) return null;

    return (
      <div className="space-y-3 mt-3">
        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="font-medium">
            {parsed.calculator?.replace('_', ' ')?.toUpperCase() || 'Cálculo'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            parsed.status === 'ok' ? 'bg-green-100 text-green-800' :
            parsed.status === 'need_more_info' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {parsed.status === 'ok' ? 'OK' :
             parsed.status === 'need_more_info' ? 'Precisa dados' : 'Erro'}
          </span>
        </div>

        {/* Perguntas faltantes */}
        {parsed.questions?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <h5 className="font-medium text-xs mb-1">Informações necessárias:</h5>
            <ul className="space-y-1 text-xs">
              {parsed.questions.slice(0, 3).map((q: string, i: number) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>{q}</span>
                </li>
              ))}
              {parsed.questions.length > 3 && (
                <li className="text-yellow-600 text-xs">
                  ... e mais {parsed.questions.length - 3} pergunta(s)
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Resultados principais */}
        {parsed.results && Object.keys(parsed.results).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <h5 className="font-medium text-xs mb-1">Resultados:</h5>
            <div className="space-y-1 text-xs">
              {Object.entries(parsed.results).slice(0, 4).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">
                    {typeof value === 'number' && (key.includes('valor') || key.includes('total')) ? 
                      `R$ ${value.toFixed(2).replace('.', ',')}` : 
                      typeof value === 'number' ? value.toFixed(2) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breakdown resumido */}
        {parsed.breakdown?.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <h5 className="font-medium text-xs mb-1">Detalhes:</h5>
            <div className="space-y-1 text-xs">
              {parsed.breakdown.slice(0, 3).map((item: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{item.label}:</span>
                  <span className="font-medium">
                    {typeof item.value === 'number' ? 
                      `R$ ${item.value.toFixed(2).replace('.', ',')}` : item.value}
                  </span>
                </div>
              ))}
              {parsed.breakdown.length > 3 && (
                <div className="text-blue-600 text-xs">
                  ... e mais {parsed.breakdown.length - 3} item(s)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Referências legais */}
        {parsed.legal_refs?.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <h5 className="font-medium text-xs mb-1">Base legal:</h5>
            <div className="flex flex-wrap gap-1 text-xs">
              {parsed.legal_refs.slice(0, 3).map((ref: string, i: number) => (
                <span key={i} className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer compacto */}
        {parsed.disclaimer && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2">
            <p className="text-xs text-orange-800">{parsed.disclaimer}</p>
          </div>
        )}
      </div>
    );
  };

  if (!canUseIA) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 sticky top-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            IA Especialista CLT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tire dúvidas sobre {calculatorName.toLowerCase()} e direito trabalhista com nossa IA especializada.
          </p>
          <Button 
            onClick={() => navigate('/ia-clt')}
            className="w-full"
            variant="outline"
          >
            Fazer Login para Usar IA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 sticky top-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              IA Especialista CLT
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Calcule ou tire dúvidas sobre {calculatorName.toLowerCase()}
        </p>

        <div className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ex: Calcular ${calculatorName.toLowerCase()} para salário 3000, trabalhador em SP...`}
            className="min-h-[80px] max-h-[120px] resize-none text-sm"
            disabled={loading}
          />
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Shift + Enter para quebrar linha</span>
            <span>{input.length}/500</span>
          </div>

          <Button
            onClick={handleSendQuestion}
            disabled={!input.trim() || loading || input.length > 500}
            className="w-full"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calcular/Perguntar
              </>
            )}
          </Button>
        </div>

        {(response || parsedResponse) && (
          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="bg-background/50 p-3 rounded-lg border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Resposta da IA:</span>
              </div>
              
              {/* Explicação textual */}
              {parsedResponse?.explanation_markdown ? (
                <div className="text-sm leading-relaxed mb-2 text-foreground/90">
                  {parsedResponse.explanation_markdown}
                </div>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {response}
                </div>
              )}

              {/* Resposta estruturada */}
              {parsedResponse && renderCalculatorResponse(parsedResponse)}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput('');
                  setResponse('');
                  setParsedResponse(null);
                }}
                className="flex-1"
              >
                Nova Pergunta
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleFullChat}
                className="flex-1"
              >
                Chat Completo
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {!response && !parsedResponse && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleFullChat}
            className="w-full text-primary hover:text-primary hover:bg-primary/10"
          >
            Abrir Chat Completo
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};