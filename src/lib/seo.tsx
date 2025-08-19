interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  type?: "website" | "article";
  jsonLd?: object;
}

export const updateSEO = ({ 
  title, 
  description, 
  keywords,
  canonical,
  ogImage = "https://cltfacil.com/og-image.png",
  type = "website",
  jsonLd 
}: SEOData) => {
  // Update title
  document.title = title;

  // Update or create meta tags
  const updateMeta = (name: string, content: string, property = false) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      if (property) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  };

  // Basic meta tags
  updateMeta('description', description);
  if (keywords) updateMeta('keywords', keywords);

  // Open Graph
  updateMeta('og:title', title, true);
  updateMeta('og:description', description, true);
  updateMeta('og:type', type, true);
  updateMeta('og:image', ogImage, true);
  if (canonical) updateMeta('og:url', canonical, true);

  // Twitter
  updateMeta('twitter:title', title);
  updateMeta('twitter:description', description);
  updateMeta('twitter:image', ogImage);

  // Canonical link
  if (canonical) {
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;
  }

  // JSON-LD structured data
  if (jsonLd) {
    // Remove existing JSON-LD
    const existingJsonLd = document.querySelector('script[type="application/ld+json"]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    // Add new JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
};

// JSON-LD schema generators
export const generateSoftwareApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CLT Fácil",
  "description": "Calculadoras trabalhistas gratuitas para CLT: adicional noturno, DSR, férias, 13º salário e mais.",
  "url": "https://cltfacil.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CLT Fácil"
  }
});

export const generateCalculatorSchema = (name: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": name,
  "description": description,
  "url": url,
  "applicationCategory": "BusinessApplication",
  "browserRequirements": "Requires JavaScript",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL"
  }
});

export const generateFAQSchema = (faqItems: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
});