import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";

import AdicionalNoturnoCalculator from "@/components/calculators/AdicionalNoturnoCalculator";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import { slugToTitle } from "@/lib/slug";
import cargosData from "@/data/cargos.json";
import ufsData from "@/data/ufs.json";
import NotFound from "@/pages/NotFound";

const AdicionalNoturnoCargoUF = () => {
  const { cargo, uf } = useParams<{ cargo: string; uf: string }>();

  // Validar se cargo e UF existem
  const cargoInfo = cargosData.find(c => c.slug === cargo);
  const ufInfo = ufsData.find(u => u.sigla.toLowerCase() === uf?.toLowerCase());

  if (!cargoInfo || !ufInfo) {
    return <NotFound />;
  }

  const cargoTitle = cargoInfo.nome;
  const ufTitle = ufInfo.nome;
  const pageTitle = `Adicional Noturno para ${cargoTitle} — ${ufTitle}`;
  const pageDescription = `Calcule o adicional noturno para ${cargoTitle.toLowerCase()} em ${ufTitle}. Ferramenta grátis e rápida com passo a passo.`;
  const canonicalUrl = `${import.meta.env.VITE_PUBLIC_URL || 'https://clt-facil-calculadoras.lovable.app'}/clt/adicional-noturno/${cargo}/${uf}`;

  // FAQ contextualizado
  const faqItems = [
    {
      question: `Como calcular adicional noturno para ${cargoTitle.toLowerCase()} em ${ufTitle}?`,
      answer: `Para ${cargoTitle.toLowerCase()} em ${ufTitle}, o adicional noturno é de 20% sobre a hora normal, conforme CLT. Calcule: (salário ÷ jornada mensal) × 20% × horas noturnas trabalhadas.`
    },
    {
      question: `Qual o horário noturno para ${cargoTitle.toLowerCase()}?`,
      answer: `Para trabalho urbano de ${cargoTitle.toLowerCase()}, o horário noturno é das 22h às 5h. A hora noturna tem 52 minutos e 30 segundos.`
    },
    {
      question: `${cargoTitle} em ${ufTitle} tem direito a adicional noturno?`,
      answer: `Sim, todo trabalhador de ${cargoTitle.toLowerCase()} em ${ufTitle} que atue no período noturno (22h às 5h) tem direito ao adicional de 20%, conforme artigo 73 da CLT.`
    }
  ];

  // SEO dinâmico
  useSEO({
    title: `${pageTitle} | CLT Fácil`,
    description: pageDescription,
    canonical: canonicalUrl,
    keywords: `adicional noturno, ${cargoTitle.toLowerCase()}, ${ufTitle}, calculadora, CLT, trabalho noturno`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        generateCalculatorSchema(
          `CLT Fácil — ${pageTitle}`,
          pageDescription,
          canonicalUrl
        ),
        generateFAQSchema(faqItems)
      ]
    }
  });

  // Telemetria
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view_programmatic', {
        cargo: cargo || 'unknown',
        uf: uf || 'unknown'
      });
    }
  }, [cargo, uf]);

  return (
    <>
      <section className="py-8">
        <Container size="md">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/calculadoras">Calculadoras</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/clt/adicional-noturno">Adicional Noturno</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{ufTitle}</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{cargoTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <PageHeader
            title={pageTitle}
            description={`Calcule rapidamente o adicional noturno de 20% para ${cargoTitle.toLowerCase()} que trabalha no período das 22h às 5h em ${ufTitle}.`}
          />
        </Container>
      </section>

      <section className="pb-12">
        <Container size="md">
          <div className="max-w-4xl mx-auto space-y-6">
            <AdicionalNoturnoCalculator 
              cargo={cargoTitle}
              uf={ufTitle}
              showShareButtons={true}
              showAds={true}
            />
            
            <Notice variant="warning">
              <strong>Atenção:</strong> Este cálculo é uma estimativa baseada na CLT. 
              Consulte sempre a CCT de {cargoTitle.toLowerCase()} em {ufTitle} para verificar percentuais específicos.
            </Notice>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-muted/30">
        <Container size="md">
          <FAQ items={faqItems} />
        </Container>
      </section>

      {/* Links internos */}
      <section className="py-8 border-t">
        <Container size="md">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Outras Calculadoras</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/clt/adicional-noturno" 
                className="text-primary hover:underline"
              >
                Calculadora Geral de Adicional Noturno
              </Link>
              <Link 
                to="/calculadoras" 
                className="text-primary hover:underline"
              >
                Todas as Calculadoras
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default AdicionalNoturnoCargoUF;