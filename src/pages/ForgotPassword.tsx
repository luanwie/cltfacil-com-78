import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Container from '@/components/ui/container';
import { Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const hasToken = useMemo(
    () => window.location.hash.includes('access_token') || searchParams.get('token'),
    [searchParams]
  );

  const { resetPassword, updatePassword } = useAuth();

  // Estado do formulário de "enviar e-mail"
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Estado do formulário de "definir nova senha"
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [updating, setUpdating] = useState(false);

  // feedback
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Garante que o Supabase inicialize a sessão de recovery (quando chegou via e-mail)
    if (hasToken) {
      // Apenas tocar a sessão para o helper capturar o hash
      supabase.auth.getSession().catch(() => {});
    }
  }, [hasToken]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(null); setSending(true);
    const { error } = await resetPassword(email);
    setSending(false);
    if (error) setErr(error.message);
    else setOk('Se existir uma conta com este e-mail, enviamos um link para redefinir a senha.');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(null);

    if (password.length < 8) {
      setErr('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setErr('As senhas não coincidem.');
      return;
    }

    setUpdating(true);
    const { error } = await updatePassword(password);
    setUpdating(false);

    if (error) setErr(error.message);
    else setOk('Senha atualizada com sucesso. Você já pode fazer login.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <div className="flex items-center justify-center p-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Calculator className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-foreground">CLT Fácil</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Container className="w-full max-w-md">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {hasToken ? 'Definir nova senha' : 'Esqueci minha senha'}
                </h1>
                <p className="text-muted-foreground">
                  {hasToken
                    ? 'Crie sua nova senha para acessar sua conta.'
                    : 'Informe seu e-mail para receber o link de redefinição.'}
                </p>
              </div>

              {err && (
                <Alert variant="destructive">
                  <AlertDescription>{err}</AlertDescription>
                </Alert>
              )}
              {ok && (
                <Alert>
                  <AlertDescription>{ok}</AlertDescription>
                </Alert>
              )}

              {!hasToken ? (
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={sending}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending ? 'Enviando…' : 'Enviar link de redefinição'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={updating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirmar nova senha</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      minLength={8}
                      disabled={updating}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={updating}>
                    {updating ? 'Atualizando…' : 'Atualizar senha'}
                  </Button>
                </form>
              )}

              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    </div>
  );
}
