-- Create storage bucket for store item images
INSERT INTO storage.buckets (id, name, public) VALUES ('store-items', 'store-items', true);

-- Create policies for store item uploads
CREATE POLICY "Allow public access to store item images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'store-items');

CREATE POLICY "Allow authenticated users to upload store item images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'store-items' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own store item images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'store-items' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own store item images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'store-items' AND auth.uid()::text = (storage.foldername(name))[1]);