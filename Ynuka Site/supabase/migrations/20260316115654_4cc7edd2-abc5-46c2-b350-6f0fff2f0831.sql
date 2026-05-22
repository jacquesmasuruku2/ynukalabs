
-- Comments table for blog posts
CREATE TABLE public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Comments are publicly viewable" ON public.blog_comments
  FOR SELECT TO public USING (true);

-- Anyone can add comments
CREATE POLICY "Anyone can add comments" ON public.blog_comments
  FOR INSERT TO public WITH CHECK (true);

-- Admins can delete comments
CREATE POLICY "Admins can delete comments" ON public.blog_comments
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
