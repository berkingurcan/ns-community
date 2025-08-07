-- Storage policies for project-logos bucket

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload images to project-logos bucket
CREATE POLICY "Users can upload project images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-logos' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow users to view all project images
CREATE POLICY "Anyone can view project images" ON storage.objects
FOR SELECT USING (bucket_id = 'project-logos');

-- Policy: Allow users to update their own uploaded images
CREATE POLICY "Users can update their own project images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own project images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-logos', 'project-logos', true)
ON CONFLICT (id) DO NOTHING;