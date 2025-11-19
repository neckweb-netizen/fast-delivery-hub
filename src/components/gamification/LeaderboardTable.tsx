import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
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

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  type?: 'total' | 'weekly';
  currentUserId?: string;
}

const getRankIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-slate-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-700" />;
    default:
      return null;
  }
};

const getRankBadge = (position: number) => {
  if (position <= 3) {
    return 'default';
  } else if (position <= 10) {
    return 'secondary';
  }
  return 'outline';
};

export const LeaderboardTable = ({ entries, type = 'total', currentUserId }: LeaderboardTableProps) => {
  const title = type === 'total' ? 'Ranking Geral' : 'Ranking Semanal';
  const description = type === 'total' 
    ? 'Top 100 usuários com mais pontos acumulados'
    : 'Top 100 usuários da semana';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum usuário no ranking ainda</p>
            </div>
          ) : (
            entries.map((entry) => {
              const position = type === 'total' ? entry.rank_position : entry.weekly_rank_position;
              const points = type === 'total' ? entry.total_points : entry.weekly_points;
              const isCurrentUser = entry.user_id === currentUserId;

              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    isCurrentUser && 'bg-primary/5 border-primary',
                    !isCurrentUser && 'hover:bg-accent/50'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-10 shrink-0">
                      {getRankIcon(position) || (
                        <Badge variant={getRankBadge(position) as any} className="w-8 h-8 flex items-center justify-center p-0">
                          {position}
                        </Badge>
                      )}
                    </div>

                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                        {entry.usuarios.nome.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {entry.usuarios.nome}
                        {isCurrentUser && <span className="text-primary ml-1">(Você)</span>}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>Nível {entry.current_level}</span>
                        <span>•</span>
                        <span>{entry.badges_count} badges</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-primary">
                      {points.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
