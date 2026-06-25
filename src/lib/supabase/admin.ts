import { supabase } from "@/integrations/supabase/client";

export async function hasRole(userId: string, role: "admin" | "customer") {
  const { data: rpcData, error: rpcError } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: role,
  });

  if (!rpcError) return Boolean(rpcData);

  console.warn("[admin] has_role rpc failed, fallback to accounts lookup:", rpcError.message);

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
