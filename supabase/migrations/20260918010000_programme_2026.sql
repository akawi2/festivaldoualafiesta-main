-- Programme 2026 (séparé de la migration structurelle : ces lignes sont
-- visibles tout de suite sur le site en production, à pousser après validation).
-- Les événements des éditions passées (2024/2025) s'affichaient encore sur
-- la page Programme 2026 : on les désactive (réversible depuis le back-office).
UPDATE public.program_events SET is_active = false WHERE start_time < '2026-01-01';

-- Horaires indicatifs (le dossier ne les précise pas) : à ajuster depuis le
-- back-office, onglet Programme.
INSERT INTO public.program_events (title, artist_name, event_type, stage, start_time, end_time, description_fr, description_en, is_active, is_featured) VALUES
  ('Caravane du Festival – Douala 1er', 'Communauté Urbaine de Douala', 'Caravane', 'Douala 1er', '2026-11-07 09:00:00+01', '2026-11-07 18:00:00+01',
   'Première étape de la caravane de mobilisation : sélections locales des activités du festival.', 'First stop of the mobilisation caravan: local selections for the festival activities.', true, false),
  ('Caravane du Festival – Douala 2ème', 'Communauté Urbaine de Douala', 'Caravane', 'Douala 2ème', '2026-11-14 09:00:00+01', '2026-11-14 18:00:00+01',
   'Deuxième étape de la caravane : sélections locales des activités du festival.', 'Second stop of the caravan: local selections for the festival activities.', true, false),
  ('Caravane du Festival – Douala 3ème', 'Communauté Urbaine de Douala', 'Caravane', 'Douala 3ème', '2026-11-21 09:00:00+01', '2026-11-21 18:00:00+01',
   'Troisième étape de la caravane : sélections locales des activités du festival.', 'Third stop of the caravan: local selections for the festival activities.', true, false),
  ('Caravane du Festival – Douala 4ème', 'Communauté Urbaine de Douala', 'Caravane', 'Douala 4ème', '2026-11-28 09:00:00+01', '2026-11-28 18:00:00+01',
   'Quatrième étape de la caravane : sélections locales des activités du festival.', 'Fourth stop of the caravan: local selections for the festival activities.', true, false),
  ('Caravane du Festival – Douala 5ème (clôture)', 'Communauté Urbaine de Douala', 'Caravane', 'Douala 5ème', '2026-12-12 09:00:00+01', '2026-12-12 18:00:00+01',
   'Dernière étape et clôture de la caravane : sélections locales des activités du festival.', 'Last stop and closing of the caravan: local selections for the festival activities.', true, false),
  ('Douala Brain Games – Phases finales (jour 1)', 'Communauté Urbaine de Douala', 'Compétition', 'Parcours Vita', '2026-12-18 09:00:00+01', '2026-12-18 18:00:00+01',
   'Phases finales des sports intellectuels : jeu de dames, ludo, scrabble, échecs, ngeka/songo, langa na tila et puzzle.', 'Finals of the mind sports: draughts, ludo, scrabble, chess, ngeka/songo, langa na tila and puzzle.', true, false),
  ('Douala Brain Games – Phases finales (jour 2)', 'Communauté Urbaine de Douala', 'Compétition', 'Parcours Vita', '2026-12-19 09:00:00+01', '2026-12-19 18:00:00+01',
   'Phases finales des sports intellectuels.', 'Finals of the mind sports.', true, false),
  ('Douala Brain Games – Phases finales (jour 3)', 'Communauté Urbaine de Douala', 'Compétition', 'Parcours Vita', '2026-12-20 09:00:00+01', '2026-12-20 18:00:00+01',
   'Phases finales des sports intellectuels.', 'Finals of the mind sports.', true, false),
  ('PROME''D – Jour 1', 'PROME''D', 'Business', 'Parcours Vita', '2026-12-21 09:00:00+01', '2026-12-21 18:00:00+01',
   'Le volet économique du festival : exposition corporate, rendez-vous B2B, consultations gratuites, pitchs et démonstrations technologiques.', 'The economic side of the festival: corporate exhibition, B2B meetings, free consultations, pitches and technology demos.', true, false),
  ('PROME''D – Jour 2', 'PROME''D', 'Business', 'Parcours Vita', '2026-12-22 09:00:00+01', '2026-12-22 18:00:00+01',
   'Le volet économique du festival.', 'The economic side of the festival.', true, false),
  ('PROME''D – Jour 3', 'PROME''D', 'Business', 'Parcours Vita', '2026-12-23 09:00:00+01', '2026-12-23 16:00:00+01',
   'Le volet économique du festival.', 'The economic side of the festival.', true, false),
  ('Grande parade Miss Douala Fiesta (cérémonie d''ouverture)', 'Miss Douala Fiesta', 'Concours', 'Parcours Vita', '2026-12-23 18:00:00+01', '2026-12-23 22:00:00+01',
   'Grande parade des 40 candidates, cérémonie d''ouverture du festival.', 'Grand parade of the 40 candidates, opening ceremony of the festival.', true, true),
  ('Noël Solidaire – La Table du Cœur', 'Mairie de la Ville de Douala', 'Solidarité', 'Parcours Vita', '2026-12-25 10:00:00+01', '2026-12-25 17:00:00+01',
   'Un repas, des cadeaux, un spectacle et un espace de jeu pour 500 enfants démunis de la ville.', 'A meal, gifts, a show and a play area for 500 underprivileged children.', true, true),
  ('Demi-finale Miss Douala Fiesta', 'Miss Douala Fiesta', 'Concours', 'Parcours Vita', '2026-12-26 18:00:00+01', '2026-12-26 22:00:00+01',
   'Demi-finale : 15 candidates en lice.', 'Semi-final: 15 candidates compete.', true, false),
  ('Finale et sacre Miss Douala Fiesta', 'Miss Douala Fiesta', 'Concours', 'Parcours Vita', '2027-01-02 18:00:00+01', '2027-01-02 23:00:00+01',
   'Finale à 10 candidates et sacre de Miss Douala Fiesta et de ses deux Dauphines.', 'Final with 10 candidates and crowning of Miss Douala Fiesta and her two runners-up.', true, true);
