import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';
import { LevelDisplay } from '@/components/gamification/LevelDisplay';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, TrendingUp, Calendar, Star, Zap, Award, Target, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

        {/* How It Works Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>Como Funciona o Ranking?</CardTitle>
            </div>
            <CardDescription>
              Entenda como você pode subir no ranking e se tornar um líder da comunidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="points">
                <AccordionTrigger className="hover:text-primary">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span>Sistema de Pontos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>Ganhe pontos realizando atividades na plataforma:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>+50 pontos</strong> - Criar relato no Voz do Povo</li>
                    <li><strong>+20 pontos</strong> - Avaliar uma empresa</li>
                    <li><strong>+10 pontos</strong> - Comentar em problemas</li>
                    <li><strong>+5 pontos</strong> - Votar em problemas</li>
                    <li><strong>+15 pontos</strong> - Realizar agendamento</li>
                    <li><strong>+10 pontos</strong> - Salvar cupons</li>
                    <li><strong>+5 pontos</strong> - Visualizar stories</li>
                    <li><strong>+10 pontos</strong> - Participar de enquetes</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="levels">
                <AccordionTrigger className="hover:text-primary">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>Níveis de Progressão</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>Conforme acumula pontos, você sobe de nível:</p>
                  <div className="space-y-2 ml-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span><strong>Nível 1 - Novato:</strong> 0 a 200 pontos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span><strong>Nível 2 - Explorador:</strong> 201 a 600 pontos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span><strong>Nível 3 - Cidadão Ativo:</strong> 601 a 1500 pontos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span><strong>Nível 4 - Influente:</strong> 1501 a 4000 pontos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span><strong>Nível 5 - Líder da Comunidade:</strong> 4001+ pontos</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="badges">
                <AccordionTrigger className="hover:text-primary">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span>Medalhas e Conquistas</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>Desbloqueie medalhas especiais ao atingir marcos importantes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Avaliador Bronze/Prata/Ouro:</strong> 10/50/200 avaliações</li>
                    <li><strong>Relator de Problemas:</strong> 5 relatos no Voz do Povo</li>
                    <li><strong>Explorador da Cidade:</strong> Visitar 50 perfis</li>
                    <li><strong>Caçador de Cupons:</strong> Salvar 15 cupons</li>
                    <li><strong>Engajado:</strong> Usar o app 7 dias seguidos</li>
                    <li>E muitas outras medalhas exclusivas!</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ranking">
                <AccordionTrigger className="hover:text-primary">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>Rankings e Competição</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>Existem dois tipos de ranking:</p>
                  <div className="space-y-2 ml-2">
                    <div>
                      <strong className="text-foreground">🏆 Ranking Geral:</strong>
                      <p className="text-sm">Baseado em todos os pontos acumulados desde o cadastro. Mostra os usuários mais ativos de todos os tempos.</p>
                    </div>
                    <div>
                      <strong className="text-foreground">📈 Ranking Semanal:</strong>
                      <p className="text-sm">Resetado toda semana. Todos começam do zero, dando chance para novos usuários subirem no ranking!</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="missions">
                <AccordionTrigger className="hover:text-primary">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span>Missões Diárias e Semanais</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>Complete missões especiais para ganhar pontos extras:</p>
                  <div className="space-y-2 ml-2">
                    <div>
                      <strong className="text-foreground">Missões Diárias:</strong>
                      <p className="text-sm">Tarefas que renovam todos os dias. Ex: "Dê 1 avaliação hoje" (+20 pontos)</p>
                    </div>
                    <div>
                      <strong className="text-foreground">Missões Semanais:</strong>
                      <p className="text-sm">Desafios maiores que duram uma semana. Ex: "Participe de 3 enquetes" (+50 pontos)</p>
                    </div>
                  </div>
                  <p className="text-sm italic">Acesse suas missões na página de Conquistas!</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Alert className="mt-4 border-primary/20 bg-primary/5">
              <Trophy className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Dica Pro:</strong> Seja ativo na comunidade! Quanto mais você participa, avalia e ajuda outros usuários, mais rápido você sobe no ranking e desbloqueia recompensas exclusivas.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

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
