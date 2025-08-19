import { AlertTriangle, BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

// remaining: null => ilimitado (PRO)
export default function UsageNotice({ remaining }: { remaining: number | null }) {
  if (remaining === null) return null; // PRO

  return (
    <Card className="p-3">
      {remaining > 0 ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-medium">
              Você tem {remaining} cálculos gratuitos restantes.
            </span>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/assinar-pro">
              <BadgeDollarSign className="w-4 h-4 mr-1" />
              Tornar PRO
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 text-amber-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Limite gratuito atingido. Torne-se PRO para continuar.
            </span>
          </div>
          <Button asChild size="sm">
            <Link to="/assinar-pro">Tornar PRO</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
