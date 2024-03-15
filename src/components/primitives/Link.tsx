import NextLink, { LinkProps as NextLinkProps } from 'next/link';

// Props from Next, which includes NextLinkProps and all the things anchor elements support.
type BaseLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> &
    NextLinkProps & {
        children?: React.ReactNode;
    } & React.RefAttributes<HTMLAnchorElement>;

// Enforce href is passed as a string (not a URL).
export type LinkProps = Omit<BaseLinkProps, 'href'> & { href: string };

/**
 * Low-level Link component that handles navigation to external urls.
 * It does not contain any styling.
 */
export function Link(props: LinkProps) {
    const { href, prefetch, children, ...domProps } = props;

    // Use a real anchor tag for external links,s and a Next.js Link for internal links.
    // If we use a NextLink for external links, Nextjs won't rerender the top-level layouts.
    const isExternal = URL.canParse(props.href);
    if (isExternal) {
        return (
            <a {...domProps} href={href}>
                {children}
            </a>
        );
    }

    return <NextLink {...props}>{children}</NextLink>;
}
