import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatInterface } from '@/components/IA/ChatInterface';
import { useIAUsage } from '@/hooks/useIAUsage';
import { useSEO } from '@/hooks/useSEO';
import Container from '@/components/ui/container';
import PageHeader from '@/components/ui/page-header';
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
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <PageHeader
            title="Assistente Jurídico IA"
            description="Consultoria inteligente especializada em direito trabalhista brasileiro"
            className="text-center"
          />
        </div>

        {/* Status Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Account Status */}
          <Card className="lg:col-span-2 border-0 shadow-card bg-gradient-subtle">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Status da Conta</h3>
                    {isPro ? (
                      <div className="flex items-center gap-2 text-success">
                        <Crown className="w-4 h-4" />
                        <span className="font-medium">PRO - Consultas ilimitadas</span>
                      </div>
                    ) : isLogged ? (
                      <p className="text-muted-foreground">
                        Plano gratuito - {remainingIA} consulta(s) restante(s)
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        Faça login para usar o assistente
                      </p>
                    )}
                  </div>
                </div>

                {!isPro && (
                  <Button 
                    onClick={() => navigate('/assinar-pro')}
                    className="bg-gradient-hero hover:opacity-90 transition-opacity shadow-card"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade PRO
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-card bg-accent/50">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {isPro ? "∞" : remainingIA}
              </div>
              <p className="text-sm text-muted-foreground">
                {isPro ? "Consultas ilimitadas" : "Consultas restantes"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Alerts */}
        {!isLogged && (
          <Alert className="border-warning/30 bg-warning/5">
            <LogIn className="h-5 w-5 text-warning" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>Faça login para acessar o assistente jurídico especializado.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="self-start sm:self-auto"
                >
                  Fazer Login
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isLogged && !isPro && remainingIA === 0 && (
          <Alert className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>Consultas gratuitas esgotadas. Upgrade para PRO e tenha acesso ilimitado.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/assinar-pro')}
                  className="self-start sm:self-auto"
                >
                  Upgrade PRO
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Chat Interface */}
        <div className="relative">
          <ChatInterface
            onUsageIncrement={incrementIAUsage}
            canUse={canUseIA}
          />
        </div>

        {/* Help Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Como usar o assistente
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Faça perguntas específicas sobre direito trabalhista</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>A IA pode citar artigos da CLT e jurisprudências</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Seja específico para obter respostas mais precisas</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-warning" />
                Planos disponíveis
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium mb-1">Gratuito</div>
                  <div className="text-muted-foreground">1 consulta por mês</div>
                </div>
                <div>
                  <div className="font-medium mb-1 text-primary">PRO</div>
                  <div className="text-muted-foreground">Consultas ilimitadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default IAClt;