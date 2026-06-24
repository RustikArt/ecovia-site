import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const LazyAdminPage = lazy(() => import("@/pages/AdminPage"));

export const Route = createFileRoute("/admin-5d4f7e9c2b")({
  head: () => ({
    meta: [
      { title: "Dashboard admin - Ecovia" },
      {
        name: "description",
        content: "Moderation des avis et gestion simple des comptes clients Ecovia.",
      },
    ],
  }),
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const [{ supabase }, { hasRole }] = await Promise.all([
      import("@/integrations/supabase/client"),
      import("@/lib/supabase/admin"),
    ]);
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
    const allowed = await hasRole(data.session.user.id, "admin");
    if (!allowed) throw redirect({ to: "/compte" });
    return { user: data.session.user };
  },
  component: AdminPageRoute,
});

function AdminPageRoute() {
  return (
    <Suspense fallback={null}>
      <LazyAdminPage />
    </Suspense>
  );
}
