import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from 'stream'
import Stripe from 'stripe'
import { stripe } from '../../services/stripe'
import { saveSubscription } from '../api/_lib/manageSubscription'

// código "padrão" pois o stripe envia os eventos atraves de stream, como se enviasse por pedaços

    async function buffer(readable: Readable) {
        const chunks = []

        for await (const chunk of readable) {
            chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
        }
    
        return Buffer.concat(chunks)
    }

    export const config = {
        api: {
            bodyParser: false,
        }
    }

    const relevantEvents = new Set([ //new Set é como se fosse um array onde não tem objetos repetidos dentro dele
        'checkout.session.completed'
    ])

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') { // verifica se o metodo enviado é post, se não for informa que o method não é suportado
        const buf = await buffer(req) // aqui é armazenado os eventos enviados pelo stripe na variável buf
        const secret = req.headers['stripe-signature']

        let event: Stripe.Event;

        try{// como se fosse um if para verificar se a chave secret enviada pelo stripe bate com a requisição enviada, assim "aceitando" apenas Post do Stripe e evitando que pessoas externas enviem metodos Post
            // Verificando se os parametros batem, e construindo o Objeto de evento
            event = stripe.webhooks.constructEvent(
                buf,
                secret,
                process.env.STRIPE_WEBHOOK_SECRET
              );           
          } catch (err) {
            return res.status(400).send(`Webhook error: ${err.message}`)
          }

        const { type } = event;

        if(relevantEvents.has(type)) {
            try {
                switch (type) {
                    case 'checkout.session.completed':
                    
                        const checkoutSession = event.data.object as Stripe.Checkout.Session

                        await saveSubscription(
                            checkoutSession.subscription.toString(), // parâmetros passados para a funcion saveSubscription
                            checkoutSession.customer.toString(),
                        )

                        break;
                    default:
                        throw new Error('Unhandled event.')
                }
            } catch (err) {
                console.log(err)// Adicionar o log aqui
                return res.status(400).json({ error: 'Webhook handle failed.' }) //Adicionar o status aqui
              }
        }

        res.json({ received: true })
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}