-- ====================================================
-- SISTEMA DE GAMIFICAÇÃO
-- ====================================================

-- Tabela de configuração de níveis
CREATE TABLE IF NOT EXISTS public.gamification_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir níveis padrão
INSERT INTO public.gamification_levels (level, name, min_points, max_points, icon, color) VALUES
  (1, 'Novato', 0, 200, 'User', '#94A3B8'),
  (2, 'Explorador', 201, 600, 'Compass', '#3B82F6'),
  (3, 'Cidadão Ativo', 601, 1500, 'Users', '#8B5CF6'),
  (4, 'Influente', 1501, 4000, 'Award', '#F59E0B'),
  (5, 'Líder da Comunidade', 4001, NULL, 'Crown', '#EF4444');

-- Tabela de pontos do usuário
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  action_type TEXT NOT NULL,
  action_description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_created_at ON public.user_points(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_action_type ON public.user_points(action_type);

-- Tabela de badges (medalhas)
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  category TEXT DEFAULT 'general',
  points_reward INTEGER DEFAULT 0,
  requirement_count INTEGER DEFAULT 1,
  requirement_type TEXT,
  rarity TEXT DEFAULT 'common',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir badges padrão
INSERT INTO public.badges (key, name, description, icon, color, category, points_reward, requirement_count, requirement_type, rarity) VALUES
  -- Avaliações
  ('first_review', 'Primeira Avaliação', 'Publicou sua primeira avaliação', 'Star', '#F59E0B', 'reviews', 50, 1, 'avaliacoes', 'common'),
  ('reviewer_bronze', 'Avaliador Bronze', 'Publicou 10 avaliações', 'Medal', '#CD7F32', 'reviews', 100, 10, 'avaliacoes', 'bronze'),
  ('reviewer_silver', 'Avaliador Prata', 'Publicou 50 avaliações', 'Medal', '#C0C0C0', 'reviews', 300, 50, 'avaliacoes', 'silver'),
  ('reviewer_gold', 'Avaliador Ouro', 'Publicou 200 avaliações', 'Medal', '#FFD700', 'reviews', 1000, 200, 'avaliacoes', 'gold'),
  
  -- Voz do Povo
  ('first_problem', 'Primeiro Relato', 'Reportou seu primeiro problema', 'AlertCircle', '#EF4444', 'problems', 50, 1, 'problemas_cidade', 'common'),
  ('problem_reporter', 'Relator de Problemas', 'Reportou 5 problemas', 'AlertTriangle', '#EF4444', 'problems', 200, 5, 'problemas_cidade', 'bronze'),
  ('problem_solver', 'Resolvedor', 'Teve 3 problemas resolvidos', 'CheckCircle', '#10B981', 'problems', 300, 3, 'problemas_resolvidos', 'silver'),
  
  -- Agendamentos
  ('first_appointment', 'Primeiro Agendamento', 'Realizou seu primeiro agendamento', 'Calendar', '#3B82F6', 'appointments', 30, 1, 'agendamentos', 'common'),
  ('appointment_master', 'Mestre dos Agendamentos', 'Realizou 10 agendamentos', 'CalendarCheck', '#3B82F6', 'appointments', 150, 10, 'agendamentos', 'bronze'),
  
  -- Cupons
  ('coupon_hunter', 'Caçador de Cupons', 'Salvou 15 cupons', 'Ticket', '#8B5CF6', 'coupons', 100, 15, 'favoritos_cupons', 'bronze'),
  
  -- Exploração
  ('explorer', 'Explorador da Cidade', 'Visitou 50 perfis de empresas', 'Map', '#10B981', 'exploration', 200, 50, 'visualizacoes', 'bronze'),
  ('story_viewer', 'Visualizador de Stories', 'Visualizou 20 stories', 'Eye', '#F59E0B', 'exploration', 100, 20, 'visualizacoes_stories', 'common'),
  
  -- Engajamento
  ('active_commenter', 'Comentarista Ativo', 'Fez 5 comentários', 'MessageCircle', '#3B82F6', 'engagement', 80, 5, 'comentarios', 'common'),
  ('voter', 'Votante Ativo', 'Votou 20 vezes', 'ThumbsUp', '#10B981', 'engagement', 100, 20, 'votos', 'common'),
  ('week_streak', 'Streak Semanal', 'Usou o app por 7 dias seguidos', 'Flame', '#EF4444', 'engagement', 150, 7, 'days_streak', 'silver'),
  
  -- Favoritos
  ('favorite_collector', 'Colecionador', 'Favoritou 10 empresas', 'Heart', '#EC4899', 'favorites', 80, 10, 'favoritos', 'common'),
  
  -- Enquetes
  ('poll_participant', 'Participante Ativo', 'Participou de 5 enquetes', 'BarChart3', '#8B5CF6', 'polls', 100, 5, 'respostas_enquete', 'common');

-- Tabela de badges do usuário
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON public.user_badges(earned_at DESC);

-- Tabela de missões
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  type TEXT NOT NULL DEFAULT 'daily', -- daily, weekly, special
  action_key TEXT NOT NULL,
  target_count INTEGER DEFAULT 1,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir missões padrão
INSERT INTO public.missions (title, description, points, type, action_key, target_count, icon, color) VALUES
  -- Diárias
  ('Avalie uma empresa', 'Publique uma avaliação hoje', 20, 'daily', 'daily_review', 1, 'Star', '#F59E0B'),
  ('Vote em problemas', 'Vote em 3 problemas da cidade', 10, 'daily', 'daily_votes', 3, 'ThumbsUp', '#10B981'),
  ('Explore a cidade', 'Visite 5 perfis de empresas', 15, 'daily', 'daily_visits', 5, 'Map', '#3B82F6'),
  ('Participe de uma enquete', 'Vote em uma enquete ativa', 15, 'daily', 'daily_poll', 1, 'BarChart3', '#8B5CF6'),
  
  -- Semanais
  ('Relator da Semana', 'Reporte 2 problemas na cidade', 50, 'weekly', 'weekly_problems', 2, 'AlertCircle', '#EF4444'),
  ('Caçador de Cupons', 'Salve 3 cupons esta semana', 40, 'weekly', 'weekly_coupons', 3, 'Ticket', '#8B5CF6'),
  ('Agendador Ativo', 'Faça 2 agendamentos esta semana', 60, 'weekly', 'weekly_appointments', 2, 'Calendar', '#3B82F6'),
  ('Comentarista', 'Faça 5 comentários esta semana', 35, 'weekly', 'weekly_comments', 5, 'MessageCircle', '#10B981');

-- Tabela de progresso das missões do usuário
CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  period_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON public.user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_completed ON public.user_missions(completed);
CREATE INDEX IF NOT EXISTS idx_user_missions_period ON public.user_missions(period_start DESC);

-- Tabela de ranking (cache)
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  badges_count INTEGER DEFAULT 0,
  rank_position INTEGER,
  weekly_rank_position INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_total_points ON public.leaderboard_cache(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly_points ON public.leaderboard_cache(weekly_points DESC);

-- Adicionar campos de gamificação na tabela usuarios
ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS weekly_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badges_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- ====================================================
-- FUNÇÕES AUXILIARES
-- ====================================================

-- Função para calcular total de pontos do usuário
CREATE OR REPLACE FUNCTION public.calculate_user_total_points(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(points), 0) INTO v_total
  FROM public.user_points
  WHERE user_id = p_user_id;
  
  RETURN v_total;
END;
$$;

-- Função para calcular nível baseado nos pontos
CREATE OR REPLACE FUNCTION public.calculate_user_level(p_points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_level INTEGER;
BEGIN
  SELECT level INTO v_level
  FROM public.gamification_levels
  WHERE p_points >= min_points 
    AND (max_points IS NULL OR p_points <= max_points)
  ORDER BY level DESC
  LIMIT 1;
  
  RETURN COALESCE(v_level, 1);
END;
$$;

-- Função para adicionar pontos ao usuário
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_action_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_total_points INTEGER;
BEGIN
  -- Obter nível atual
  SELECT current_level INTO v_old_level
  FROM public.usuarios
  WHERE id = p_user_id;
  
  -- Inserir registro de pontos
  INSERT INTO public.user_points (user_id, points, action_type, action_description, reference_id, reference_type)
  VALUES (p_user_id, p_points, p_action_type, p_action_description, p_reference_id, p_reference_type);
  
  -- Calcular novo total
  v_total_points := public.calculate_user_total_points(p_user_id);
  v_new_level := public.calculate_user_level(v_total_points);
  
  -- Atualizar usuário
  UPDATE public.usuarios
  SET 
    total_points = v_total_points,
    current_level = v_new_level,
    last_activity_date = CURRENT_DATE
  WHERE id = p_user_id;
  
  -- Se subiu de nível, criar notificação
  IF v_new_level > v_old_level THEN
    INSERT INTO public.notificacoes (usuario_id, tipo, titulo, conteudo)
    VALUES (
      p_user_id,
      'level_up',
      '🎉 Parabéns! Você subiu de nível!',
      'Você alcançou o nível ' || v_new_level || '!'
    );
  END IF;
END;
$$;

-- Função para verificar e conceder badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
  v_count INTEGER;
  v_has_badge BOOLEAN;
BEGIN
  -- Iterar sobre todos os badges ativos
  FOR v_badge IN 
    SELECT * FROM public.badges WHERE is_active = TRUE
  LOOP
    -- Verificar se usuário já tem o badge
    SELECT EXISTS(
      SELECT 1 FROM public.user_badges 
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_has_badge;
    
    IF NOT v_has_badge THEN
      -- Verificar se cumpre requisito baseado no tipo
      CASE v_badge.requirement_type
        WHEN 'avaliacoes' THEN
          SELECT COUNT(*) INTO v_count FROM public.avaliacoes WHERE usuario_id = p_user_id;
        WHEN 'problemas_cidade' THEN
          SELECT COUNT(*) INTO v_count FROM public.problemas_cidade WHERE usuario_id = p_user_id;
        WHEN 'problemas_resolvidos' THEN
          SELECT COUNT(*) INTO v_count FROM public.problemas_cidade 
          WHERE usuario_id = p_user_id AND status = 'resolvido';
        WHEN 'agendamentos' THEN
          SELECT COUNT(*) INTO v_count FROM public.agendamentos a
          JOIN public.empresas e ON a.empresa_id = e.id
          WHERE e.usuario_id = p_user_id;
        WHEN 'favoritos' THEN
          SELECT COUNT(*) INTO v_count FROM public.favoritos WHERE usuario_id = p_user_id;
        WHEN 'comentarios' THEN
          SELECT COUNT(*) INTO v_count FROM public.comentarios_problema WHERE usuario_id = p_user_id;
        ELSE
          v_count := 0;
      END CASE;
      
      -- Se atingiu o requisito, conceder badge
      IF v_count >= v_badge.requirement_count THEN
        INSERT INTO public.user_badges (user_id, badge_id, progress)
        VALUES (p_user_id, v_badge.id, v_count);
        
        -- Adicionar pontos de recompensa
        IF v_badge.points_reward > 0 THEN
          PERFORM public.add_user_points(
            p_user_id,
            v_badge.points_reward,
            'badge_earned',
            'Conquistou o badge: ' || v_badge.name,
            v_badge.id,
            'badge'
          );
        END IF;
        
        -- Notificar usuário
        INSERT INTO public.notificacoes (usuario_id, tipo, titulo, conteudo)
        VALUES (
          p_user_id,
          'badge_earned',
          '🏆 Nova Conquista!',
          'Você conquistou o badge "' || v_badge.name || '"!'
        );
      END IF;
    END IF;
  END LOOP;
  
  -- Atualizar contagem de badges
  UPDATE public.usuarios
  SET badges_count = (
    SELECT COUNT(*) FROM public.user_badges WHERE user_id = p_user_id
  )
  WHERE id = p_user_id;
END;
$$;

-- Função para atualizar ranking
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar cache do ranking
  INSERT INTO public.leaderboard_cache (
    user_id,
    total_points,
    weekly_points,
    monthly_points,
    current_level,
    badges_count,
    last_updated
  )
  SELECT 
    u.id,
    u.total_points,
    u.weekly_points,
    u.monthly_points,
    u.current_level,
    u.badges_count,
    NOW()
  FROM public.usuarios u
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    weekly_points = EXCLUDED.weekly_points,
    monthly_points = EXCLUDED.monthly_points,
    current_level = EXCLUDED.current_level,
    badges_count = EXCLUDED.badges_count,
    last_updated = NOW();
  
  -- Calcular posições no ranking
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank_pos,
      ROW_NUMBER() OVER (ORDER BY weekly_points DESC) as weekly_rank_pos
    FROM public.leaderboard_cache
  )
  UPDATE public.leaderboard_cache lc
  SET 
    rank_position = ru.rank_pos,
    weekly_rank_position = ru.weekly_rank_pos
  FROM ranked_users ru
  WHERE lc.user_id = ru.user_id;
END;
$$;

-- Função para resetar pontos semanais
CREATE OR REPLACE FUNCTION public.reset_weekly_points()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.usuarios SET weekly_points = 0;
  UPDATE public.leaderboard_cache SET weekly_points = 0;
  
  -- Resetar missões semanais
  DELETE FROM public.user_missions 
  WHERE mission_id IN (
    SELECT id FROM public.missions WHERE type = 'weekly'
  );
END;
$$;

-- Função para resetar pontos mensais
CREATE OR REPLACE FUNCTION public.reset_monthly_points()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.usuarios SET monthly_points = 0;
  UPDATE public.leaderboard_cache SET monthly_points = 0;
END;
$$;

-- ====================================================
-- TRIGGERS
-- ====================================================

-- Trigger para adicionar pontos ao criar avaliação
CREATE OR REPLACE FUNCTION public.trigger_points_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.add_user_points(
    NEW.usuario_id,
    25,
    'review_created',
    'Avaliou: ' || (SELECT nome FROM public.empresas WHERE id = NEW.empresa_id),
    NEW.id,
    'avaliacoes'
  );
  
  PERFORM public.check_and_award_badges(NEW.usuario_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_points_review ON public.avaliacoes;
CREATE TRIGGER trigger_points_review
  AFTER INSERT ON public.avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_points_on_review();

-- Trigger para adicionar pontos ao criar problema
CREATE OR REPLACE FUNCTION public.trigger_points_on_problem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.add_user_points(
    NEW.usuario_id,
    30,
    'problem_created',
    'Reportou problema: ' || NEW.titulo,
    NEW.id,
    'problemas_cidade'
  );
  
  PERFORM public.check_and_award_badges(NEW.usuario_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_points_problem ON public.problemas_cidade;
CREATE TRIGGER trigger_points_problem
  AFTER INSERT ON public.problemas_cidade
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_points_on_problem();

-- Trigger para adicionar pontos ao comentar
CREATE OR REPLACE FUNCTION public.trigger_points_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.add_user_points(
    NEW.usuario_id,
    10,
    'comment_created',
    'Comentou em um problema',
    NEW.id,
    'comentarios_problema'
  );
  
  PERFORM public.check_and_award_badges(NEW.usuario_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_points_comment ON public.comentarios_problema;
CREATE TRIGGER trigger_points_comment
  AFTER INSERT ON public.comentarios_problema
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_points_on_comment();

-- Trigger para adicionar pontos ao favoritar
CREATE OR REPLACE FUNCTION public.trigger_points_on_favorite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.add_user_points(
    NEW.usuario_id,
    5,
    'favorite_added',
    'Favoritou uma empresa',
    NEW.id,
    'favoritos'
  );
  
  PERFORM public.check_and_award_badges(NEW.usuario_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_points_favorite ON public.favoritos;
CREATE TRIGGER trigger_points_favorite
  AFTER INSERT ON public.favoritos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_points_on_favorite();

-- Trigger para adicionar pontos ao participar de enquete
CREATE OR REPLACE FUNCTION public.trigger_points_on_poll_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.usuario_id IS NOT NULL THEN
    PERFORM public.add_user_points(
      NEW.usuario_id,
      15,
      'poll_vote',
      'Participou de uma enquete',
      NEW.id,
      'respostas_enquete'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_points_poll ON public.respostas_enquete;
CREATE TRIGGER trigger_points_poll
  AFTER INSERT ON public.respostas_enquete
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_points_on_poll_vote();

-- ====================================================
-- RLS POLICIES
-- ====================================================

-- gamification_levels
ALTER TABLE public.gamification_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos podem ver níveis" ON public.gamification_levels FOR SELECT USING (TRUE);
CREATE POLICY "Admins podem gerenciar níveis" ON public.gamification_levels FOR ALL 
  USING (is_admin(auth.uid()));

-- user_points
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seus pontos" ON public.user_points FOR SELECT 
  USING (user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Sistema pode inserir pontos" ON public.user_points FOR INSERT 
  WITH CHECK (TRUE);

-- badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos podem ver badges ativos" ON public.badges FOR SELECT 
  USING (is_active = TRUE);
CREATE POLICY "Admins podem gerenciar badges" ON public.badges FOR ALL 
  USING (is_admin(auth.uid()));

-- user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seus badges" ON public.user_badges FOR SELECT 
  USING (user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Sistema pode conceder badges" ON public.user_badges FOR INSERT 
  WITH CHECK (TRUE);

-- missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos podem ver missões ativas" ON public.missions FOR SELECT 
  USING (is_active = TRUE);
CREATE POLICY "Admins podem gerenciar missões" ON public.missions FOR ALL 
  USING (is_admin(auth.uid()));

-- user_missions
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver suas missões" ON public.user_missions FOR SELECT 
  USING (user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Usuários podem atualizar suas missões" ON public.user_missions FOR UPDATE 
  USING (user_id = auth.uid());
CREATE POLICY "Sistema pode criar missões de usuário" ON public.user_missions FOR INSERT 
  WITH CHECK (TRUE);

-- leaderboard_cache
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos podem ver ranking" ON public.leaderboard_cache FOR SELECT 
  USING (TRUE);
CREATE POLICY "Sistema pode atualizar ranking" ON public.leaderboard_cache FOR ALL 
  USING (TRUE);