import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";

const Privacidade = () => {
  useSEO({
    title: "Política de Privacidade | CLT Fácil - Calculadoras Trabalhistas",
    description: "Política de privacidade do CLT Fácil. Como protegemos e utilizamos suas informações em nossas calculadoras trabalhistas.",
    keywords: "política de privacidade, CLT Fácil, proteção de dados, LGPD",
    canonical: "https://cltfacil.com/privacidade"
  });
  return (
    <>
      <section className="py-12">
        <Container size="md">
          <PageHeader
            title="Política de Privacidade"
            description="Como coletamos, utilizamos e protegemos suas informações."
          />
        </Container>
      </section>

      <section className="pb-12">
        <Container size="md">
          <div className="prose prose-lg max-w-none space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">1. Informações Coletadas</h2>
              <p className="text-muted-foreground leading-relaxed">
                O CLT Fácil coleta apenas as informações mínimas necessárias para o funcionamento 
                de nossas calculadoras. Os dados inseridos nas calculadoras são processados 
                localmente em seu navegador e não são armazenados em nossos servidores.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">2. Uso de Dados</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Os dados fornecidos são utilizados exclusivamente para:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Realizar os cálculos trabalhistas solicitados</li>
                  <li>Melhorar a experiência do usuário</li>
                  <li>Análises estatísticas agregadas e anônimas</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">3. Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies técnicos essenciais para o funcionamento do site. 
                Também podemos usar ferramentas de análise como Google Analytics para 
                entender como nossos usuários interagem com o site, sempre de forma 
                agregada e anônima.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">4. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com 
                terceiros para fins comerciais. Dados podem ser compartilhados apenas 
                quando exigido por lei ou para proteger nossos direitos legais.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">5. Segurança</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança adequadas para proteger suas informações 
                contra acesso não autorizado, alteração, divulgação ou destruição. 
                No entanto, nenhum método de transmissão pela internet é 100% seguro.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">6. Seus Direitos</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Você tem o direito de:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Saber quais dados pessoais temos sobre você</li>
                  <li>Solicitar a correção de dados incorretos</li>
                  <li>Solicitar a exclusão de seus dados</li>
                  <li>Retirar seu consentimento a qualquer momento</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">7. Publicidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nosso site pode exibir anúncios através de redes publicitárias terceirizadas. 
                Esses parceiros podem usar cookies para personalizar anúncios com base em 
                suas visitas a este e outros sites.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">8. Menores de Idade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nossos serviços não são direcionados a menores de 18 anos. Não coletamos 
                intencionalmente informações pessoais de menores de idade.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">9. Alterações na Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Esta política pode ser atualizada ocasionalmente. Recomendamos revisar 
                esta página periodicamente para estar ciente de quaisquer mudanças.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">10. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas sobre esta política de privacidade ou sobre o 
                tratamento de seus dados pessoais, entre em contato conosco através 
                dos canais disponíveis em nosso site.
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

export default Privacidade;