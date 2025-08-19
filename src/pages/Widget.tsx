import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import AdicionalNoturnoCalculator from "@/components/calculators/AdicionalNoturnoCalculator";
import cargosData from "@/data/cargos.json";
import ufsData from "@/data/ufs.json";

const Widget = () => {
  const [searchParams] = useSearchParams();
  const cargoSlug = searchParams.get('cargo');
  const ufSigla = searchParams.get('uf');

  // Buscar informações do cargo e UF
  const cargoInfo = cargoSlug ? cargosData.find(c => c.slug === cargoSlug) : null;
  const ufInfo = ufSigla ? ufsData.find(u => u.sigla.toLowerCase() === ufSigla.toLowerCase()) : null;

  const cargoTitle = cargoInfo?.nome;
  const ufTitle = ufInfo?.nome;

  // SEO do widget
  useEffect(() => {
    // Meta robots
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'noindex,follow');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex,follow';
      document.head.appendChild(meta);
    }

    // Canonical para a página programática correspondente
    if (cargoSlug && ufSigla) {
      const canonicalUrl = `${import.meta.env.VITE_PUBLIC_URL || 'https://clt-facil-calculadoras.lovable.app'}/clt/adicional-noturno/${cargoSlug}/${ufSigla}`;
      
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonical) {
        canonical.setAttribute('href', canonicalUrl);
      } else {
        const canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        canonicalLink.href = canonicalUrl;
        document.head.appendChild(canonicalLink);
      }
    }

    // Title simples
    document.title = 'Calculadora de Adicional Noturno - Widget';

    // Cleanup
    return () => {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) {
        robotsMeta.setAttribute('content', 'index,follow');
      }
    };
  }, [cargoSlug, ufSigla]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold">
            Calculadora de Adicional Noturno
            {cargoTitle && ufTitle && ` - ${cargoTitle} (${ufTitle})`}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Calcule o adicional noturno de forma rápida e precisa
          </p>
        </div>
        
        <AdicionalNoturnoCalculator 
          cargo={cargoTitle}
          uf={ufTitle}
          showShareButtons={false}
          showAds={false}
        />
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            Powered by{' '}
            <a 
              href={import.meta.env.VITE_PUBLIC_URL || 'https://clt-facil-calculadoras.lovable.app'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CLT Fácil
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Widget;