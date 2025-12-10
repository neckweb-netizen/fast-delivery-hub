
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { supabaseCache } from '@/lib/supabaseCache';

// Tipo do perfil do usuário
interface UserProfile {
  id: string;
  user_id?: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  bio?: string;
  tipo_conta?: string;
  cidade_id?: string;
  criado_em?: string;
  atualizado_em?: string;
}

type TipoConta = 'usuario' | 'empresa' | 'admin_cidade' | 'admin_geral';

interface AdditionalSignUpData {
  telefone?: string;
  nomeEmpresa?: string;
  endereco?: string;
  descricao?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const createUserProfile = useCallback(async (userId: string, authUser: User, tipoConta: TipoConta = 'usuario', additionalData?: AdditionalSignUpData) => {
    try {
      console.log('👤 Creating user profile for:', userId, 'Type:', tipoConta);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          nome: authUser.user_metadata?.nome || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          telefone: additionalData?.telefone || authUser.user_metadata?.telefone
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        return null;
      }

      console.log('✅ Profile created successfully:', data.nome);
      
      return {
        ...data,
        tipo_conta: (authUser.user_metadata?.tipo_conta as TipoConta) || tipoConta
      } as UserProfile;
    } catch (error) {
      console.error('💥 Error creating user profile:', error);
      return null;
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string, authUser: User): Promise<UserProfile | null> => {
    try {
      const cacheKey = `user-profile-${userId}`;
      const cachedProfile = supabaseCache.get<UserProfile>(cacheKey);
      
      if (cachedProfile) {
        console.log('✅ Profile found in cache:', cachedProfile.nome);
        return cachedProfile;
      }

      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return null;
      }

      if (data) {
        console.log('✅ Profile found:', data.nome);
        const profileWithTipo = {
          ...data,
          tipo_conta: (authUser.user_metadata?.tipo_conta as TipoConta) || 'usuario'
        } as UserProfile;
        supabaseCache.set(cacheKey, profileWithTipo, 1800);
        return profileWithTipo;
      } else {
        console.log('⚠️ No profile found, creating default...');
        const newProfile = await createUserProfile(userId, authUser);
        if (newProfile) {
          supabaseCache.set(cacheKey, newProfile, 1800);
        }
        return newProfile;
      }
    } catch (error) {
      console.error('💥 Error in fetchProfile:', error);
      return null;
    }
  }, [createUserProfile]);

  const redirectAfterLogin = useCallback((userProfile: UserProfile, isExplicitLogin = false) => {
    if (!isExplicitLogin) return;
    
    if (userProfile.tipo_conta === 'empresa') {
      setTimeout(() => { window.location.href = '/empresa-dashboard'; }, 100);
    } else if (userProfile.tipo_conta === 'admin_geral' || userProfile.tipo_conta === 'admin_cidade') {
      setTimeout(() => { window.location.href = '/admin'; }, 100);
    }
  }, []);

  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let mounted = true;
    let isInitializing = false;

    const initializeAuth = async () => {
      if (initialized || isInitializing) return;
      isInitializing = true;

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (mounted) { setLoading(false); setInitialized(true); }
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            const userProfile = await fetchProfile(session.user.id, session.user);
            if (mounted) setProfile(userProfile);
          }
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        if (mounted) { setLoading(false); setInitialized(true); }
      }
    };

    if (!initialized) initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === 'INITIAL_SESSION' && initialized) return;

        setUser(session?.user ?? null);
        
        if (session?.user) {
          if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
          fetchTimeoutRef.current = setTimeout(async () => {
            if (mounted) {
              const userProfile = await fetchProfile(session.user.id, session.user);
              if (mounted) { setProfile(userProfile); setLoading(false); }
            }
          }, 50);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      subscription.unsubscribe();
    };
  }, [initialized, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setLoading(false); return { error }; }
      
      if (data.user) {
        const userProfile = await fetchProfile(data.user.id, data.user);
        if (userProfile) redirectAfterLogin(userProfile, true);
      }
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, nome: string, tipoConta: TipoConta = 'usuario', additionalData?: AdditionalSignUpData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { nome, tipo_conta: tipoConta, ...additionalData },
          emailRedirectTo: `${window.location.origin}/`
        },
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) { setProfile(null); window.location.href = '/'; }
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return { user, profile, loading, signIn, signUp, signOut };
};
