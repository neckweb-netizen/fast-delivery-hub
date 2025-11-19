import { Shield, Crown, Award, Users, Compass, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LevelDisplayProps {
  level: number;
  levelName: string;
  currentPoints: number;
  nextLevelPoints?: number;
  progress?: number;
  compact?: boolean;
  className?: string;
}

const getLevelIcon = (level: number) => {
  switch (level) {
    case 1:
      return User;
    case 2:
      return Compass;
    case 3:
      return Users;
    case 4:
      return Award;
    case 5:
      return Crown;
    default:
      return Shield;
  }
};

const getLevelColor = (level: number) => {
  switch (level) {
    case 1:
      return 'text-muted-foreground';
    case 2:
      return 'text-primary';
    case 3:
      return 'text-purple-500';
    case 4:
      return 'text-amber-500';
    case 5:
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
};

const getLevelGradient = (level: number) => {
  switch (level) {
    case 1:
      return 'from-slate-400 to-slate-600';
    case 2:
      return 'from-primary to-blue-600';
    case 3:
      return 'from-purple-500 to-purple-700';
    case 4:
      return 'from-amber-500 to-orange-600';
    case 5:
      return 'from-red-500 to-rose-700';
    default:
      return 'from-slate-400 to-slate-600';
  }
};

export const LevelDisplay = ({
  level,
  levelName,
  currentPoints,
  nextLevelPoints,
  progress = 0,
  compact = false,
  className,
}: LevelDisplayProps) => {
  const Icon = getLevelIcon(level);
  const colorClass = getLevelColor(level);
  const gradientClass = getLevelGradient(level);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('p-2 rounded-full bg-gradient-to-br', gradientClass)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium">Nível {level}</p>
          <p className="text-xs text-muted-foreground">{levelName}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={cn('p-4 rounded-full bg-gradient-to-br', gradientClass)}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">Nível {level}</h3>
              <span className={cn('text-lg font-semibold', colorClass)}>{levelName}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {currentPoints.toLocaleString('pt-BR')} pontos
            </p>
          </div>
        </div>

        {nextLevelPoints && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso para o próximo nível</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              Faltam {(nextLevelPoints - currentPoints).toLocaleString('pt-BR')} pontos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
