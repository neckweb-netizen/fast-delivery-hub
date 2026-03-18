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

// Default level info
const DEFAULT_LEVELS: GamificationLevel[] = [
  { id: '1', level: 1, name: 'Iniciante', min_points: 0, max_points: 100, icon: '🌱', color: '#4CAF50' },
  { id: '2', level: 2, name: 'Explorador', min_points: 100, max_points: 300, icon: '🧭', color: '#2196F3' },
  { id: '3', level: 3, name: 'Contribuidor', min_points: 300, max_points: 600, icon: '⭐', color: '#FF9800' },
  { id: '4', level: 4, name: 'Expert', min_points: 600, max_points: 1000, icon: '🏆', color: '#9C27B0' },
  { id: '5', level: 5, name: 'Lenda', min_points: 1000, max_points: null, icon: '👑', color: '#F44336' },
];

export const useGamification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar stats do perfil do usuário
  const { data: userStats, isLoading: loadingStats } = useQuery({
    queryKey: ['user-gamification-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('total_points, current_level, badges_count')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) {
        return { total_points: 0, current_level: 1, badges_count: 0 };
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Use default levels
  const levelInfo = userStats 
    ? DEFAULT_LEVELS.find(l => l.level === (userStats.current_level || 1)) || DEFAULT_LEVELS[0]
    : DEFAULT_LEVELS[0];

  const nextLevel = userStats
    ? DEFAULT_LEVELS.find(l => l.level === (userStats.current_level || 1) + 1) || null
    : DEFAULT_LEVELS[1];

  const calculateLevelProgress = () => {
    if (!userStats || !levelInfo) return 0;
    const currentPoints = userStats.total_points || 0;
    const levelMin = levelInfo.min_points;
    const levelMax = nextLevel?.min_points || levelMin + 100;
    const progress = ((currentPoints - levelMin) / (levelMax - levelMin)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return {
    userStats,
    loadingStats,
    levelInfo,
    nextLevel,
    calculateLevelProgress,
    pointsHistory: [],
    badges: [],
    userBadges: [],
    missions: [],
    userMissions: [],
    leaderboard: [],
    weeklyLeaderboard: [],
  };
};
