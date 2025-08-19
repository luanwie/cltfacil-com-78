// src/integrations/supabase/user-data.ts
import { supabase } from "./client";
import type { Database } from "./types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SavedCalc = Database["public"]["Tables"]["saved_calcs"]["Row"];
export type CalcHistory = Database["public"]["Tables"]["calc_history"]["Row"];

// Util: pega user_id logado
export async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("auth.getUser error", error);
    return null;
  }
  return data.user?.id ?? null;
}

// Garante que existe profile (cria se faltar)
export async function ensureProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // tenta buscar
  const { data: prof, error } = await supabase
    .from("profiles")
    .select("id,user_id,name,is_pro,calc_count,pro_since,created_at,updated_at")
    .eq("user_id", userId)
    .single();

  if (!error && prof) return prof;

  // cria default se não existir
  const { data: created, error: upErr } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      name: null,
      is_pro: false,
      calc_count: 0,
    })
    .select("id,user_id,name,is_pro,calc_count,pro_since,created_at,updated_at")
    .single();

  if (upErr) {
    console.error("ensureProfile insert error", upErr);
    return null;
  }
  return created ?? null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id,user_id,name,is_pro,calc_count,pro_since,created_at,updated_at")
    .eq("user_id", userId)
    .single();
  if (error) {
    console.error("getCurrentProfile", error);
    return null;
  }
  return data;
}

/** Salva um cálculo */
export async function saveCalculation(params: {
  calculator: string;
  input: unknown;
  result: unknown;
  note?: string | null;
}): Promise<SavedCalc | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("saved_calcs")
    .insert({
      user_id: userId,
      calculator: params.calculator,
      input: params.input as any,
      result: params.result as any,
      note: params.note ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("saveCalculation", error);
    return null;
  }
  return data;
}

export async function listSavedCalcs(): Promise<SavedCalc[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from("saved_calcs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listSavedCalcs", error);
    return [];
  }
  return data ?? [];
}

export async function deleteSavedCalc(id: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const { error } = await supabase
    .from("saved_calcs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    console.error("deleteSavedCalc", error);
    return false;
  }
  return true;
}

// Histórico (opcional – para “Meus cálculos”)
export async function addCalcHistory(params: {
  calculator: string;
  meta?: unknown;
}): Promise<CalcHistory | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const { data, error } = await supabase
    .from("calc_history")
    .insert({
      user_id: userId,
      calculator: params.calculator,
      meta: (params.meta ?? null) as any,
    })
    .select("*")
    .single();

  if (error) {
    console.error("addCalcHistory", error);
    return null;
  }
  return data;
}

export async function listCalcHistory(): Promise<CalcHistory[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from("calc_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listCalcHistory", error);
    return [];
  }
  return data ?? [];
}

/**
 * (Opcional) Mantive um alias para não quebrar nada se você
 * acidentalmente importou de aqui.
 * O incremento real você já tem em "@/utils/incrementCalc".
 */
export async function incrementCalcIfNeeded(_: boolean) {
  // deixado vazio de propósito — use o seu util atual.
  return;
}
// --- aliases p/ compatibilidade com o restante do projeto ---
export const getProfile = getCurrentProfile; // alias

// Atualiza apenas o 'name' do profile (email fica no auth user)
export async function upsertProfile(payload: { name?: string | null }) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "no-user" as const };

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        name: payload.name ?? null,
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("upsertProfile", error);
    return { error };
  }
  return { error: null };
}

// Atualiza senha do usuário no auth
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error("updatePassword", error);
    return { error };
  }
  return { data, error: null };
}

// Histórico (aliases)
export const listHistory = listCalcHistory;

// Salvar cálculo (alias)
export const saveCalc = saveCalculation;
