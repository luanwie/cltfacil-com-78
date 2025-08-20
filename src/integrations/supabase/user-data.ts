// src/integrations/supabase/user-data.ts
import { supabase } from "./client";
import type { Database } from "./types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

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
    .select("id,user_id,nome,is_pro,calc_count,pro_since,created_at,updated_at")
    .eq("user_id", userId)
    .single();

  if (!error && prof) return prof;

  // cria default se não existir
  const { data: created, error: upErr } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      nome: null,
      is_pro: false,
      calc_count: 0,
    })
    .select("id,user_id,nome,is_pro,calc_count,pro_since,created_at,updated_at")
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
    .select("id,user_id,nome,is_pro,calc_count,pro_since,created_at,updated_at")
    .eq("user_id", userId)
    .single();
  if (error) {
    console.error("getCurrentProfile", error);
    return null;
  }
  return data;
}

// Aliases p/ compatibilidade com o restante do projeto
export const getProfile = getCurrentProfile; // alias

// Atualiza apenas o 'nome' do profile (email fica no auth user)
export async function upsertProfile(payload: { nome?: string | null }) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "no-user" as const };

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        nome: payload.nome ?? null,
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

// Placeholder functions for future implementation (saved_calcs and calc_history tables don't exist yet)
export const saveCalculation = () => null;
export const listSavedCalcs = () => [];
export const deleteSavedCalc = () => false;
export const addCalcHistory = () => null;
export const listCalcHistory = () => [];
export const incrementCalcIfNeeded = () => {};

// Aliases for compatibility
export const listHistory = listCalcHistory;
export const saveCalc = saveCalculation;
