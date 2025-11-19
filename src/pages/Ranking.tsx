import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';
import { LevelDisplay } from '@/components/gamification/LevelDisplay';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Ranking() {
  const { user } = useAuth();
  const {
    userStats,
    levelInfo,
    nextLevel,
    leaderboard,
    weeklyLeaderboard,
    calculateLevelProgress,
    loadingStats,
  } = useGamification();

  const userRank = leaderboard?.find((entry) => entry.user_id === user?.id);
  const userWeeklyRank = weeklyLeaderboard?.find((entry) => entry.user_id === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-4">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            <h1 className="text-4xl font-bold">Ranking</h1>
          </div>
          <p className="text-muted-foreground">
            Veja os usuários mais ativos e engajados da comunidade
          </p>
        </div>

        {/* User Stats */}
        {user && userStats && levelInfo && !loadingStats && (
          <div className="grid gap-4 md:grid-cols-2">
            <LevelDisplay
              level={userStats.current_level}
              levelName={levelInfo.name}
              currentPoints={userStats.total_points}
              nextLevelPoints={nextLevel?.min_points}
              progress={calculateLevelProgress()}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">#{userRank?.rank_position || '-'}</p>
                      <p className="text-xs text-muted-foreground">Posição Geral</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">#{userWeeklyRank?.weekly_rank_position || '-'}</p>
                      <p className="text-xs text-muted-foreground">Posição Semanal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Leaderboards */}
        <Tabs defaultValue="total" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="total" className="gap-2">
              <Trophy className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Semanal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="total" className="mt-6">
            <LeaderboardTable
              entries={leaderboard || []}
              type="total"
              currentUserId={user?.id}
            />
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <LeaderboardTable
              entries={weeklyLeaderboard || []}
              type="weekly"
              currentUserId={user?.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
