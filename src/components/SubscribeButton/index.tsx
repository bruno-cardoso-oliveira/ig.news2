import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router'
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'

export function SubscribeButton() {
    const { data: session } = useSession(); // pega o status da session, se está logado ou não
    const router = useRouter()

    async function hadleSubscribe() {
        if(!session) { //verifica se não está logando, se não estiver redireciona para o signIn do Github
            signIn('github')
            return;
        }

        if (session.activeSubscription) {
            router.push('/posts') // redirecionamento programado e não por ação do usuário (exemplo: button)
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