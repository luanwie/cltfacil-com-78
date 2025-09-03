import { Link } from "react-router-dom";
import { Calculator, Clock, Shield, Zap, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/ui/container";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";

import { useSEO } from "@/hooks/useSEO";
import { generateSoftwareApplicationSchema, generateFAQSchema } from "@/lib/seo";

const Index = () => {
  // SEO setup
  useSEO({
    title: "Calculadora de Rescisão Trabalhista (CLT) Online | CLT Fácil",
    description: "Calcule rescisão, aviso, FGTS, DSR e horas extras em segundos. 100% grátis e online.",
    keywords: "calculadora rescisão trabalhista, CLT, aviso prévio, FGTS, DSR, horas extras, direitos trabalhistas",
    canonical: "https://cltfacil.com/",
    jsonLd: generateSoftwareApplicationSchema()
  });

  const heroFeatures = [
    { icon: Zap, title: "Simples e Rápido", description: "Calcule em segundos sem complicações" },
    { icon: Shield, title: "Confiável", description: "Baseado na legislação CLT atualizada" },
    { icon: Calculator, title: "Uso limitado", description: "4 cálculos grátis por mês" }
  ];

  const howItWorks = [
    { step: "1", title: "Escolha a calculadora", description: "Selecione o tipo de cálculo trabalhista que precisa" },
    { step: "2", title: "Insira os dados", description: "Preencha as informações básicas do seu caso" },
    { step: "3", title: "Obtenha o resultado", description: "Receba o cálculo detalhado instantaneamente" }
  ];

  const LINKS_HOME = [
    { title: "Adicional Noturno", href: "/clt/adicional-noturno" },
    { title: "DSR - Descanso Semanal", href: "/clt/dsr" },
    { title: "Férias Proporcionais", href: "/clt/ferias-proporcionais" },
    { title: "13º Proporcional", href: "/clt/13o-proporcional" },
    { title: "Banco de Horas", href: "/clt/banco-de-horas" },
    { title: "Rescisão Trabalhista", href: "/clt/rescisao" },
    { title: "Salário Líquido", href: "/clt/salario-liquido" },
    { title: "INSS Mensal", href: "/clt/inss" },
    { title: "IRRF Mensal", href: "/clt/irrf" },
    { title: "FGTS + Projeção", href: "/clt/fgts" },
    { title: "Horas Extras (50%/100%)", href: "/clt/horas-extras" },
    { title: "DSR sobre Comissões", href: "/clt/dsr-comissoes" },
    { title: "Periculosidade (30%)", href: "/clt/periculosidade" },
    { title: "Insalubridade (10/20/40%)", href: "/clt/insalubridade" },
    { title: "Férias + Abono (1/3)", href: "/clt/ferias-abono" },
    { title: "Férias em Dobro", href: "/clt/ferias-dobro" },
    { title: "Aviso Prévio", href: "/clt/aviso-previo" },
    { title: "Vale-Transporte (6%)", href: "/clt/vale-transporte" },
  ];

  const mainCalculators = LINKS_HOME.slice(0, 9);

  const faqItems = [
    { question: "Quando as horas extras são 50% e quando são 100%?", answer: "Em regra, 50% em dias úteis e 100% em domingos e feriados, salvo acordo coletivo." },
    { question: "Qual é o limite de horas extras por mês?", answer: "Limite legal de 2 horas por dia, cerca de 44 horas/mês (22 dias úteis). Acordos podem alterar." },
    { question: "As horas extras geram DSR?", answer: "Sim, costumam refletir no DSR e em verbas correlatas." },
    { question: "Os cálculos são confiáveis?", answer: "As calculadoras seguem a legislação CLT vigente. Consulte a CCT/ACT e orientação jurídica quando necessário." }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <Container>
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Calculadoras Trabalhistas CLT
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Calculadoras de rescisão, férias, 13º, INSS, FGTS e mais. Grátis com limite de 4 cálculos por mês. Desbloqueie uso ilimitado com o Plano PRO.
              </p>
            </div>

<div className="flex flex-col sm:flex-row gap-4 justify-center">
<Button asChild variant="hero" size="lg" aria-label="Usar grátis 4 cálculos por mês">
  <Link to="/calculadoras">
    Usar grátis (4 cálculos/mês)
    <ChevronRight className="w-5 h-5" />
  </Link>
</Button>
<Button asChild variant="outline" size="lg" aria-label="Conhecer o plano PRO">
  <Link to="/assinar-pro">Conhecer Plano PRO</Link>
</Button>

  <Button asChild variant="outline" size="lg">
    <Link to="/assinar-pro">Conhecer Plano PRO</Link>
  </Button>
</div>

            {/* Hero Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
              {heroFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <Container>
          <div className="text-center space-y-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona o cálculo</h2>
              <p className="text-lg text-muted-foreground">Em apenas 3 passos simples você tem seu cálculo trabalhista</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {howItWorks.map((step, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">{step.description}</CardDescription>
                  </CardContent>
                  {index < howItWorks.length - 1 && (
                    <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 text-muted-foreground transform -translate-y-1/2" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Main Calculators */}
      <section className="py-20">
        <Container>
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Outras calculadoras</h2>
              <p className="text-lg text-muted-foreground">Acesse nossas ferramentas mais utilizadas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {LINKS_HOME.slice(0, 9).map((calc, index) => (
                <Card key={index} className="group hover:shadow-elevated transition-all duration-medium hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      {calc.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button asChild className="w-full">
                      <Link to={calc.href}>
                        Calcular Agora
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/calculadoras">
                  Ver Todas as Calculadoras
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <Container size="md">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas frequentes</h2>
            <p className="text-lg text-muted-foreground">
              Esclareça suas principais dúvidas sobre cálculos trabalhistas
            </p>
          </div>
          <FAQ items={[
  {
    question: "Quantos cálculos gratuitos tenho por mês?",
    answer: "O plano gratuito permite até 4 cálculos por mês. Para uso ilimitado, assine o Plano PRO.",
  },
  {
    question: "Preciso fazer cadastro para usar?",
    answer: "Você pode realizar 1 cálculo sem login. Após isso, é necessário criar uma conta gratuita ou assinar o PRO.",
  },
  {
    question: "Posso cancelar o plano PRO quando quiser?",
    answer: "Sim. Você pode cancelar a assinatura a qualquer momento pelo portal da Stripe, sem taxas.",
  },
]} />
        </Container>
      </section>

      {/* Legal Notice */}
      <section className="py-12">
        <Container size="md">
          <Notice variant="info">
            <strong>Aviso Legal:</strong> As calculadoras oferecem estimativas baseadas na legislação CLT vigente.
            Consulte sempre a CCT/ACT específica e busque orientação jurídica quando necessário.
          </Notice>
        </Container>
      </section>
    </>
  );
};

export default Index;
