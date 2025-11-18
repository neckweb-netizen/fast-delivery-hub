import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CategoriaOportunidade {
  id: string;
  nome: string;
  slug: string;
  tipo: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface CategoriaOportunidadeInput {
  nome: string;
  tipo: string;
  ativo: boolean;
}

export const useAdminCategoriasOportunidades = () => {
  const queryClient = useQueryClient();

  const { data: categorias, isLoading } = useQuery({
    queryKey: ['admin-categorias-oportunidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias_oportunidades')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as CategoriaOportunidade[];
    }
  });

  const createCategoria = useMutation({
    mutationFn: async (input: CategoriaOportunidadeInput) => {
      const slug = input.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const { data, error } = await supabase
        .from('categorias_oportunidades')
        .insert({
          nome: input.nome,
          slug,
          tipo: input.tipo,
          ativo: input.ativo
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categorias-oportunidades'] });
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar categoria: ' + error.message);
    }
  });

  const updateCategoria = useMutation({
    mutationFn: async ({ id, ...input }: CategoriaOportunidadeInput & { id: string }) => {
      const slug = input.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const { data, error } = await supabase
        .from('categorias_oportunidades')
        .update({
          nome: input.nome,
          slug,
          tipo: input.tipo,
          ativo: input.ativo
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categorias-oportunidades'] });
      toast.success('Categoria atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar categoria: ' + error.message);
    }
  });

  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categorias_oportunidades')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categorias-oportunidades'] });
      toast.success('Categoria excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir categoria: ' + error.message);
    }
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('categorias_oportunidades')
        .update({ ativo })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categorias-oportunidades'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  });

  return {
    categorias,
    isLoading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleAtivo
  };
};
