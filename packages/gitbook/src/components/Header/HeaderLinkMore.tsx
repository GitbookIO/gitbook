import { isSiteAuthLoginHref } from '@/lib/auth-login-link';
import type { GitBookSiteContext } from '@/lib/context';
import type {
    CustomizationContentLink,
    CustomizationHeaderItem,
    SiteSocialAccount,
} from '@gitbook/api';
import type React from 'react';

import { resolveContentRef } from '@/lib/references';

import { SocialAccountLink } from '../Footer/SocialAccounts';
import { DropdownMenuSeparator } from '../primitives/DropdownMenu';
import { HeaderLinkMenuItem, HeaderLinkSubMenu } from './HeaderLinkClient';
import { HeaderLinkMoreDropdown } from './HeaderLinkMoreClient';
import { getHeaderLinkMoreDropdownClassName } from './HeaderLinkStyles';
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
                dropdownClassName={getHeaderLinkMoreDropdownClassName(
                    context.customization.styling.search
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

    const target = link.to ? await resolveContentRef(link.to, context) : null;

    return 'links' in link && link.links.length > 0 ? (
        <HeaderLinkSubMenu link={link} locale={context.locale}>
            {link.links.map((subLink, index) => {
                return <MoreMenuLink key={index} {...props} link={subLink} />;
            })}
        </HeaderLinkSubMenu>
    ) : (
        <HeaderLinkMenuItem
            link={link}
            locale={context.locale}
            href={target?.href}
            isSiteAuthLoginHref={isSiteAuthLoginHref(context.linker, target?.href)}
        />
    );
}
