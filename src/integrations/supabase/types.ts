// src/integrations/supabase/types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          is_pro: boolean;
          calc_count: number;
          pro_since: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          is_pro?: boolean;
          calc_count?: number;
          pro_since?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };

      saved_calcs: {
        Row: {
          id: string;
          user_id: string;
          calculator: string;
          input: Json;
          result: Json;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          calculator: string;
          input: Json;
          result: Json;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_calcs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "saved_calcs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };

      calc_history: {
        Row: {
          id: string;
          user_id: string;
          calculator: string;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          calculator: string;
          meta?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calc_history"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "calc_history_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
