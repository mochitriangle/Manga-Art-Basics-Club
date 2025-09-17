-- Database Performance Optimization Script
-- Run this in your Supabase SQL Editor to improve query performance

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_is_teacher ON public.profiles(role, is_teacher);
CREATE INDEX IF NOT EXISTS idx_posters_active_created ON public.posters(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_user_created ON public.submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_submission_created ON public.reviews(submission_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitions_published_end ON public.competitions(published, end_at);

-- Optimize existing indexes
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_profiles_is_teacher;
CREATE INDEX idx_profiles_role_is_teacher_composite ON public.profiles(role, is_teacher, full_name);

-- Add partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_active_posters ON public.posters(created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_published_competitions ON public.competitions(end_at ASC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_teacher_profiles ON public.profiles(full_name) WHERE is_teacher = true;

-- Update table statistics for better query planning
ANALYZE public.profiles;
ANALYZE public.posters;
ANALYZE public.submissions;
ANALYZE public.reviews;
ANALYZE public.competitions;
ANALYZE public.tutorials;

-- Add database-level optimizations
ALTER TABLE public.profiles SET (fillfactor = 90);
ALTER TABLE public.posters SET (fillfactor = 95);
ALTER TABLE public.submissions SET (fillfactor = 90);
ALTER TABLE public.reviews SET (fillfactor = 90);
ALTER TABLE public.competitions SET (fillfactor = 95);
ALTER TABLE public.tutorials SET (fillfactor = 95);
