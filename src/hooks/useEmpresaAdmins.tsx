import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmpresaAdmins = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const empresasQuery = useQuery({
    queryKey: ['empresas-for-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          id, nome, categoria_id, cidade_id,
          categorias(nome),
          cidades(nome)
        `)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    },
  });

  const usuariosDisponiveis = useQuery({
    queryKey: ['usuarios-disponveis-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, tipo_conta')
        .order('nome');

      if (error) throw error;
      return data;
    },
  });

  // Use empresa_admins table instead of non-existent usuario_empresa_admin
  const atribuicoesQuery = useQuery({
    queryKey: ['empresa-admin-assignments'],
    queryFn: async () => {
      const { data: admins, error } = await supabase
        .from('empresa_admins')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      // Fetch user and empresa data
      const userIds = [...new Set((admins || []).map(a => a.usuario_id).filter(Boolean))];
      const empresaIds = [...new Set((admins || []).map(a => a.empresa_id).filter(Boolean))];

      const { data: usuarios } = userIds.length > 0
        ? await supabase.from('usuarios').select('id, nome, email').in('id', userIds as string[])
        : { data: [] };

      const { data: empresas } = empresaIds.length > 0
        ? await supabase.from('empresas').select('id, nome, categorias(nome), cidades(nome)').in('id', empresaIds as string[])
        : { data: [] };

      return (admins || []).map((admin: any) => ({
        ...admin,
        tipo_atribuicao: 'manual',
        ativo: true,
        usuarios: (usuarios || []).find((u: any) => u.id === admin.usuario_id) || null,
        empresas: (empresas || []).find((e: any) => e.id === admin.empresa_id) || null,
      }));
    },
  });

  const atribuirAdminMutation = useMutation({
    mutationFn: async ({ usuarioId, empresaId }: { usuarioId: string; empresaId: string }) => {
      const { error } = await supabase
        .from('empresa_admins')
        .insert({
          usuario_id: usuarioId,
          empresa_id: empresaId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa-admin-assignments'] });
      toast({ title: 'Administrador atribuído com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const removerAtribuicaoMutation = useMutation({
    mutationFn: async (atribuicaoId: string) => {
      const { error } = await supabase
        .from('empresa_admins')
        .delete()
        .eq('id', atribuicaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa-admin-assignments'] });
      toast({ title: 'Atribuição removida com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover atribuição', variant: 'destructive' });
    },
  });

  return {
    empresas: empresasQuery.data || [],
    usuariosDisponiveis: usuariosDisponiveis.data || [],
    atribuicoes: atribuicoesQuery.data || [],
    loading: empresasQuery.isLoading || usuariosDisponiveis.isLoading || atribuicoesQuery.isLoading,
    atribuirAdmin: atribuirAdminMutation.mutate,
    removerAtribuicao: removerAtribuicaoMutation.mutate,
    refetch: () => {
      empresasQuery.refetch();
      usuariosDisponiveis.refetch();
      atribuicoesQuery.refetch();
    },
  };
};
