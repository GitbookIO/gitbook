import {
    type CustomizationContentLink,
    type CustomizationFooterGroup,
    SiteInsightsLinkPosition,
} from '@gitbook/api';

import { Link } from '../primitives';
import type { GitBookAnyContext } from '@/lib/context';
import { resolveContentRef } from '@/lib/references';
import { getLocalizedTitle } from '@/lib/sites';

export function FooterLinksGroup(props: {
    group: CustomizationFooterGroup;
    context: GitBookAnyContext;
}) {
    const { group, context } = props;
    const title = getLocalizedTitle(group, context.locale);

    return (
        <nav className="footer-group">
            <h4 className="footer-group-title">{title}</h4>
            <ul className="footer-group-links">
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
    const title = getLocalizedTitle(link, context.locale);
    const resolved = await resolveContentRef(link.to, context);

    return (
        <Link
            href={resolved?.href ?? '#'}
            className="footer-link"
            insights={{
                type: 'link_click',
                link: {
                    target: link.to,
                    position: SiteInsightsLinkPosition.Footer,
                },
            }}
        >
            {title}
        </Link>
    );
}
