import {
    CustomizationContentLink,
    CustomizationHeaderItem,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { GitBookSiteContext } from '@v2/lib/context';
import React from 'react';

import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { Dropdown, DropdownChevron, DropdownMenu, DropdownMenuItem } from './Dropdown';
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

    const renderButton = () => (
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
                'items-center',
            )}
        >
            <span className="sr-only">{label}</span>
            <Icon icon="ellipsis" className={tcls('size-4')} />
            <DropdownChevron />
        </button>
    );

    return (
        <div className={`${styles.linkEllipsis} items-center z-20`}>
            <Dropdown button={renderButton} className="-translate-x-48 md:translate-x-0">
                <DropdownMenu>
                    {links.map((link, index) => (
                        <MoreMenuLink key={index} link={link} context={context} />
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}

async function MoreMenuLink(props: {
    context: GitBookSiteContext;
    link: CustomizationHeaderItem | CustomizationContentLink;
}) {
    const { context, link } = props;

    const target = link.to ? await resolveContentRef(link.to, context) : null;

    return (
        <>
            {'links' in link && link.links.length > 0 && (
                <hr className="first:hidden border-t border-tint my-1 -mx-2" />
            )}
            <DropdownMenuItem
                href={target?.href ?? null}
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
            {'links' in link
                ? link.links.map((subLink, index) => (
                      <MoreMenuLink key={index} {...props} link={subLink} />
                  ))
                : null}
        </>
    );
}
