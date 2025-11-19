import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { MissionCard } from '@/components/gamification/MissionCard';
import { PointsHistory } from '@/components/gamification/PointsHistory';
import { LevelDisplay } from '@/components/gamification/LevelDisplay';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Target, TrendingUp, Star, Zap, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useState } from 'react';

export default function Conquistas() {
  const { user } = useAuth();
  const {
    userStats,
    levelInfo,
    nextLevel,
    userBadges,
    allBadges,
    userMissions,
    pointsHistory,
    calculateLevelProgress,
    loadingStats,
  } = useGamification();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // CTA para usuários não logados
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-4">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Award className="h-12 w-12 text-primary" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold">
                Comece Sua Jornada de Conquistas!
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Desbloqueie medalhas exclusivas, complete missões diárias e semanais, 
                e acompanhe todo seu progresso na plataforma.
              </p>

              <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto my-8">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Medalhas Únicas</h3>
                  <p className="text-sm text-muted-foreground">
                    Desbloqueie conquistas especiais
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Missões</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete desafios diários e semanais
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Progresso</h3>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe toda sua evolução
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  className="gap-2"
                  onClick={() => setAuthDialogOpen(true)}
                >
                  <Award className="h-5 w-5" />
                  Criar Conta Grátis
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setAuthDialogOpen(true)}
                >
                  Já tenho conta
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground pt-4">
                Junte-se à comunidade e comece a ganhar recompensas agora!
              </p>
            </CardContent>
          </Card>

          <AuthDialog 
            open={authDialogOpen} 
            onOpenChange={setAuthDialogOpen}
          />
        </div>
      </div>
    );
  }

  // Separar badges conquistados e não conquistados
  const earnedBadgeIds = new Set(userBadges?.map((b) => b.id) || []);
  const unearnedBadges = allBadges?.filter((badge) => !earnedBadgeIds.has(badge.id)) || [];

  // Agrupar badges por categoria
  const badgesByCategory = (badges: any[]) => {
    const grouped: Record<string, any[]> = {};
    badges.forEach((badge) => {
      if (!grouped[badge.category]) {
        grouped[badge.category] = [];
      }
      grouped[badge.category].push(badge);
    });
    return grouped;
  };

  const earnedByCategory = badgesByCategory(userBadges || []);
  const unearnedByCategory = badgesByCategory(unearnedBadges);

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      reviews: 'Avaliações',
      problems: 'Voz do Povo',
      appointments: 'Agendamentos',
      coupons: 'Cupons',
      exploration: 'Exploração',
      engagement: 'Engajamento',
      favorites: 'Favoritos',
      polls: 'Enquetes',
      general: 'Geral',
    };
    return names[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-4">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            <h1 className="text-4xl font-bold">Minhas Conquistas</h1>
          </div>
          <p className="text-muted-foreground">
            Acompanhe seu progresso, badges e missões
          </p>
        </div>

        {/* Level Display */}
        {userStats && levelInfo && !loadingStats && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LevelDisplay
                level={userStats.current_level}
                levelName={levelInfo.name}
                currentPoints={userStats.total_points}
                nextLevelPoints={nextLevel?.min_points}
                progress={calculateLevelProgress()}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Trophy className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{userStats.badges_count}</p>
                      <p className="text-xs text-muted-foreground">Badges Conquistados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{userStats.weekly_points}</p>
                      <p className="text-xs text-muted-foreground">Pontos esta Semana</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="badges" className="gap-2">
              <Trophy className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-2">
              <Target className="h-4 w-4" />
              Missões
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="mt-6 space-y-8">
            {/* Earned Badges */}
            {userBadges && userBadges.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">🏆 Conquistados ({userBadges.length})</h2>
                {Object.entries(earnedByCategory).map(([category, badges]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      {getCategoryName(category)}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {badges.map((badge) => (
                        <BadgeCard
                          key={badge.id}
                          name={badge.name}
                          description={badge.description}
                          icon={badge.icon}
                          color={badge.color}
                          rarity={badge.rarity}
                          earned={true}
                          earnedAt={badge.earned_at}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unearned Badges */}
            {unearnedBadges.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">🔒 A Conquistar ({unearnedBadges.length})</h2>
                {Object.entries(unearnedByCategory).map(([category, badges]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      {getCategoryName(category)}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {badges.map((badge) => (
                        <BadgeCard
                          key={badge.id}
                          name={badge.name}
                          description={badge.description}
                          icon={badge.icon}
                          color={badge.color}
                          rarity={badge.rarity}
                          earned={false}
                          requirementCount={badge.requirement_count}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions" className="mt-6 space-y-6">
            {userMissions && userMissions.length > 0 ? (
              <>
                {/* Active Missions */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">📋 Missões Ativas</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {userMissions
                      .filter((m) => !m.completed)
                      .map((mission) => (
                        <MissionCard
                          key={mission.id}
                          title={mission.title}
                          description={mission.description}
                          points={mission.points}
                          type={mission.type}
                          icon={mission.icon}
                          color={mission.color}
                          targetCount={mission.target_count}
                          progress={mission.progress}
                          completed={mission.completed}
                        />
                      ))}
                  </div>
                </div>

                {/* Completed Missions */}
                {userMissions.some((m) => m.completed) && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">✅ Missões Concluídas</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {userMissions
                        .filter((m) => m.completed)
                        .map((mission) => (
                          <MissionCard
                            key={mission.id}
                            title={mission.title}
                            description={mission.description}
                            points={mission.points}
                            type={mission.type}
                            icon={mission.icon}
                            color={mission.color}
                            targetCount={mission.target_count}
                            progress={mission.progress}
                            completed={mission.completed}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma missão disponível no momento</p>
                  <p className="text-sm mt-2">Novas missões serão adicionadas em breve!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <PointsHistory history={pointsHistory || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
