import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Stripe } from "https://esm.sh/stripe?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // @ts-ignore: Ignora versão
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature")

  try {
    const body = await req.text()
    
    // 1. Verifica autenticidade
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature!, endpointSecret!)
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log(`🔔 Evento recebido: ${event.type}`)

    // 2. Roteamento de Eventos
    switch (event.type) {
      
      // ✅ CASO 1: PAGAMENTO APROVADO (Entrada)
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.user_id

        if (!userId) {
             console.log('⚠️ User ID não encontrado no metadata')
             break;
        }

        console.log(`💰 Pagamento recebido do usuário: ${userId}`)

        const { data: profile } = await supabase
          .from('profiles')
          .select('account_id')
          .eq('id', userId)
          .single()

        if (profile?.account_id) {
          await supabase
            .from('accounts')
            .update({ 
              status: 'active',
              subscription_id: session.subscription,
              stripe_customer_id: session.customer 
            })
            .eq('id', profile.account_id)
          
          console.log(`✅ Condomínio ativado e vinculado ao cliente Stripe: ${session.customer}`)
        }
        break;
      }

      // 🚫 CASO 2: ASSINATURA CANCELADA / FATURA ANULADA (Saída)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const stripeCustomerId = subscription.customer

        console.log(`❌ Assinatura cancelada para o cliente Stripe: ${stripeCustomerId}`)

        const { error } = await supabase
          .from('accounts')
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', stripeCustomerId)

        if (error) console.error('Erro ao cancelar conta:', error)
        else console.log('🔒 Acesso revogado no banco de dados.')
        
        break;
      }

      // ⚠️ CASO 3: PAGAMENTO FALHOU (Cartão recusado, etc)
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const stripeCustomerId = invoice.customer

        console.log(`⚠️ Pagamento falhou para: ${stripeCustomerId}`)

        await supabase
          .from('accounts')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', stripeCustomerId)
        
        break;
      }
      
      // 🔄 CASO 4: PAGAMENTO RECORRENTE BEM SUCEDIDO
      case 'invoice.payment_succeeded': {
         const invoice = event.data.object
         if(invoice.billing_reason === 'subscription_cycle') {
             await supabase
              .from('accounts')
              .update({ status: 'active' })
              .eq('stripe_customer_id', invoice.customer)
         }
         break;
      }

      // ⬆️ CASO 5: MUDANÇA DE PLANO (Upgrades / Downgrades / Reativação) -> MÁGICA NOVA AQUI
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Pega o ID do produto atrelado a essa assinatura
        const productId = subscription.items.data[0].price.product;

        // Busca o produto lá no Stripe para ver se tem a etiqueta de carregadores
        const product = await stripe.products.retrieve(productId as string);

        // Lê a etiqueta. Se você esquecer de colocar no Stripe, ele assume 2 por segurança.
        const limiteCarregadores = product.metadata.carregadores 
          ? parseInt(product.metadata.carregadores) 
          : 2;

        console.log(`⬆️ Plano atualizado. Cliente ${customerId} agora tem limite de ${limiteCarregadores} carregadores.`);

        // Se ele estava "past_due" e pagou pelo portal, o Stripe manda esse evento com status 'active'.
        // Então aproveitamos para garantir que o condomínio volte a ficar ativo.
        let novoStatus = subscription.status;
        if (novoStatus === 'active' || novoStatus === 'trialing') {
            novoStatus = 'active';
        }

        // Atualiza o banco com a nova quantidade e o status
        await supabase
          .from('accounts')
          .update({ 
            limite_carregadores: limiteCarregadores,
            status: novoStatus
          })
          .eq('stripe_customer_id', customerId);

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (err) {
    console.error(`Erro no servidor: ${err.message}`)
    return new Response(`Server Error: ${err.message}`, { status: 400 })
  }
})