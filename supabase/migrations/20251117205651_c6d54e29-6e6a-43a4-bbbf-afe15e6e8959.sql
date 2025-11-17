-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('usuario', 'criador_empresa', 'empresa', 'admin_cidade', 'admin_geral');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to get user's primary role (for backward compatibility)
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'admin_geral' THEN 1
    WHEN 'admin_cidade' THEN 2
    WHEN 'empresa' THEN 3
    WHEN 'criador_empresa' THEN 4
    WHEN 'usuario' THEN 5
  END
  LIMIT 1;
$$;

-- Create function to check if user is any type of admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin_geral', 'admin_cidade')
  );
$$;

-- Migrate existing data from usuarios.tipo_conta to user_roles (cast via text)
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT id, tipo_conta::text::app_role, criado_em
FROM public.usuarios
ON CONFLICT (user_id, role) DO NOTHING;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin geral can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_geral'))
WITH CHECK (public.has_role(auth.uid(), 'admin_geral'));

CREATE POLICY "Admin cidade can manage non-admin roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin_cidade') 
  AND role NOT IN ('admin_geral', 'admin_cidade')
);

CREATE POLICY "Admin cidade can update non-admin roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin_cidade')
  AND role NOT IN ('admin_geral', 'admin_cidade')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin_cidade')
  AND role NOT IN ('admin_geral', 'admin_cidade')
);

-- Create trigger to sync user_roles back to usuarios.tipo_conta (for backward compatibility)
CREATE OR REPLACE FUNCTION public.sync_user_role_to_usuarios()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.usuarios
    SET tipo_conta = public.get_user_primary_role(NEW.user_id)::text::tipo_conta
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.usuarios
    SET tipo_conta = COALESCE(public.get_user_primary_role(OLD.user_id)::text::tipo_conta, 'usuario'::tipo_conta)
    WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER sync_user_role_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role_to_usuarios();

-- Update key RLS policies to use has_role() function

-- Update usuarios table policies
DROP POLICY IF EXISTS "Admins podem gerenciar usuários" ON public.usuarios;
CREATE POLICY "Admins podem gerenciar usuários"
ON public.usuarios FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update audit_logs policies
DROP POLICY IF EXISTS "Apenas admins podem acessar logs de auditoria" ON public.audit_logs;
CREATE POLICY "Apenas admins podem acessar logs de auditoria"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Apenas sistema pode inserir logs de auditoria" ON public.audit_logs;
CREATE POLICY "Apenas sistema pode inserir logs de auditoria"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Update avisos_sistema policies
DROP POLICY IF EXISTS "Admins podem gerenciar avisos" ON public.avisos_sistema;
CREATE POLICY "Admins podem gerenciar avisos"
ON public.avisos_sistema FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update canal_informativo policies
DROP POLICY IF EXISTS "Admins podem gerenciar canal informativo" ON public.canal_informativo;
CREATE POLICY "Admins podem gerenciar canal informativo"
ON public.canal_informativo FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update empresas admin policies
DROP POLICY IF EXISTS "Admin geral pode gerenciar todas as empresas" ON public.empresas;
CREATE POLICY "Admin geral pode gerenciar todas as empresas"
ON public.empresas FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_geral'))
WITH CHECK (public.has_role(auth.uid(), 'admin_geral'));

DROP POLICY IF EXISTS "Admin cidade pode gerenciar empresas de sua cidade" ON public.empresas;
CREATE POLICY "Admin cidade pode gerenciar empresas de sua cidade"
ON public.empresas FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin_cidade')
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND cidade_id = empresas.cidade_id
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin_cidade')
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND cidade_id = empresas.cidade_id
  )
);

-- Update agendamentos admin policy
DROP POLICY IF EXISTS "Admins podem gerenciar agendamentos" ON public.agendamentos;
CREATE POLICY "Admins podem gerenciar agendamentos"
ON public.agendamentos FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update comentarios_problema admin policy
DROP POLICY IF EXISTS "Admins podem moderar comentários" ON public.comentarios_problema;
CREATE POLICY "Admins podem moderar comentários"
ON public.comentarios_problema FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update problemas_cidade admin policy
DROP POLICY IF EXISTS "Admins podem moderar problemas" ON public.problemas_cidade;
CREATE POLICY "Admins podem moderar problemas"
ON public.problemas_cidade FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update enquetes admin policy
DROP POLICY IF EXISTS "Admins podem gerenciar enquetes" ON public.enquetes;
CREATE POLICY "Admins podem gerenciar enquetes"
ON public.enquetes FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update home_sections_order admin policy
DROP POLICY IF EXISTS "Admins podem gerenciar ordem das seções" ON public.home_sections_order;
CREATE POLICY "Admins podem gerenciar ordem das seções"
ON public.home_sections_order FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update categorias_problema admin policy
DROP POLICY IF EXISTS "Admins podem gerenciar categorias" ON public.categorias_problema;
CREATE POLICY "Admins podem gerenciar categorias"
ON public.categorias_problema FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update rate_limits admin policy
DROP POLICY IF EXISTS "Admins podem visualizar rate limits" ON public.rate_limits;
CREATE POLICY "Admins podem visualizar rate limits"
ON public.rate_limits FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update notificacoes admin policy
DROP POLICY IF EXISTS "Admins podem criar notificações" ON public.notificacoes;
CREATE POLICY "Admins podem criar notificações"
ON public.notificacoes FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));