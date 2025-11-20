import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planoId, cardData, userInfo, installments = 1 } = await req.json();

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

    // Primeiro, criar o token do cartão no Mercado Pago
    console.log('Creating card token...');
    const tokenResponse = await fetch('https://api.mercadopago.com/v1/card_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        card_number: cardData.cardNumber,
        cardholder: {
          name: cardData.cardholderName,
          identification: {
            type: cardData.identificationType,
            number: cardData.identificationNumber,
          },
        },
        security_code: cardData.securityCode,
        expiration_month: cardData.cardExpirationMonth,
        expiration_year: cardData.cardExpirationYear,
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
    console.log('Token result:', JSON.stringify(tokenResult));

    // Buscar o payment_method_id correto usando a API do Mercado Pago
    const bin = cardData.cardNumber.substring(0, 6);
    console.log('Searching payment method for BIN:', bin);
    
    const pmResponse = await fetch(`https://api.mercadopago.com/v1/payment_methods/search?public_key=${mpPublicKey}&bin=${bin}`, {
      method: 'GET',
    });

    let pmResult: any = null;
    if (pmResponse.ok) {
      try {
        pmResult = await pmResponse.json();
        console.log('Payment method search result:', JSON.stringify(pmResult));
      } catch (e) {
        console.error('Error parsing payment method response:', e);
      }
    } else {
      console.error('Payment method search failed with status:', pmResponse.status);
    }

    let paymentMethodId = tokenResult.payment_method_id;
    
    if (pmResult && pmResponse.ok && pmResult.results && pmResult.results.length > 0) {
      paymentMethodId = pmResult.results[0].id;
      console.log('Payment method found from API:', paymentMethodId);
    } else if (!paymentMethodId) {
      // Fallback: inferir pelo primeiro dígito se a API falhar
      const firstDigit = cardData.cardNumber.charAt(0);
      const firstTwoDigits = cardData.cardNumber.substring(0, 2);
      
      if (firstDigit === '4') {
        paymentMethodId = 'visa';
      } else if (firstTwoDigits === '51' || firstTwoDigits === '52' || firstTwoDigits === '53' || 
                 firstTwoDigits === '54' || firstTwoDigits === '55') {
        paymentMethodId = 'master';
      } else if (firstTwoDigits === '34' || firstTwoDigits === '37') {
        paymentMethodId = 'amex';
      } else {
        paymentMethodId = 'visa';
      }
      console.log('Payment method inferred as fallback:', paymentMethodId);
    }

    // Criar pagamento com cartão no Mercado Pago
    const paymentData = {
      transaction_amount: Number(plano.preco_mensal),
      token: tokenResult.id,
      description: `${plano.nome} - Plano Mensal`,
      installments: installments,
      payment_method_id: paymentMethodId,
      payer: {
        email: userInfo.email,
        identification: {
          type: userInfo.docType,
          number: userInfo.docNumber,
        },
      },
    };

    console.log('Creating card payment with Mercado Pago:', { ...paymentData, token: 'REDACTED' });

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
        'X-Idempotency-Key': `${planoId}-${Date.now()}`,
      },
      body: JSON.stringify(paymentData),
    });

    const mpResult = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Mercado Pago error:', mpResult);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao processar pagamento',
          details: mpResult 
        }),
        { status: mpResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Card payment created successfully:', mpResult.id);

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
