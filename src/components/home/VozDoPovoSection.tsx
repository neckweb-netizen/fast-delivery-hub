import { Link } from 'react-router-dom';
import { MessageSquare, ChevronRight, Clock, ThumbsUp } from 'lucide-react';
import { useProblemasCidade } from '@/hooks/useProblemasCidade';
import { useCidadePadrao } from '@/hooks/useCidadePadrao';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const VozDoPovoSection = () => {
  const { data: cidadePadrao } = useCidadePadrao();
  const { problemas, isLoading } = useProblemasCidade(cidadePadrao?.id, {
    ordenacao: 'recentes'
  });

  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 lg:mx-6" style={{ minHeight: '450px' }}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48"></div>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!problemas || problemas.length === 0) {
    return null;
  }

  const problemasRecentes = problemas.slice(0, 3);

  return (
    <div className="mx-2 sm:mx-4 lg:mx-6" style={{ minHeight: '450px' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-bold text-foreground">Voz do Povo</h2>
        </div>
        <Link
          to="/reclamacoes"
          className="text-sm text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1"
        >
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid gap-4">
        {problemasRecentes.map((problema) => (
          <Link
            key={problema.id}
            to={`/reclamacoes/${problema.id}`}
            className="block"
          >
            <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-secondary">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-1 flex-1">
                    {problema.titulo}
                  </h3>
                  {problema.categoria && (
                    <Badge 
                      variant="secondary"
                      className="flex-shrink-0"
                      style={{ 
                        backgroundColor: `${problema.categoria.cor}20`,
                        color: problema.categoria.cor,
                        borderColor: problema.categoria.cor
                      }}
                    >
                      {problema.categoria.nome}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {problema.descricao}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(problema.criado_em), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                  
                  {problema.votos_positivos > 0 && (
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{problema.votos_positivos}</span>
                    </div>
                  )}

                  {problema.total_comentarios > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{problema.total_comentarios}</span>
                    </div>
                  )}

                  {problema.bairro && (
                    <span className="text-secondary">
                      {problema.bairro}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
