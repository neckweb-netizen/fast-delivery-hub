
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Produto {
  id: string;
  empresa_id: string;
  nome: string;
  descricao?: string;
  preco?: number;
  preco_promocional?: number;
  categoria?: string;
  imagem_url?: string;
  ativo: boolean;
  destaque: boolean;
  criado_em: string;
}

export interface ProdutoInput {
  nome: string;
  descricao?: string;
  preco?: number;
  preco_promocional?: number;
  categoria?: string;
  imagem_url?: string;
  ativo?: boolean;
  destaque?: boolean;
}

export const useProdutos = (empresaId?: string) => {
  return useQuery({
    queryKey: ['produtos', empresaId],
    queryFn: async () => {
      let query = supabase
        .from('produtos')
        .select('*, empresas(id, nome)')
        .eq('ativo', true)
        .order('destaque', { ascending: false })
        .order('criado_em', { ascending: false });

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useProdutosPorEmpresa = (empresaId: string) => {
  return useQuery({
    queryKey: ['produtos', 'empresa', empresaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('destaque', { ascending: false })
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return (data || []) as Produto[];
    },
    enabled: !!empresaId,
  });
};

export const useCriarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produto: ProdutoInput & { empresa_id: string }) => {
      const { data, error } = await supabase
        .from('produtos')
        .insert([produto])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar produto');
    },
  });
};

export const useAtualizarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...produto }: Partial<ProdutoInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('produtos')
        .update(produto)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar produto');
    },
  });
};

export const useExcluirProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir produto');
    },
  });
};
