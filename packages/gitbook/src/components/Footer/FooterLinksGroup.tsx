import {
    CustomizationContentLink,
    CustomizationFooterGroup,
    SiteInsightsLinkPosition,
} from '@gitbook/api';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';

export function FooterLinksGroup(props: {
    group: CustomizationFooterGroup;
    context: ContentRefContext;
}) {
    const { group, context } = props;

    return (
        <nav className="text-sm flex flex-col gap-4">
            <h4 className="font-semibold">{group.title}</h4>
            <ul className="flex flex-col items-start gap-4">
                {group.links.map((link, index) => {
                    return (
                        <li key={index}>
                            <FooterLink link={link} context={context} />
                        </li>
                    );
                })}
            </ul>
        </nav>
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
                'font-normal',
                'text-dark/8',
                'hover:text-primary',
                'dark:text-light/8',
                'dark:hover:text-light',
                'contrast-more:underline',
                'contrast-more:text-dark',
                'contrast-more:dark:text-light',
                'underline-offset-2',
            )}
            insights={{
                type: 'link_click',
                link: {
                    target: link.to,
                    position: SiteInsightsLinkPosition.Footer,
                },
            }}
        >
            {link.title}
        </Link>
    );
}
