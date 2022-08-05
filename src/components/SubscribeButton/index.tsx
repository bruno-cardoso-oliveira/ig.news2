import { signIn, useSession } from 'next-auth/react';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';

import styles from './styles.module.scss'

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
    const { data: session } = useSession(); // pega o status da session, se está logado ou não

    async function hadleSubscribe() {
        if(!session) { //verifica se não está logando, se não estiver redireciona para o signIn do Github
            signIn('github')
            return;
        }

        try {
            const response = await api.post('subscribe')

            const { sessionId } = response.data;

            const stripe = await getStripeJs()

            await stripe.redirectToCheckout({sessionId})
        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <button
            type="button"
            className={styles.subscribeButton}    
            onClick={hadleSubscribe}   
        >
            Subscribe now
        </button>
    );
}