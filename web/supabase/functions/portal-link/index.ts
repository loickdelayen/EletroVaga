import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Stripe } from "https://esm.sh/stripe?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // @ts-ignore
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Trata requisições OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Configura o cliente Supabase com o token do usuário
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Verifica quem está logado
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado")

    // 3. Busca o account_id no perfil
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('account_id')
      .eq('id', user.id)
      .single()

    if (!profile?.account_id) throw new Error("Usuário não tem condomínio vinculado.")

    // 4. Busca o ID DO STRIPE na tabela accounts (O jeito seguro) 🔒
    const { data: account } = await supabaseClient
      .from('accounts')
      .select('stripe_customer_id')
      .eq('id', profile.account_id)
      .single()

    const stripeCustomerId = account?.stripe_customer_id

    // Se não tiver ID no banco, aí sim dá erro
    if (!stripeCustomerId) {
        throw new Error("ID do Stripe não encontrado. Entre em contato com o suporte.")
    }

    // 5. Gera o link do portal usando o ID exato
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId, 
      return_url: `${req.headers.get('origin')}/dashboard`, // Mudei para /dashboard para voltar pra tela certa
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 400,
    })
  }
})