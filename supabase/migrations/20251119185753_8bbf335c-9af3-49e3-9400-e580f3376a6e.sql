-- Drop existing user_sessions table if it exists
DROP TABLE IF EXISTS public.user_sessions CASCADE;

-- Create user_sessions table
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  
  -- Session data
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Entry data
  entry_url TEXT,
  entry_referrer TEXT,
  exit_url TEXT,
  
  -- Engagement metrics
  pages_visited INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_scrolls INTEGER DEFAULT 0,
  
  -- Device data
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  
  -- Location
  cidade_id UUID REFERENCES public.cidades(id),
  
  -- Marketing attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  conversion_type TEXT,
  conversion_value NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX idx_sessions_started_at ON public.user_sessions(started_at DESC);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sistema pode gerenciar sessões"
  ON public.user_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins podem ver todas as sessões"
  ON public.user_sessions
  FOR SELECT
  USING (is_admin(auth.uid()));