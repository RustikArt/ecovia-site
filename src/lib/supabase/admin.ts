import { supabase } from "@/integrations/supabase/client";

export async function hasRole(userId: string, role: "admin" | "customer") {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: role,
  });

  if (error) {
    console.error("[admin] has_role RPC error:", error.message);
    return false;
  }

  return Boolean(data);
}
