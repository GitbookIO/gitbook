import { isSiteAuthLoginHref } from '@/lib/auth-login-link';
import type { GitBookSiteContext } from '@/lib/context';
import {
    type CustomizationContentLink,
    type CustomizationHeaderItem,
    SiteInsightsLinkPosition,
} from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';
import { getLocalizedTitle } from '@/lib/sites';
import { SiteAuthLoginDropdownMenuItem } from '../SiteAuth/SiteAuthLoginLink';
import { DropdownMenuItem } from '../primitives/DropdownMenu';
import { HeaderLinkDropdown, HeaderLinkNavItem } from './HeaderLinkDropdown';

export async function HeaderLink(props: {
    context: GitBookSiteContext;
    link: CustomizationHeaderItem;
}) {
    const { context, link } = props;
    const { customization } = context;

    const target = link.to ? await resolveContentRef(link.to, context) : null;
    const headerPreset = customization.header.preset;
    const linkStyle = link.style ?? 'link';
    const title = getLocalizedTitle(link, context.locale);

    if (link.links && link.links.length > 0) {
        return (
            <HeaderLinkDropdown
                headerPreset={headerPreset}
                title={title}
                hasTarget={!!target}
                linkTarget={link.to}
                linkStyle={linkStyle}
                href={target?.href}
                isSiteAuthLoginHref={
                    target ? isSiteAuthLoginHref(context.linker, target.href) : false
                }
                dropdownClassName={`shrink ${customization.styling.search === 'prominent' ? 'right-0 left-auto' : null}`}
            >
                {link.links.map((subLink, index) => (
                    <SubHeaderLink key={index} {...props} link={subLink} />
                ))}
            </HeaderLinkDropdown>
        );
    }

    if (!link.to) {
        return null;
    }

    return (
        <HeaderLinkNavItem
            linkTarget={link.to}
            linkStyle={linkStyle}
            headerPreset={headerPreset}
            title={title}
            isDropdown={false}
            href={target?.href}
            isSiteAuthLoginHref={target ? isSiteAuthLoginHref(context.linker, target.href) : false}
        />
    );
}

async function SubHeaderLink(props: {
    context: GitBookSiteContext;
    link: CustomizationContentLink;
}) {
    const { context, link } = props;

    const target = await resolveContentRef(link.to, context);

    if (!target) {
        return null;
    }

    const title = getLocalizedTitle(link, context.locale);
    const sharedProps = {
        href: target.href,
        insights: {
            type: 'link_click' as const,
            link: {
                target: link.to,
                position: SiteInsightsLinkPosition.Header,
            },
        },
    };

    return isSiteAuthLoginHref(context.linker, target.href) ? (
        <SiteAuthLoginDropdownMenuItem {...sharedProps}>{title}</SiteAuthLoginDropdownMenuItem>
    ) : (
        <DropdownMenuItem {...sharedProps}>{title}</DropdownMenuItem>
    );
}
