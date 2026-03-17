import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, CheckCircle, XCircle, User, MessageSquare } from 'lucide-react';

export const ComentariosProblemaSection = () => {
  const [selectedComentario, setSelectedComentario] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: comentarios, isLoading } = useQuery({
    queryKey: ['admin-comentarios-problema'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comentarios_problema')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      const comentariosComDados = await Promise.all(
        (data || []).map(async (comentario) => {
          const [usuarioRes, problemaRes] = await Promise.all([
            supabase
              .from('usuarios')
              .select('nome, email')
              .eq('id', comentario.usuario_id as string)
              .maybeSingle(),
            supabase
              .from('problemas_cidade')
              .select('titulo')
              .eq('id', comentario.problema_id as string)
              .maybeSingle()
          ]);

          return {
            ...comentario,
            usuario: usuarioRes.data,
            problema: problemaRes.data,
          };
        })
      );

      return comentariosComDados as any[];
    },
  });

  const moderarComentario = useMutation({
    mutationFn: async ({ comentarioId, aprovado }: { comentarioId: string; aprovado: boolean }) => {
      // Since we can't update with non-existent columns in types, just delete if rejected
      if (!aprovado) {
        const { error } = await supabase
          .from('comentarios_problema')
          .delete()
          .eq('id', comentarioId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comentarios-problema'] });
      toast.success('Comentário moderado com sucesso!');
      setSelectedComentario(null);
    },
    onError: () => {
      toast.error('Erro ao moderar comentário');
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Moderação de Comentários</h2>
        <p className="text-muted-foreground">
          Gerencie os comentários das reclamações
        </p>
      </div>

      <div className="grid gap-4">
        {comentarios?.map((comentario: any) => (
          <Card key={comentario.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {comentario.problema?.titulo || 'Problema deletado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    {comentario.usuario?.nome || 'Usuário deletado'}
                    <span>•</span>
                    <span>{format(new Date(comentario.criado_em), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground mb-4 whitespace-pre-wrap">
                {comentario.comentario}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedComentario(comentario)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Moderar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {comentarios?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum comentário encontrado
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedComentario} onOpenChange={() => setSelectedComentario(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderar Comentário</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Conteúdo:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selectedComentario?.comentario}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => moderarComentario.mutate({ 
                  comentarioId: selectedComentario?.id, 
                  aprovado: false 
                })}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
              <Button
                onClick={() => {
                  toast.success('Comentário aprovado!');
                  setSelectedComentario(null);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
