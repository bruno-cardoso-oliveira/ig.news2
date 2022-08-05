 import { FaGithub } from 'react-icons/fa'
 import { FiX } from 'react-icons/fi'
 import { useSession, signIn, signOut } from "next-auth/react"

 import styles from './styles.module.scss'
 
 export function SignInButton() {
    const { data: session } = useSession(); // coleta a informação se o usuário está logado ou não através do hook useSession

    return session ? ( // se existe uma sessão exibe botão verde senão exibe botão amarelo
        <button 
            type="button"
            className={styles.signInButton}
        >
            <FaGithub color="#04D361" />
            {session.user.name}
            <FiX 
                color="#737380" 
                className={styles.closeIcon}
                onClick={() => signOut()}
            />
        </button>

    ) : (
        <button 
            type="button"
            className={styles.signInButton}
            onClick={() => signIn('github')} // autenticação Github (login)
        >
            <FaGithub color="#EBA417" />
            Sign in with Github
        </button>
    );
}