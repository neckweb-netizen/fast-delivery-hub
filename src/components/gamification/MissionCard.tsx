import { CheckCircle2, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface MissionCardProps {
  title: string;
  description: string;
  points: number;
  type: string;
  icon: string | null;
  color: string;
  targetCount: number;
  progress?: number;
  completed?: boolean;
}

const getMissionTypeLabel = (type: string) => {
  switch (type) {
    case 'daily':
      return 'Diária';
    case 'weekly':
      return 'Semanal';
    case 'special':
      return 'Especial';
    default:
      return type;
  }
};

const getMissionTypeBadge = (type: string) => {
  switch (type) {
    case 'daily':
      return 'default';
    case 'weekly':
      return 'secondary';
    case 'special':
      return 'destructive';
    default:
      return 'default';
  }
};

export const MissionCard = ({
  title,
  description,
  points,
  type,
  icon,
  color,
  targetCount,
  progress = 0,
  completed = false,
}: MissionCardProps) => {
  const IconComponent = icon && (LucideIcons as any)[icon] ? (LucideIcons as any)[icon] : Target;
  const progressPercentage = Math.min((progress / targetCount) * 100, 100);
  const typeLabel = getMissionTypeLabel(type);
  const typeBadge = getMissionTypeBadge(type);

  return (
    <Card className={cn('transition-all hover:shadow-md', completed && 'border-green-500 bg-green-50/50')}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: color + '20' }}
            >
              <IconComponent className="h-5 w-5" style={{ color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{title}</CardTitle>
                {completed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <Badge variant={typeBadge as any} className="text-xs shrink-0">
            {typeLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {!completed && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span className="font-medium">{progress}/{targetCount}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{typeLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
            <span>+{points}</span>
            <span className="text-xs">pts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
