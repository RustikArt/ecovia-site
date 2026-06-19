import process from "node:process";

// Config serveur uniquement (.server.ts = jamais bundlé côté client).
// Sur Cloudflare Workers, lire process.env dans une fonction/handler, pas au module scope.

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
  };
}
