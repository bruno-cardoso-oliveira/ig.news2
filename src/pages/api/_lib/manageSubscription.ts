import { query as q } from 'faunadb'
import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';


export async function saveSubscription( // função responsável por salvar as informações no DB
    subscriptionId: string,
    customerId: string,
) {
     // Buscar o usuário dentro do FaundaDB com o ID {customerId}
     // Salvar os dados da subscription no FaunaDB

     const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
     )

     const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }

     await fauna.query(
        q.Create(
            q.Collection('subscriptions'),
            { data: subscriptionData }
        )
     )
}