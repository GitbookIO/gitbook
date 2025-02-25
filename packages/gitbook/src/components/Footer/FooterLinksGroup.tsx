import {
    CustomizationContentLink,
    CustomizationFooterGroup,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import { GitBookAnyContext } from '@v2/lib/context';

import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';

export function FooterLinksGroup(props: {
    group: CustomizationFooterGroup;
    context: GitBookAnyContext;
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

async function FooterLink(props: { link: CustomizationContentLink; context: GitBookAnyContext }) {
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
                'text-tint',
                'hover:text-primary',
                'tint:hover:text-tint-strong',
                'contrast-more:underline',
                'contrast-more:text-tint-strong',
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
