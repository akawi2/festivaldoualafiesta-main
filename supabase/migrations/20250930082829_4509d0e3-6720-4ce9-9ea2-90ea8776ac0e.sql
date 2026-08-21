-- Mise à jour des URLs des images des candidates avec les assets locaux
UPDATE public.miss_candidates 
SET image_url = '/src/assets/candidate-1.jpg'
WHERE name = 'Aminata Diallo';

UPDATE public.miss_candidates 
SET image_url = '/src/assets/candidate-2.jpg'
WHERE name = 'Fatima Njoya';

UPDATE public.miss_candidates 
SET image_url = '/src/assets/candidate-6.jpg'
WHERE name = 'Grace Mballa';

UPDATE public.miss_candidates 
SET image_url = '/src/assets/candidate-14.jpg'
WHERE name = 'Marie-Claire Essomba';

UPDATE public.miss_candidates 
SET image_url = '/src/assets/candidate-25.jpg'
WHERE name = 'Nadège Tchoupo';

UPDATE public.miss_candidates 
SET image_url = '/src/assets/candidate-26.jpg'
WHERE name = 'Pauline Dikoume';