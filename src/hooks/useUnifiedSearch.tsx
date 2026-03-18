import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export const useUnifiedSearch = (searchTerm: string) => {
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  return useQuery({
    queryKey: ['unified-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.trim().length < 2) {
        return { empresas: [], produtos: [], eventos: [], cupons: [], vagas: [], servicos: [], locais: [], noticias: [] };
      }

      const [empresasRes, produtosRes, eventosRes, cuponsRes, vagasRes, locaisRes, noticiasRes] = await Promise.all([
        supabase.from('empresas').select('*, categorias(nome, icone), cidades(nome)')
          .eq('ativo', true).eq('aprovada', true)
          .or(`nome.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%`)
          .order('destaque', { ascending: false }).limit(10),
        supabase.from('produtos').select('*, empresas(nome, slug)')
          .eq('ativo', true)
          .or(`nome.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%`)
          .order('destaque', { ascending: false }).limit(10),
        supabase.from('eventos').select('*, categorias(nome)')
          .eq('ativo', true)
          .or(`titulo.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%`)
          .gte('data_inicio', new Date().toISOString())
          .order('destaque', { ascending: false }).limit(10),
        supabase.from('cupons').select('*, empresas(nome, slug)')
          .eq('ativo', true)
          .or(`titulo.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%`)
          .limit(10),
        supabase.from('vagas').select('*')
          .eq('ativo', true)
          .or(`titulo.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%`)
          .limit(10),
        supabase.from('lugares_publicos').select('*')
          .eq('ativo', true)
          .or(`nome.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%`)
          .limit(10),
        supabase.from('canal_informativo').select('*')
          .eq('ativo', true)
          .or(`titulo.ilike.%${debouncedSearch}%,conteudo.ilike.%${debouncedSearch}%`)
          .limit(10),
      ]);

      return {
        empresas: empresasRes.data || [],
        produtos: produtosRes.data || [],
        eventos: eventosRes.data || [],
        cupons: cuponsRes.data || [],
        vagas: vagasRes.data || [],
        servicos: [] as any[],
        locais: locaisRes.data || [],
        noticias: noticiasRes.data || []
      };
    },
    enabled: debouncedSearch.trim().length >= 2,
  });
};
