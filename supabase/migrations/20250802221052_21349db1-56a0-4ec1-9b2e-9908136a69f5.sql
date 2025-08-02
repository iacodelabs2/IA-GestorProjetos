-- Add new GitHub fields to projects table
ALTER TABLE public.projects 
ADD COLUMN github_page TEXT,
ADD COLUMN github_url TEXT;