import { CustomizationHeaderLink } from '@gitbook/api';
import React from 'react';

import { ContentRefContext, resolveContentRef } from '@/lib/references';

import { Dropdown, DropdownChevron, DropdownMenu, DropdownMenuItem } from './Dropdown';
import styles from './headerLinks.module.css';

/**
 * Dropdown menu for header links hidden at small screen size.
 */
export function HeaderLinkMore(props: {
    label: React.ReactNode;
    links: CustomizationHeaderLink[];
    context: ContentRefContext;
}) {
    const { label, links, context } = props;

    const renderButton = () => (
        <button className="px-1">
            <span className="sr-only">{label}</span>
            <DropdownChevron />
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
