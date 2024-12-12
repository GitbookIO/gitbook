import {
    CustomizationContentLink,
    CustomizationHeaderItem,
    CustomizationHeaderPreset,
    CustomizationSettings,
    SiteCustomizationSettings,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import React from 'react';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { Dropdown, DropdownMenu, DropdownMenuItem } from './Dropdown';
import styles from './headerLinks.module.css';

/**
 * Dropdown menu for header links hidden at small screen size.
 */
export function HeaderLinkMore(props: {
    label: React.ReactNode;
    links: CustomizationHeaderItem[];
    context: ContentRefContext;
    customization: CustomizationSettings | SiteCustomizationSettings;
}) {
    const { label, links, context, customization } = props;

    const isCustomizationDefault =
        customization.header.preset === CustomizationHeaderPreset.Default;

    const renderButton = () => (
        <button
            className={tcls(
                'px-1',
                !isCustomizationDefault
                    ? ['text-header-link-500']
                    : ['text-dark/8', 'dark:text-light/8', 'dark:hover:text-light'],
                'hover:text-header-link-400',
            )}
        >
            <span className="sr-only">{label}</span>
            <Icon icon="ellipsis" className={tcls('opacity-6', 'size-3', 'ms-1')} />
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
    context: ContentRefContext;
    link: CustomizationHeaderItem | CustomizationContentLink;
}) {
    const { context, link } = props;

    const target = link.to ? await resolveContentRef(link.to, context) : null;

    return (
        <>
            {'links' in link && link.links.length > 0 && (
                <hr className="first:hidden border-t border-light-3 dark:border-dark-3 my-1 -mx-2" />
            )}
            <DropdownMenuItem href={target?.href ?? null}>{link.title}</DropdownMenuItem>
            {'links' in link
                ? link.links.map((subLink, index) => (
                      <MoreMenuLink key={index} {...props} link={subLink} />
                  ))
                : null}
        </>
    );
}
