import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// Edge function para processar pagamentos com cartão via Mercado Pago
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

// Validar número do cartão (algoritmo de Luhn)
function isValidCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Validar CVV
function isValidCVV(cvv: string): boolean {
  const cleaned = cvv.replace(/\D/g, '');
  return cleaned.length >= 3 && cleaned.length <= 4;
}

// Validar mês de expiração
function isValidExpirationMonth(month: string | number): boolean {
  const monthNum = parseInt(String(month), 10);
  return monthNum >= 1 && monthNum <= 12;
}

// Validar ano de expiração
function isValidExpirationYear(year: string | number): boolean {
  const yearNum = parseInt(String(year), 10);
  const currentYear = new Date().getFullYear();
  // Aceitar anos entre o atual e 20 anos no futuro
  return yearNum >= currentYear && yearNum <= currentYear + 20;
}

// Validar se o cartão não está expirado
function isCardNotExpired(month: string | number, year: string | number): boolean {
  const monthNum = parseInt(String(month), 10);
  let yearNum = parseInt(String(year), 10);
  
  // Converter ano de 2 dígitos para 4 dígitos
  if (yearNum < 100) {
    yearNum += 2000;
  }
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (yearNum > currentYear) return true;
  if (yearNum === currentYear && monthNum >= currentMonth) return true;
  
  return false;
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
  
  // Para outros tipos, apenas verificar se tem dígitos
  return cleaned.length >= 5 && cleaned.length <= 20;
}

// Validar nome do titular
function isValidCardholderName(name: string): boolean {
  if (!name || name.length < 3 || name.length > 100) return false;
  // Nome deve conter apenas letras, espaços e acentos
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

// Rate limiting simples por IP (em memória)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // Máximo de requisições
const RATE_LIMIT_WINDOW = 60000; // Janela de 1 minuto

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

// Limpar registros antigos periodicamente
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
    const { planoId, cardData, userInfo, installments = 1 } = body;

    // ========== VALIDAÇÕES DE ENTRADA ==========

    // Validar planoId
    if (!planoId || typeof planoId !== 'string') {
      console.error('Invalid planoId:', planoId);
      return new Response(
        JSON.stringify({ error: 'ID do plano inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar cardData
    if (!cardData || typeof cardData !== 'object') {
      console.error('Invalid cardData');
      return new Response(
        JSON.stringify({ error: 'Dados do cartão inválidos' }),
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

    // Sanitizar e validar dados do cartão
    const cardNumber = String(cardData.cardNumber || '').replace(/\D/g, '');
    const cardholderName = sanitizeString(String(cardData.cardholderName || ''));
    const securityCode = String(cardData.securityCode || '').replace(/\D/g, '');
    const expirationMonth = String(cardData.cardExpirationMonth || '');
    const expirationYear = String(cardData.cardExpirationYear || '');
    const identificationType = sanitizeString(String(cardData.identificationType || 'CPF')).toUpperCase();
    const identificationNumber = String(cardData.identificationNumber || '').replace(/\D/g, '');

    // Validar número do cartão
    if (!isValidCardNumber(cardNumber)) {
      console.error('Invalid card number format');
      return new Response(
        JSON.stringify({ error: 'Número do cartão inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar CVV
    if (!isValidCVV(securityCode)) {
      console.error('Invalid CVV');
      return new Response(
        JSON.stringify({ error: 'Código de segurança inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar expiração
    if (!isValidExpirationMonth(expirationMonth)) {
      console.error('Invalid expiration month');
      return new Response(
        JSON.stringify({ error: 'Mês de expiração inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidExpirationYear(expirationYear)) {
      console.error('Invalid expiration year');
      return new Response(
        JSON.stringify({ error: 'Ano de expiração inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se cartão não está expirado
    if (!isCardNotExpired(expirationMonth, expirationYear)) {
      console.error('Card is expired');
      return new Response(
        JSON.stringify({ error: 'Cartão expirado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar nome do titular
    if (!isValidCardholderName(cardholderName)) {
      console.error('Invalid cardholder name');
      return new Response(
        JSON.stringify({ error: 'Nome do titular inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar documento
    if (!isValidDocument(identificationType, identificationNumber)) {
      console.error('Invalid document');
      return new Response(
        JSON.stringify({ error: `${identificationType} inválido` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitizar e validar dados do usuário
    const userEmail = sanitizeString(String(userInfo.email || ''));
    const userDocType = sanitizeString(String(userInfo.docType || 'CPF')).toUpperCase();
    const userDocNumber = String(userInfo.docNumber || '').replace(/\D/g, '');

    // Validar email
    if (!isValidEmail(userEmail)) {
      console.error('Invalid email');
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar parcelas
    const installmentsNum = parseInt(String(installments), 10);
    if (isNaN(installmentsNum) || installmentsNum < 1 || installmentsNum > 12) {
      console.error('Invalid installments:', installments);
      return new Response(
        JSON.stringify({ error: 'Número de parcelas inválido (1-12)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Security validations passed for card payment');
    console.log('Creating card payment for plan:', planoId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar informações do plano
    const { data: plano, error: planoError } = await supabase
      .from('planos')
      .select('*')
      .eq('id', planoId)
      .single();

    if (planoError || !plano) {
      console.error('Error fetching plan:', planoError);
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

    // Obter tokens do Mercado Pago
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    const mpPublicKey = Deno.env.get('MERCADO_PAGO_PUBLIC_KEY');
    
    if (!mpAccessToken || !mpPublicKey) {
      console.error('MERCADO_PAGO tokens not configured');
      return new Response(
        JSON.stringify({ error: 'Configuração de pagamento não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar o token do cartão no Mercado Pago
    console.log('Creating card token...');
    const tokenResponse = await fetch('https://api.mercadopago.com/v1/card_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        card_number: cardNumber,
        cardholder: {
          name: cardholderName,
          identification: {
            type: identificationType,
            number: identificationNumber,
          },
        },
        security_code: securityCode,
        expiration_month: expirationMonth,
        expiration_year: expirationYear,
      }),
    });

    const tokenResult = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token creation error:', tokenResult);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao validar cartão',
          details: tokenResult 
        }),
        { status: tokenResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Card token created successfully:', tokenResult.id);

    // Buscar o payment_method_id correto
    const bin = cardNumber.substring(0, 6);
    console.log('Searching payment method for BIN:', bin);
    
    const pmResponse = await fetch(`https://api.mercadopago.com/v1/payment_methods/search?public_key=${mpPublicKey}&bin=${bin}`, {
      method: 'GET',
    });

    let pmResult: any = null;
    if (pmResponse.ok) {
      try {
        pmResult = await pmResponse.json();
        console.log('Payment method found');
      } catch (e) {
        console.error('Error parsing payment method response:', e);
      }
    }

    let paymentMethodId = tokenResult.payment_method_id;
    
    if (pmResult && pmResponse.ok && pmResult.results && pmResult.results.length > 0) {
      paymentMethodId = pmResult.results[0].id;
    } else if (!paymentMethodId) {
      // Fallback: inferir pelo primeiro dígito
      const firstDigit = cardNumber.charAt(0);
      const firstTwoDigits = cardNumber.substring(0, 2);
      
      if (firstDigit === '4') {
        paymentMethodId = 'visa';
      } else if (['51', '52', '53', '54', '55'].includes(firstTwoDigits)) {
        paymentMethodId = 'master';
      } else if (['34', '37'].includes(firstTwoDigits)) {
        paymentMethodId = 'amex';
      } else {
        paymentMethodId = 'visa';
      }
    }

    // Separar nome do titular
    const nameParts = cardholderName.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Usuario';

    // Criar pagamento com cartão
    const paymentData = {
      transaction_amount: Number(plano.preco_mensal),
      token: tokenResult.id,
      description: `${plano.nome} - Plano Mensal`,
      installments: installmentsNum,
      payment_method_id: paymentMethodId,
      binary_mode: false,
      statement_descriptor: 'SAJTEM',
      payer: {
        email: userEmail,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: userDocType,
          number: userDocNumber,
        },
      },
      additional_info: {
        items: [
          {
            id: planoId,
            title: plano.nome,
            description: `Assinatura do plano ${plano.nome}`,
            category_id: 'services',
            quantity: 1,
            unit_price: Number(plano.preco_mensal),
          }
        ],
        payer: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    };

    console.log('Creating card payment with Mercado Pago');

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
        'X-Idempotency-Key': `${planoId}-${Date.now()}-${crypto.randomUUID()}`,
      },
      body: JSON.stringify(paymentData),
    });

    const mpResult = await mpResponse.json();

    console.log('Mercado Pago Response Status:', mpResponse.status);

    if (!mpResponse.ok) {
      console.error('Mercado Pago error:', {
        status: mpResponse.status,
        cause: mpResult.cause,
        message: mpResult.message,
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao processar pagamento',
          details: mpResult,
          message: mpResult.message || 'Pagamento não aprovado',
        }),
        { status: mpResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Card payment created successfully:', mpResult.id);

    // Log de auditoria (sem dados sensíveis)
    try {
      await supabase.from('security_logs').insert({
        event_type: 'payment_card_created',
        user_id: null,
        metadata: {
          payment_id: mpResult.id,
          status: mpResult.status,
          plan_id: planoId,
          amount: plano.preco_mensal,
        },
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.error('Error logging payment event:', logError);
    }

    return new Response(
      JSON.stringify({
        paymentId: mpResult.id,
        status: mpResult.status,
        statusDetail: mpResult.status_detail,
        transactionAmount: mpResult.transaction_amount,
        installments: mpResult.installments,
        paymentMethodId: mpResult.payment_method_id,
        paymentTypeId: mpResult.payment_type_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating card payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
