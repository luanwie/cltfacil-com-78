// src/utils/incrementCalc.ts

/**
 * Incrementa o contador de uso APENAS para contas FREE.
 * Assinatura retrocompatível: pode ser chamada com 1 ou 2 argumentos.
 *   - incrementCalcIfNeeded(isPro)
 *   - incrementCalcIfNeeded(isPro, isLogged)
 *
 * Armazena o contador em localStorage:
 *  - anonCalcCount: visitantes/usuários não logados
 *  - userCalcCount: usuários logados (não PRO)
 *
 * Observação: removida a dependência de 'supabase' para evitar erro de build.
 */

const ANON_KEY = "anonCalcCount";
const USER_KEY = "userCalcCount";

function safeGetLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    if (!("localStorage" in window)) return null;
    // Teste rápido (Safari private mode pode lançar)
    const testKey = "__ls_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

function inc(key: string) {
  const ls = safeGetLocalStorage();
  if (!ls) return;
  const raw = ls.getItem(key);
  const current = raw ? parseInt(raw, 10) || 0 : 0;
  ls.setItem(key, String(current + 1));
}

export async function incrementCalcIfNeeded(
  isPro: boolean,
  isLogged?: boolean
): Promise<void> {
  // PRO não consome créditos
  if (isPro) return;

  // Para manter compatibilidade, trata undefined como "não logado"
  const logged = Boolean(isLogged);

  // Apenas incrementa localmente; sem chamadas externas
  if (logged) {
    inc(USER_KEY);
  } else {
    inc(ANON_KEY);
  }

  // Mantém a função async/await-friendly
  return;
}
