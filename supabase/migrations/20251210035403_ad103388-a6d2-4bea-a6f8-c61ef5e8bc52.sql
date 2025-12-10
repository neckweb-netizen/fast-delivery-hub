-- Adicionar trigger para criar perfil quando usuário se registra (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Adicionar trigger para atualizar timestamp
DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON public.user_profiles;
CREATE TRIGGER update_user_profiles_timestamp
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_profile_timestamp();