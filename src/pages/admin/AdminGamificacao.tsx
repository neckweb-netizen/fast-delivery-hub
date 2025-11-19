import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Target, Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Badge {
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
  is_active: boolean;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  action_key: string;
  target_count: number;
  icon: string | null;
  color: string;
  is_active: boolean;
}

export default function AdminGamificacao() {
  const queryClient = useQueryClient();
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  // Buscar badges
  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
  });

  // Buscar missões
  const { data: missions, isLoading: loadingMissions } = useQuery({
    queryKey: ['admin-missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('type', { ascending: true });

      if (error) throw error;
      return data as Mission[];
    },
  });

  // Atualizar badge
  const updateBadge = useMutation({
    mutationFn: async (badge: Partial<Badge> & { id: string }) => {
      const { error } = await supabase
        .from('badges')
        .update(badge)
        .eq('id', badge.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
      toast({ title: 'Badge atualizado com sucesso!' });
      setEditingBadge(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar badge',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Atualizar missão
  const updateMission = useMutation({
    mutationFn: async (mission: Partial<Mission> & { id: string }) => {
      const { error } = await supabase
        .from('missions')
        .update(mission)
        .eq('id', mission.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
      toast({ title: 'Missão atualizada com sucesso!' });
      setEditingMission(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar missão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Atualizar ranking
  const updateLeaderboard = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('update_leaderboard');
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Ranking atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar ranking',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-4">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            <h1 className="text-4xl font-bold">Gerenciar Gamificação</h1>
          </div>
          <p className="text-muted-foreground">
            Configure badges, missões e gerencie o sistema de gamificação
          </p>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Executar operações administrativas</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => updateLeaderboard.mutate()}>
              Atualizar Ranking Agora
            </Button>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="badges" className="gap-2">
              <Award className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-2">
              <Target className="h-4 w-4" />
              Missões
            </TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Badges</CardTitle>
                <CardDescription>
                  {badges?.length || 0} badges cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingBadges ? (
                    <p className="text-center text-muted-foreground py-8">Carregando...</p>
                  ) : badges && badges.length > 0 ? (
                    badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: badge.color + '20' }}
                          >
                            <Award className="h-6 w-6" style={{ color: badge.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{badge.name}</h3>
                              <Badge variant="outline">{badge.rarity}</Badge>
                              <Badge variant="secondary">{badge.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {badge.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              +{badge.points_reward} pontos • Requisito: {badge.requirement_count}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={badge.is_active}
                            onCheckedChange={(checked) =>
                              updateBadge.mutate({ id: badge.id, is_active: checked })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBadge(badge)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum badge encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Missões</CardTitle>
                <CardDescription>
                  {missions?.length || 0} missões cadastradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingMissions ? (
                    <p className="text-center text-muted-foreground py-8">Carregando...</p>
                  ) : missions && missions.length > 0 ? (
                    missions.map((mission) => (
                      <div
                        key={mission.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: mission.color + '20' }}
                          >
                            <Target className="h-6 w-6" style={{ color: mission.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{mission.title}</h3>
                              <Badge variant="outline">{mission.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {mission.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              +{mission.points} pontos • Meta: {mission.target_count}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={mission.is_active}
                            onCheckedChange={(checked) =>
                              updateMission.mutate({ id: mission.id, is_active: checked })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMission(mission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma missão encontrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
