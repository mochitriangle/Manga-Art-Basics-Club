-- Set stellabai690@gmail.com as a teacher
-- Update their role to 'staff' (which gives them teacher privileges)
UPDATE public.profiles 
SET role = 'staff'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'stellabai690@gmail.com'
);

-- If the above doesn't work (user might not exist yet), you can also try:
-- UPDATE public.profiles 
-- SET role = 'staff'
-- WHERE id IN (
--   SELECT p.id 
--   FROM public.profiles p
--   JOIN auth.users u ON p.id = u.id
--   WHERE u.email = 'stellabai690@gmail.com'
-- );

-- Verify the update
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'stellabai690@gmail.com';
