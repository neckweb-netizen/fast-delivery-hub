import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface Agendamento {
  id: string;
  empresa_id: string;
  usuario_id?: string;
  servico_id?: string;
  data_hora: string;
  observacoes?: string;
  status: string;
  criado_em: string;
}

export const useAgendamentos = (empresaId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['agendamentos', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('data_hora', { ascending: true });

      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!empresaId,
  });

  const criarAgendamento = useMutation({
    mutationFn: async (dados: {
      empresa_id: string;
      data_hora: string;
      observacoes?: string;
      servico_id?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          empresa_id: dados.empresa_id,
          data_hora: dados.data_hora,
          observacoes: dados.observacoes || null,
          servico_id: dados.servico_id || null,
          usuario_id: user.user.id,
          status: 'pendente',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast({
        title: 'Agendamento criado!',
        description: 'Seu agendamento foi solicitado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: 'Erro ao agendar',
        description: 'Não foi possível criar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast({ title: 'Status atualizado!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    },
  });

  return {
    agendamentos: agendamentos || [],
    isLoading,
    criarAgendamento,
    atualizarStatus,
  };
};
