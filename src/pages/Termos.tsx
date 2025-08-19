import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";

const Termos = () => {
  useSEO({
    title: "Termos de Uso | CLT Fácil - Calculadoras Trabalhistas",
    description: "Termos de uso do CLT Fácil. Condições para utilização das calculadoras trabalhistas gratuitas.",
    keywords: "termos de uso, CLT Fácil, condições, calculadoras trabalhistas",
    canonical: "https://cltfacil.com/termos"
  });

  return (
    <>
      <section className="py-12">
        <Container size="md">
          <PageHeader
            title="Termos de Uso"
            description="Condições para utilização das calculadoras do CLT Fácil."
          />
        </Container>
      </section>

      <section className="pb-12">
        <Container size="md">
          <div className="prose prose-lg max-w-none space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar o CLT Fácil, você concorda em cumprir estes termos de uso. 
                Se não concordar com algum destes termos, não utilize nossos serviços.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                O CLT Fácil é uma plataforma gratuita que oferece calculadoras trabalhistas 
                baseadas na Consolidação das Leis do Trabalho (CLT) brasileira. 
                Nosso objetivo é fornecer estimativas para auxiliar no entendimento dos direitos trabalhistas.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">3. Natureza Informativa</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>IMPORTANTE:</strong> As calculadoras do CLT Fácil têm caráter meramente informativo e educacional.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Os resultados são estimativas baseadas na legislação geral</li>
                  <li>Não constituem aconselhamento jurídico</li>
                  <li>Não substituem consulta profissional especializada</li>
                  <li>Podem haver especificidades em convenções coletivas não consideradas</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">4. Limitações de Responsabilidade</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>O CLT Fácil não se responsabiliza por:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Decisões tomadas com base nos resultados das calculadoras</li>
                  <li>Prejuízos decorrentes do uso das informações</li>
                  <li>Diferenças entre cálculos e valores reais devidos</li>
                  <li>Mudanças na legislação não atualizadas no sistema</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">5. Uso Adequado</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Ao utilizar o CLT Fácil, você concorda em:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Usar o serviço apenas para fins legítimos</li>
                  <li>Não tentar quebrar ou contornar medidas de segurança</li>
                  <li>Não usar o serviço para atividades ilegais</li>
                  <li>Respeitar os direitos de propriedade intelectual</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo do CLT Fácil, incluindo textos, cálculos, design e código, 
                é protegido por direitos autorais. É permitido o uso pessoal das calculadoras, 
                mas é proibida a reprodução comercial sem autorização.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">7. Disponibilidade do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                Embora nos esforcemos para manter o serviço sempre disponível, 
                não garantimos disponibilidade 100% do tempo. Podemos suspender 
                ou descontinuar o serviço a qualquer momento, com ou sem aviso prévio.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">8. Recomendações Importantes</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Para situações trabalhistas específicas, recomendamos:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Consultar a CCT ou ACT da sua categoria profissional</li>
                  <li>Buscar orientação de advogado trabalhista</li>
                  <li>Verificar legislação atualizada</li>
                  <li>Considerar particularidades do seu caso</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">9. Alterações nos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos podem ser atualizados periodicamente. 
                Mudanças significativas serão comunicadas no site. 
                O uso continuado após as alterações constitui aceitação dos novos termos.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">10. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dúvidas sobre estes termos podem ser esclarecidas através 
                dos canais de contato disponíveis em nosso site.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 mt-8">
              <p className="text-sm text-muted-foreground">
                <strong>Última atualização:</strong> Janeiro de 2024
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Termos;