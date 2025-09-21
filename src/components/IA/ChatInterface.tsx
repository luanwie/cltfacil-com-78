import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, Bot, User, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  parsed?: any; // Para respostas JSON estruturadas
  mode?: 'calculator' | 'conversational';
}

interface ChatInterfaceProps {
  onUsageIncrement: () => Promise<void>;
  canUse: boolean;
  mode?: 'calculator' | 'conversational';
  calculatorContext?: string;
}

export const ChatInterface = ({ 
  onUsageIncrement, 
  canUse, 
  mode = 'conversational',
  calculatorContext
}: ChatInterfaceProps) => {
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
      mode,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      await onUsageIncrement();

      // Adicionar contexto da calculadora se fornecido
      const prompt = calculatorContext 
        ? `${calculatorContext}\n\nPergunta do usuário: ${input}`
        : input;

      const { data, error } = await supabase.functions.invoke('ia-clt', {
        body: { prompt, mode }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        parsed: data.parsed,
        mode: data.mode || mode,
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

  const renderCalculatorResponse = (parsed: any) => {
    if (!parsed) return null;

    return (
      <div className="mt-4 space-y-4">
        {/* Status do cálculo */}
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          <span className="font-medium text-sm">
            {parsed.calculator?.replace('_', ' ')?.toUpperCase() || 'Cálculo'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            parsed.status === 'ok' ? 'bg-green-100 text-green-800' :
            parsed.status === 'need_more_info' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {parsed.status === 'ok' ? 'Concluído' :
             parsed.status === 'need_more_info' ? 'Precisa mais dados' : 'Erro'}
          </span>
        </div>

        {/* Perguntas faltantes */}
        {parsed.questions?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Informações necessárias:</h4>
            <ul className="space-y-1 text-sm">
              {parsed.questions.map((q: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resultados */}
        {parsed.results && Object.keys(parsed.results).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Resultados:</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(parsed.results).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">
                    {typeof value === 'number' && key.includes('valor') ? 
                      `R$ ${value.toFixed(2).replace('.', ',')}` : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breakdown detalhado */}
        {parsed.breakdown?.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Detalhamento:</h4>
            <div className="space-y-1 text-sm">
              {parsed.breakdown.map((item: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{item.label}:</span>
                  <span className="font-medium">
                    {typeof item.value === 'number' ? 
                      `R$ ${item.value.toFixed(2).replace('.', ',')}` : item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hipóteses assumidas */}
        {parsed.assumptions?.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Hipóteses assumidas:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {parsed.assumptions.map((assumption: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span>•</span>
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Referências legais */}
        {parsed.legal_refs?.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Referências legais:</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              {parsed.legal_refs.map((ref: string, i: number) => (
                <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {parsed.disclaimer && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">{parsed.disclaimer}</p>
          </div>
        )}
      </div>
    );
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
                    {mode === 'calculator' ? (
                      <Calculator className="w-12 h-12 text-primary" />
                    ) : (
                      <Bot className="w-12 h-12 text-primary" />
                    )}
                  </div>
                </div>
                <div className="space-y-3 max-w-md">
                  <h3 className="text-xl font-semibold text-foreground">
                    {mode === 'calculator' ? 
                      'Assistente de Cálculos CLT' : 
                      'Assistente Jurídico Especializado'
                    }
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {mode === 'calculator' ? 
                      'Descreva o cálculo trabalhista que precisa e eu fornecerei resultados estruturados' :
                      'Tire suas dúvidas sobre direito trabalhista brasileiro com nossa IA especializada em CLT'
                    }
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
                            {message.mode === 'calculator' ? (
                              <Calculator className="w-5 h-5" />
                            ) : (
                              <Bot className="w-5 h-5" />
                            )}
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
                      <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                        {message.mode === 'calculator' && message.parsed?.explanation_markdown ? (
                          <div dangerouslySetInnerHTML={{ 
                            __html: message.parsed.explanation_markdown.replace(/\n/g, '<br/>') 
                          }} />
                        ) : (
                          message.content
                        )}
                      </div>
                      
                      {/* Renderizar resposta estruturada da calculadora */}
                      {message.role === 'assistant' && message.parsed && 
                       renderCalculatorResponse(message.parsed)}
                      
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
                          {mode === 'calculator' ? (
                            <Calculator className="w-5 h-5" />
                          ) : (
                            <Bot className="w-5 h-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl px-4 py-3 shadow-card">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">
                          {mode === 'calculator' ? 'Calculando...' : 'Pensando...'}
                        </span>
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
                placeholder={
                  !canUse ? "Faça login para conversar com a IA" :
                  mode === 'calculator' ? "Ex: Calcular adicional noturno para vendedor no RS, salário 2800, 42 horas noturnas..." :
                  "Faça sua pergunta sobre direito trabalhista..."
                }
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