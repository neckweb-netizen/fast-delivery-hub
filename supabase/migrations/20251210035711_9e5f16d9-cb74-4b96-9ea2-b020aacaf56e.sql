-- Adicionar campo tipo na tabela categorias
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'empresa';

-- Adicionar campos adicionais na tabela planos
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS produtos_destaque_permitidos INTEGER DEFAULT 0;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS prioridade_destaque INTEGER DEFAULT 0;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_eventos BOOLEAN DEFAULT false;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS suporte_prioritario BOOLEAN DEFAULT false;

-- Criar tabela de usuários (para compatibilidade com o código existente)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  tipo_conta TEXT DEFAULT 'usuario',
  avatar_url TEXT,
  cidade_id UUID REFERENCES public.cidades(id),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem todos" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "Usuários atualizam próprio" ON public.usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários criam próprio" ON public.usuarios FOR INSERT WITH CHECK (auth.uid() = id);

-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins veem logs" ON public.audit_logs FOR SELECT USING (true);

-- Criar tabela de security logs
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Security logs públicos para leitura" ON public.security_logs FOR SELECT USING (true);
CREATE POLICY "Security logs inserção" ON public.security_logs FOR INSERT WITH CHECK (true);

-- Criar tabela de avisos do sistema
CREATE TABLE IF NOT EXISTS public.avisos_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT DEFAULT 'info',
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.avisos_sistema ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Avisos públicos" ON public.avisos_sistema FOR SELECT USING (ativo = true);

-- Criar tabela de banners
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  link TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Banners públicos" ON public.banners FOR SELECT USING (ativo = true);

-- Criar tabela de canal informativo
CREATE TABLE IF NOT EXISTS public.canal_informativo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT,
  imagem_url TEXT,
  categoria TEXT,
  autor_id UUID REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.canal_informativo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Canal informativo público" ON public.canal_informativo FOR SELECT USING (ativo = true);

-- Criar tabela de enquetes
CREATE TABLE IF NOT EXISTS public.enquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta TEXT NOT NULL,
  opcoes JSONB,
  votos JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  data_fim TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.enquetes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enquetes públicas" ON public.enquetes FOR SELECT USING (ativo = true);

-- Criar tabela de problemas da cidade
CREATE TABLE IF NOT EXISTS public.problemas_cidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  imagem_url TEXT,
  endereco TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status TEXT DEFAULT 'pendente',
  resolvido BOOLEAN DEFAULT false,
  votos INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.problemas_cidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problemas públicos" ON public.problemas_cidade FOR SELECT USING (true);
CREATE POLICY "Usuários criam problemas" ON public.problemas_cidade FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuários atualizam seus problemas" ON public.problemas_cidade FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Usuários deletam seus problemas" ON public.problemas_cidade FOR DELETE USING (auth.uid() = usuario_id);

-- Criar tabela de comentários de problemas
CREATE TABLE IF NOT EXISTS public.comentarios_problema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problema_id UUID REFERENCES public.problemas_cidade(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.comentarios_problema ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comentários públicos" ON public.comentarios_problema FOR SELECT USING (true);
CREATE POLICY "Usuários criam comentários" ON public.comentarios_problema FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Criar tabela de stories
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'imagem',
  media_url TEXT,
  titulo TEXT,
  link TEXT,
  visualizacoes INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  expira_em TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stories públicos" ON public.stories FOR SELECT USING (ativo = true);
CREATE POLICY "Empresas criam stories" ON public.stories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = stories.empresa_id AND usuario_id = auth.uid())
);

-- Criar tabela de lugares públicos
CREATE TABLE IF NOT EXISTS public.lugares_publicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  endereco TEXT,
  imagem_url TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  cidade_id UUID REFERENCES public.cidades(id),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.lugares_publicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lugares públicos visíveis" ON public.lugares_publicos FOR SELECT USING (ativo = true);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT DEFAULT 'info',
  lida BOOLEAN DEFAULT false,
  link TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem suas notificações" ON public.notificacoes FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Sistema cria notificações" ON public.notificacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuários atualizam suas notificações" ON public.notificacoes FOR UPDATE USING (auth.uid() = usuario_id);

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  servico_id UUID,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem seus agendamentos" ON public.agendamentos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Empresas veem seus agendamentos" ON public.agendamentos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = agendamentos.empresa_id AND usuario_id = auth.uid())
);
CREATE POLICY "Usuários criam agendamentos" ON public.agendamentos FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  plano_id UUID REFERENCES public.planos(id),
  valor DECIMAL(10,2),
  metodo TEXT,
  status TEXT DEFAULT 'pendente',
  referencia_externa TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empresas veem seus pagamentos" ON public.pagamentos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = pagamentos.empresa_id AND usuario_id = auth.uid())
);

-- Criar tabela de admins de empresa
CREATE TABLE IF NOT EXISTS public.empresa_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(empresa_id, usuario_id)
);

ALTER TABLE public.empresa_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins veem suas empresas" ON public.empresa_admins FOR SELECT USING (auth.uid() = usuario_id);

-- Criar tabela de endereços de empresa
CREATE TABLE IF NOT EXISTS public.enderecos_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT,
  endereco TEXT NOT NULL,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  principal BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.enderecos_empresa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Endereços públicos" ON public.enderecos_empresa FOR SELECT USING (true);
CREATE POLICY "Donos gerenciam endereços" ON public.enderecos_empresa FOR ALL USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = enderecos_empresa.empresa_id AND usuario_id = auth.uid())
);

-- Criar tabela de URLs curtas
CREATE TABLE IF NOT EXISTS public.short_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  url_destino TEXT NOT NULL,
  cliques INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.short_urls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "URLs curtas públicas" ON public.short_urls FOR SELECT USING (true);
CREATE POLICY "URLs curtas inserção" ON public.short_urls FOR INSERT WITH CHECK (true);
CREATE POLICY "URLs curtas atualização" ON public.short_urls FOR UPDATE USING (true);

-- Criar tabela de configurações do menu
CREATE TABLE IF NOT EXISTS public.menu_configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  config JSONB,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.menu_configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Menu público" ON public.menu_configuracoes FOR SELECT USING (true);

-- Criar tabela de ordem das seções home
CREATE TABLE IF NOT EXISTS public.home_sections_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  config JSONB,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.home_sections_order ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seções home públicas" ON public.home_sections_order FOR SELECT USING (true);