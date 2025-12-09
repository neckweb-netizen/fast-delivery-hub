import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Edge function para retornar a chave pública do Mercado Pago
// A public key é segura para expor no frontend

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const publicKey = Deno.env.get('MERCADO_PAGO_PUBLIC_KEY');
    
    if (!publicKey) {
      console.error('MERCADO_PAGO_PUBLIC_KEY não configurado');
      return new Response(
        JSON.stringify({ error: 'Chave pública do Mercado Pago não configurada' }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Public key encontrada, retornando...');

    return new Response(
      JSON.stringify({ public_key: publicKey }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao buscar public key:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
