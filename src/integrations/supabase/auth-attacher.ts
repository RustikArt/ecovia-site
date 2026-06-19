import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

// Enregistré dans src/start.ts : transmet le token Supabase aux server functions.
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return next({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
});
