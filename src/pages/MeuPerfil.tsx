import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function MeuPerfil() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<SubSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const edgeBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  async function fetchSummary() {
    if (!user) return;
    setLoading(true); setErr(null); setMsg(null);
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const res = await fetch(`${edgeBase}/get-subscription-summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) {
      setErr(json.error || 'Falha ao carregar assinatura');
      setLoading(false);
      return;
    }
    if (!json.found || !json.subscription) {
      setSub(null);
    } else {
      setSub(json.subscription as SubSummary);
    }
    setLoading(false);
  }

  useEffect(() => { fetchSummary(); /* eslint-disable-next-line */ }, [user]);

  const cancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar? O acesso continuará até o fim do ciclo atual.')) return;
    try {
      setBusy(true); setErr(null); setMsg(null);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`${edgeBase}/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao cancelar');

      const dt = json.current_period_end ? new Date(json.current_period_end) : null;
      setMsg(
        dt
          ? `Sua assinatura foi cancelada. Você tem até ${format(dt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })} para utilizar.`
          : 'Sua assinatura foi cancelada ao fim do ciclo.'
      );
      await fetchSummary();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const renderBody = () => {
    if (loading) return <p>Carregando…</p>;
    if (!sub) return <p>Você não possui assinatura ativa.</p>;

    return (
      <>
        <div className="space-y-1">
          <p><strong>Plano:</strong> {sub.product_name ?? sub.price_id ?? '—'}</p>
          <p>
            <strong>Status:</strong> {sub.status}
            {sub.cancel_at_period_end ? ' (terminará no fim do ciclo)' : ''}
          </p>
          {sub.current_period_end && (
            <p>
              <strong>Próxima renovação:</strong>{' '}
              {format(new Date(sub.current_period_end), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="destructive" onClick={cancel} disabled={busy}>
            {busy ? 'Processando…' : 'Cancelar assinatura'}
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Meu Plano</h2>

        {err && (
          <Alert variant="destructive">
            <AlertDescription>{err}</AlertDescription>
          </Alert>
        )}
        {msg && (
          <Alert>
            <AlertDescription>{msg}</AlertDescription>
          </Alert>
        )}

        {renderBody()}
      </Card>
    </div>
  );
}
