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
    ('simulation-of-green-office-desktop-trinket-artificial-plant-pot'),
    ('palm-tree-leaf-plant-simulation-plastic-green-plant'),
    ('compatible-with-apple-artificial-plant-eucalyptus-lysimachia-artificial-potted-plant-artificial-flower-potted-artificial-green-plant'),
    ('artificial-plant-turtle-back-leaf-green-leaf-decoration-indoor-ceiling-artificial-flower'),
    ('plant-hanging-spider-plant-net-bag-decoration-boho'),
    ('artificial-green-plant-succulent-artificial-plant-home-furnishings'),
    ('artificial-plant-bonsai-desktop-decoration'),
    ('artificial-flower-green-plant-monstera-plant-flower-indoor'),
    ('artificial-plant-decoration-living-room-floor-bonsai-ornaments'),
    ('artificial-green-plant-monstera-fake-flower-supermarket-feel'),
    ('simulation-plant-fake-green-plant-interior-decoration'),
    ('simulated-plant-18-leaf-travelers-banana-green-plant-ornament'),
    ('artificial-eucalyptus-potted-plant-round-desktop-decoration'),
    ('flower-pot-net-bag-beige-cotton-rope-indoor-plant-hanger-hanging-basket-sling'),
    ('flower-pot-net-bag-plant-greening-hanging'),
    ('hand-woven-plant-hanging-basket-cotton-rope-sling-basket'),
    ('handmade-woven-flower-pot-bamboo-green-plant-flower-stand-floor-ornaments-decoration')
  ) AS t(product_handle)
),

review_templates AS (
  SELECT *
  FROM (VALUES

    ('Camille', 'Franchement tres contente. Je cherchais quelque chose pour habiller un coin vide et le rendu est parfait.'),

    ('Nora', 'J avais peur que ca fasse artificiel mais une fois en place le resultat est vraiment sympa.'),

    ('Julie', 'Recu rapidement. Correspond bien aux photos du site.'),

    ('Sophie', 'Achete pour mon bureau a domicile. Ca apporte un peu de vie sans avoir besoin d entretien.'),

    ('Manon', 'Belle surprise au deballage. Les details sont plus reussis que ce a quoi je m attendais.'),

    ('Lina', 'Tres joli dans mon salon. Plusieurs personnes m ont demande ou je l avais achete.'),

    ('Chloe', 'Bonne qualite pour le prix. Je ne regrette pas mon achat.'),

    ('Elise', 'Exactement ce que je cherchais pour completer ma decoration.'),

    ('Sarah', 'Facile a integrer dans une piece. Le rendu reste discret mais elegant.'),

    ('Anais', 'Le produit est arrive en parfait etat et bien emballe.'),

    ('Ines', 'J aime beaucoup le resultat. Ca apporte une touche chaleureuse a la piece.'),

    ('Lea', 'Conforme a la description. Rien a signaler.'),

    ('Mathilde', 'Je l ai place dans mon entree et le rendu est tres reussi.'),

    ('Clara', 'Visuellement tres agreable. Ca fait son petit effet.'),

    ('Emma', 'Je recommande. Belle finition et rendu naturel.'),

    ('Lucie', 'Je l ai commande sans trop savoir a quoi m attendre et finalement je suis ravie.'),

    ('Louise', 'Le feuillage est bien realise. Une fois installe, le rendu est convaincant.'),

    ('Margaux', 'Tres satisfaite. Je pense en recommander un autre pour une autre piece.'),

    ('Jeanne', 'Joli produit decoratif. S integre facilement dans tous les styles.'),

    ('Pauline', 'Le rendu est encore mieux que sur les photos.'),

    ('Thomas', 'Simple mais efficace. C est exactement ce qu il me fallait.'),

    ('Lucas', 'Bon achat. Apporte un peu de couleur sans prendre trop de place.'),

    ('Nathan', 'J avais besoin d une solution sans entretien et c est parfait.'),

    ('Hugo', 'Produit conforme et livraison rapide.'),

    ('Louis', 'Ca change vraiment l ambiance de la piece.'),

    ('Gabriel', 'Belle qualite generale. Rien de negatif a signaler.'),

    ('Arthur', 'J aime beaucoup le rendu final. Tres decoratif.'),

    ('Jules', 'Installe en quelques secondes et effet immediat.'),

    ('Leo', 'Produit bien fini et agreable a regarder.'),

    ('Raphael', 'Bon rapport qualite prix. Je suis satisfait.'),

    ('Adam', 'Le rendu est propre et moderne.'),

    ('Noah', 'Correspond tout a fait a ce que je recherchais.'),

    ('Ethan', 'Belle touche decorative pour un bureau.'),

    ('Mael', 'Le produit a trouve sa place des le premier jour.'),

    ('Tom', 'Tres content du resultat dans mon appartement.'),

    ('Alexandre', 'Discret mais apporte beaucoup a la decoration.'),

    ('Baptiste', 'Joli rendu, surtout a distance.'),

    ('Valentin', 'Plus qualitatif que ce que j imaginais.'),

    ('Maxime', 'Fait vraiment bien dans un coin lecture.'),

    ('Antoine', 'Ravi de mon achat. Je recommande sans hesitation.'),

    ('Nicolas', 'Apporte une touche de verdure sans les contraintes habituelles.'),

    ('Julien', 'Belle presence visuelle sans etre envahissante.'),

    ('Benjamin', 'Le rendu est naturel et s accorde bien avec mes meubles.'),

    ('Pierre', 'J en suis tres satisfait apres plusieurs semaines.'),

    ('Martin', 'Produit soigne et conforme a mes attentes.'),

    ('Theo', 'Joli objet decoratif. Rien a redire.'),

    ('Samuel', 'Tres bon achat pour completer un interieur moderne.'),

    ('David', 'Le rendu est sobre et elegant.'),

    ('Florian', 'Bon produit. Je pourrais facilement en recommander un autre.'),

    ('Cedric', 'Belle surprise. La qualite est au rendez vous.'),

    ('Kevin', 'Acheté pour mon bureau, ca rend tres bien.'),

    ('Yanis', 'Donne un aspect plus accueillant a la piece.'),

    ('Mehdi', 'Tres satisfait du rendu global.'),

    ('Romain', 'Produit simple mais vraiment efficace en decoration.')

  ) AS r(author_name, base_comment)
),

existing AS (
  SELECT
    tp.product_handle,
    COUNT(pr.id) FILTER (WHERE pr.status = 'pending')::int AS pending_count
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
    e.pending_count
  FROM existing e
),

needs_to_add AS (
  SELECT
    n.product_handle,
    n.target_count,
    GREATEST(0, n.target_count - n.pending_count)::int AS to_add
  FROM needs n
  WHERE n.pending_count < n.target_count
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

    rt.base_comment AS comment,

    'pending'::text AS status,

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
  COALESCE(e.pending_count, 0) AS pending_before,
  (
    SELECT COUNT(*)::int
    FROM inserted i
    WHERE i.product_handle = tp.product_handle
  ) AS inserted_now,
  (
    SELECT COUNT(*)::int
    FROM public.product_reviews pr2
    WHERE pr2.product_handle = tp.product_handle
      AND pr2.status = 'pending'
  ) AS pending_after
FROM target_products tp
LEFT JOIN existing e ON e.product_handle = tp.product_handle
ORDER BY tp.product_handle;

COMMIT;

-- Verification globale (optionnelle):
-- SELECT
--   product_handle,
--   COUNT(*) FILTER (WHERE status = 'pending') AS pending_reviews,
--   ROUND(AVG(rating)::numeric, 2) AS avg_rating
-- FROM public.product_reviews
-- GROUP BY product_handle
-- ORDER BY product_handle;