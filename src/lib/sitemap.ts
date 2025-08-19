import cargosData from "@/data/cargos.json";
import ufsData from "@/data/ufs.json";

export const generateSitemap = (baseUrl: string = 'https://clt-facil-calculadoras.lovable.app') => {
  const urls = [
    // Páginas estáticas
    { loc: baseUrl, lastmod: '2024-01-01', changefreq: 'weekly', priority: '1.0' },
    { loc: `${baseUrl}/calculadoras`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.9' },
    
    // URLs SEO-friendly (prioridade alta)
    { loc: `${baseUrl}/calculadora-rescisao`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.9' },
    { loc: `${baseUrl}/calculadora-horas-extras`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.9' },
    { loc: `${baseUrl}/calculadora-dsr`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.9' },
    { loc: `${baseUrl}/calculadora-adicional-noturno`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.9' },
    
    // URLs técnicas originais
    { loc: `${baseUrl}/clt/adicional-noturno`, lastmod: '2024-01-01', changefreq: 'monthly', priority: '0.8' },
    { loc: `${baseUrl}/clt/ferias-proporcionais`, lastmod: '2024-01-01', changefreq: 'monthly', priority: '0.8' },
    { loc: `${baseUrl}/clt/dsr`, lastmod: '2024-01-01', changefreq: 'monthly', priority: '0.8' },
    { loc: `${baseUrl}/clt/13o-proporcional`, lastmod: '2024-01-01', changefreq: 'monthly', priority: '0.8' },
    { loc: `${baseUrl}/clt/banco-de-horas`, lastmod: '2024-01-01', changefreq: 'monthly', priority: '0.8' },
    { loc: `${baseUrl}/clt/rescisao`, lastmod: '2024-01-01', changefreq: 'monthly', priority: '0.8' },
    { loc: `${baseUrl}/clt/salario-liquido`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/inss`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/irrf`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/fgts`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/horas-extras`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/dsr-comissoes`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/periculosidade`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/insalubridade`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/ferias-abono`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/ferias-dobro`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/aviso-previo`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/clt/vale-transporte`, lastmod: '2024-01-01', changefreq: 'weekly', priority: '0.8' },
    
    // Páginas institucionais
    { loc: `${baseUrl}/sobre`, lastmod: '2024-01-01', changefreq: 'monthly', priority: '0.5' },
    { loc: `${baseUrl}/contato`, lastmod: '2024-01-01', changefreq: 'monthly', priority: '0.5' },
    { loc: `${baseUrl}/termos`, lastmod: '2024-01-01', changefreq: 'yearly', priority: '0.3' },
    { loc: `${baseUrl}/privacidade`, lastmod: '2024-01-01', changefreq: 'yearly', priority: '0.3' },
  ];

  // Adicionar todas as combinações Cargo × UF
  for (const cargo of cargosData) {
    for (const uf of ufsData) {
      urls.push({
        loc: `${baseUrl}/clt/adicional-noturno/${cargo.slug}/${uf.sigla.toLowerCase()}`,
        lastmod: '2024-01-01',
        changefreq: 'daily',
        priority: '0.80'
      });
    }
  }

  // Gerar XML
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xmlContent;
};