import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Banner {
  id: string;
  titulo: string;
  imagem_url: string;
  link_url?: string;
  ativo: boolean;
  ordem: number;
  criado_em: string;
  descricao?: string;
  link?: string;
  secao?: string;
}

export const useAdminBanners = (secao?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bannersQuery = useQuery({
    queryKey: ['admin-banners', secao],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const createBanner = useMutation({
    mutationFn: async (banner: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('banners')
        .insert([{
          titulo: banner.titulo,
          imagem_url: banner.imagem_url,
          link: banner.link_url || banner.link || null,
          ativo: banner.ativo ?? true,
          ordem: banner.ordem || 0,
          descricao: banner.descricao || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast({ title: 'Banner criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const duplicateBanner = useMutation({
    mutationFn: async ({ id, newSecao }: { id: string; newSecao: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { data: original, error: fetchError } = await supabase
        .from('banners')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('banners')
        .insert([{
          titulo: `${original.titulo} (Cópia)`,
          imagem_url: original.imagem_url,
          link: original.link,
          ativo: original.ativo,
          ordem: original.ordem,
          descricao: original.descricao,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast({ title: 'Banner duplicado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({ id, ...banner }: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const updateData: any = {};
      if (banner.titulo) updateData.titulo = banner.titulo;
      if (banner.imagem_url) updateData.imagem_url = banner.imagem_url;
      if (banner.link_url !== undefined) updateData.link = banner.link_url || null;
      if (banner.link !== undefined) updateData.link = banner.link || null;
      if (banner.ativo !== undefined) updateData.ativo = banner.ativo;
      if (banner.ordem !== undefined) updateData.ordem = banner.ordem;
      if (banner.descricao !== undefined) updateData.descricao = banner.descricao;

      const { data, error } = await supabase
        .from('banners')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast({ title: 'Banner atualizado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast({ title: 'Banner removido com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  return {
    banners: bannersQuery.data || [],
    isLoading: bannersQuery.isLoading,
    error: bannersQuery.error,
    createBanner,
    updateBanner,
    deleteBanner,
    duplicateBanner,
  };
};
