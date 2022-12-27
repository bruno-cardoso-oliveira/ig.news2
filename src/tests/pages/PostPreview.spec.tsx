import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic';

const post = { 
        slug:'my-new-post', 
        title: 'My New Post', 
        content: '<p>Post excerpt</p>', 
        updatedAt: '10 de Abril' 
};

jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
    }),
  }))
jest.mock('next-auth/react')
jest.mock('../../services/prismic')

describe('Post preview page', () => {
    it('renders correctly', () => {
        const useSessionMocked = jest.mocked(useSession)

        useSessionMocked.mockReturnValueOnce({
            data: {
                activeSubscription: 'fake-active-subscription',
                expires: null
            },
            status: 'authenticated'
        });

        render(<Post post={post} />)

        expect(screen.getByText('My New Post')).toBeInTheDocument()
        expect(screen.getByText('Post excerpt')).toBeInTheDocument()
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
    });

    /* it('redirects user if no subscription is found', async () => {
        const getSessionMocked = jest.mocked(getSession)

        getSessionMocked.mockResolvedValueOnce(null)

        const response = await getServerSideProps({ 
            params: {slug: 'my-new-post'} 
        } as any)
  
    expect(response).toEqual(
        expect.objectContaining({
            redirect: expect.objectContaining({
                destination: '/',
            })
        })
      )
    });
    
    it('loads initial data', async () => {
        const getSessionMocked = jest.mocked(getSession)
        const getPrismicClientMocked = jest.mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
              uid: 'my-new-post', // Adicionar o mesmo UID
              data: {
                title: [
                  { type: 'heading', text: 'My new post' }
                ],
                content: [
                  { type: 'paragraph', text: 'Post content' }
                ]
              },
              last_publication_date: '04-01-2021'
            })
          } as any);

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        } as any);

        const response = await getServerSideProps({ 
            params: {slug: 'my-new-post'} 
        } as any)
  
    expect(response).toEqual(
        expect.objectContaining({
            props: {
                post: {
                    slug: 'my-new-post',
                    title: 'My new post',
                    content: '<p>Post content</p>',
                    updatedAt: '01 de abril de 2021'
                }
            }
        })
    )
}) */
}) 