import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const usePagamentos = (empresaId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pagamentos, isLoading } = useQuery({
    queryKey: ['pagamentos', empresaId],
    queryFn: async () => {
      let query = supabase
        .from('pagamentos')
        .select(`
          *,
          empresas (nome),
          planos (nome)
        `)
        .order('criado_em', { ascending: false });

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const registrarPagamento = useMutation({
    mutationFn: async (dados: any) => {
      const { data, error } = await supabase
        .from('pagamentos')
        .insert(dados)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      toast({ title: 'Pagamento registrado' });
    },
    onError: () => {
      toast({ title: 'Erro ao registrar pagamento', variant: 'destructive' });
    },
  });

  const atualizarPagamento = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: any }) => {
      const { data, error } = await supabase
        .from('pagamentos')
        .update(dados)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      toast({ title: 'Pagamento atualizado' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar pagamento', variant: 'destructive' });
    },
  });

  const excluirPagamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pagamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      toast({ title: 'Pagamento excluído' });
    },
    onError: () => {
      toast({ title: 'Erro ao excluir pagamento', variant: 'destructive' });
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
