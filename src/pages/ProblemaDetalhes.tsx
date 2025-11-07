import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowUp, ArrowDown, MapPin, Calendar, Eye, User } from 'lucide-react';
import { useProblemaDetalhes, useProblemasCidade } from '@/hooks/useProblemasCidade';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ComentariosList } from '@/components/problemas/ComentariosList';
import { ComentarioForm } from '@/components/problemas/ComentarioForm';
import { useAuth } from '@/hooks/useAuth';
import * as LucideIcons from 'lucide-react';

const ProblemaDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { problema, comentarios, isLoading } = useProblemaDetalhes(id!);
  const { votarProblema, incrementarVisualizacao } = useProblemasCidade();

  useEffect(() => {
    if (id) {
      incrementarVisualizacao.mutate(id);
    }
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-4">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!problema) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Sugestão não encontrada</p>
        </div>
      </MainLayout>
    );
  }

  const statusColors = {
    aberto: 'bg-red-500/10 text-red-500 border-red-500/20',
    em_analise: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    resolvido: 'bg-green-500/10 text-green-500 border-green-500/20',
    fechado: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  const prioridadeColors = {
    baixa: 'bg-blue-500/10 text-blue-500',
    media: 'bg-yellow-500/10 text-yellow-500',
    alta: 'bg-orange-500/10 text-orange-500',
    urgente: 'bg-red-500/10 text-red-500',
  };

  const statusLabels = {
    aberto: 'Aberto',
    em_analise: 'Em Análise',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
  };

  const prioridadeLabels = {
    baixa: 'Baixa Prioridade',
    media: 'Prioridade Média',
    alta: 'Alta Prioridade',
    urgente: 'Urgente',
  };

  const handleVoto = async (tipoVoto: 1 | -1) => {
    if (!user) return;
    await votarProblema.mutateAsync({ problemaId: problema.id, tipoVoto });
  };

  const IconeCategoria = problema.categoria?.icone
    ? (LucideIcons as any)[problema.categoria.icone]
    : null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/problemas-cidade')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardContent className="p-6">
            {/* Header com badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {problema.categoria && IconeCategoria && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium"
                  style={{
                    backgroundColor: `${problema.categoria.cor}15`,
                    color: problema.categoria.cor,
                  }}
                >
                  <IconeCategoria className="w-4 h-4" />
                  {problema.categoria.nome}
                </div>
              )}
              <Badge className={statusColors[problema.status]}>
                {statusLabels[problema.status]}
              </Badge>
              <Badge className={prioridadeColors[problema.prioridade]}>
                {prioridadeLabels[problema.prioridade]}
              </Badge>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {problema.titulo}
            </h1>

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {problema.usuario?.nome || 'Anônimo'}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(problema.criado_em), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {problema.visualizacoes} visualizações
              </div>
            </div>

            {/* Localização */}
            <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg mb-6">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  {problema.endereco}
                </p>
                {problema.bairro && (
                  <p className="text-sm text-muted-foreground">
                    {problema.bairro}
                  </p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-foreground whitespace-pre-wrap">
                {problema.descricao}
              </p>
            </div>

            {/* Imagens */}
            {problema.imagens && problema.imagens.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {problema.imagens.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Imagem ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Votos */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVoto(1)}
                  disabled={!user}
                  className="gap-1"
                >
                  <ArrowUp className="w-4 h-4" />
                  {problema.votos_positivos}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVoto(-1)}
                  disabled={!user}
                  className="gap-1"
                >
                  <ArrowDown className="w-4 h-4" />
                  {problema.votos_negativos}
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {problema.votos_positivos - problema.votos_negativos} pontos
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Comentários */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Comentários ({comentarios?.length || 0})
          </h2>

          {user && (
            <div className="mb-6">
              <ComentarioForm problemaId={problema.id} />
            </div>
          )}

          <Separator className="my-6" />

          {comentarios && comentarios.length > 0 ? (
            <ComentariosList comentarios={comentarios as any} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProblemaDetalhes;
