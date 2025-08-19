import { Mail, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";

const Contato = () => {
  useSEO({
    title: "Contato | CLT Fácil - Calculadoras Trabalhistas",
    description: "Entre em contato com o CLT Fácil. Envie suas dúvidas, sugestões ou feedback sobre nossas calculadoras trabalhistas.",
    keywords: "contato, CLT Fácil, suporte, dúvidas, calculadoras trabalhistas",
    canonical: "https://cltfacil.com/contato"
  });

  return (
    <>
      <section className="py-12">
        <Container size="md">
          <PageHeader
            title="Entre em Contato"
            description="Tem alguma dúvida ou sugestão? Gostaríamos de ouvir você!"
          />
        </Container>
      </section>

      <section className="pb-12">
        <Container size="md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Email</CardTitle>
                <CardDescription>
                  Envie suas dúvidas, sugestões ou feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  contato@cltfacil.com
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Suporte</CardTitle>
                <CardDescription>
                  Ajuda com as calculadoras e funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  suporte@cltfacil.com
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-muted/30 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Antes de entrar em contato</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Dúvidas sobre cálculos:</strong> Nossas calculadoras seguem a legislação CLT vigente. 
                Para situações específicas, consulte sempre a Convenção Coletiva de Trabalho (CCT) ou 
                Acordo Coletivo de Trabalho (ACT) da sua categoria.
              </p>
              <p>
                <strong>Sugestões de novas calculadoras:</strong> Estamos sempre trabalhando para adicionar 
                novas funcionalidades. Sua opinião é muito importante para nós.
              </p>
              <p>
                <strong>Problemas técnicos:</strong> Descreva detalhadamente o problema encontrado, 
                incluindo navegador utilizado e passos para reproduzir o erro.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Contato;