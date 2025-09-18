import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Loader2, Sparkles, ArrowRight } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canUseIA, incrementIAUsage } = useIAUsage();

  const handleSendQuestion = async () => {
    if (!input.trim() || loading || !canUseIA) return;

    setLoading(true);
    setResponse('');

    try {
      await incrementIAUsage();

      const contextualPrompt = calculatorContext 
        ? `Contexto: O usuário está usando a calculadora de ${calculatorName}. ${calculatorContext}\n\nPergunta: ${input}`
        : `Contexto: O usuário está usando a calculadora de ${calculatorName}.\n\nPergunta: ${input}`;

      const { data, error } = await supabase.functions.invoke('ia-clt', {
        body: { prompt: contextualPrompt }
      });

      if (error) throw error;

      setResponse(data.response);
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
            <Bot className="w-5 h-5 text-primary" />
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
          Tire dúvidas sobre {calculatorName.toLowerCase()} e direito trabalhista
        </p>

        <div className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ex: Como calcular ${calculatorName.toLowerCase()} para funcionário que...`}
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
                Perguntando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Perguntar à IA
              </>
            )}
          </Button>
        </div>

        {response && (
          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="bg-background/50 p-3 rounded-lg border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Resposta da IA:</span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {response}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput('');
                  setResponse('');
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

        {!response && (
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