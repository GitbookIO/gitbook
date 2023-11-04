import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import Link from 'next/link';

export function FooterLinksGroup(props: { group: any; context: ContentRefContext }) {
    const { group, context } = props;

    return (
        <div className={tcls('flex', 'flex-col', 'gap-3')}>
            <h4 className={tcls('text-base', 'text-slate-900', 'dark:text-white')}>{group.title}</h4>
            {group.links.map((link, index) => {
                return <FooterLink key={index} link={link} context={context} />;
            })}
        </div>
    );
}

async function FooterLink(props: { link: any; context: ContentRefContext }) {
    const { link, context } = props;
    const resolved = await resolveContentRef(link.to, context);

    if (!resolved) {
        return null;
    }

    return (
        <Link
            href={resolved.href}
            className={tcls('text-sm', 'text-slate-400', 'hover:text-slate-700')}
        >
            {link.title}
        </Link>
    );
}
