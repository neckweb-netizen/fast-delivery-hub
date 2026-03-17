
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmpresaStories = () => {
  return useQuery({
    queryKey: ['empresa-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          empresas(
            id,
            nome,
            slug
          )
        `)
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return (data || []) as any[];
    },
  });
};

export const useAdminEmpresaStories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const storiesQuery = useQuery({
    queryKey: ['admin-empresa-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          empresas(
            id,
            nome,
            slug
          )
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const storyData: any = {
        empresa_id: data.empresa_id,
        tipo: data.tipo_midia || 'imagem',
        media_url: data.url_midia || data.imagem_story_url,
        titulo: data.nome_perfil_sistema || null,
        link: data.botao_link || null,
      };
      
      const { error } = await supabase
        .from('stories')
        .insert(storyData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-empresa-stories'] });
      queryClient.invalidateQueries({ queryKey: ['empresa-stories'] });
      toast({ title: 'Story criado com sucesso!' });
    },
    onError: (error) => {
      console.error('Erro ao criar story:', error);
      toast({ 
        title: 'Erro ao criar story', 
        description: 'Tente novamente.',
        variant: 'destructive' 
      });
    },
  });

  const updateStoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const updateData: any = {};
      
      if (data.ativo !== undefined) updateData.ativo = data.ativo;
      if (data.url_midia || data.imagem_story_url) updateData.media_url = data.url_midia || data.imagem_story_url;
      if (data.titulo) updateData.titulo = data.titulo;
      if (data.botao_link) updateData.link = data.botao_link;
      
      if (Object.keys(updateData).length === 0) {
        throw new Error('Nenhum campo válido para atualização');
      }
      
      const { error } = await supabase
        .from('stories')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-empresa-stories'] });
      queryClient.invalidateQueries({ queryKey: ['empresa-stories'] });
      toast({ title: 'Story atualizado com sucesso!' });
    },
    onError: (error) => {
      console.error('Erro ao atualizar story:', error);
      toast({ 
        title: 'Erro ao atualizar story', 
        description: 'Tente novamente.',
        variant: 'destructive' 
      });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-empresa-stories'] });
      queryClient.invalidateQueries({ queryKey: ['empresa-stories'] });
      toast({ title: 'Story removido com sucesso!' });
    },
    onError: (error) => {
      console.error('Erro ao remover story:', error);
      toast({ 
        title: 'Erro ao remover story', 
        description: 'Tente novamente.',
        variant: 'destructive' 
      });
    },
  });

  return {
    stories: storiesQuery.data || [],
    loading: storiesQuery.isLoading,
    createStory: createStoryMutation.mutate,
    updateStory: updateStoryMutation.mutate,
    deleteStory: deleteStoryMutation.mutate,
    refetch: storiesQuery.refetch,
  };
};
