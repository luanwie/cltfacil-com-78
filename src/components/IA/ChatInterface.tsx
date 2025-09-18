import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, Bot, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onUsageIncrement: () => Promise<void>;
  canUse: boolean;
}

export const ChatInterface = ({ onUsageIncrement, canUse }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || loading || !canUse) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      await onUsageIncrement();

      const { data, error } = await supabase.functions.invoke('ia-clt', {
        body: { prompt: input }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Chat Messages Container */}
      <div className="relative">
        <Card className="min-h-[500px] max-h-[700px] border-0 shadow-elevated bg-gradient-subtle">
          <div className="p-6 h-full overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[450px] text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                  <div className="relative bg-primary/10 p-6 rounded-full">
                    <Bot className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <div className="space-y-3 max-w-md">
                  <h3 className="text-xl font-semibold text-foreground">
                    Assistente Jurídico Especializado
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Tire suas dúvidas sobre direito trabalhista brasileiro com nossa IA especializada em CLT
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <Avatar className="w-10 h-10 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] relative ${
                        message.role === 'assistant'
                          ? 'bg-card border border-border/50 text-card-foreground shadow-card'
                          : 'bg-primary text-primary-foreground shadow-elevated'
                      } rounded-2xl px-4 py-3 transition-all duration-medium`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                        {message.content}
                      </p>
                      <span className="text-xs opacity-60 mt-2 block">
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <Avatar className="w-10 h-10 border-2 border-secondary/50">
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-4 justify-start animate-in fade-in-0 slide-in-from-bottom-2">
                    <div className="flex-shrink-0">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl px-4 py-3 shadow-card">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Input Area */}
      <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={canUse ? "Faça sua pergunta sobre direito trabalhista..." : "Faça login para conversar com a IA"}
                className="min-h-[60px] max-h-[120px] resize-none border-border/50 bg-background/50 focus:bg-background transition-colors duration-medium"
                disabled={!canUse || loading}
              />
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>Use Shift + Enter para quebrar linha</span>
                <span>{input.length}/1000</span>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading || !canUse || input.length > 1000}
              size="lg"
              className="h-auto px-4 py-3 bg-primary hover:bg-primary-hover transition-all duration-medium shadow-card hover:shadow-elevated"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};