import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Edge function para processar pagamentos PIX via Mercado Pago
// Inclui validações de segurança robustas

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== VALIDAÇÕES DE SEGURANÇA ==========

// Validar formato de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Validar CPF
function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;
  
  return true;
}

// Validar CNPJ
function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  let size = cleaned.length - 2;
  let numbers = cleaned.substring(0, size);
  const digits = cleaned.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cleaned.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

// Validar documento (CPF ou CNPJ)
function isValidDocument(docType: string, docNumber: string): boolean {
  const cleaned = docNumber.replace(/\D/g, '');
  
  if (docType.toUpperCase() === 'CPF') {
    return isValidCPF(cleaned);
  } else if (docType.toUpperCase() === 'CNPJ') {
    return isValidCNPJ(cleaned);
  }
  
  return cleaned.length >= 5 && cleaned.length <= 20;
}

// Validar nome
function isValidName(name: string): boolean {
  if (!name || name.length < 2 || name.length > 100) return false;
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
  return nameRegex.test(name);
}

// Validar valor da transação
function isValidTransactionAmount(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && amount <= 100000;
}

// Sanitizar string para prevenir injection
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .substring(0, 500);
}

// Rate limiting simples por IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

// Limpar registros antigos
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000);

// ========== HANDLER PRINCIPAL ==========

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verificar rate limit
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  
  if (!checkRateLimit(clientIP)) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: 'Muitas tentativas. Aguarde um momento antes de tentar novamente.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { planoId, userInfo } = body;

    // ========== VALIDAÇÕES DE ENTRADA ==========

    // Validar planoId
    if (!planoId || typeof planoId !== 'string') {
      console.error('Invalid planoId:', planoId);
      return new Response(
        JSON.stringify({ error: 'ID do plano inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar userInfo
    if (!userInfo || typeof userInfo !== 'object') {
      console.error('Invalid userInfo');
      return new Response(
        JSON.stringify({ error: 'Informações do usuário inválidas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitizar e validar dados do usuário
    const userName = sanitizeString(String(userInfo.nome || ''));
    const userEmail = sanitizeString(String(userInfo.email || ''));
    const docType = sanitizeString(String(userInfo.tipoDocumento || 'CPF')).toUpperCase();
    const docNumber = String(userInfo.documento || userInfo.cpf || '').replace(/\D/g, '');

    // Validar nome
    if (!isValidName(userName)) {
      console.error('Invalid name:', userName);
      return new Response(
        JSON.stringify({ error: 'Nome inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar email
    if (!isValidEmail(userEmail)) {
      console.error('Invalid email:', userEmail);
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar documento
    if (!isValidDocument(docType, docNumber)) {
      console.error('Invalid document:', docType, docNumber);
      return new Response(
        JSON.stringify({ error: `${docType} inválido` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Security validations passed for PIX payment');

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do plano
    const { data: plano, error: planoError } = await supabase
      .from('planos')
      .select('*')
      .eq('id', planoId)
      .single();

    if (planoError || !plano) {
      console.error('Erro ao buscar plano:', planoError);
      return new Response(
        JSON.stringify({ error: 'Plano não encontrado' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar valor do plano
    if (!isValidTransactionAmount(Number(plano.preco_mensal))) {
      console.error('Invalid plan price:', plano.preco_mensal);
      return new Response(
        JSON.stringify({ error: 'Valor do plano inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar token do Mercado Pago
    const token = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!token) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return new Response(
        JSON.stringify({ error: 'Token do Mercado Pago não configurado' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Separar nome
    const nameParts = userName.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Silva';

    // Criar pagamento Pix
    const idempotencyKey = crypto.randomUUID();
    
    const paymentData = {
      description: `Assinatura do plano ${plano.nome}`,
      transaction_amount: Number(plano.preco_mensal),
      payment_method_id: "pix",
      payer: {
        email: userEmail,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: docType,
          number: docNumber
        }
      }
    };

    console.log('Criando pagamento PIX para plano:', planoId);

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentData),
    });

    const paymentResult = await mercadoPagoResponse.json();
    
    if (!mercadoPagoResponse.ok) {
      console.error('Erro na API do Mercado Pago:', paymentResult);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar pagamento', details: paymentResult }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('PIX payment created successfully:', paymentResult.id);

    // Log de auditoria (sem dados sensíveis)
    try {
      await supabase.from('security_logs').insert({
        event_type: 'payment_pix_created',
        user_id: null,
        metadata: {
          payment_id: paymentResult.id,
          status: paymentResult.status,
          plan_id: planoId,
          amount: plano.preco_mensal,
        },
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.error('Error logging payment event:', logError);
    }

    // Retornar dados do pagamento
    return new Response(
      JSON.stringify({
        id: paymentResult.id,
        status: paymentResult.status,
        qr_code: paymentResult.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: paymentResult.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: paymentResult.point_of_interaction?.transaction_data?.ticket_url,
        transaction_amount: paymentResult.transaction_amount,
        description: paymentResult.description
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
