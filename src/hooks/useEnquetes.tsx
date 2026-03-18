import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEnquetes = () => {
  const queryClient = useQueryClient();

  // Buscar enquete ativa para exibir na home
  const { data: enqueteAtiva, isLoading } = useQuery({
    queryKey: ['enquete-ativa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enquetes')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        titulo: data.pergunta,
        opcoes: (data.opcoes as any) || [],
        votos: (data.votos as any) || {},
        ativo: data.ativo,
        data_fim: data.data_fim,
      } as any;
    }
  });

  // Buscar todas as enquetes (admin)
  const { data: enquetes, isLoading: isLoadingAll } = useQuery({
    queryKey: ['enquetes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enquetes')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    }
  });

  // Votar na enquete
  const votarEnquete = useMutation({
    mutationFn: async ({ 
      enqueteId, 
      opcoes 
    }: { 
      enqueteId: string; 
      opcoes: number[]; 
    }) => {
      // Simple vote: update votos JSON
      const { data: enquete, error: fetchError } = await supabase
        .from('enquetes')
        .select('votos')
        .eq('id', enqueteId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const votos = (enquete?.votos as any) || {};
      for (const idx of opcoes) {
        votos[idx] = (votos[idx] || 0) + 1;
      }
      
      const { error } = await supabase
        .from('enquetes')
        .update({ votos })
        .eq('id', enqueteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquete-ativa'] });
      toast.success('Voto registrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao votar na enquete');
    }
  });

  // Criar enquete (admin)
  const criarEnquete = useMutation({
    mutationFn: async (enquete: { pergunta: string; opcoes: any; ativo?: boolean; data_fim?: string }) => {
      const { data, error } = await supabase
        .from('enquetes')
        .insert({
          pergunta: enquete.pergunta,
          opcoes: enquete.opcoes,
          ativo: enquete.ativo ?? true,
          data_fim: enquete.data_fim || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquetes'] });
      queryClient.invalidateQueries({ queryKey: ['enquete-ativa'] });
      toast.success('Enquete criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar enquete: ' + error.message);
    }
  });

  // Atualizar enquete (admin)
  const atualizarEnquete = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('enquetes')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquetes'] });
      queryClient.invalidateQueries({ queryKey: ['enquete-ativa'] });
      toast.success('Enquete atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar enquete: ' + error.message);
    }
  });

  // Excluir enquete (admin)
  const excluirEnquete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enquetes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquetes'] });
      queryClient.invalidateQueries({ queryKey: ['enquete-ativa'] });
      toast.success('Enquete excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir enquete: ' + error.message);
    }
  });

  return {
    enqueteAtiva,
    enquetes,
    isLoading,
    isLoadingAll,
    votarEnquete,
    criarEnquete,
    atualizarEnquete,
    excluirEnquete
  };
};
