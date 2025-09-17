import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatInterface } from '@/components/IA/ChatInterface';
import { useIAUsage } from '@/hooks/useIAUsage';
import { useSEO } from '@/hooks/useSEO';
import Layout from '@/components/layout/layout';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Bot, Crown, LogIn, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const IAClt = () => {
  const navigate = useNavigate();
  const { isLogged, isPro, remainingIA, canUseIA, loading, incrementIAUsage } = useIAUsage();

  useSEO({
    title: "IA Especialista em CLT | Tire suas dúvidas trabalhistas",
    description: "Consultoria inteligente sobre direito trabalhista brasileiro. Perguntas e respostas precisas sobre CLT com inteligência artificial especializada.",
    keywords: "IA CLT, inteligência artificial trabalhista, consultoria CLT, direito trabalhista, IA jurídica",
    canonical: "https://calculadoraclt.com.br/ia-clt"
  });

  if (loading) {
    return (
      <Layout>
        <Container className="py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <PageHeader
            title="🤖 IA Especialista em CLT"
            description="Consultoria inteligente sobre direito trabalhista brasileiro"
            className="text-center"
          />

          {/* Status Card */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bot className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Status da Conta</h3>
                    {isPro ? (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        PRO - Perguntas ilimitadas
                      </p>
                    ) : isLogged ? (
                      <p className="text-sm text-muted-foreground">
                        Gratuito - {remainingIA} pergunta(s) restante(s) este mês
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Faça login para usar a IA
                      </p>
                    )}
                  </div>
                </div>

                {!isPro && (
                  <Button 
                    onClick={() => navigate('/assinar-pro')}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Tornar PRO
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage Alerts */}
          {!isLogged && (
            <Alert className="border-warning/50 bg-warning/10">
              <LogIn className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Você precisa fazer login para usar a IA especialista.</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/login')}
                    className="ml-4"
                  >
                    Fazer Login
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isLogged && !isPro && remainingIA === 0 && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Você esgotou suas perguntas gratuitas deste mês. Torne-se PRO para uso ilimitado.</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/assinar-pro')}
                    className="ml-4"
                  >
                    Virar PRO
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Chat Interface */}
          <ChatInterface
            onUsageIncrement={incrementIAUsage}
            canUse={canUseIA}
          />

          {/* Instructions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">💡 Como usar a IA CLT</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Faça perguntas específicas sobre direito trabalhista brasileiro</li>
                <li>• A IA é especializada em CLT e pode citar artigos específicos</li>
                <li>• Usuários gratuitos: 1 pergunta por mês</li>
                <li>• Usuários PRO: perguntas ilimitadas</li>
                <li>• Para consultas complexas, seja específico em sua pergunta</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Layout>
  );
};

export default IAClt;