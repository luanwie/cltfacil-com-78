// src/integrations/supabase/user-data.ts
import { supabase } from "./client";
import type { Database } from "./types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Util: pega user_id logado
export async function getCurrentUserId(): Promise<string | null> {
  try {
    // Cast para ambientes onde os tipos antigos não expõem getSession/getUser corretamente
    const { data, error } = await (supabase.auth as any).getUser();
    if (error) {
      console.error("auth.getUser error", error);
      return null;
    }
    return data?.user?.id ?? null;
  } catch (e) {
    console.error("auth.getUser exception", e);
    return null;
  }
}

// Garante que existe profile (cria se faltar)
export async function ensureProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data: prof, error } = await supabase
    .from("profiles")
    .select("id,user_id,nome,is_pro,calc_count,pro_since,created_at,updated_at")
    .eq("user_id", userId)
    .single();

  if (!error && prof) return prof;

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

// Aliases p/ compatibilidade
export const getProfile = getCurrentProfile;

// Atualiza apenas a senha (auth)
export async function updatePassword(newPassword: string) {
  const { data, error } = await (supabase.auth as any).updateUser({ password: newPassword });
  if (error) {
    console.error("updatePassword", error);
    return { error };
  }
  return { data, error: null };
}

// Placeholders (tabelas não existem ainda)
export const saveCalculation = () => null;
export const listSavedCalcs = () => [];
export const deleteSavedCalc = () => false;
export const addCalcHistory = () => null;
export const listCalcHistory = () => [];
export const incrementCalcIfNeeded = () => {};

// Aliases
export const listHistory = listCalcHistory;
export const saveCalc = saveCalculation;
