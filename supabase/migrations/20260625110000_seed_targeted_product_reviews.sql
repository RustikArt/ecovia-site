-- Seed d'avis produits: ajoute entre 2 et 4 avis approuves par article
-- Compatible avec la table public.product_reviews creee dans 20260623120000_product_reviews.sql
--
-- Utilisation:
-- 1) Remplacer les handles dans target_products par vos handles Shopify reels.
-- 2) Executer ce script dans Supabase SQL Editor.
--
-- Proprietes:
-- - 2 a 4 avis par produit (cible: 2..4)
-- - style naturel avec texte adapte selon le type de produit detecte dans le handle
-- - insertion idempotente (evite les doublons auteur+commentaire+produit)
-- - ne depasse jamais 4 avis approuves pour un produit cible

BEGIN;

WITH target_products AS (
  -- Remplacez cette liste par VOS handles Shopify.
  -- Un handle par ligne.
  SELECT *
  FROM (VALUES
    ('olivier-artificiel-120cm'),
    ('ficus-lyrata-artificiel'),
    ('monstera-artificielle-xl'),
    ('eucalyptus-artificiel-premium'),
    ('sansevieria-artificielle-90cm'),
    ('pothos-retombant-artificiel')
  ) AS t(product_handle)
),

review_templates AS (
  SELECT *
  FROM (VALUES
    ('Camille', 'Recu rapidement, le rendu est propre et la silhouette est elegante.'),
    ('Nora', 'Tres bonne surprise au deballage, les finitions sont soignees.'),
    ('Julie', 'Installe en 2 minutes, ca habille la piece sans effort.'),
    ('Sophie', 'Le volume est bien proportionne, effet deco immediat.'),
    ('Manon', 'Conforme aux photos, ca fait vraiment premium en interieur.'),
    ('Lina', 'Le pot est stable et l ensemble est visuellement harmonieux.'),
    ('Chloe', 'Aucun entretien a prevoir et pourtant le rendu reste naturel.'),
    ('Elise', 'Belle texture des feuilles, tres bon choix pour un coin bureau.'),
    ('Sarah', 'J ai hesite avant de commander, finalement je suis ravie du resultat.'),
    ('Anais', 'Produit soigne, ideal pour apporter du vert sans contrainte.'),
    ('Ines', 'La qualite percue est au rendez-vous, surtout a la lumiere du jour.'),
    ('Lea', 'Simple, efficace et chic: exactement ce que je voulais pour la deco.')
  ) AS r(author_name, base_comment)
),

existing AS (
  SELECT
    tp.product_handle,
    COUNT(pr.id) FILTER (WHERE pr.status = 'approved')::int AS approved_count
  FROM target_products tp
  LEFT JOIN public.product_reviews pr
    ON pr.product_handle = tp.product_handle
  GROUP BY tp.product_handle
),

needs AS (
  SELECT
    e.product_handle,
    -- Cible pseudo-aleatoire stable: 2, 3 ou 4 avis selon le handle
    (2 + (ABS(hashtext(e.product_handle)) % 3))::int AS target_count,
    e.approved_count
  FROM existing e
),

needs_to_add AS (
  SELECT
    n.product_handle,
    n.target_count,
    GREATEST(0, n.target_count - n.approved_count)::int AS to_add
  FROM needs n
  WHERE n.approved_count < n.target_count
),

candidates AS (
  SELECT
    nta.product_handle,
    rt.author_name,

    -- Notes majoritairement 4-5, avec parfois 3 pour garder un rendu credibile
    CASE
      WHEN ABS(hashtext(nta.product_handle || '|' || rt.author_name)) % 10 < 6 THEN 5
      WHEN ABS(hashtext(nta.product_handle || '|' || rt.author_name)) % 10 < 9 THEN 4
      ELSE 3
    END::smallint AS rating,

    -- Commentaire cible selon le type de plante detecte dans le handle
    (
      rt.base_comment || ' ' ||
      CASE
        WHEN nta.product_handle ILIKE '%olivier%' THEN 'Les nuances du feuillage rappellent bien un olivier mediterraneen.'
        WHEN nta.product_handle ILIKE '%ficus%' THEN 'Le port du ficus est convaincant, parfait pres d une baie vitree.'
        WHEN nta.product_handle ILIKE '%monstera%' THEN 'Les decoupes des feuilles donnent un vrai esprit tropical au salon.'
        WHEN nta.product_handle ILIKE '%eucalyptus%' THEN 'Le ton des feuilles est doux, ideal pour une ambiance epuree.'
        WHEN nta.product_handle ILIKE '%sansevieria%' THEN 'La forme verticale fonctionne tres bien dans un espace etroit.'
        WHEN nta.product_handle ILIKE '%pothos%' OR nta.product_handle ILIKE '%retomb%' THEN 'L effet retombant est reussi, surtout sur une etagere haute.'
        ELSE 'Le style reste sobre et realiste, facile a integrer dans la deco.'
      END
    ) AS comment,

    'approved'::text AS status,

    -- Dates etalees sur les 3 dernieres semaines pour un historique naturel
    (
      now()
      - make_interval(days => (ABS(hashtext(rt.author_name || nta.product_handle)) % 21 + 1))
      - make_interval(hours => (ABS(hashtext(nta.product_handle || rt.author_name)) % 18))
    )::timestamptz AS created_at,

    ROW_NUMBER() OVER (
      PARTITION BY nta.product_handle
      ORDER BY md5(nta.product_handle || '|' || rt.author_name)
    ) AS rn,

    nta.to_add
  FROM needs_to_add nta
  CROSS JOIN review_templates rt
),

selected AS (
  SELECT
    c.product_handle,
    c.author_name,
    c.rating,
    c.comment,
    c.status,
    c.created_at
  FROM candidates c
  WHERE c.rn <= c.to_add
),

inserted AS (
  INSERT INTO public.product_reviews (
    product_handle,
    author_name,
    rating,
    comment,
    status,
    created_at
  )
  SELECT
    s.product_handle,
    s.author_name,
    s.rating,
    s.comment,
    s.status,
    s.created_at
  FROM selected s
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.product_reviews pr
    WHERE pr.product_handle = s.product_handle
      AND pr.author_name = s.author_name
      AND pr.comment = s.comment
  )
  RETURNING product_handle
)
SELECT
  tp.product_handle,
  COALESCE(e.approved_count, 0) AS approved_before,
  (
    SELECT COUNT(*)::int
    FROM inserted i
    WHERE i.product_handle = tp.product_handle
  ) AS inserted_now,
  (
    SELECT COUNT(*)::int
    FROM public.product_reviews pr2
    WHERE pr2.product_handle = tp.product_handle
      AND pr2.status = 'approved'
  ) AS approved_after
FROM target_products tp
LEFT JOIN existing e ON e.product_handle = tp.product_handle
ORDER BY tp.product_handle;

COMMIT;

-- Verification globale (optionnelle):
-- SELECT
--   product_handle,
--   COUNT(*) FILTER (WHERE status = 'approved') AS approved_reviews,
--   ROUND(AVG(rating)::numeric, 2) AS avg_rating
-- FROM public.product_reviews
-- GROUP BY product_handle
-- ORDER BY product_handle;
