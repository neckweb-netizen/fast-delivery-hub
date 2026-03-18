
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CanalInformativoItem {
  id: string;
  titulo: string;
  conteudo?: string;
  categoria?: string;
  imagem_url?: string;
  autor_id?: string;
  ativo: boolean;
  criado_em: string;
}

export interface CreateCanalInformativoData {
  titulo: string;
  conteudo?: string;
  categoria?: string;
  imagem_url?: string;
}

export const useCanalInformativo = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canalQuery = useQuery({
    queryKey: ['canal-informativo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('canal_informativo')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return (data || []) as CanalInformativoItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateCanalInformativoData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('Usuário não autenticado');

      const { data: canalItem, error } = await supabase
        .from('canal_informativo')
        .insert([{
          titulo: data.titulo,
          conteudo: data.conteudo,
          categoria: data.categoria,
          imagem_url: data.imagem_url,
          autor_id: user.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return canalItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canal-informativo'] });
      toast({ title: 'Publicação criada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar publicação', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CanalInformativoItem> & { id: string }) => {
      const { error } = await supabase
        .from('canal_informativo')
        .update(data as any)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canal-informativo'] });
      toast({ title: 'Publicação atualizada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar publicação', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('canal_informativo')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canal-informativo'] });
      toast({ title: 'Publicação removida com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao remover publicação', description: error.message, variant: 'destructive' });
    },
  });

  return {
    items: canalQuery.data || [],
    loading: canalQuery.isLoading,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    refetch: canalQuery.refetch,
  };
};
