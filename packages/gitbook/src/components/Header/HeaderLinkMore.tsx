import {
    CustomizationHeaderLink,
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
    links: CustomizationHeaderLink[];
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
        <div className={`${styles.linkEllipsis} items-center`}>
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

async function MoreMenuLink(props: { context: ContentRefContext; link: CustomizationHeaderLink }) {
    const { context, link } = props;

    const target = await resolveContentRef(link.to, context);

    if (!target) {
        return null;
    }

    return <DropdownMenuItem href={target.href}>{link.title}</DropdownMenuItem>;
}
