import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

export const UsageTopBanner = () => {
  const { isLogged, isPro, remaining, canUse } = useProAndUsage();
  const navigate = useNavigate();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);

  // Hide banner for PRO users or if dismissed
  if (isPro || dismissed) return null;

  const handleSignup = () => {
    navigate(`/signup?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const handleUpgradeToPro = async () => {
    if (!isLogged) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('checkout');
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        navigate('/assinar-pro');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      navigate('/assinar-pro');
    }
  };

  // Show signup banner for non-logged users after they've used calculations
  if (!isLogged && remaining < 1) {
    return (
      <div className="sticky top-0 z-40 bg-[hsl(var(--info-banner))] text-[hsl(var(--info-banner-foreground))] px-4 py-3 border-b border-[hsl(var(--info-banner-foreground)/0.2)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl">💼</span>
            <p className="text-sm font-medium truncate sm:text-base">
              Você está usando muito o CLTFácil! Cadastre-se grátis para histórico ilimitado e funcionalidades extras
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              onClick={handleSignup}
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground whitespace-nowrap"
            >
              Cadastrar Grátis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="p-1 h-8 w-8 hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show PRO upgrade banner for logged users who reached limit
  if (isLogged && remaining === 0) {
    return (
      <div className="sticky top-0 z-40 bg-[hsl(var(--pro-banner))] text-[hsl(var(--pro-banner-foreground))] px-4 py-3 border-b border-white/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl">🚀</span>
            <p className="text-sm font-medium truncate sm:text-base">
              Upgrade para PRO: Relatórios personalizados, exportação PDF e mais
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              onClick={handleUpgradeToPro}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white whitespace-nowrap"
            >
              Tornar PRO
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="p-1 h-8 w-8 hover:bg-white/10 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};