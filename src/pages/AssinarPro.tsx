import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AssinarPro = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Estados para preços dinâmicos
  const [monthlyPrice, setMonthlyPrice] = useState("R$ 7,90/mês");
  const [yearlyPrice, setYearlyPrice] = useState("R$ 79,90/ano");
  const [yearlyEquivalent, setYearlyEquivalent] = useState("R$ 6,66/mês");
  
  // Contador regressivo (24 horas)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Links de pagamento
  const LINK_MENSAL = "https://buy.stripe.com/9B66oI3jP2HLbFm1eY1kA07";
  const LINK_ANUAL = "https://buy.stripe.com/4gM6oIaMheqt24M5ve1kA04";

  // Contador regressivo
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset para 24h quando chegar a 0
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Buscar preços do Stripe
  useEffect(() => {
    let mounted = true;
    
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
          
          if (yearlyData.amount) {
            const monthlyEquivalent = (yearlyData.amount / 100) / 12;
            setYearlyEquivalent(`R$ ${monthlyEquivalent.toFixed(2).replace('.', ',')}/mês`);
          }
        }

      } catch (error) {
        console.warn("Erro ao buscar preços:", error);
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

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Banner de Promoção */}
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 text-white p-6 rounded-xl mb-8 text-center shadow-2xl border-2 border-red-400">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
            <h2 className="text-2xl font-bold">🔥 PROMOÇÃO ESPECIAL 🔥</h2>
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          
          <p className="text-lg mb-4 font-semibold">
            Desconto de até <span className="text-3xl font-black text-yellow-300">60% OFF</span> por tempo limitado!
          </p>
          
          {/* Contador Regressivo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            <span className="font-bold">Oferta expira em:</span>
          </div>
          
          <div className="flex justify-center gap-4 mb-4">
            <div className="bg-black/20 backdrop-blur px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold">{formatTime(timeLeft.hours)}</div>
              <div className="text-xs">HORAS</div>
            </div>
            <div className="bg-black/20 backdrop-blur px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold">{formatTime(timeLeft.minutes)}</div>
              <div className="text-xs">MIN</div>
            </div>
            <div className="bg-black/20 backdrop-blur px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold animate-pulse">{formatTime(timeLeft.seconds)}</div>
              <div className="text-xs">SEG</div>
            </div>
          </div>
          
          <p className="text-sm font-medium opacity-90">
            ⚡ Aproveite agora antes que seja tarde demais!
          </p>
        </div>

        {/* Título Principal */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 bg-yellow-100 text-yellow-800 border-yellow-300">
            <Star className="h-4 w-4 mr-1" />
            Plano PRO com Desconto
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Torne-se <span className="text-primary">PRO</span> com Super Desconto
          </h1>
          <p className="text-xl text-muted-foreground">
            Tenha acesso ilimitado a todas as calculadoras trabalhistas
          </p>
        </div>

        {!user && (
          <Card className="mb-8 border-amber-300">
            <CardHeader>
              <CardTitle>Faça login para aproveitar a promoção</CardTitle>
              <CardDescription>Você precisa entrar para concluir a assinatura PRO com desconto.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={goLogin}>Ir para o login</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Plano Gratuito */}
          <Card className="opacity-75">
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

          {/* Plano PRO Mensal - COM PROMOÇÃO */}
          <Card className="border-orange-500 border-2 relative shadow-2xl transform scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-orange-500 text-white px-4 py-1 animate-pulse">
                🔥 60% OFF
              </Badge>
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Plano PRO Mensal
              </CardTitle>
              <CardDescription>Para profissionais e empresas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Preços com Desconto */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg text-muted-foreground line-through">
                    De R$ 19,90/mês
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    -60%
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-orange-500">
                  Por {monthlyPrice}
                </div>
                <p className="text-sm text-green-600 font-semibold">
                  💰 Você economiza R$ 12,00/mês
                </p>
              </div>

              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleSubscribe('mensal')} 
                disabled={loading} 
                className="w-full bg-orange-500 hover:bg-orange-600" 
                size="lg"
              >
                {loading ? "Processando..." : "🔥 Aproveitar Oferta Mensal"}
              </Button>
            </CardContent>
          </Card>

          {/* Plano PRO Anual - COM PROMOÇÃO */}
          <Card className="border-green-500 border-2 relative shadow-2xl transform scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-green-500 text-white px-4 py-1 animate-pulse">
                🚀 MELHOR OFERTA
              </Badge>
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                Plano PRO Anual
              </CardTitle>
              <CardDescription>Máximo desconto + 2 meses grátis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Preços com Desconto */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg text-muted-foreground line-through">
                    De R$ 199,00/ano
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    -60%
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-green-500">
                  Por {yearlyPrice}
                </div>
                <div className="text-sm text-muted-foreground">
                  Equivale a {yearlyEquivalent}
                </div>
                <p className="text-sm text-green-600 font-semibold bg-green-50 p-2 rounded-md border border-green-200">
                  💰 Você economiza R$ 119,10 no ano!
                </p>
              </div>

              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleSubscribe('anual')} 
                disabled={loading} 
                className="w-full bg-green-500 hover:bg-green-600" 
                size="lg"
              >
                {loading ? "Processando..." : "🚀 Aproveitar Melhor Oferta"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer com Garantias */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancele a qualquer momento</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sem taxas ocultas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Suporte 24/7</span>
            </div>
          </div>
          
          <p className="text-xs text-red-500 font-semibold animate-pulse">
            ⚠️ Esta oferta especial expira em menos de 24 horas!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssinarPro;