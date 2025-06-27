import type { GitBookSiteContext } from '@/lib/context';
import {
    type CustomizationContentLink,
    type CustomizationHeaderItem,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import type React from 'react';

import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import {
    DropdownChevron,
    DropdownMenu,
    DropdownMenuItem,
    DropdownSubMenu,
} from '../primitives/DropdownMenu';
import styles from './headerLinks.module.css';

/**
 * Dropdown menu for header links hidden at small screen size.
 */
export function HeaderLinkMore(props: {
    label: React.ReactNode;
    links: CustomizationHeaderItem[];
    context: GitBookSiteContext;
}) {
    const { label, links, context } = props;

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
            <DropdownChevron />
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

    return 'links' in link && link.links.length > 0 ? (
        <DropdownSubMenu label={link.title}>
            {link.links.map((subLink, index) => {
                return <MoreMenuLink key={index} {...props} link={subLink} />;
            })}
        </DropdownSubMenu>
    ) : (
        <DropdownMenuItem
            href={target?.href}
            insights={
                link.to
                    ? {
                          type: 'link_click',
                          link: {
                              target: link.to,
                              position: SiteInsightsLinkPosition.Header,
                          },
                      }
                    : undefined
            }
        >
            {link.title}
        </DropdownMenuItem>
    );
}
