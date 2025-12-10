import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

type UserProfile = Tables<'user_profiles'>;

export interface UpdateProfileData {
  nome?: string;
  telefone?: string;
  avatar_url?: string;
  bio?: string;
  data_nascimento?: string;
  genero?: string;
  profissao?: string;
  cidade_id?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
  interesses?: string[];
  perfil_publico?: boolean;
  mostrar_email?: boolean;
  mostrar_telefone?: boolean;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar perfil do usuário logado
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          atualizado_em: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({ title: 'Perfil atualizado com sucesso!' });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  // Upload de avatar
  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      toast({
        title: 'Erro ao fazer upload',
        description: 'Não foi possível enviar a imagem.',
        variant: 'destructive'
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  }, [user, toast]);

  // Buscar perfil público de outro usuário
  const getPublicProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .rpc('get_public_user_profile', { user_id_param: userId });

    if (error) {
      console.error('Error fetching public profile:', error);
      return null;
    }

    return data?.[0] || null;
  }, []);

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    uploadAvatar,
    getPublicProfile
  };
};
