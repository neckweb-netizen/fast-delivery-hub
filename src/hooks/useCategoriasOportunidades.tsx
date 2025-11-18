import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCategoriasOportunidades = (tipo?: 'vaga' | 'servico') => {
  return useQuery({
    queryKey: ['categorias-oportunidades', tipo],
    queryFn: async () => {
      let query = supabase
        .from('categorias_oportunidades')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};
