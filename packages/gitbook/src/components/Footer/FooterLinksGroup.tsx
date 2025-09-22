import type { GitBookAnyContext } from '@/lib/context';
import {
    type CustomizationContentLink,
    type CustomizationFooterGroup,
    SiteInsightsLinkPosition,
} from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';

export function FooterLinksGroup(props: {
    group: CustomizationFooterGroup;
    context: GitBookAnyContext;
}) {
    const { group, context } = props;

    return (
        <nav className="flex flex-col gap-4 text-sm">
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

    return (
        <Link
            href={resolved?.href ?? '#'}
            className={tcls(
                'font-normal',
                'text-tint',
                'links-default:hover:text-primary',
                'links-default:tint:hover:text-tint-strong',

                'contrast-more:underline',
                'contrast-more:text-tint-strong',
                'underline-offset-2',

                'links-accent:hover:underline',
                'links-accent:underline-offset-4',
                'links-accent:decoration-primary-subtle',
                'links-accent:decoration-[3px]'
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
