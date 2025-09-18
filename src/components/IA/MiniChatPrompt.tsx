import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Loader2, MessageCircle, Sparkles } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
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
    setOpen(false);
    navigate('/ia-clt');
  };

  if (!canUseIA) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">IA Especialista em CLT</h4>
              <p className="text-xs text-muted-foreground">
                Tire dúvidas sobre esta calculadora
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/ia-clt')}
              className="text-xs"
            >
              Fazer Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              IA Especialista em CLT
            </h4>
            <p className="text-xs text-muted-foreground">
              Tire dúvidas sobre {calculatorName.toLowerCase()}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <MessageCircle className="w-3 h-3 mr-1" />
                Perguntar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  IA Especialista - {calculatorName}
                </DialogTitle>
                <DialogDescription>
                  Faça uma pergunta específica sobre {calculatorName.toLowerCase()} e direito trabalhista
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ex: Como calcular ${calculatorName.toLowerCase()} para funcionário que trabalha...`}
                    className="min-h-[80px]"
                    disabled={loading}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {input.length}/500 caracteres
                    </span>
                    <Button
                      onClick={handleSendQuestion}
                      disabled={!input.trim() || loading || input.length > 500}
                      size="sm"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Send className="w-4 h-4 mr-1" />
                      )}
                      Perguntar
                    </Button>
                  </div>
                </div>

                {response && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                      <Bot className="w-4 h-4 text-primary" />
                      Resposta da IA:
                    </h5>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleFullChat}
                    className="flex-1"
                  >
                    Chat Completo
                  </Button>
                  {response && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setInput('');
                        setResponse('');
                      }}
                      size="sm"
                    >
                      Nova Pergunta
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};