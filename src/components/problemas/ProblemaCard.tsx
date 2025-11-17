import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, MessageCircle, Eye, MapPin, Edit, Trash2, CheckCircle } from 'lucide-react';
import { ProblemaCidade, useProblemasCidade } from '@/hooks/useProblemasCidade';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import * as LucideIcons from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProblemaFormDialog } from './ProblemaFormDialog';

interface ProblemaCardProps {
  problema: ProblemaCidade;
}

export const ProblemaCard = ({ problema }: ProblemaCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { votarProblema, excluirProblema, atualizarProblema } = useProblemasCidade();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const isAuthor = user?.id === problema.usuario_id;

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
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  };

  const handleVoto = async (e: React.MouseEvent, tipoVoto: 1 | -1) => {
    e.stopPropagation();
    if (!user) {
      return;
    }
    await votarProblema.mutateAsync({ problemaId: problema.id, tipoVoto });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await excluirProblema.mutateAsync(problema.id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResolve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResolving(true);
    try {
      await atualizarProblema.mutateAsync({
        problemaId: problema.id,
        dados: { status: 'resolvido' },
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const IconeCategoria = problema.categoria?.icone
    ? (LucideIcons as any)[problema.categoria.icone]
    : null;

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate(`/reclamacoes/${problema.id}`)}
      >
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex gap-4">
              {/* Votos */}
              <div className="flex flex-col items-center gap-1 min-w-[48px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => handleVoto(e, 1)}
                  disabled={!user}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <span className="font-bold text-lg">
                  {problema.votos_positivos - problema.votos_negativos}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => handleVoto(e, -1)}
                  disabled={!user}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {problema.categoria && IconeCategoria && (
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: `${problema.categoria.cor}15`,
                        color: problema.categoria.cor,
                      }}
                    >
                      <IconeCategoria className="w-3.5 h-3.5" />
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
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                  {problema.titulo}
                </h3>

                {/* Descrição */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {problema.descricao}
                </p>

                {/* Localização */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {problema.bairro && `${problema.bairro} • `}
                  {problema.endereco}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>
                    Por {problema.usuario?.nome || 'Anônimo'}
                  </span>
                  <span>•</span>
                  <span>
                    {format(new Date(problema.criado_em), "d 'de' MMMM", { locale: ptBR })}
                  </span>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {problema.visualizacoes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {problema.total_comentarios || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagens */}
          {problema.imagens && problema.imagens.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {problema.imagens.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Imagem ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
              ))}
            </div>
          )}

          {/* Ações do autor - Mobile na parte inferior, Desktop na lateral */}
          {isAuthor && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="mt-4 pt-4 border-t border-border flex flex-row gap-2 md:absolute md:right-4 md:top-4 md:flex-col md:mt-0 md:pt-0 md:border-t-0"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex-1 md:flex-none h-9 px-3 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary"
              >
                <Edit className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResolve}
                disabled={isResolving || problema.status === 'resolvido' || problema.status === 'fechado'}
                className="flex-1 md:flex-none h-9 px-3 bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-600 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{isResolving ? 'Marcando...' : 'Resolvido'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="flex-1 md:flex-none h-9 px-3 bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive"
              >
                <Trash2 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Excluir</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta reclamação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de edição */}
      <ProblemaFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        problema={problema}
        isEdit={true}
      />
    </>
  );
};
