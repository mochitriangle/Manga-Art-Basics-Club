-- Add posters table to the database
-- This script should be run in your Supabase SQL editor

-- Create posters table
CREATE TABLE IF NOT EXISTS public.posters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on posters table
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

-- Posters RLS policies
CREATE POLICY "Public can view active posters" ON public.posters
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all posters" ON public.posters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can manage posters" ON public.posters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posters_active ON public.posters(is_active);

-- Create posters storage bucket (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public can view poster images
CREATE POLICY "Public can view poster images" ON storage.objects
  FOR SELECT USING (bucket_id = 'posters');

-- Policy: Staff and admins can upload poster images
CREATE POLICY "Staff can upload poster images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posters' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Policy: Staff and admins can delete poster images
CREATE POLICY "Staff can delete poster images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posters' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Add is_teacher column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_teacher BOOLEAN DEFAULT false;

-- Create index for teacher filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_teacher ON public.profiles(is_teacher);
