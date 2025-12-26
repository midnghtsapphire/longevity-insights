-- Create biomarkers table for storing user health readings
CREATE TABLE public.biomarkers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  reference_min NUMERIC,
  reference_max NUMERIC,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.biomarkers ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own biomarkers" 
ON public.biomarkers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own biomarkers" 
ON public.biomarkers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own biomarkers" 
ON public.biomarkers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own biomarkers" 
ON public.biomarkers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_biomarkers_updated_at
BEFORE UPDATE ON public.biomarkers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries by user
CREATE INDEX idx_biomarkers_user_id ON public.biomarkers(user_id);
CREATE INDEX idx_biomarkers_measured_at ON public.biomarkers(measured_at DESC);