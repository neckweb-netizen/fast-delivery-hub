-- Create user_tracking_events table for detailed user behavior analytics
CREATE TABLE IF NOT EXISTS public.user_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  
  -- User identification data
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  
  -- Location data
  cidade_id UUID REFERENCES public.cidades(id),
  
  -- Interaction data
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  click_position JSONB,
  
  -- Business context
  empresa_id UUID REFERENCES public.empresas(id),
  produto_id UUID REFERENCES public.produtos(id),
  evento_id UUID REFERENCES public.eventos(id),
  cupom_id UUID REFERENCES public.cupons(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Performance data
  page_load_time INTEGER,
  time_on_page INTEGER,
  scroll_depth INTEGER,
  
  -- Marketing data
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tracking_user_id ON public.user_tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_session_id ON public.user_tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_event_type ON public.user_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_tracking_event_name ON public.user_tracking_events(event_name);
CREATE INDEX IF NOT EXISTS idx_user_tracking_created_at ON public.user_tracking_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_tracking_empresa_id ON public.user_tracking_events(empresa_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_produto_id ON public.user_tracking_events(produto_id);

-- Create user_journey table for funnel analysis
CREATE TABLE IF NOT EXISTS public.user_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  
  -- Journey step
  step_number INTEGER NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  action_taken TEXT,
  
  -- Timing
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_from_previous_step INTEGER,
  
  -- Context
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_journey_user_id ON public.user_journey(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_session_id ON public.user_journey(session_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_timestamp ON public.user_journey(timestamp);

-- Create conversion_events table
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  
  -- Conversion details
  conversion_type TEXT NOT NULL,
  conversion_value NUMERIC,
  
  -- Attribution
  first_touch_source TEXT,
  last_touch_source TEXT,
  attribution_model TEXT,
  
  -- Context
  empresa_id UUID REFERENCES public.empresas(id),
  produto_id UUID REFERENCES public.produtos(id),
  evento_id UUID REFERENCES public.eventos(id),
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON public.conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON public.conversion_events(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON public.conversion_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sistema pode inserir eventos de tracking"
  ON public.user_tracking_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver todos os eventos"
  ON public.user_tracking_events
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Sistema pode inserir jornadas"
  ON public.user_journey
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver jornadas"
  ON public.user_journey
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Sistema pode inserir conversões"
  ON public.conversion_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver conversões"
  ON public.conversion_events
  FOR SELECT
  USING (is_admin(auth.uid()));