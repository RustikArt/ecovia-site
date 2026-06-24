-- Table des avis produits soumis par les clients
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  product_handle text     NOT NULL,
  author_name text        NOT NULL,
  rating      smallint    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text        NOT NULL,
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Index pour requêtes filtrées par produit + statut
CREATE INDEX IF NOT EXISTS product_reviews_handle_status_idx
  ON public.product_reviews (product_handle, status);

-- RLS activé : accès restreint par politique
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut soumettre un avis (en statut 'pending' uniquement)
DROP POLICY IF EXISTS "Public can insert pending reviews" ON public.product_reviews;
CREATE POLICY "Public can insert pending reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (status = 'pending');

-- Tout le monde peut lire les avis approuvés
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.product_reviews;
CREATE POLICY "Public can read approved reviews"
  ON public.product_reviews FOR SELECT
  USING (status = 'approved');

-- Les admins peuvent lire et modifier tous les avis
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.product_reviews;
CREATE POLICY "Admins can manage reviews"
  ON public.product_reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'::public.app_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'::public.app_role
    )
  );
