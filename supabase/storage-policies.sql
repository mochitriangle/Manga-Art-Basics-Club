-- Create homework bucket (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('homework', 'homework', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Students can only upload to their own folder
CREATE POLICY "Students can upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'homework' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Students can view their own files
CREATE POLICY "Students can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'homework' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Staff and admins can list all files
CREATE POLICY "Staff can list all files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'homework' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Policy: Staff and admins can view all files
CREATE POLICY "Staff can view all files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'homework' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Policy: Only file owners can delete their files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'homework' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Staff and admins can delete any file
CREATE POLICY "Staff can delete any file" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'homework' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );
