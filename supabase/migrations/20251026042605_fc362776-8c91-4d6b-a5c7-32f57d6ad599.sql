-- Create apps table for user-created apps
CREATE TABLE public.apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  size TEXT NOT NULL DEFAULT '0 KB',
  rating DECIMAL(2,1) DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  app_code TEXT NOT NULL,
  category TEXT DEFAULT 'utility',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Users can view approved apps
CREATE POLICY "Anyone can view approved apps" 
ON public.apps 
FOR SELECT 
USING (is_approved = true);

-- Users can view their own apps
CREATE POLICY "Users can view their own apps" 
ON public.apps 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own apps
CREATE POLICY "Users can create apps" 
ON public.apps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own apps
CREATE POLICY "Users can update their own apps" 
ON public.apps 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own apps
CREATE POLICY "Users can delete their own apps" 
ON public.apps 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_apps_updated_at
BEFORE UPDATE ON public.apps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for app icons and assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-assets', 'app-assets', true);

-- Storage policies for app assets
CREATE POLICY "Anyone can view app assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'app-assets');

CREATE POLICY "Users can upload their own app assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own app assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own app assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);