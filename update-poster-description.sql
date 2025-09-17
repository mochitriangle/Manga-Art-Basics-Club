-- Update PMAC Poster description
-- Run this script in your Supabase SQL Editor

UPDATE public.posters 
SET description = 'Draw your dream, start from the basics!'
WHERE title = 'PMAC Poster';

-- Verify the update was successful
SELECT * FROM public.posters WHERE title = 'PMAC Poster';
