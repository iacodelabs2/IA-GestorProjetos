-- Add general progress percentage to projects table
ALTER TABLE public.projects 
ADD COLUMN general_progress DECIMAL(5,2) DEFAULT 0.00 CHECK (general_progress >= 0 AND general_progress <= 100);

-- Create project_steps table for project steps with individual progress
CREATE TABLE public.project_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_description TEXT,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_steps
ALTER TABLE public.project_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_steps
CREATE POLICY "Users can view their own project steps" 
ON public.project_steps 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = project_steps.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create their own project steps" 
ON public.project_steps 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = project_steps.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update their own project steps" 
ON public.project_steps 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = project_steps.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own project steps" 
ON public.project_steps 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = project_steps.project_id 
  AND projects.user_id = auth.uid()
));

-- Add trigger for automatic timestamp updates on project_steps
CREATE TRIGGER update_project_steps_updated_at
BEFORE UPDATE ON public.project_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_project_steps_project_id ON public.project_steps(project_id);
CREATE INDEX idx_project_steps_order ON public.project_steps(project_id, order_index);