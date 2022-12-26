import Link, { LinkProps } from 'next/link'
import { ReactElement, cloneElement } from 'react'
import { useRouter } from 'next/router'

interface ActiveLinkProps extends LinkProps { // extends LinkProps faz com que além dos props vindos do Active link, ele aceite as propriedades que o link já recebe
    children: ReactElement;
    activeClassName: string;
}

export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {
    const { asPath } = useRouter() // asPath retorna exatamente a rota que está sendo acessada no momento

    const className = asPath === rest.href 
        ? activeClassName
        : '';

    return (
        <Link {...rest}>
            {cloneElement(children, {
                className,
            })}
        </Link>
    )
}