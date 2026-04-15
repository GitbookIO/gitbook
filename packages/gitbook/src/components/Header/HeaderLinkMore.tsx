import { isSiteAuthLoginHref } from '@/lib/auth-login-link';
import type { GitBookSiteContext } from '@/lib/context';
import {
    type CustomizationContentLink,
    type CustomizationHeaderItem,
    SiteInsightsLinkPosition,
    type SiteSocialAccount,
} from '@gitbook/api';
import type React from 'react';

import { resolveContentRef } from '@/lib/references';
import { getLocalizedTitle } from '@/lib/sites';
import { tcls } from '@/lib/tailwind';

import { SocialAccountLink } from '../Footer/SocialAccounts';
import { SiteAuthLoginDropdownMenuItem } from '../SiteAuth/SiteAuthLoginLink';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownSubMenu,
} from '../primitives/DropdownMenu';
import { HeaderLinkMoreDropdown } from './HeaderLinkMoreClient';
import styles from './headerLinks.module.css';

/**
 * Dropdown menu for header links hidden at small screen size.
 */
export function HeaderLinkMore(props: {
    label: React.ReactNode;
    links: CustomizationHeaderItem[];
    socialAccounts: SiteSocialAccount[];
    context: GitBookSiteContext;
}) {
    const { label, links, context, socialAccounts } = props;

    return (
        <div className={`${styles.linkEllipsis} z-20 items-center`}>
            <HeaderLinkMoreDropdown
                label={label}
                dropdownClassName={tcls(
                    'max-md:right-0 max-md:left-auto',
                    context.customization.styling.search === 'prominent' && 'right-0 left-auto'
                )}
            >
                {links.map((link, index) => (
                    <MoreMenuLink key={index} link={link} context={context} />
                ))}
                {socialAccounts.length > 0 && <DropdownMenuSeparator />}
                {socialAccounts.map((account) => (
                    <SocialAccountLink
                        key={`${account.platform}-${account.handle}`}
                        account={account}
                    />
                ))}
            </HeaderLinkMoreDropdown>
        </div>
    );
}

async function MoreMenuLink(props: {
    context: GitBookSiteContext;
    link: CustomizationHeaderItem | CustomizationContentLink;
}) {
    const { context, link } = props;

    const title = getLocalizedTitle(link, context.locale);
    const target = link.to ? await resolveContentRef(link.to, context) : null;
    const sharedProps = {
        href: target?.href,
        insights: link.to
            ? {
                  type: 'link_click' as const,
                  link: {
                      target: link.to,
                      position: SiteInsightsLinkPosition.Header,
                  },
              }
            : undefined,
    };

    return 'links' in link && link.links.length > 0 ? (
        <DropdownSubMenu label={title}>
            {link.links.map((subLink, index) => {
                return <MoreMenuLink key={index} {...props} link={subLink} />;
            })}
        </DropdownSubMenu>
    ) : isSiteAuthLoginHref(context.linker, target?.href) && sharedProps.href ? (
        <SiteAuthLoginDropdownMenuItem {...sharedProps} href={sharedProps.href}>
            {title}
        </SiteAuthLoginDropdownMenuItem>
    ) : (
        <DropdownMenuItem {...sharedProps}>{title}</DropdownMenuItem>
    );
}
