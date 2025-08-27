import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Crown } from "lucide-react";

export const UsageBanner = () => {
  const { isLogged, isPro, remaining, canUse } = useProAndUsage();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide banner for PRO users
  if (isPro) return null;

  const handleUpgradeToPro = () => {
    if (!isLogged) {
      navigate(`/login?next=${encodeURIComponent("/assinar-pro")}`);
      return;
    }

    // Preserve UTM parameters when navigating to /assinar-pro
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.search;
    navigate(`/assinar-pro${searchParams}`);
  };

  if (isLogged && remaining > 0) {
    return (
      <Card className="p-4 border-warning/20 bg-warning/5">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span>Você tem <strong>{remaining} cálculos gratuitos</strong> restantes.</span>
        </div>
      </Card>
    );
  }

  if (remaining === 0) {
    return (
      <Card className="p-4 border-destructive/20 bg-destructive/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium">
              Limite atingido: Torne-se PRO para cálculos ilimitados
            </span>
          </div>
          <Button 
            onClick={handleUpgradeToPro}
            size="sm"
            className="bg-gradient-primary hover:opacity-90"
          >
            <Crown className="h-4 w-4 mr-2" />
            Tornar PRO
          </Button>
        </div>
      </Card>
    );
  }

  return null;
};