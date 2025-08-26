import { useEffect, useState } from "react";
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

// --- Botão que abre o Portal do Cliente (Stripe) via Edge Function ---
function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-billing-portal-session", {
        body: { returnUrl: `${window.location.origin}/meu-perfil` },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Portal session returned no URL");
      window.location.href = data.url;
    } catch (e: any) {
      alert(`Falha ao abrir o portal: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={openPortal} disabled={loading}>
      {loading ? "Abrindo…" : "Gerenciar assinatura"}
    </Button>
  );
}

type Step = "LOADING" | "NEEDS_LOGIN" | "READY";

export default function MeuPerfil() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [syncing, setSyncing] = useState(false);
  const [syncErr, setSyncErr] = useState<string | null>(null);

  useSEO({
    title: "Meu Perfil - CLT Fácil",
    description: "Gerencie seus dados pessoais e assinatura no CLT Fácil",
    canonical: "/meu-perfil",
  });

  // Redireciona se não logado e carrega dados + sincroniza PRO
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=" + encodeURIComponent("/meu-perfil"));
      return;
    }
    if (user) {
      (async () => {
        await fetchProfile();
        await syncPro(); // sincroniza com Stripe e atualiza profile.is_pro
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("nome, is_pro, calc_count, pro_since")
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

  // Chama a Edge Function sync-pro-from-stripe (ATENÇÃO: precisa das secrets certas)
  const syncPro = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("sync-pro-from-stripe", { body: {} });
      if (error) throw error;
      // Recarrega o perfil para refletir o is_pro atualizado
      await fetchProfile();
    } catch (e: any) {
      setSyncErr(e?.message || "Falha ao sincronizar assinatura");
    } finally {
      setSyncing(false);
    }
  };

  const step: Step = authLoading || profileLoading ? "LOADING" : !user ? "NEEDS_LOGIN" : "READY";
  const isPro = !!profile?.is_pro;

  // Skeleton
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
                  {isPro ? "Você tem acesso completo às calculadoras" : "Acesso limitado às calculadoras"}
                </CardDescription>
              </div>
              {isPro ? (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                  <Crown className="h-3 w-3 mr-1" />
                  PRO Ativo
                </Badge>
              ) : (
                <Badge variant="outline">Gratuito</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {syncErr && (
              <Alert variant="destructive">
                <AlertDescription>{syncErr}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-3">
              {/* Sempre visível para abrir/cancelar no Portal do Cliente */}
              <ManageSubscriptionButton />
              {/* Sincroniza PRO agora */}
              <Button variant="outline" onClick={syncPro} disabled={syncing}>
                {syncing ? "Sincronizando…" : "Tentar novamente"}
              </Button>
            </div>

            {isPro && profile?.pro_since && (
              <p className="text-xs text-muted-foreground">
                PRO desde {new Date(profile.pro_since).toLocaleString()}
              </p>
            )}
          </CardContent>
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
}
