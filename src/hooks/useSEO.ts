import { useEffect } from 'react';
import { updateSEO } from '@/lib/seo';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  type?: "website" | "article";
  jsonLd?: object;
}

export const useSEO = (seoData: SEOData) => {
  useEffect(() => {
    updateSEO(seoData);
  }, [seoData]);
};