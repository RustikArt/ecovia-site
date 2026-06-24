import { supabase } from "@/integrations/supabase/client";

export async function hasRole(userId: string, role: "admin" | "customer") {
  const { data, error } = await supabase
    .from("accounts")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[admin] role lookup error:", error.message);
    return false;
  }

  return data?.role === role;
}
