-- Criar tabela de pagamentos de planos
CREATE TABLE IF NOT EXISTS public.pagamentos_planos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  plano_id UUID NOT NULL REFERENCES public.planos(id) ON DELETE RESTRICT,
  valor DECIMAL(10, 2) NOT NULL,
  data_pagamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('pix', 'boleto', 'cartao_credito', 'cartao_debito', 'transferencia', 'dinheiro')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  comprovante_url TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_empresa_id ON public.pagamentos_planos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_plano_id ON public.pagamentos_planos(plano_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data_pagamento ON public.pagamentos_planos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON public.pagamentos_planos(status);

-- Habilitar RLS
ALTER TABLE public.pagamentos_planos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pagamentos_planos
CREATE POLICY "Admins podem gerenciar pagamentos"
  ON public.pagamentos_planos
  FOR ALL
  USING (user_has_permission());

CREATE POLICY "Empresas podem ver seus próprios pagamentos"
  ON public.pagamentos_planos
  FOR SELECT
  USING (
    empresa_id IN (
      SELECT id FROM empresas 
      WHERE usuario_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pagamentos_planos_updated_at
  BEFORE UPDATE ON public.pagamentos_planos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.pagamentos_planos IS 'Registros de pagamentos de planos das empresas';
COMMENT ON COLUMN public.pagamentos_planos.forma_pagamento IS 'Forma de pagamento: pix, boleto, cartao_credito, cartao_debito, transferencia, dinheiro';
COMMENT ON COLUMN public.pagamentos_planos.status IS 'Status do pagamento: pendente, confirmado, cancelado';