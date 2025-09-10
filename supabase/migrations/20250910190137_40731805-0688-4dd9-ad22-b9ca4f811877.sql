-- Create calculation_history table
CREATE TABLE public.calculation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  calculation_name TEXT NOT NULL,
  calculation_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calculation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access based on email
CREATE POLICY "Users can view their own calculations" 
ON public.calculation_history 
FOR SELECT 
USING (user_email = auth.email());

CREATE POLICY "Users can create their own calculations" 
ON public.calculation_history 
FOR INSERT 
WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own calculations" 
ON public.calculation_history 
FOR UPDATE 
USING (user_email = auth.email());

CREATE POLICY "Users can delete their own calculations" 
ON public.calculation_history 
FOR DELETE 
USING (user_email = auth.email());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calculation_history_updated_at
BEFORE UPDATE ON public.calculation_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_calculation_history_user_email ON public.calculation_history(user_email);
CREATE INDEX idx_calculation_history_created_at ON public.calculation_history(created_at DESC);