-- Insert PMAC Poster into the database
-- Run this script in your Supabase SQL Editor after setting up the posters table

INSERT INTO public.posters (title, description, image_url, is_active) 
VALUES (
  'PMAC Poster',
  'Official promotional poster for the Manga & Art Basics Club featuring anime-style character with paintbrush and club branding',
  'https://manga-art-basics-club.vercel.app/pmac-poster.png',
  true
);

-- Verify the insert was successful
SELECT * FROM public.posters WHERE title = 'PMAC Poster';
