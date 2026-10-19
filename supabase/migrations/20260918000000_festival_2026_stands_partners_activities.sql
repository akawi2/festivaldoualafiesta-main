-- Édition 2026 : nouveaux tarifs/infos des stands (fiche A), souscriptions
-- sponsoring (fiche B) et visibilité (fiche C), inscriptions aux activités
-- (Mami Makala / Papa Beignet / Besua) et programme daté 2026.

-- 1) Stands : infos exposant demandées par la fiche A ---------------------
ALTER TABLE public.stand_reservations
  ADD COLUMN IF NOT EXISTS representative_name text,
  ADD COLUMN IF NOT EXISTS representative_position text,
  ADD COLUMN IF NOT EXISTS activity_sector text,
  ADD COLUMN IF NOT EXISTS email text;

-- Les anciennes signatures restaient appelables en parallèle (autres
-- surcharges, sans anti-spam) : on les supprime toutes avant de recréer.
DROP FUNCTION IF EXISTS public.submit_stand_reservation(text, text, text, integer);
DROP FUNCTION IF EXISTS public.submit_stand_reservation(text, text, text, integer, integer);
DROP FUNCTION IF EXISTS public.submit_stand_reservation(text, text, text, integer, integer, integer);
DROP FUNCTION IF EXISTS public.submit_stand_reservation(text, text, text, integer, integer, integer, text, text);

CREATE OR REPLACE FUNCTION public.submit_stand_reservation(
  p_stand_type text,
  p_stand_name text,
  p_stand_phone text,
  p_quantity integer DEFAULT 1,
  p_price_fcfa integer DEFAULT NULL, -- ignoré : compat. avec l'ancien front
  p_total_price integer DEFAULT NULL, -- ignoré : compat. avec l'ancien front
  p_ip text DEFAULT NULL,
  p_fingerprint text DEFAULT NULL,
  p_representative_name text DEFAULT NULL,
  p_representative_position text DEFAULT NULL,
  p_activity_sector text DEFAULT NULL,
  p_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
  stand_price integer;
BEGIN
  -- Le prix vient toujours du serveur (jamais du client).
  CASE p_stand_type
    WHEN 'Emplacement mutuel' THEN stand_price := 15000;
    WHEN 'Stand Social' THEN stand_price := 100000;
    WHEN 'Stand Business' THEN stand_price := 250000;
    WHEN 'Stand Partenaire' THEN stand_price := 500000;
    ELSE RAISE EXCEPTION 'Type de stand inconnu.' USING ERRCODE = 'P0001';
  END CASE;

  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 50 THEN
    RAISE EXCEPTION 'Quantité invalide.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.stand_reservations (
    stand_type, stand_name, stand_phone, quantity, price_fcfa, total_price,
    submitter_ip, submitter_fingerprint,
    representative_name, representative_position, activity_sector, email
  )
  VALUES (
    p_stand_type, p_stand_name, p_stand_phone, p_quantity, stand_price, stand_price * p_quantity,
    p_ip, p_fingerprint,
    p_representative_name, p_representative_position, p_activity_sector, p_email
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_stand_reservation(text, text, text, integer, integer, integer, text, text, text, text, text, text) TO anon, authenticated;

-- 2) Catalogue sponsoring / visibilité (source unique des prix) -----------
CREATE TABLE IF NOT EXISTS public.partner_catalog (
  key text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('sponsoring', 'visibility')),
  category text,
  label_fr text NOT NULL,
  label_en text NOT NULL,
  price_fcfa integer, -- NULL = sur devis
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.partner_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view partner catalog" ON public.partner_catalog;
CREATE POLICY "Anyone can view partner catalog" ON public.partner_catalog FOR SELECT USING (true);

INSERT INTO public.partner_catalog (key, kind, category, label_fr, label_en, price_fcfa, display_order) VALUES
  ('co_creator',  'sponsoring', NULL, 'Co-Créateur',  'Co-Creator',  75000000, 1),
  ('energizer',   'sponsoring', NULL, 'Dynamiseur',   'Energizer',   55000000, 2),
  ('connector',   'sponsoring', NULL, 'Connexeur',    'Connector',   35000000, 3),
  ('catalyst',    'sponsoring', NULL, 'Catalyseur',   'Catalyst',    25000000, 4),
  ('product_5min',  'visibility', 'media',   'Présentation produit – 5 min',  'Product presentation – 5 min',  250000, 1),
  ('product_10min', 'visibility', 'media',   'Présentation produit – 10 min', 'Product presentation – 10 min', 400000, 2),
  ('web_468x60',    'visibility', 'digital', 'Bannière web – 468x60 px',      'Web banner – 468x60 px',        100000, 3),
  ('web_350x200',   'visibility', 'digital', 'Bannière web – 350x200 px',     'Web banner – 350x200 px',       150000, 4),
  ('spot_0_15',     'visibility', 'spots',   'Spot 0–15 sec',                  'Spot 0–15 sec',                 250000, 5),
  ('spot_15_30',    'visibility', 'spots',   'Spot 15–30 sec',                 'Spot 15–30 sec',                350000, 6),
  ('spot_30_45',    'visibility', 'spots',   'Spot 30–45 sec',                 'Spot 30–45 sec',                500000, 7),
  ('spot_45_60',    'visibility', 'spots',   'Spot 45–60 sec',                 'Spot 45–60 sec',                750000, 8),
  ('flying_banners','visibility', 'other',   'Flying Banners (max 10)',        'Flying Banners (max 10)',      1000000, 9),
  ('custom_activation','visibility','other', 'Animations partenaires personnalisées (sur devis)', 'Customized partner activations (on quote)', NULL, 10),
  ('page_quarter',  'visibility', 'other',   '1/4 de page',                    '1/4 page',                      500000, 11),
  ('page_half',     'visibility', 'other',   '1/2 page',                       '1/2 page',                      750000, 12),
  ('page_full',     'visibility', 'other',   'Pleine page',                    'Full page',                    1500000, 13),
  ('page_double',   'visibility', 'other',   'Double page centrale',           'Centre double page',           2500000, 14)
ON CONFLICT (key) DO UPDATE SET
  kind = EXCLUDED.kind, category = EXCLUDED.category, label_fr = EXCLUDED.label_fr,
  label_en = EXCLUDED.label_en, price_fcfa = EXCLUDED.price_fcfa, display_order = EXCLUDED.display_order;

-- 3) Souscriptions sponsoring / visibilité ---------------------------------
CREATE TABLE IF NOT EXISTS public.partner_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('sponsoring', 'visibility')),
  organization_name text NOT NULL,
  representative_name text NOT NULL,
  representative_position text,
  activity_sector text,
  phone text NOT NULL,
  email text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_price integer NOT NULL DEFAULT 0,
  contribution_type text CHECK (contribution_type IN ('financial', 'in_kind')),
  contribution_details text,
  status text NOT NULL DEFAULT 'pending',
  submitter_ip text,
  submitter_fingerprint text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_subscriptions ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_check_partner_subscription_rate_limit ON public.partner_subscriptions;
CREATE TRIGGER trg_check_partner_subscription_rate_limit
  BEFORE INSERT ON public.partner_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.check_submission_rate_limit();

CREATE OR REPLACE FUNCTION public.submit_partner_subscription(
  p_kind text,
  p_organization_name text,
  p_representative_name text,
  p_representative_position text,
  p_activity_sector text,
  p_phone text,
  p_email text,
  p_item_keys text[],
  p_contribution_type text DEFAULT NULL,
  p_contribution_details text DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
  selected jsonb;
  total integer;
  found_count integer;
BEGIN
  IF p_kind NOT IN ('sponsoring', 'visibility') THEN
    RAISE EXCEPTION 'Type de souscription inconnu.' USING ERRCODE = 'P0001';
  END IF;

  IF p_item_keys IS NULL OR cardinality(p_item_keys) = 0 THEN
    RAISE EXCEPTION 'Veuillez sélectionner au moins une option.' USING ERRCODE = 'P0001';
  END IF;

  IF p_kind = 'sponsoring' AND cardinality(p_item_keys) <> 1 THEN
    RAISE EXCEPTION 'Veuillez choisir un seul pack de sponsoring.' USING ERRCODE = 'P0001';
  END IF;

  SELECT
    jsonb_agg(jsonb_build_object('key', c.key, 'label_fr', c.label_fr, 'label_en', c.label_en, 'price_fcfa', c.price_fcfa) ORDER BY c.display_order),
    COALESCE(sum(c.price_fcfa), 0)::integer,
    count(*)
  INTO selected, total, found_count
  FROM public.partner_catalog c
  WHERE c.key = ANY (p_item_keys) AND c.kind = p_kind;

  IF found_count <> (SELECT count(DISTINCT k) FROM unnest(p_item_keys) AS k) THEN
    RAISE EXCEPTION 'Option inconnue.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.partner_subscriptions (
    kind, organization_name, representative_name, representative_position, activity_sector,
    phone, email, items, total_price, contribution_type, contribution_details,
    submitter_ip, submitter_fingerprint
  )
  VALUES (
    p_kind, p_organization_name, p_representative_name, p_representative_position, p_activity_sector,
    p_phone, p_email, selected, total,
    CASE WHEN p_kind = 'sponsoring' THEN p_contribution_type ELSE NULL END,
    CASE WHEN p_kind = 'sponsoring' THEN p_contribution_details ELSE NULL END,
    p_ip, p_fingerprint
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_partner_subscription(text, text, text, text, text, text, text, text[], text, text, text, text) TO anon, authenticated;

-- 4) Inscriptions aux activités (Mami Makala / Papa Beignet / Besua) ------
CREATE TABLE IF NOT EXISTS public.activity_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline text NOT NULL CHECK (discipline IN ('mami_makala', 'papa_beignet', 'besua')),
  full_name text NOT NULL,
  age integer NOT NULL CHECK (age BETWEEN 10 AND 99),
  commercial_name text NOT NULL,
  district text NOT NULL,
  experience_years integer NOT NULL CHECK (experience_years BETWEEN 0 AND 80),
  phone text NOT NULL,
  weight_category text CHECK (weight_category IN ('light', 'heavy')),
  status text NOT NULL DEFAULT 'pending',
  submitter_ip text,
  submitter_fingerprint text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_registrations ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_check_activity_registration_rate_limit ON public.activity_registrations;
CREATE TRIGGER trg_check_activity_registration_rate_limit
  BEFORE INSERT ON public.activity_registrations
  FOR EACH ROW EXECUTE FUNCTION public.check_submission_rate_limit();

CREATE OR REPLACE FUNCTION public.submit_activity_registration(
  p_discipline text,
  p_full_name text,
  p_age integer,
  p_commercial_name text,
  p_district text,
  p_experience_years integer,
  p_phone text,
  p_weight_category text DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  IF p_discipline NOT IN ('mami_makala', 'papa_beignet', 'besua') THEN
    RAISE EXCEPTION 'Activité inconnue.' USING ERRCODE = 'P0001';
  END IF;

  IF p_discipline = 'besua' AND p_weight_category IS NULL THEN
    RAISE EXCEPTION 'Veuillez choisir une catégorie de poids.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.activity_registrations (
    discipline, full_name, age, commercial_name, district, experience_years, phone,
    weight_category, submitter_ip, submitter_fingerprint
  )
  VALUES (
    p_discipline, p_full_name, p_age, p_commercial_name, p_district, p_experience_years, p_phone,
    CASE WHEN p_discipline = 'besua' THEN p_weight_category ELSE NULL END,
    p_ip, p_fingerprint
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_activity_registration(text, text, integer, text, text, integer, text, text, text, text) TO anon, authenticated;

-- 5) RPC admin (même modèle que admin_update_stand_status) ------------------
CREATE OR REPLACE FUNCTION public.admin_list_partner_subscriptions()
RETURNS SETOF public.partner_subscriptions
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT * FROM public.partner_subscriptions ORDER BY created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_partner_subscription_status(p_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.partner_subscriptions SET status = p_status, updated_at = now() WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_list_activity_registrations()
RETURNS SETOF public.activity_registrations
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT * FROM public.activity_registrations ORDER BY created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_activity_registration_status(p_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.activity_registrations SET status = p_status, updated_at = now() WHERE id = p_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_list_partner_subscriptions() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_partner_subscription_status(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_activity_registrations() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_activity_registration_status(uuid, text) TO anon, authenticated;
