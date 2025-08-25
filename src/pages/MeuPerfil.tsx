import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/ui/container";
import { useAuth } from "@/hooks/useAuth";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useSEO } from "@/hooks/useSEO";
import ProfileForm from "@/components/profile/ProfileForm";

const MeuPerfil = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isPro, loading: proLoading } = useProAndUsage();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useSEO({
    title: "Meu Perfil - CLT Fácil",
    description: "Gerencie seus dados pessoais e assinatura no CLT Fácil",
    canonical: "/meu-perfil"
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=" + encodeURIComponent("/meu-perfil"));
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
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
            <User className="w-6 h-6 text-primary" />
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
                  {isPro ? "Você tem acesso completo às calculadoras" : "Acesso limitado às calculadoras"}
                </CardDescription>
              </div>
              {isPro ? (
                <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                  <Crown className="h-3 w-3 mr-1" />
                  PRO Ativo
                </Badge>
              ) : (
                <Badge variant="outline">Gratuito</Badge>
              )}
            </div>
          </CardHeader>
          {isPro && (
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Gerencie sua assinatura, formas de pagamento ou cancele a qualquer momento.
              </p>
              <ProfileForm.ManageSubscriptionButton />
            </CardContent>
          )}
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