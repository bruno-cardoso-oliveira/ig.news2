import { GetStaticProps } from 'next'
import Head from 'next/head'
import { stripe } from '../../src/services/stripe'
import { SubscribeButton } from '../components/SubscribeButton'

import styles from './home.module.scss'

interface HomeProps {
  product: {
    priceId: string;
    amount: string;
  }
}

export default function Home({ product }: HomeProps) {

  return (
    <>
      <Head> 
        <title>Home | ig.news</title> 
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton />
        </section>

        <img src="./images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

// Tudo que estiver dentro do "Head" será anexado no Head do _document.tsx, assim podemos dar um title para cada página (title dinâmico)

// Client-side -> outros casos, informações geradas apenas com ação do usuário (comentários) por exemplo
// Server-side -> dados dinâmicos específicos por usuário gerados no carregamento da página/aplicação
// Static Site Generation -> mesmo HTML para todas pessoas que acessam a página/aplicação

export const getStaticProps: GetStaticProps = async () => { // o GetStaticProps só pode ser usado para páginas que podem ser estáticas e vão exibir o mesmo conteúdo para todo mundo que acessar
  const price = await stripe.prices.retrieve('price_1LO8DxCFBlqm1bq3ygg09qws')

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', { // formatação para dolar $
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100),
  };

  return { 
    props: {
      product,
    },
    revalidate: 60 * 60 * 24 // 24 horas -> quanto tempo em segundos quer que essa página seja estática sem se revalidada
  }
}
