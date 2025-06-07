
-- Create table for storing tag configuration data
CREATE TABLE public.tag_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1
);

-- Add RLS policies for tag configurations
ALTER TABLE public.tag_configurations ENABLE ROW LEVEL SECURITY;

-- Only admins can view tag configurations
CREATE POLICY "Admins can view tag configurations" 
  ON public.tag_configurations 
  FOR SELECT 
  USING (public.is_current_user_admin());

-- Only admins can create tag configurations
CREATE POLICY "Admins can create tag configurations" 
  ON public.tag_configurations 
  FOR INSERT 
  WITH CHECK (public.is_current_user_admin());

-- Only admins can update tag configurations
CREATE POLICY "Admins can update tag configurations" 
  ON public.tag_configurations 
  FOR UPDATE 
  USING (public.is_current_user_admin());

-- Create function to get active tag configuration
CREATE OR REPLACE FUNCTION public.get_active_tag_config()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT tag_data 
  FROM public.tag_configurations 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
$$;

-- Add indexes for performance
CREATE INDEX idx_tag_configurations_active ON public.tag_configurations(is_active, created_at DESC);
CREATE INDEX idx_issues_backend_tags_gin ON public.issues USING gin(backend_tags);
CREATE INDEX idx_issues_published_score ON public.issues(published, score DESC) WHERE published = true;

-- Insert default tag configuration
INSERT INTO public.tag_configurations (tag_data, created_by) VALUES (
  '{
    "Cardiologia": [
      "Dislipidemia",
      "Estatinas",
      "Hipertensão",
      "Risco cardiovascular"
    ],
    "Endocrinologia": [
      "Diabetes tipo 2",
      "Remissão",
      "Controle glicêmico",
      "Obesidade"
    ],
    "Fisioterapia": [],
    "Fonoaudiologia": [],
    "Psicologia": [
      "Depressão",
      "Psicoterapia",
      "Suporte psicossocial"
    ],
    "Psiquiatria": [
      "Depressão",
      "Psicoterapia",
      "Suporte psicossocial"
    ],
    "Saúde mental": [
      "Escuta ativa",
      "Psicoeducação"
    ],
    "Nutrição": [
      "Educação alimentar",
      "Nutrição clínica",
      "Suplementação"
    ],
    "Atividade física": [
      "Adesão"
    ],
    "Clínica médica": [
      "Nefrologia",
      "Gastroenterologia",
      "Reumatologia",
      "Infectologia",
      "Pneumologia"
    ],
    "Geriatria": [],
    "Pediatria": [
      "Nutrição infantil",
      "Prevenção pediátrica",
      "Rastreios pediátricos"
    ],
    "Medicina de família": [
      "Atenção primária",
      "Seguimento longitudinal"
    ],
    "Decisão compartilhada": [
      "Comunicação clínica"
    ],
    "Saúde pública": [
      "Políticas públicas",
      "Programas populacionais",
      "Ações coletivas",
      "Vacinação"
    ],
    "Farmacologia": [
      "Desprescrição"
    ],
    "Enfermagem": [],
    "Real world evidence": [
      "Estudos pragmáticos",
      "Aplicação clínica",
      "Barreiras de implementação"
    ],
    "Bioestatística": [],
    "Inferência causal": [],
    "Rastreio clínico": [],
    "Testes diagnósticos": [],
    "Odontologia": [],
    "Educação em saúde": [],
    "Hospital": [],
    "Cirurgia": [
      "Ortopedia",
      "Urologia",
      "Cirurgia geral",
      "Indicação cirúrgica",
      "Otorrinologia"
    ]
  }'::jsonb,
  (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
);
