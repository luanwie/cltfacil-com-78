import { useEffect, useMemo, useState } from "react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type SubSummary = {
  id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | string;
  cancel_at_period_end: boolean;
  current_period_end: string | null; // ISO
  price_id: string | null;
  price_unit_amount: number | null;
  currency: string | null;
  product_name: string | null;
};

type Step = "LOADING" | "NEEDS_LOGIN" | "FREE" | "PRO_ACTIVE" | "PRO_CANCELLED_PENDING" | "ERROR";

const MeuPerfil = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState<string | null>(null);
  const [subMsg, setSubMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sub, setSub] = useState<SubSummary | null>(null);

  const ed
