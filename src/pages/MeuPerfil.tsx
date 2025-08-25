import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Settings, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/ui/container";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import ProfileForm from "@/components/profile/ProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type SubSummary = {
  id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | string;
  cancel_at_period_end: boolean;
  current_period_end: string | null; // ISO
  price_id: string | null;
  price_unit_amount: number | null;
  currency: string | null;
  product_name: string | null;
};

type Step = "LOADING" | "NEEDS_LOGIN" | "FREE" | "PRO_ACTIVE" | "PRO_CANCELLED_PENDING" | "ERROR";

const MeuPerfil = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState<string | null>(null);
  const [subMsg, setSubMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sub, setSub] = useState<SubSummary | null>(null);

  const edgeBase = useMemo(() => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`, []);
  useSEO({
    title: "Meu Perfil - CLT Fácil",
    description: "Gerencie seus dados pessoais e assinatura no CLT Fácil",
    canonical: "/meu-perfil",
  });

  // Redireciona se não logado e carrega dados quando logado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=" + encodeURIComponent("/meu-perfil"));
      return;
    }
    if (user) {
      fetchProfile();
      fetchSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("nome, calc_count")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (e) {
      console.error("Error fetching profile:", e);
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao cancelar assinatura");

      const dt = json.current_period_end ? new Date(json.current_period_end) : null;
      setSubMsg(
        dt
          ? `Sua assinatura foi cancelada. Você tem até ${format(dt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
              locale: ptBR,
            })} para utilizar.`
          : "Sua assinatura foi cancelada ao fim do ciclo."
      );
      await fetchSubscription();
    } catch (e: any) {
      setSubError(e.message);
    } finally {
      setBusy(false);
    }
  };

  // Deriva a etapa atual
  const step: Step = (() => {
    if (authLoading || profileLoading || subLoading) return "LOADING";
    if (!user) return "NEEDS_LOGIN";
    if (subError) return "ERROR";
    if (!sub) return "FREE";
    const active = sub.status === "active" || sub.status === "trialing" || sub.status === "past_due";
    if (active && sub.cancel_at_period_end) return "PRO_CANCELLED_PENDING";
    if (active) return "PRO_ACTIVE";
    return "FREE"; // fallback conservador
  })();

  // UI helpers
  const PlanBadge = () =>
    step === "PRO_ACTIVE" || step === "PRO_CANCELLED_PENDING" ? (
      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
        <Crown className="h-3 w-3 mr-1" />
        PRO Ativo
      </Badge>
    ) : (
      <Badge variant="outline">Gratuito</Badge>
    );

  const AssinaturaBody = () => {
    if (step === "LOADING") {
      return (
        <CardContent>
          <Skeleton className="h-4 w-64 mb-3" />
          <Skeleton className="h-10 w-44" />
        </CardContent>
      );
    }

    if (step === "ERROR") {
      return (
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{subError || "Erro ao carregar assinatura"}</AlertDescription>
          </Alert>
        </CardContent>
      );
    }

    if (step === "FREE") {
      return (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Você está no plano gratuito. Faça upgrade para liberar todas as calculadoras.
          </p>
          <div className="mt-4">
            <ProfileForm.ManageSubscriptionButton />
          </div>
        </CardContent>
      );
    }

    // PRO_ACTIVE ou PRO_CANCELLED_PENDING
    return (
      <CardContent>
        <div className="space-y-1">
          <p>
            <strong>Plano:</strong> {sub?.product_name ?? sub?.price_id ?? "—"}
          </p>
          <p>
            <strong>Status:</strong> {sub?.status}
            {sub?.cancel_at_period_end ? " (terminará no fim do ciclo)" : ""}
          </p>
          {sub?.current_period_end && (
            <p>
              <strong>Próxima renovação:</strong>{" "}
              {format(new Date(sub.current_period_end), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
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
          <ProfileForm.ManageSubscriptionButton />
          <Button variant="destructive" onClick={cancelSubscription} disabled={busy}>
            {busy ? "Processando…" : "Cancelar assinatura"}
          </Button>
        </div>
      </CardContent>
    );
  };

  // Skeleton geral enquanto carrega auth/perfil/sub
  if (step === "LOADING") {
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

  // Se não logado, o effect já redirecionou
  if (step === "NEEDS_LOGIN") return null;

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

        {/* Assinatura */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Assinatura
                </CardTitle>
                <CardDescription>
                  {step === "FREE"
                    ? "Acesso limitado às calculadoras"
                    : "Você tem acesso completo às calculadoras"}
                </CardDescription>
              </div>
              <PlanBadge />
            </div>
          </CardHeader>
          <AssinaturaBody />
        </Card>

        <Separator />

        {/* Formulário de Perfil */}
        <ProfileForm
          initialName={profile?.nome || ""}
          initialEmail={user?.email || ""}
          onProfileUpdate={fetchProfile}
        />
      </div>
    </Container>
  );
};

export default MeuPerfil;
