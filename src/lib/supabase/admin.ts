import { supabase } from "@/integrations/supabase/client";

export async function hasRole(userId: string, role: "admin" | "customer") {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();

  if (error) {
    console.error("[admin] role lookup error:", error.message);
    return false;
  }

  return Boolean(data?.role);
}
