import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface ServicoAgendamento {
  id: string;
  empresa_id: string;
  nome: string;
  nome_servico?: string;
  descricao?: string;
  preco?: number;
  duracao_minutos?: number;
  ativo: boolean;
  criado_em: string;
}

export const useServicosAgendamento = (empresaId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Since servicos_agendamento table doesn't exist, return empty
  const servicos: ServicoAgendamento[] = [];
  const isLoading = false;

  const criarServico = useMutation({
    mutationFn: async (_dados: any) => {
      throw new Error('Funcionalidade não disponível');
    },
    onError: () => {
      toast({ title: 'Erro ao criar serviço', variant: 'destructive' });
    },
  });

  const atualizarServico = useMutation({
    mutationFn: async (_dados: any) => {
      throw new Error('Funcionalidade não disponível');
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar serviço', variant: 'destructive' });
    },
  });

  const excluirServico = useMutation({
    mutationFn: async (_id: string) => {
      throw new Error('Funcionalidade não disponível');
    },
    onError: () => {
      toast({ title: 'Erro ao excluir serviço', variant: 'destructive' });
    },
  });

  return {
    servicos,
    isLoading,
    criarServico: criarServico.mutate,
    atualizarServico: atualizarServico.mutate,
    excluirServico: excluirServico.mutate,
    isCreating: criarServico.isPending,
    isUpdating: atualizarServico.isPending,
    isDeleting: excluirServico.isPending,
  };
};
