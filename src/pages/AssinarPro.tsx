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
  const [priceLabel, setPriceLabel] = useState("R$ 19,90/mês"); // fallback

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-price");
        if (!mounted) return;
        if (error) {
          console.warn("get-price error:", error);
          return; // mantém fallback
        }
        if (data?.label) setPriceLabel(data.label);
      } catch (e) {
        console.warn("get-price failed:", e);
      }
    })();
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
      const { data, error } = await supabase.functions.invoke("checkout", {
        body: { plan }
      });
      if (error) {
        console.error("Checkout error:", error);
        toast.error("Erro ao criar checkout: " + error.message);
        return;
      }
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("URL de checkout não encontrada");
      }
    } catch (err) {
      console.error("Error creating checkout:", err);
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
                R$ 19,90/mês
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
                R$ 149,90/ano
              </div>
              <div className="text-sm text-muted-foreground">
                Equivale a R$ 12,49/mês
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
