import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const LazyComptePage = lazy(() => import("@/pages/ComptePage"));

export const Route = createFileRoute("/_authenticated/compte")({
  component: ComptePageRoute,
});

function ComptePageRoute() {
  return (
    <Suspense fallback={null}>
      <LazyComptePage />
    </Suspense>
  );
}
