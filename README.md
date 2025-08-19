# CLT Fácil - Calculadoras Trabalhistas

Hub de calculadoras trabalhistas gratuitas para tráfego orgânico e monetização com anúncios.

## 🚀 Sobre o Projeto

O CLT Fácil é uma plataforma que oferece calculadoras trabalhistas gratuitas, desenvolvida para:
- Captar tráfego orgânico através de SEO
- Oferecer ferramentas úteis para trabalhadores e profissionais de RH
- Monetização futura com anúncios
- Expansão para funcionalidades premium

## 📋 Status Atual - Versão 1.0 (MVP)

Esta é a entrega inicial focada em:
- ✅ Landing page otimizada para SEO
- ✅ Grid de calculadoras (3 ativas, outras "em breve")
- ✅ Calculadora de Adicional Noturno (UI funcional)
- ✅ Páginas institucionais (Sobre, Privacidade)
- ✅ Design system completo
- ✅ Estrutura SEO (meta tags, JSON-LD, sitemap)
- ✅ Layout responsivo e dark mode

## 🛠️ Stack Tecnológica

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build**: Vite
- **Deploy**: Lovable Platform

## 🎨 Design System

### Cores
- **Primary**: Azul profissional (#3B82F6) para CTAs e elementos importantes
- **Base**: Tons de cinza neutros para texto e backgrounds
- **Success**: Verde para resultados positivos
- **Warning**: Amarelo para alertas

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Pesos**: 400, 500, 600, 700

### Componentes
Todos os componentes seguem o design system definido em `src/index.css` e `tailwind.config.ts`:
- Buttons com variantes: default, hero, outline, secondary
- Cards com sombras e hover effects
- Inputs especializados (NumberInput para valores monetários)
- FAQ acordeão
- Notices para avisos importantes

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout
│   └── ui/              # Componentes reutilizáveis
├── pages/               # Páginas principais
│   ├── calculadoras/    # Páginas de calculadoras específicas
│   └── ...
├── hooks/               # Custom hooks (useSEO)
├── lib/                 # Utilitários (SEO helpers)
└── ...
```

## 🧮 Calculadoras

### Ativas
- **Adicional Noturno**: Cálculo do adicional de 20% para trabalho noturno

### Em Desenvolvimento
- DSR (Descanso Semanal Remunerado)
- Férias Proporcionais  
- 13º Proporcional
- Banco de Horas
- Rescisão Trabalhista

## 🔍 SEO e Performance

### Implementado
- Meta tags dinâmicas por página
- Open Graph e Twitter Cards
- JSON-LD structured data
- Sitemap.xml e robots.txt
- Core Web Vitals otimizados
- Lazy loading de recursos

### Canonical URLs
Todas as páginas têm canonical URLs definidas para evitar conteúdo duplicado.

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## ⚙️ Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` com:

```env
VITE_APP_NAME="CLT Fácil"
VITE_EXTERNAL_RESCISAO_URL=""  # URL externa para calculadora de rescisão (opcional)
VITE_GA4_ID=""                 # Google Analytics 4 ID (para implementação futura)
```

## 📈 Próximos Marcos

### Marco 2: Backend e Funcionalidades
- [ ] Implementar regras reais de cálculo (Adicional Noturno)
- [ ] Integração com Supabase para histórico de cálculos
- [ ] Sistema de autenticação opcional

### Marco 3: SEO Avançado
- [ ] SEO programático por UF/cargo
- [ ] Landing pages específicas por categoria
- [ ] Blog de conteúdo trabalhista

### Marco 4: Monetização
- [ ] Integração Google AdSense
- [ ] Otimização de posicionamento de anúncios
- [ ] A/B testing de layouts

### Marco 5: Premium
- [ ] Funcionalidades PRO
- [ ] Integração Stripe
- [ ] Relatórios em PDF
- [ ] Calculadoras avançadas

## 🎯 Como Adicionar Novas Calculadoras

1. **Criar a página da calculadora** em `src/pages/calculadoras/`
2. **Adicionar a rota** em `src/App.tsx`
3. **Registrar no grid** em `src/pages/Calculadoras.tsx`
4. **Implementar SEO específico** usando `useSEO`
5. **Adicionar ao sitemap** em `public/sitemap.xml`

### Template base para nova calculadora:
```tsx
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema } from "@/lib/seo";

const MinhaCalculadora = () => {
  useSEO({
    title: "Nome da Calculadora - CLT Fácil",
    description: "Descrição SEO da calculadora",
    canonical: "https://cltfacil.com/clt/minha-calculadora",
    jsonLd: generateCalculatorSchema("Nome", "Descrição", "URL")
  });

  return (
    // Implementação da calculadora
  );
};
```

## 🎨 Customização do Tema

### Alterar cores principais
Edite `src/index.css` nas variáveis CSS:
```css
:root {
  --primary: 217 71% 53%;      /* Azul principal */
  --primary-hover: 217 71% 48%; /* Hover do primary */
  /* ... */
}
```

### Adicionar nova variante de botão
Edite `src/components/ui/button.tsx`:
```tsx
variant: {
  // ... variantes existentes
  "minha-variante": "classes tailwind aqui",
}
```

## 📊 Analytics

### Google Analytics 4
Para ativar analytics:
1. Adicione `VITE_GA4_ID` no arquivo `.env`
2. Implementar gtag no `index.html` (próxima fase)

### Métricas importantes
- Page views por calculadora
- Taxa de conversão (uso das calculadoras)
- Tempo na página
- Taxa de rejeição

## 🔒 Aviso Legal

As calculadoras oferecem estimativas baseadas na legislação CLT vigente. Consulte sempre a CCT/ACT específica e busque orientação jurídica quando necessário.

---

**Versão**: 1.0 MVP  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Pronto para produção