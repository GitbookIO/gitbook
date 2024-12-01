import { CustomizationContentLink, CustomizationFooterGroup } from '@gitbook/api';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';

export function FooterLinksGroup(props: {
    group: CustomizationFooterGroup;
    context: ContentRefContext;
}) {
    const { group, context } = props;

    return (
        <div className={tcls('flex', 'flex-col', 'gap-3')}>
            <p className={tcls('text-base', 'font-semibold')}>{group.title}</p>
            {group.links.map((link, index) => {
                return <FooterLink key={index} link={link} context={context} />;
            })}
        </div>
    );
}

async function FooterLink(props: { link: CustomizationContentLink; context: ContentRefContext }) {
    const { link, context } = props;
    const resolved = await resolveContentRef(link.to, context);

    if (!resolved) {
        return null;
    }

    return (
        <Link
            href={resolved.href}
            className={tcls(
                'text-sm',
                'font-normal',
                'text-dark/8',
                'hover:text-dark/9',
                'dark:text-light/8',
                'dark:hover:text-light/9',
            )}
        >
            {link.title}
        </Link>
    );
}
