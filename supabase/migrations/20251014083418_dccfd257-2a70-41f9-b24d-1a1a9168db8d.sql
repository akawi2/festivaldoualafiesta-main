-- Add English description columns to tables

-- Add description_en to gallery_images
ALTER TABLE public.gallery_images 
ADD COLUMN description_en TEXT;

-- Add description_en to kwatt_heroes
ALTER TABLE public.kwatt_heroes 
ADD COLUMN description_en TEXT;

-- Add description_en to program_events
ALTER TABLE public.program_events 
ADD COLUMN description_en TEXT;

-- Add description_en to gallery_categories
ALTER TABLE public.gallery_categories 
ADD COLUMN description_en TEXT;

-- Rename existing description columns to description_fr for clarity
ALTER TABLE public.gallery_images 
RENAME COLUMN description TO description_fr;

ALTER TABLE public.kwatt_heroes 
RENAME COLUMN description TO description_fr;

ALTER TABLE public.program_events 
RENAME COLUMN description TO description_fr;

ALTER TABLE public.gallery_categories 
RENAME COLUMN description TO description_fr;