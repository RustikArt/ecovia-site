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

  if (data?.role === role) {
    return true;
  }

  // Fallback if the role is stored only in accounts.role
  const { data: accountData, error: accountError } = await supabase
    .from("accounts")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (accountError) {
    console.error("[admin] account role lookup error:", accountError.message);
    return false;
  }

  return accountData?.role === role;
}
