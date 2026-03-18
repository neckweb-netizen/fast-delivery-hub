
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEmpresas = (cidadeId?: string, categoriaId?: string) => {
  return useQuery({
    queryKey: ['empresas', cidadeId, categoriaId],
    queryFn: async () => {
      let query = supabase
        .from('empresas')
        .select(`
          *,
          categorias(nome),
          cidades(nome)
        `)
        .eq('ativo', true)
        .order('destaque', { ascending: false })
        .order('criado_em', { ascending: false });

      if (cidadeId) {
        query = query.eq('cidade_id', cidadeId);
      }
      
      if (categoriaId) {
        query = query.eq('categoria_id', categoriaId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useEmpresasDestaque = (cidadeId: string) => {
  return useQuery({
    queryKey: ['empresas-destaque', cidadeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          *,
          categorias(nome)
        `)
        .eq('ativo', true)
        .eq('destaque', true)
        .eq('cidade_id', cidadeId)
        .order('media_avaliacoes', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
    enabled: !!cidadeId,
  });
};

// Função para verificar se uma string é um UUID válido
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useEmpresaById = (id: string) => {
  return useQuery({
    queryKey: ['empresa', id],
    queryFn: async () => {
      if (!id || id === 'undefined' || id.trim() === '') {
        throw new Error('ID da empresa é obrigatório');
      }

      const isUUID = isValidUUID(id);
      let data, error;

      const selectQuery = `
        *,
        categorias(nome, icone),
        cidades(nome),
        avaliacoes(
          *
        )
      `;

      if (isUUID) {
        const result = await supabase
          .from('empresas')
          .select(selectQuery)
          .eq('id', id)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('empresas')
          .select(selectQuery)
          .eq('slug', id)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      if (!data) throw new Error('Empresa não encontrada');
      
      // Fetch user names for avaliacoes
      if (data.avaliacoes && data.avaliacoes.length > 0) {
        const userIds = [...new Set(data.avaliacoes.map((a: any) => a.usuario_id).filter(Boolean))];
        const { data: usuarios } = await supabase
          .from('usuarios')
          .select('id, nome')
          .in('id', userIds as string[]);
        const userMap = (usuarios || []).reduce((acc: any, u: any) => { acc[u.id] = u.nome; return acc; }, {});
        data.avaliacoes = data.avaliacoes.map((a: any) => ({
          ...a,
          usuario_nome: userMap[a.usuario_id] || 'Usuário'
        }));
      }
      
      return data;
    },
    enabled: !!id && id !== 'undefined' && id.trim() !== '',
  });
};
