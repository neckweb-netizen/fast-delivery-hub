import { Medal, Lock, Star, Trophy, Award, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface BadgeCardProps {
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  rarity: string;
  earned?: boolean;
  earnedAt?: string;
  progress?: number;
  requirementCount?: number;
  compact?: boolean;
}

const getRarityColor = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case 'common':
      return 'bg-slate-500';
    case 'bronze':
      return 'bg-amber-700';
    case 'silver':
      return 'bg-slate-400';
    case 'gold':
      return 'bg-yellow-500';
    case 'legendary':
      return 'bg-purple-600';
    default:
      return 'bg-slate-500';
  }
};

const getRarityLabel = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case 'common':
      return 'Comum';
    case 'bronze':
      return 'Bronze';
    case 'silver':
      return 'Prata';
    case 'gold':
      return 'Ouro';
    case 'legendary':
      return 'Lendário';
    default:
      return rarity;
  }
};

export const BadgeCard = ({
  name,
  description,
  icon,
  color,
  rarity,
  earned = false,
  earnedAt,
  progress,
  requirementCount,
  compact = false,
}: BadgeCardProps) => {
  const IconComponent = icon && (LucideIcons as any)[icon] ? (LucideIcons as any)[icon] : Medal;
  const rarityColor = getRarityColor(rarity);
  const rarityLabel = getRarityLabel(rarity);

  const progressPercentage = progress && requirementCount 
    ? Math.min((progress / requirementCount) * 100, 100)
    : 0;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 p-3 rounded-lg border', !earned && 'opacity-50')}>
        <div
          className={cn('p-2 rounded-full', earned ? rarityColor : 'bg-muted')}
          style={{ backgroundColor: earned ? color : undefined }}
        >
          {earned ? (
            <IconComponent className="h-5 w-5 text-white" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', !earned && 'opacity-60')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn('p-3 rounded-lg', earned ? rarityColor : 'bg-muted')}
            style={{ backgroundColor: earned ? color : undefined }}
          >
            {earned ? (
              <IconComponent className="h-6 w-6 text-white" />
            ) : (
              <Lock className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {rarityLabel}
          </Badge>
        </div>
        <CardTitle className="text-base mt-2">{name}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      
      {!earned && progress !== undefined && requirementCount && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{progress}/{requirementCount}</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        </CardContent>
      )}

      {earned && earnedAt && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="h-3 w-3" />
            <span>Conquistado em {new Date(earnedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
