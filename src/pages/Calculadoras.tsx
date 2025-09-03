import { Link } from "react-router-dom";
import { Calculator, Clock, DollarSign, Calendar, TrendingUp, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";



const Calculadoras = () => {
  const calculators = [
    {
      id: "salario-liquido",
      title: "Salário Líquido",
      description: "Calcule o salário líquido com INSS, IRRF e deduções",
      icon: DollarSign,
      href: "/clt/salario-liquido",
      available: true,
      popular: true
    },
    {
      id: "inss",
      title: "INSS Mensal",
      description: "Calcule a contribuição previdenciária mensal",
      icon: Calculator,
      href: "/clt/inss",
      available: true,
      popular: true
    },
    {
      id: "irrf",
      title: "IRRF Mensal",
      description: "Calcule o Imposto de Renda Retido na Fonte",
      icon: Calculator,
      href: "/clt/irrf",
      available: true,
      popular: true
    },
    {
      id: "fgts",
      title: "FGTS + Projeção",
      description: "Calcule depósitos e projeções do FGTS com multas",
      icon: TrendingUp,
      href: "/clt/fgts",
      available: true,
      popular: true
    },
    {
      id: "decimo-terceiro",
      title: "13º Proporcional",
      description: "Calcule o 13º salário proporcional aos meses trabalhados",
      icon: DollarSign,
      href: "/clt/13o-proporcional",
      available: true,
      popular: true
    },
    {
      id: "ferias-proporcionais",
      title: "Férias Proporcionais",
      description: "Calcule férias proporcionais ao período trabalhado",
      icon: Calendar,
      href: "/clt/ferias-proporcionais",
      available: true,
      popular: true
    },
    {
      id: "rescisao",
      title: "Rescisão Trabalhista",
      description: "Calculadora completa para rescisão de contrato",
      icon: FileText,
      href: "/clt/rescisao",
      available: true,
      popular: true
    },
    {
      id: "horas-extras",
      title: "Horas Extras (50%/100%)",
      description: "Calcule horas extras com adicional de 50% e 100%",
      icon: Clock,
      href: "/clt/horas-extras",
      available: true,
      popular: true
    },
    {
      id: "adicional-noturno",
      title: "Adicional Noturno",
      description: "Calcule o adicional de 20% para trabalho noturno (22h às 5h)",
      icon: Clock,
      href: "/clt/adicional-noturno",
      available: true
    },
    {
      id: "dsr",
      title: "DSR - Descanso Semanal",
      description: "Calcule o Descanso Semanal Remunerado sobre horas extras",
      icon: Calendar,
      href: "/clt/dsr",
      available: true
    },
    {
      id: "banco-horas",
      title: "Banco de Horas",
      description: "Controle e calcule saldo de banco de horas",
      icon: TrendingUp,
      href: "/clt/banco-de-horas",
      available: true
    },
    {
      id: "dsr-comissoes",
      title: "DSR sobre Comissões",
      description: "Calcule DSR sobre comissões e vendas variáveis",
      icon: Calendar,
      href: "/clt/dsr-comissoes",
      available: true
    },
    {
      id: "periculosidade",
      title: "Periculosidade (30%)",
      description: "Calcule adicional de periculosidade de 30%",
      icon: ExternalLink,
      href: "/clt/periculosidade",
      available: true
    },
    {
      id: "insalubridade",
      title: "Insalubridade (10/20/40%)",
      description: "Calcule adicional de insalubridade por grau",
      icon: ExternalLink,
      href: "/clt/insalubridade",
      available: true
    },
    {
      id: "ferias-abono",
      title: "Férias + Abono (1/3)",
      description: "Calcule férias com opção de venda de 1/3",
      icon: Calendar,
      href: "/clt/ferias-abono",
      available: true
    },
    {
      id: "ferias-dobro",
      title: "Férias em Dobro",
      description: "Calcule férias vencidas em dobro",
      icon: Calendar,
      href: "/clt/ferias-dobro",
      available: true
    },
    {
      id: "aviso-previo",
      title: "Aviso Prévio",
      description: "Calcule dias e indenização de aviso prévio",
      icon: FileText,
      href: "/clt/aviso-previo",
      available: true
    },
    {
      id: "vale-transporte",
      title: "Vale-Transporte (6%)",
      description: "Calcule desconto e custo do vale-transporte",
      icon: Calculator,
      href: "/clt/vale-transporte",
      available: true
    }
  ];

  const activeCalculators = calculators.filter(calc => calc.available);

  return (
    <>
      <section className="py-12">
        <Container>
          <PageHeader
            title="Calculadoras Trabalhistas"
            description="Ferramentas para cálculos trabalhistas com limite gratuito de 4 cálculos por mês. Para acesso ilimitado, torne-se PRO."
          />
        </Container>
      </section>


      {/* Active Calculators */}
      <section className="pb-12">
        <Container>
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Prontas para você calcular</h2>
              <p className="text-muted-foreground">Ferramentas CLT atualizadas e confiáveis. Veja o resultado na hora.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCalculators.map((calc) => {
                const Icon = calc.icon;
                return (
                  <Card key={calc.id} className="group hover:shadow-elevated transition-all duration-medium hover:scale-[1.02]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {calc.title}
                            </CardTitle>
                          </div>
                        </div>
                        {calc.popular && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
<Button asChild className="w-full" aria-label={`Calcular ${calc.title}`}>
  <Link to={calc.href}>
    Calcular Agora
    <Calculator className="w-4 h-4" />
  </Link>
</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </section>


    </>
  );
};

export default Calculadoras;