-- Tabela de cidades
CREATE TABLE IF NOT EXISTS public.cidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'BA',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  icone TEXT,
  cor TEXT,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de planos
CREATE TABLE IF NOT EXISTS public.planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_mensal DECIMAL(10,2) DEFAULT 0,
  preco_anual DECIMAL(10,2) DEFAULT 0,
  duracao_dias INTEGER DEFAULT 30,
  limite_produtos INTEGER DEFAULT 10,
  limite_cupons INTEGER DEFAULT 5,
  limite_eventos INTEGER DEFAULT 5,
  limite_vagas INTEGER DEFAULT 3,
  destaque BOOLEAN DEFAULT false,
  stories BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  descricao TEXT,
  categoria_id UUID REFERENCES public.categorias(id),
  cidade_id UUID REFERENCES public.cidades(id),
  endereco TEXT,
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  logo_url TEXT,
  capa_url TEXT,
  horario_funcionamento JSONB,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  plano_atual_id UUID REFERENCES public.planos(id),
  plano_data_inicio TIMESTAMP WITH TIME ZONE,
  plano_data_vencimento TIMESTAMP WITH TIME ZONE,
  aprovada BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  visualizacoes INTEGER DEFAULT 0,
  media_avaliacoes DECIMAL(3,2) DEFAULT 0,
  total_avaliacoes INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de cupons
CREATE TABLE IF NOT EXISTS public.cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  codigo TEXT,
  tipo_desconto TEXT DEFAULT 'percentual',
  valor_desconto DECIMAL(10,2),
  valor_minimo DECIMAL(10,2),
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  limite_uso INTEGER,
  usos INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  local TEXT,
  endereco TEXT,
  preco DECIMAL(10,2),
  link_ingresso TEXT,
  categoria_id UUID REFERENCES public.categorias(id),
  destaque BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2),
  preco_promocional DECIMAL(10,2),
  imagem_url TEXT,
  categoria TEXT,
  destaque BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de vagas de emprego
CREATE TABLE IF NOT EXISTS public.vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  requisitos TEXT,
  salario TEXT,
  tipo_contrato TEXT,
  local TEXT,
  remoto BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nota INTEGER CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  aprovada BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de favoritos
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(usuario_id, empresa_id)
);

-- Tabela de categorias de oportunidades
CREATE TABLE IF NOT EXISTS public.categorias_oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  tipo TEXT DEFAULT 'vaga',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_oportunidades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leitura pública
CREATE POLICY "Cidades públicas" ON public.cidades FOR SELECT USING (true);
CREATE POLICY "Categorias públicas" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Planos públicos" ON public.planos FOR SELECT USING (true);
CREATE POLICY "Empresas ativas públicas" ON public.empresas FOR SELECT USING (ativo = true);
CREATE POLICY "Cupons públicos" ON public.cupons FOR SELECT USING (ativo = true);
CREATE POLICY "Eventos públicos" ON public.eventos FOR SELECT USING (ativo = true);
CREATE POLICY "Produtos públicos" ON public.produtos FOR SELECT USING (ativo = true);
CREATE POLICY "Vagas públicas" ON public.vagas FOR SELECT USING (ativo = true);
CREATE POLICY "Avaliações aprovadas públicas" ON public.avaliacoes FOR SELECT USING (aprovada = true);
CREATE POLICY "Categorias oportunidades públicas" ON public.categorias_oportunidades FOR SELECT USING (true);

-- Políticas para favoritos
CREATE POLICY "Usuários veem seus favoritos" ON public.favoritos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuários criam seus favoritos" ON public.favoritos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuários removem seus favoritos" ON public.favoritos FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para avaliações
CREATE POLICY "Usuários criam avaliações" ON public.avaliacoes FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuários atualizam suas avaliações" ON public.avaliacoes FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas para empresas (donos)
CREATE POLICY "Donos atualizam suas empresas" ON public.empresas FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Usuários criam empresas" ON public.empresas FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Políticas para cupons (donos da empresa)
CREATE POLICY "Donos criam cupons" ON public.cupons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = cupons.empresa_id AND usuario_id = auth.uid())
);
CREATE POLICY "Donos atualizam cupons" ON public.cupons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = cupons.empresa_id AND usuario_id = auth.uid())
);
CREATE POLICY "Donos deletam cupons" ON public.cupons FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = cupons.empresa_id AND usuario_id = auth.uid())
);

-- Políticas para eventos (donos da empresa)
CREATE POLICY "Donos criam eventos" ON public.eventos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = eventos.empresa_id AND usuario_id = auth.uid())
);
CREATE POLICY "Donos atualizam eventos" ON public.eventos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = eventos.empresa_id AND usuario_id = auth.uid())
);
CREATE POLICY "Donos deletam eventos" ON public.eventos FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = eventos.empresa_id AND usuario_id = auth.uid())
);

-- Políticas para produtos (donos da empresa)
CREATE POLICY "Donos criam produtos" ON public.produtos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = produtos.empresa_id AND usuario_id = auth.uid())
);
CREATE POLICY "Donos atualizam produtos" ON public.produtos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = produtos.empresa_id AND usuario_id = auth.uid())
);
CREATE POLICY "Donos deletam produtos" ON public.produtos FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = produtos.empresa_id AND usuario_id = auth.uid())
);

-- Políticas para vagas (donos da empresa)
CREATE POLICY "Donos criam vagas" ON public.vagas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = vagas.empresa_id AND usuario_id = auth.uid())
);
CREATE POLICY "Donos atualizam vagas" ON public.vagas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = vagas.empresa_id AND usuario_id = auth.uid())
);
CREATE POLICY "Donos deletam vagas" ON public.vagas FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.empresas WHERE id = vagas.empresa_id AND usuario_id = auth.uid())
);