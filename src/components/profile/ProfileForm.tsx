import { useState } from "react";
import { Loader2, Save, Mail, Lock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
  onProfileUpdate?: () => void;
}

const ProfileForm = ({ initialName, initialEmail, onProfileUpdate }: ProfileFormProps) => {
  const { user } = useAuth();
  
  // Estados para cada seção
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Loading states
  const [nameLoading, setNameLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateName = async () => {
    if (!user || !name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setNameLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ nome: name.trim() })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nome atualizado com sucesso.",
      });

      onProfileUpdate?.();
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Erro",
        description: "E-mail inválido.",
        variant: "destructive",
      });
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });

      if (error) throw error;

      toast({
        title: "E-mail atualizado",
        description: "Verifique sua caixa de entrada para confirmar o novo e-mail.",
      });
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o e-mail. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (password.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Senha alterada com sucesso.",
      });

      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
            />
          </div>
          <Button 
            onClick={handleUpdateName} 
            disabled={nameLoading || !name.trim() || name === initialName}
            className="w-fit"
          >
            {nameLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar nome
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* E-mail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            E-mail
          </CardTitle>
          <CardDescription>
            Altere seu e-mail de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
            />
          </div>
          <Button 
            onClick={handleUpdateEmail} 
            disabled={emailLoading || !email.trim() || email === initialEmail}
            className="w-fit"
          >
            {emailLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Atualizar e-mail
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Senha
          </CardTitle>
          <CardDescription>
            Altere sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha (mín. 8 caracteres)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
            />
          </div>
          <Button 
            onClick={handleUpdatePassword} 
            disabled={passwordLoading || !password || password !== confirmPassword}
            className="w-fit"
          >
            {passwordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Alterar senha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente separado para gerenciar assinatura
const ManageSubscriptionButton = () => {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL do portal não recebida');
      }
    } catch (error: any) {
      console.error('Error opening billing portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleManageSubscription} 
      disabled={loading}
      className="gap-2"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      <Settings className="w-4 h-4" />
      Gerenciar assinatura
    </Button>
  );
};

ProfileForm.ManageSubscriptionButton = ManageSubscriptionButton;

export default ProfileForm;