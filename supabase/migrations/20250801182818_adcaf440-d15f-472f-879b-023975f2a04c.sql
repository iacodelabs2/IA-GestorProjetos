-- Add projeto field for Supabase section
ALTER TABLE public.projects ADD COLUMN supabase_projeto text;

-- Rename github_email to github_username  
ALTER TABLE public.projects RENAME COLUMN github_email TO github_username;