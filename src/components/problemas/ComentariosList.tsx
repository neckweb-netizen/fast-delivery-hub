import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comentario {
  id: string;
  conteudo: string;
  votos_positivos: number;
  votos_negativos: number;
  criado_em: string;
  usuario?: {
    nome: string;
  };
}

interface ComentariosListProps {
  comentarios: Comentario[];
  onVotar?: (comentarioId: string, tipoVoto: 1 | -1) => void;
  canVote?: boolean;
}

export const ComentariosList = ({ comentarios, onVotar, canVote = false }: ComentariosListProps) => {
  return (
    <div className="space-y-4">
      {comentarios.map((comentario) => (
        <Card key={comentario.id}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1 min-w-[40px]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => onVotar?.(comentario.id, 1)}
                  disabled={!canVote}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <span className="text-sm font-medium">
                  {comentario.votos_positivos - comentario.votos_negativos}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => onVotar?.(comentario.id, -1)}
                  disabled={!canVote}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    {comentario.usuario?.nome || 'Anônimo'}
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comentario.criado_em), "d 'de' MMM 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {comentario.conteudo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
