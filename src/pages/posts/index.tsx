import { GetStaticProps } from 'next'
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import { RichText }from 'prismic-dom'
import Link from 'next/link';
import styles from './styles.module.scss'


type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
}

interface PostsProps {
    posts: Post[]
}

export default function Posts({ posts }: PostsProps ) {
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    { posts.map(post => ( // Slug é tipo o link que é criado pelo título -> ex http://localhost:3000/posts/motogp-bagnaia-segura-vinales-e-vence-o-gp-da-gra-bretanha
                        <Link key={post.slug} href={`/posts/preview/${post.slug}`}>
                            <a>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>
                       
                    ))}
                </div>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    // Sempre faça a formatação de dados logo após consumir da API pois isso vai gerar apenas uma formatação e não toda vez que ocorrer o acesso a aplicação

    const prismic = getPrismicClient()

    const response = await prismic.query<any>([
        Prismic.predicates.at('document.type', 'publication') // vai buscar dentro do Prismic todos os documento cujo o type seja publication
    ], {
        fetch: ['publication.title', 'publication.content'],
        pageSize: 100,
    })

    const posts = response.results.map(post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: post.data.content.find(content => content.type === 'paragraph')?. text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString(
                "pt-BR",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
            ),
        }
    })

    return {
        props: {
            posts
        }
    }
}