import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem?: string;
  lida: boolean;
  criado_em: string;
  tipo?: string;
  link?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        return [];
      }

      return (data || []).map(n => ({
        id: n.id,
        usuario_id: n.usuario_id,
        titulo: n.titulo,
        mensagem: n.mensagem,
        lida: n.lida,
        criado_em: n.criado_em,
        tipo: n.tipo,
        link: n.link,
      })) as Notification[];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `usuario_id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          const n = payload.new as any;
          toast.info(n.titulo, {
            description: n.mensagem,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId)
        .eq('usuario_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('usuario_id', user.id)
        .eq('lida', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast.success('Todas as notificações foram marcadas como lidas');
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data: {
      usuario_id: string;
      titulo: string;
      mensagem?: string;
    }) => {
      const { error } = await supabase
        .from('notificacoes')
        .insert(data as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notificationsQuery.data || [];
  const unreadNotifications = notifications.filter(n => !n.lida);

  return {
    notifications,
    unreadNotifications,
    totalUnread: unreadNotifications.length,
    loading: notificationsQuery.isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    createNotification: createNotificationMutation.mutate,
    refetch: notificationsQuery.refetch,
  };
};
