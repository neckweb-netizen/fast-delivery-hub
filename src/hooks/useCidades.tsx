
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCidades = () => {
  return useQuery({
    queryKey: ['cidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cidades')
        .select('id, nome, estado, ativo, criado_em')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
  });
};
