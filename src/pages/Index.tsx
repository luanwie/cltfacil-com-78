import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Settings, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/ui/container";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useSEO } from "@/hooks/useSEO";
import ProfileForm from "@/components/profile/ProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type SubSummary = {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null; // ISO
  price_id: string | null;
  price_unit_amount: number | null;
  currency: string | null;
  product_name: string | null;
};

const MeuPerfil = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isPro, loading: proLoading } = useProAndUsage();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Sub/Stripe state
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState<string | null>(null);
  const [subMsg, setSubMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sub, setSub] = useState<SubSummary | null>(null);

  const edgeBase = useMemo(
    () => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
    []
  );

  useSEO({
    title: "Meu Perfil - CLT Fácil",
    description: "Gerencie seus dados pessoais e assinatura no CLT Fácil",
    canonical: "/meu-perfil",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=" + encodeURIComponent("/meu-perfil"));
      return;
    }
    if (user) {
      fetchProfile();
      fetchSubscription();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("nome, is_pro, calc_count")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchSubscription = async () => {
    if (!user) return;
    try {
      setSubLoading(true);
      setSubError(null);
      setSubMsg(null);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`${edgeBase}/get-subscription-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao carregar assinatura");
      if (!json.found || !json.subscription) {
        setSub(null);
      } else {
        setSub(json.subscription as SubSummary);
      }
    } catch (e: any) {
      setSubError(e.message);
    } finally {
      setSubLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm("Tem certeza que deseja cancelar? O acesso continuará até o fim do ciclo atual.")) return;
    try {
      setBusy(true);
      setSubError(null);
      setSubMsg(null);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`${edgeBase}/cancel-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao cancelar assinatura");

      const dt = json.current_period_end ? new Date(json.current_period_end) : null;
      setSubMsg(
        dt
          ? `Sua assinatura foi cancelada. Você tem até ${format(
              dt,
              "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
              { locale: ptBR }
            )} para utilizar.`
          : "Sua assinatura foi cancelada ao fim do ciclo."
      );
      await fetchSubscription();
    } catch (e: any) {
      setSubError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const renderAssinaturaCardBody = () => {
    if (subLoading || proLoading) {
      return (
        <CardContent>
          <Skeleton className="h-4 w-64 mb-3" />
          <Skeleton className="h-10 w-44" />
        </CardContent>
      );
    }

    // Quando não achamos assinatura no Stripe (ex.: usuário free)
    if (!sub) {
      return (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Você está no plano gratuito. Faça upgrade para liberar todas as calculadoras.
          </p>
          {/* Mantém seu botão atual (se tiver) */}
          <div className="mt-4">
            <ProfileForm.ManageSubscriptionButton />
          </div>
        </CardContent>
      );
    }

    // Com assinatura (Stripe) encontrada
    return (
      <CardContent>
        <div className="space-y-1">
          <p>
            <strong>Plano:</strong> {sub.product_name ?? sub.price_id ?? "—"}
          </p>
          <p>
            <strong>Status:</strong> {sub.status}
            {sub.cancel_at_period_end ? " (terminará no fim do ciclo)" : ""}
          </p>
          {sub.current_period_end && (
            <p>
              <strong>Próxima renovação:</strong>{" "}
              {format(new Date(sub.current_period_end), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          )}
        </div>

        {subError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{subError}</AlertDescription>
          </Alert>
        )}
        {subMsg && (
          <Alert className="mt-4">
            <AlertDescription>{subMsg}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          {/* Se quiser manter o portal do Stripe, mantenha seu botão existente */}
          <ProfileForm.ManageSubscriptionButton />

          {/* Botão de cancelamento direto (ao fim do ciclo) */}
          <Button variant="destructive" onClick={cancelSubscription} disabled={busy}>
            {busy ? "Processando…" : "Cancelar assinatura"}
          </Button>
        </div>
      </CardContent>
    );
  };

  if (authLoading || profileLoading) {
    return (
      <Container className="py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (!user) return null;

  return (
    <Container className="py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie seus dados e assinatura</p>
          </div>
        </div>

        {/* Status da Assinatura */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Assinatura
                </CardTitle>
                <CardDescription>
                  {isPro
                    ? "Você tem acesso completo às calculadoras"
                    : "Acesso limitado às calculadoras"}
                </CardDescription>
              </div>
              {isPro ? (
                <Badge
                  variant="default"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  PRO Ativo
                </Badge>
              ) : (
                <Badge variant="outline">Gratuito</Badge>
              )}
            </div>
          </CardHeader>

          {renderAssinaturaCardBody()}
        </Card>

        <Separator />

        {/* Formulário de Perfil */}
        <ProfileForm
          initialName={profile?.nome || ""}
          initialEmail={user.email || ""}
          onProfileUpdate={fetchProfile}
        />
      </div>
    </Container>
  );
};

export default MeuPerfil;
