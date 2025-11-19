import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PointsHistoryProps {
  history: Array<{
    id: string;
    points: number;
    action_type: string;
    action_description: string | null;
    created_at: string;
  }>;
}

const getActionLabel = (actionType: string) => {
  const labels: Record<string, string> = {
    review_created: '⭐ Avaliação publicada',
    problem_created: '🚨 Problema reportado',
    comment_created: '💬 Comentário feito',
    favorite_added: '❤️ Empresa favoritada',
    poll_vote: '📊 Voto em enquete',
    badge_earned: '🏆 Badge conquistado',
    level_up: '⬆️ Subiu de nível',
  };

  return labels[actionType] || actionType;
};

export const PointsHistory = ({ history }: PointsHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Histórico de Pontos</CardTitle>
            <CardDescription>Suas últimas atividades</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma atividade ainda</p>
                <p className="text-sm mt-1">Comece a ganhar pontos interagindo com o guia!</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold shrink-0 ${
                      item.points > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.points > 0 ? '+' : ''}
                    {item.points}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{getActionLabel(item.action_type)}</p>
                    {item.action_description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {item.action_description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
