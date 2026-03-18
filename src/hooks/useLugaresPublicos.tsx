import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLugaresPublicos = (cidadeId?: string) => {
  return useQuery({
    queryKey: ['lugares-publicos', cidadeId],
    queryFn: async () => {
      let query = supabase
        .from('lugares_publicos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (cidadeId) {
        query = query.eq('cidade_id', cidadeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
};

export const useLugaresPublicosAdmin = () => {
  return useQuery({
    queryKey: ['lugares-publicos-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lugares_publicos')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCreateLugarPublico = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dados: any) => {
      const { data, error } = await supabase
        .from('lugares_publicos')
        .insert(dados)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares-publicos'] });
      queryClient.invalidateQueries({ queryKey: ['lugares-publicos-admin'] });
      toast.success('Lugar público criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar lugar público');
    },
  });
};

export const useUpdateLugarPublico = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...dados }: any) => {
      const { data, error } = await supabase
        .from('lugares_publicos')
        .update(dados)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares-publicos'] });
      queryClient.invalidateQueries({ queryKey: ['lugares-publicos-admin'] });
      toast.success('Lugar público atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar lugar público');
    },
  });
};

export const useDeleteLugarPublico = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lugares_publicos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares-publicos'] });
      queryClient.invalidateQueries({ queryKey: ['lugares-publicos-admin'] });
      toast.success('Lugar público excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir lugar público');
    },
  });
};
