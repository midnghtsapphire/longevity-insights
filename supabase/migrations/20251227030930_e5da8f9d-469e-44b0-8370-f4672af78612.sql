-- Create health_goals table
CREATE TABLE public.health_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  biomarker_name TEXT NOT NULL,
  target_min NUMERIC,
  target_max NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, biomarker_name)
);

-- Enable RLS
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own health goals"
ON public.health_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health goals"
ON public.health_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health goals"
ON public.health_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health goals"
ON public.health_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_health_goals_updated_at
BEFORE UPDATE ON public.health_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();