import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProblemaCidade {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string | null;
  endereco: string;
  usuario_id: string;
  status: string;
  imagem_url: string | null;
  votos: number;
  resolvido: boolean;
  latitude: number | null;
  longitude: number | null;
  criado_em: string;
  usuario?: { nome: string };
  total_comentarios?: number;
}

export const useProblemasCidade = (cidadeId?: string, filters?: {
  categoriaId?: string;
  status?: string;
  ordenacao?: 'recentes' | 'populares' | 'resolvidos';
}) => {
  const queryClient = useQueryClient();

  const { data: problemas, isLoading } = useQuery({
    queryKey: ['problemas-cidade', cidadeId, filters],
    queryFn: async () => {
      let query = supabase
        .from('problemas_cidade')
        .select('*')
        .order('criado_em', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.ordenacao === 'populares') {
        query = query.order('votos', { ascending: false });
      } else if (filters?.ordenacao === 'resolvidos') {
        query = query.eq('resolvido', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const criarProblema = useMutation({
    mutationFn: async (novoProblema: {
      titulo: string;
      descricao: string;
      categoria?: string;
      endereco?: string;
      imagem_url?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('problemas_cidade')
        .insert([{ ...novoProblema, usuario_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problemas-cidade'] });
      toast.success('Reclamação enviada!');
    },
    onError: () => {
      toast.error('Erro ao publicar reclamação');
    },
  });

  const votarProblema = useMutation({
    mutationFn: async ({ problemaId }: { problemaId: string; tipoVoto: 1 | -1 }) => {
      // Simple increment votos
      const { data: problema } = await supabase
        .from('problemas_cidade')
        .select('votos')
        .eq('id', problemaId)
        .single();
      
      const { error } = await supabase
        .from('problemas_cidade')
        .update({ votos: (problema?.votos || 0) + 1 })
        .eq('id', problemaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problemas-cidade'] });
      queryClient.invalidateQueries({ queryKey: ['problema-detalhes'] });
    },
  });

  const incrementarVisualizacao = useMutation({
    mutationFn: async (_problemaId: string) => {
      // No-op since RPC doesn't exist
    },
  });

  const atualizarProblema = useMutation({
    mutationFn: async ({
      problemaId,
      dados
    }: {
      problemaId: string;
      dados: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('problemas_cidade')
        .update(dados)
        .eq('id', problemaId)
        .eq('usuario_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problemas-cidade'] });
      toast.success('Reclamação atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar reclamação');
    },
  });

  const excluirProblema = useMutation({
    mutationFn: async (problemaId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('problemas_cidade')
        .delete()
        .eq('id', problemaId)
        .eq('usuario_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problemas-cidade'] });
      toast.success('Reclamação excluída!');
    },
    onError: () => {
      toast.error('Erro ao excluir reclamação');
    },
  });

  return {
    problemas,
    isLoading,
    criarProblema,
    votarProblema,
    incrementarVisualizacao,
    atualizarProblema,
    excluirProblema,
  };
};

export const useProblemaDetalhes = (problemaId: string) => {
  const queryClient = useQueryClient();

  const { data: problema, isLoading } = useQuery({
    queryKey: ['problema-detalhes', problemaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('problemas_cidade')
        .select('*')
        .eq('id', problemaId)
        .single();

      if (error) throw error;

      // Fetch user name
      if (data?.usuario_id) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('nome')
          .eq('id', data.usuario_id)
          .maybeSingle();
        return { ...data, usuario } as any;
      }
      return data as any;
    },
    enabled: !!problemaId,
  });

  const { data: comentarios } = useQuery({
    queryKey: ['comentarios-problema', problemaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comentarios_problema')
        .select('*')
        .eq('problema_id', problemaId)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      const comentariosComUsuarios = await Promise.all(
        (data || []).map(async (comentario) => {
          const { data: usuario } = await supabase
            .from('usuarios')
            .select('nome')
            .eq('id', comentario.usuario_id)
            .maybeSingle();

          return { ...comentario, usuario };
        })
      );

      return comentariosComUsuarios;
    },
    enabled: !!problemaId,
  });

  const criarComentario = useMutation({
    mutationFn: async (novoComentario: {
      conteudo?: string;
      comentario?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('comentarios_problema')
        .insert([{
          problema_id: problemaId,
          usuario_id: user.id,
          comentario: novoComentario.comentario || novoComentario.conteudo || '',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios-problema', problemaId] });
      toast.success('Comentário publicado!');
    },
    onError: () => {
      toast.error('Erro ao publicar comentário');
    },
  });

  const votarComentario = useMutation({
    mutationFn: async ({ comentarioId: _id, tipoVoto: _voto }: { comentarioId: string; tipoVoto: 1 | -1 }) => {
      // No-op: votos_comentario table doesn't exist
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios-problema', problemaId] });
    },
  });

  return {
    problema,
    comentarios,
    isLoading,
    criarComentario,
    votarComentario,
  };
};

export const useCategoriasProblema = () => {
  // Return hardcoded categories since categorias_problema table doesn't exist
  const categorias = [
    { id: '1', nome: 'Infraestrutura', icone: 'construction', cor: '#f59e0b' },
    { id: '2', nome: 'Iluminação', icone: 'lightbulb', cor: '#eab308' },
    { id: '3', nome: 'Saneamento', icone: 'droplets', cor: '#3b82f6' },
    { id: '4', nome: 'Segurança', icone: 'shield', cor: '#ef4444' },
    { id: '5', nome: 'Trânsito', icone: 'car', cor: '#8b5cf6' },
    { id: '6', nome: 'Outros', icone: 'more-horizontal', cor: '#6b7280' },
  ];

  return { categorias, isLoading: false };
};
