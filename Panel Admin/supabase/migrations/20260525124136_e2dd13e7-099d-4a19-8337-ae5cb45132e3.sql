
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read blog media"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-media');

CREATE POLICY "Admins upload blog media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update blog media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete blog media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));
