# Déploiement d'Ecovia

## Objectif

Permettre un build et un déploiement simples du site Ecovia sur Cloudflare Workers avec Nitro.

## Prérequis

- Node.js 22+
- npm
- Un compte Cloudflare avec un `apiToken` et `accountId`
- Secrets GitHub configurés si vous utilisez GitHub Actions

## Variables d'environnement requises

Créez un fichier `.env` en copiant `.env.example` et en renseignant les valeurs :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SHOPIFY_STORE_DOMAIN`
- `VITE_SHOPIFY_STOREFRONT_TOKEN`
- `VITE_SHOPIFY_API_VERSION`
- `VITE_META_PIXEL_ID` (optionnel)
- `VITE_TIKTOK_PIXEL_ID` (optionnel)

## Scripts utiles

- `npm run dev` : lance le serveur Vite en local
- `npm run build` : construit le site pour production
- `npm run preview` : prévisualise le build en local
- `npm run deploy` : construit puis déploie via Wrangler

## Déploiement Cloudflare local

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Construire le projet :
   ```bash
   npm run build
   ```
3. Déployer sur Cloudflare :
   ```bash
   npx wrangler deploy
   ```

## GitHub Actions

La pipeline `.github/workflows/deploy.yml` exécute :

1. `npm ci`
2. `npm run build` avec les secrets Cloudflare et API exposées
3. `cloudflare/wrangler-action@v3` pour déployer

## Remarques

- `vite-tsconfig-paths` a été retiré : Vite gère maintenant `tsconfig` nativement via `resolve.tsconfigPaths: true`.
- Le projet utilise Nitro avec le preset `cloudflare_module`.
- Gardez `.env` hors du contrôle de version pour ne pas exposer vos clés.
