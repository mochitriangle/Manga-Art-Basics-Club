-- Add PMAC poster to the database
-- Run this after setting up the posters table and uploading the image

-- Insert the PMAC poster
-- Note: You'll need to replace '/pmac-poster.png' with the actual path to your uploaded poster image
INSERT INTO public.posters (title, description, image_url, is_active) 
VALUES (
  'PMAC Poster',
  'Official promotional poster for the Manga & Art Basics Club featuring anime-style character with paintbrush',
  '/pmac-poster.png', -- Replace with actual image URL after upload
  true
);

-- You can also manually insert via the Supabase dashboard or use the poster upload component
-- The image should be uploaded to the 'posters' storage bucket first
