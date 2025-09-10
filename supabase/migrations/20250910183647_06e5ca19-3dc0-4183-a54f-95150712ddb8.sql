-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', false);

-- Create RLS policies for logo storage
CREATE POLICY "Users can view their own logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add logo_url to profiles table
ALTER TABLE public.profiles 
ADD COLUMN logo_url TEXT;