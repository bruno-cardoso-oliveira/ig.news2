import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { fauna } from '../../../services/fauna'
import { query as q } from 'faunadb'

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      session.user.email

      try {
        const userActiveSubscription = await fauna.query(
          q.Get( // buscando a subscription do usuário por uma ref 
            q.Intersection([ 
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select( // seleciona apenas o ref do usuário coletado no Get
                  'ref',
                  q.Get( //pegando os dados do usuário pelo e-mail
                    q.Match( // que batem
                      q.Index('user_by_email'), // encontrando um usuário por e-mail
                      q.Casefold(session.user.email) // que tenha esse e-mail
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                'active'
              )
            ])
          )
        )
        
        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      } catch {
        return {
          ...session,
          activeSubscription: null
        }
      }
    },

    async signIn({ user, account, profile }) {
      const { email } = user

      try {
        await fauna.query(
          q.Let(
            {
              userExists: q.Exists(
                q.Match(
                  q.Index("user_by_email"),
                  q.Casefold(user.email)
                )
              )
            },
            q.If(
              q.Var('userExists'),
              q.Get(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              ),
              q.Create(
                q.Collection('users'),
                {
                  data: { email }
                }
              )
            )
          )
        )

        return true
      } catch {
        return false
      }
    },
  }
});