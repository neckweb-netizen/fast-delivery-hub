import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface GamificationLevel {
  id: string;
  level: number;
  name: string;
  min_points: number;
  max_points: number | null;
  icon: string | null;
  color: string;
}

export interface UserPoints {
  id: string;
  points: number;
  action_type: string;
  action_description: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  category: string;
  points_reward: number;
  requirement_count: number;
  requirement_type: string | null;
  rarity: string;
}

export interface UserBadge extends Badge {
  earned_at: string;
  progress: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  action_key: string;
  target_count: number;
  icon: string | null;
  color: string;
}

export interface UserMission extends Mission {
  progress: number;
  completed: boolean;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  weekly_points: number;
  current_level: number;
  badges_count: number;
  rank_position: number;
  weekly_rank_position: number;
  usuarios: {
    nome: string;
  };
}

export const useGamification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar nível atual do usuário
  const { data: userStats, isLoading: loadingStats } = useQuery({
    queryKey: ['user-gamification-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('usuarios')
        .select('total_points, current_level, weekly_points, badges_count, last_activity_date')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar informações do nível
  const { data: levelInfo } = useQuery({
    queryKey: ['level-info', userStats?.current_level],
    queryFn: async () => {
      if (!userStats?.current_level) return null;

      const { data, error } = await supabase
        .from('gamification_levels')
        .select('*')
        .eq('level', userStats.current_level)
        .single();

      if (error) throw error;
      return data as GamificationLevel;
    },
    enabled: !!userStats?.current_level,
  });

  // Buscar próximo nível
  const { data: nextLevel } = useQuery({
    queryKey: ['next-level', userStats?.current_level],
    queryFn: async () => {
      if (!userStats?.current_level) return null;

      const { data, error } = await supabase
        .from('gamification_levels')
        .select('*')
        .eq('level', userStats.current_level + 1)
        .single();

      if (error) return null;
      return data as GamificationLevel;
    },
    enabled: !!userStats?.current_level,
  });

  // Buscar histórico de pontos
  const { data: pointsHistory } = useQuery({
    queryKey: ['user-points-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as UserPoints[];
    },
    enabled: !!user?.id,
  });

  // Buscar badges do usuário
  const { data: userBadges } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data.map((item: any) => ({
        ...item.badges,
        earned_at: item.earned_at,
        progress: item.progress,
      })) as UserBadge[];
    },
    enabled: !!user?.id,
  });

  // Buscar todos os badges disponíveis
  const { data: allBadges } = useQuery({
    queryKey: ['all-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
  });

  // Buscar missões do usuário
  const { data: userMissions } = useQuery({
    queryKey: ['user-missions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_missions')
        .select(`
          *,
          missions (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((item: any) => ({
        ...item.missions,
        progress: item.progress,
        completed: item.completed,
        completed_at: item.completed_at,
      })) as UserMission[];
    },
    enabled: !!user?.id,
  });

  // Buscar ranking
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data: cacheData, error: cacheError } = await supabase
        .from('leaderboard_cache')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(100);

      if (cacheError) throw cacheError;
      if (!cacheData || cacheData.length === 0) return [];

      // Buscar nomes dos usuários
      const userIds = cacheData.map((entry) => entry.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select('id, nome')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Combinar dados
      const usersMap = new Map(usersData?.map((u) => [u.id, u.nome]) || []);
      return cacheData.map((entry) => ({
        ...entry,
        usuarios: { nome: usersMap.get(entry.user_id) || 'Usuário' },
      })) as LeaderboardEntry[];
    },
  });

  // Buscar ranking semanal
  const { data: weeklyLeaderboard } = useQuery({
    queryKey: ['weekly-leaderboard'],
    queryFn: async () => {
      const { data: cacheData, error: cacheError } = await supabase
        .from('leaderboard_cache')
        .select('*')
        .order('weekly_points', { ascending: false })
        .limit(100);

      if (cacheError) throw cacheError;
      if (!cacheData || cacheData.length === 0) return [];

      // Buscar nomes dos usuários
      const userIds = cacheData.map((entry) => entry.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select('id, nome')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Combinar dados
      const usersMap = new Map(usersData?.map((u) => [u.id, u.nome]) || []);
      return cacheData.map((entry) => ({
        ...entry,
        usuarios: { nome: usersMap.get(entry.user_id) || 'Usuário' },
      })) as LeaderboardEntry[];
    },
  });

  // Mutation para completar missão manualmente (se necessário)
  const completeMission = useMutation({
    mutationFn: async (missionId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_missions')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('mission_id', missionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-missions'] });
      queryClient.invalidateQueries({ queryKey: ['user-gamification-stats'] });
      toast({
        title: '✅ Missão concluída!',
        description: 'Você ganhou pontos extras!',
      });
    },
  });

  // Calcular progresso para próximo nível
  const calculateLevelProgress = () => {
    if (!userStats || !levelInfo || !nextLevel) return 0;

    const currentPoints = userStats.total_points;
    const levelMin = levelInfo.min_points;
    const levelMax = nextLevel.min_points;

    const progress = ((currentPoints - levelMin) / (levelMax - levelMin)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return {
    userStats,
    levelInfo,
    nextLevel,
    pointsHistory,
    userBadges,
    allBadges,
    userMissions,
    leaderboard,
    weeklyLeaderboard,
    loadingStats,
    calculateLevelProgress,
    completeMission,
  };
};
