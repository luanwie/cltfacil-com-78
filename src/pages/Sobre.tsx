import { Calculator, Users, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";

const Sobre = () => {
  useSEO({
    title: "Sobre o CLT Fácil - Calculadoras Trabalhistas Gratuitas",
    description: "Conheça a missão do CLT Fácil: democratizar o acesso a calculadoras trabalhistas confiáveis e gratuitas baseadas na legislação CLT.",
    keywords: "sobre CLT Fácil, calculadoras trabalhistas, missão, confiabilidade, CLT",
    canonical: "https://cltfacil.com/sobre"
  });
  const values = [
    {
      icon: Zap,
      title: "Simplicidade",
      description: "Ferramentas intuitivas que qualquer pessoa pode usar, sem complicações desnecessárias."
    },
    {
      icon: Shield,
      title: "Confiabilidade",
      description: "Cálculos baseados na legislação CLT vigente, sempre atualizados e precisos."
    },
    {
      icon: Users,
      title: "Acessibilidade",
      description: "Ferramentas 100% gratuitas para democratizar o acesso à informação trabalhista."
    }
  ];

  return (
    <>
      <section className="py-12">
        <Container size="md">
          <PageHeader
            title="Sobre o CLT Fácil"
            description="Nossa missão é simplificar os cálculos trabalhistas para todos os brasileiros."
          />
        </Container>
      </section>

      <section className="pb-12">
        <Container size="md">
          <div className="space-y-12">
            {/* Missão */}
            <div className="prose prose-lg max-w-none">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Nossa Missão</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    O CLT Fácil nasceu da necessidade de democratizar o acesso a ferramentas de cálculo trabalhista. 
                    Muitas vezes, trabalhadores e profissionais de RH enfrentam dificuldades para realizar cálculos 
                    precisos de direitos trabalhistas, seja por falta de ferramentas adequadas ou pela complexidade 
                    da legislação.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">Nossa Proposta</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Oferecemos calculadoras trabalhistas gratuitas, simples e confiáveis, baseadas na 
                    Consolidação das Leis do Trabalho (CLT). Nosso objetivo é fornecer estimativas precisas 
                    que ajudem na tomada de decisões e no entendimento dos direitos trabalhistas.
                  </p>
                </div>
              </div>
            </div>

            {/* Valores */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-center">Nossos Valores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <Card key={index} className="text-center">
                      <CardHeader>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>{value.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{value.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Compromisso */}
            <div className="bg-muted/30 rounded-lg p-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Nosso Compromisso</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Estamos comprometidos em manter nossas ferramentas sempre atualizadas com a 
                    legislação trabalhista vigente. Embora nossas calculadoras ofereçam estimativas 
                    confiáveis, sempre recomendamos consultar a Convenção Coletiva de Trabalho (CCT) 
                    ou Acordo Coletivo de Trabalho (ACT) específicos da categoria.
                  </p>
                  <p>
                    Para situações complexas ou dúvidas jurídicas específicas, aconselhamos a 
                    consulta com profissionais especializados em direito trabalhista.
                  </p>
                </div>
              </div>
            </div>

            {/* Desenvolvimento */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Em Constante Evolução</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estamos constantemente trabalhando para adicionar novas calculadoras e melhorar 
                as existentes. Se você tem sugestões ou precisa de uma calculadora específica, 
                sua opinião é muito importante para nós.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Sobre;