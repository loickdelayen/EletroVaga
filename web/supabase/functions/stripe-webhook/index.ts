import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Stripe } from "https://esm.sh/stripe?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // @ts-ignore: Ignora versão
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Chave para verificar se o aviso veio mesmo do Stripe (Segurança)
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature")

  try {
    const body = await req.text()
    
    // 1. Verifica se a mensagem é autêntica do Stripe
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature!, endpointSecret!)
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // 2. Se o pagamento foi aprovado...
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata.supabase_user_id // ID que mandamos no checkout

      console.log(`💰 Pagamento recebido do usuário: ${userId}`)

      // 3. Busca o perfil para saber qual condomínio liberar
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', userId)
        .single()

      if (profile?.account_id) {
        // 4. Atualiza o Condomínio para ATIVO
        await supabase
          .from('accounts')
          .update({ 
            status: 'active',
            subscription_id: session.subscription // Salva o ID da assinatura para cancelar depois
          })
          .eq('id', profile.account_id)
        
        console.log(`✅ Condomínio ${profile.account_id} ativado com sucesso!`)
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    return new Response(`Server Error: ${err.message}`, { status: 400 })
  }
})