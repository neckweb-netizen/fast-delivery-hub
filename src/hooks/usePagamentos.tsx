import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface Pagamento {
  id: string;
  empresa_id: string;
  plano_id: string;
  valor: number;
  data_pagamento: string;
  data_vencimento: string;
  forma_pagamento: string;
  status: string;
  comprovante_url?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface PagamentoInsert {
  empresa_id: string;
  plano_id: string;
  valor: number;
  data_pagamento: string;
  data_vencimento: string;
  forma_pagamento: string;
  status: string;
  comprovante_url?: string;
  observacoes?: string;
}

export const usePagamentos = (empresaId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pagamentos, isLoading } = useQuery({
    queryKey: ['pagamentos', empresaId],
    queryFn: async () => {
      let query = supabase
        .from('pagamentos_planos')
        .select(`
          *,
          empresas (nome),
          planos (nome)
        `)
        .order('data_pagamento', { ascending: false });

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const registrarPagamento = useMutation({
    mutationFn: async (dados: PagamentoInsert) => {
      const { data, error } = await supabase
        .from('pagamentos_planos')
        .insert(dados)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      toast({
        title: 'Pagamento registrado',
        description: 'O pagamento foi registrado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        title: 'Erro ao registrar pagamento',
        description: 'Não foi possível registrar o pagamento.',
        variant: 'destructive',
      });
    },
  });

  const atualizarPagamento = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: Partial<PagamentoInsert> }) => {
      const { data, error } = await supabase
        .from('pagamentos_planos')
        .update(dados)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      toast({
        title: 'Pagamento atualizado',
        description: 'O pagamento foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o pagamento.',
        variant: 'destructive',
      });
    },
  });

  const excluirPagamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pagamentos_planos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      toast({
        title: 'Pagamento excluído',
        description: 'O pagamento foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir pagamento:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o pagamento.',
        variant: 'destructive',
      });
    },
  });

  return {
    pagamentos,
    isLoading,
    registrarPagamento,
    atualizarPagamento,
    excluirPagamento,
  };
};
