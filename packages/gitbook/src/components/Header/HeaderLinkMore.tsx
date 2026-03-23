import { isSiteAuthLoginHref } from '@/lib/auth-login-link';
import type { GitBookSiteContext } from '@/lib/context';
import {
    type CustomizationContentLink,
    type CustomizationHeaderItem,
    SiteInsightsLinkPosition,
    type SiteSocialAccount,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import type React from 'react';

import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { SocialAccountLink } from '../Footer/SocialAccounts';
import { SiteAuthLoginDropdownMenuItem } from '../SiteAuth/SiteAuthLoginLink';
import { ToggleChevron } from '../primitives';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownSubMenu,
} from '../primitives/DropdownMenu';
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

    const renderButton = (
        <button
            type="button"
            className={tcls(
                'text-tint',
                'hover:text-primary',
                'dark:hover:text-primary',
                'theme-bold:text-header-link',
                'theme-bold:hover:text-header-link/8',
                'flex',
                'gap-1',
                'items-center'
            )}
        >
            <span className="sr-only">{label}</span>
            <Icon icon="ellipsis" className={tcls('size-4')} />
            <ToggleChevron />
        </button>
    );

    return (
        <div className={`${styles.linkEllipsis} z-20 items-center`}>
            <DropdownMenu
                button={renderButton}
                openOnHover={true}
                className={tcls(
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
            </DropdownMenu>
        </div>
    );
}

async function MoreMenuLink(props: {
    context: GitBookSiteContext;
    link: CustomizationHeaderItem | CustomizationContentLink;
}) {
    const { context, link } = props;

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
        <DropdownSubMenu label={link.title}>
            {link.links.map((subLink, index) => {
                return <MoreMenuLink key={index} {...props} link={subLink} />;
            })}
        </DropdownSubMenu>
    ) : isSiteAuthLoginHref(context.linker, target?.href) && sharedProps.href ? (
        <SiteAuthLoginDropdownMenuItem {...sharedProps} href={sharedProps.href}>
            {link.title}
        </SiteAuthLoginDropdownMenuItem>
    ) : (
        <DropdownMenuItem {...sharedProps}>{link.title}</DropdownMenuItem>
    );
}
