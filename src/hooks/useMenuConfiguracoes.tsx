import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MenuConfiguracao {
  id: string;
  nome: string;
  config: any;
  ativo: boolean;
  criado_em: string;
}

export const useMenuConfiguracoes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configuracoes, isLoading } = useQuery({
    queryKey: ['menu-configuracoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_configuracoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return (data || []) as MenuConfiguracao[];
    },
  });

  const updateConfiguracao = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MenuConfiguracao> }) => {
      const { data, error } = await supabase
        .from('menu_configuracoes')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-configuracoes'] });
      toast({ title: 'Configuração atualizada' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar configuração', variant: 'destructive' });
    },
  });

  const createConfiguracao = useMutation({
    mutationFn: async (newConfig: any) => {
      const { data, error } = await supabase
        .from('menu_configuracoes')
        .insert([newConfig])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-configuracoes'] });
      toast({ title: 'Item criado com sucesso' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar item', variant: 'destructive' });
    },
  });

  return {
    configuracoes: configuracoes || [],
    isLoading,
    updateConfiguracao: updateConfiguracao.mutate,
    createConfiguracao: createConfiguracao.mutate,
    isUpdating: updateConfiguracao.isPending,
    isCreating: createConfiguracao.isPending,
  };
};
