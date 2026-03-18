import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useEnderecosEmpresa = (empresaId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enderecos, isLoading } = useQuery({
    queryKey: ['enderecos-empresa', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const { data, error } = await supabase
        .from('enderecos_empresa')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;

      const result = (data || []) as any[];

      // Buscar dados da empresa (endereço legado)
      const { data: empresa } = await supabase
        .from('empresas')
        .select('endereco, telefone')
        .eq('id', empresaId)
        .single();

      if (empresa?.endereco && !result.find((end: any) => end.principal)) {
        result.unshift({
          id: 'legado-' + empresaId,
          empresa_id: empresaId,
          nome: 'Endereço Principal',
          endereco: empresa.endereco,
          principal: true,
          criado_em: new Date().toISOString(),
          cep: null,
          cidade: null,
          estado: null,
          latitude: null,
          longitude: null,
        });
      }

      return result.sort((a: any, b: any) => {
        if (a.principal && !b.principal) return -1;
        if (!a.principal && b.principal) return 1;
        return 0;
      });
    },
    enabled: !!empresaId,
  });

  const createEnderecoMutation = useMutation({
    mutationFn: async (novoEndereco: any) => {
      const { error } = await supabase
        .from('enderecos_empresa')
        .insert(novoEndereco);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enderecos-empresa'] });
      toast({ title: 'Endereço adicionado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao adicionar endereço', variant: 'destructive' });
    },
  });

  const updateEnderecoMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: any }) => {
      const { error } = await supabase
        .from('enderecos_empresa')
        .update(dados)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enderecos-empresa'] });
      toast({ title: 'Endereço atualizado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar endereço', variant: 'destructive' });
    },
  });

  const deleteEnderecoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enderecos_empresa')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enderecos-empresa'] });
      toast({ title: 'Endereço removido com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover endereço', variant: 'destructive' });
    },
  });

  const definirPrincipalMutation = useMutation({
    mutationFn: async (enderecoId: string) => {
      await supabase
        .from('enderecos_empresa')
        .update({ principal: false })
        .eq('empresa_id', empresaId);

      const { error } = await supabase
        .from('enderecos_empresa')
        .update({ principal: true })
        .eq('id', enderecoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enderecos-empresa'] });
      toast({ title: 'Endereço principal definido!' });
    },
    onError: () => {
      toast({ title: 'Erro ao definir endereço principal', variant: 'destructive' });
    },
  });

  return {
    enderecos: enderecos || [],
    isLoading,
    createEndereco: createEnderecoMutation.mutate,
    updateEndereco: updateEnderecoMutation.mutate,
    deleteEndereco: deleteEnderecoMutation.mutate,
    definirPrincipal: definirPrincipalMutation.mutate,
    isCreating: createEnderecoMutation.isPending,
    isUpdating: updateEnderecoMutation.isPending,
    isDeleting: deleteEnderecoMutation.isPending,
  };
};
