import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const LazyAuthPage = lazy(() => import("@/pages/AuthPage"));

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Ecovia" },
      {
        name: "description",
        content: "Connectez-vous à votre compte Ecovia ou créez-en un en quelques secondes.",
      },
    ],
  }),
  component: AuthPageRoute,
});

function AuthPageRoute() {
  return (
    <Suspense fallback={null}>
      <LazyAuthPage />
    </Suspense>
  );
}
