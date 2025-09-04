import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AssinarPro = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // ✅ NOVO: Estados separados para cada preço
  const [monthlyPrice, setMonthlyPrice] = useState("R$ 7,90/mês");
  const [yearlyPrice, setYearlyPrice] = useState("R$ 79,90/ano");
  const [yearlyEquivalent, setYearlyEquivalent] = useState("R$ 6,66/mês");

  // ⬇️ ATUALIZE com seus novos Payment Links do Stripe
  const LINK_MENSAL = "https://buy.stripe.com/4gM6oIaMheqt24M5ve1kA04"; // Substitua pelo link com preço R$ 7,90
  const LINK_ANUAL = "https://buy.stripe.com/9B66oI3jP2HLbFm1eY1kA07";   // Substitua pelo link do plano anual

  useEffect(() => {
    let mounted = true;
    
    // ✅ NOVO: Função para buscar preços
    const fetchPrices = async () => {
      try {
        // Buscar preço mensal
        const { data: monthlyData, error: monthlyError } = await supabase.functions.invoke("get-price", {
          body: { plan: "mensal" }
        });
        
        if (!monthlyError && monthlyData?.label && mounted) {
          setMonthlyPrice(monthlyData.label);
        }

        // Buscar preço anual
        const { data: yearlyData, error: yearlyError } = await supabase.functions.invoke("get-price", {
          body: { plan: "anual" }
        });
        
        if (!yearlyError && yearlyData?.label && mounted) {
          setYearlyPrice(yearlyData.label);
          
          // Calcular equivalente mensal do plano anual
          if (yearlyData.amount) {
            const monthlyEquivalent = (yearlyData.amount / 100) / 12;
            setYearlyEquivalent(`R$ ${monthlyEquivalent.toFixed(2).replace('.', ',')}/mês`);
          }
        }

      } catch (error) {
        console.warn("Erro ao buscar preços:", error);
        // Mantém os valores de fallback
      }
    };

    fetchPrices();
    return () => { mounted = false; };
  }, []);

  const goLogin = () => navigate(`/login?next=${encodeURIComponent("/assinar-pro")}`);

  const handleSubscribe = async (plan: 'mensal' | 'anual') => {
    if (!user) {
      goLogin();
      return;
    }
    setLoading(true);
    try {
      const url = plan === 'mensal' ? LINK_MENSAL : LINK_ANUAL;
      if (!url || url.includes("SEU_NOVO_LINK")) {
        toast.error("Link de pagamento não configurado. Entre em contato com o suporte.");
        return;
      }
      window.location.href = url;
    } catch (err) {
      console.error("Erro ao abrir Payment Link:", err);
      toast.error("Erro ao processar assinatura");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Cálculos ilimitados",
    "Acesso a todas as calculadoras",
    "Suporte prioritário",
    "Novas funcionalidades em primeira mão",
    "Sem anúncios",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-4 w-4 mr-1" />
            Plano PRO
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Torne-se <span className="text-primary">PRO</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Tenha acesso ilimitado a todas as calculadoras trabalhistas
          </p>
        </div>

        {!user && (
          <Card className="mb-8 border-amber-300">
            <CardHeader>
              <CardTitle>Faça login para assinar</CardTitle>
              <CardDescription>Você precisa entrar para concluir a assinatura PRO.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={goLogin}>Ir para o login</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Plano Gratuito */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Plano Gratuito</CardTitle>
              <CardDescription>Ideal para uso ocasional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">R$ 0</div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">4 cálculos por mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Acesso básico</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Plano PRO Mensal */}
          <Card className="border-primary relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Plano PRO Mensal
              </CardTitle>
              <CardDescription>Para profissionais e empresas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                {monthlyPrice} {/* ✅ DINÂMICO: preço mensal do Stripe */}
              </div>

              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleSubscribe('mensal')} 
                disabled={loading} 
                className="w-full" 
                size="lg"
              >
                {loading ? "Processando..." : "Assinar Mensal"}
              </Button>
            </CardContent>
          </Card>

          {/* Plano PRO Anual */}
          <Card className="border-primary relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">2 Meses Grátis</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Plano PRO Anual
              </CardTitle>
              <CardDescription>Melhor valor para empresas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                {yearlyPrice} {/* ✅ DINÂMICO: preço anual do Stripe */}
              </div>
              <div className="text-sm text-muted-foreground">
                Equivale a {yearlyEquivalent} {/* ✅ DINÂMICO: calculado automaticamente */}
              </div>

              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleSubscribe('anual')} 
                disabled={loading} 
                className="w-full" 
                size="lg"
              >
                {loading ? "Processando..." : "Assinar Anual"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Cancele a qualquer momento. Sem taxas ocultas.</p>
        </div>
      </div>
    </div>
  );
};

export default AssinarPro;