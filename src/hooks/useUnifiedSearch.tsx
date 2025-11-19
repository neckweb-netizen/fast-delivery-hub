import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

// Função para normalizar texto
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const useUnifiedSearch = (searchTerm: string) => {
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  return useQuery({
    queryKey: ['unified-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.trim().length < 2) {
        return {
          empresas: [],
          produtos: [],
          eventos: [],
          cupons: [],
          vagas: [],
          servicos: [],
          locais: [],
          noticias: []
        };
      }

      const normalizedSearch = normalizeText(debouncedSearch);

      // Buscar empresas
      const { data: empresas = [] } = await supabase
        .from('empresas')
        .select(`
          *,
          categorias(nome, icone_url),
          cidades(nome),
          estatisticas(*)
        `)
        .eq('ativo', true)
        .eq('status_aprovacao', 'aprovado')
        .or(`nome.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%`)
        .order('destaque', { ascending: false })
        .limit(10);

      // Buscar produtos
      const { data: produtos = [] } = await supabase
        .from('produtos')
        .select(`
          *,
          empresas(nome, slug, verificado, cidade_id)
        `)
        .eq('ativo', true)
        .or(`nome.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%,categoria_produto.ilike.%${debouncedSearch}%`)
        .order('destaque', { ascending: false })
        .limit(10);

      // Buscar eventos
      const { data: eventos = [] } = await supabase
        .from('eventos')
        .select(`
          *,
          categorias(nome),
          cidades(nome)
        `)
        .eq('ativo', true)
        .eq('status_aprovacao', 'aprovado')
        .or(`titulo.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%,local.ilike.%${debouncedSearch}%`)
        .gte('data_inicio', new Date().toISOString())
        .order('destaque', { ascending: false })
        .order('data_inicio', { ascending: true })
        .limit(10);

      // Buscar cupons
      const { data: cupons = [] } = await supabase
        .from('cupons')
        .select(`
          *,
          empresas(nome, slug, verificado)
        `)
        .eq('ativo', true)
        .gt('data_fim', new Date().toISOString())
        .or(`titulo.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%`)
        .order('criado_em', { ascending: false })
        .limit(10);

      // Vagas são tratadas como cupons especiais (removido por enquanto)
      const vagas: any[] = [];

      // Buscar serviços autônomos
      const { data: servicos = [] } = await supabase
        .from('servicos_autonomos')
        .select(`
          *,
          categorias_oportunidades(nome),
          cidades(nome)
        `)
        .eq('status_aprovacao', 'aprovado')
        .or(`nome_prestador.ilike.%${debouncedSearch}%,descricao_servico.ilike.%${debouncedSearch}%`)
        .order('criado_em', { ascending: false })
        .limit(10);

      // Buscar lugares públicos
      const { data: locais = [] } = await supabase
        .from('lugares_publicos')
        .select(`
          *,
          cidades(nome)
        `)
        .eq('ativo', true)
        .or(`nome.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%,tipo.ilike.%${debouncedSearch}%`)
        .order('destaque', { ascending: false })
        .limit(10);

      // Buscar notícias (canal informativo)
      const { data: noticias = [] } = await supabase
        .from('canal_informativo')
        .select('*')
        .eq('ativo', true)
        .or(`titulo.ilike.%${debouncedSearch}%,conteudo.ilike.%${debouncedSearch}%`)
        .order('criado_em', { ascending: false })
        .limit(10);

      return {
        empresas: empresas || [],
        produtos: produtos || [],
        eventos: eventos || [],
        cupons: cupons || [],
        vagas: vagas || [],
        servicos: servicos || [],
        locais: locais || [],
        noticias: noticias || []
      };
    },
    enabled: debouncedSearch.trim().length >= 2,
  });
};
