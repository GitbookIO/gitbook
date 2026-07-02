'use client';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { PageIcon } from '../PageIcon';
import { StyledLink } from '../primitives';
import { DropdownMenu, DropdownMenuItem } from '../primitives/DropdownMenu';

export type BreadcrumbSibling = {
    id: string;
    title: string;
    href: string;
    emoji?: string;
    icon?: string;
    /** Whether this sibling is the one currently represented by the breadcrumb item. */
    isActive: boolean;
};

/**
 * A breadcrumb item. It navigates on click, and when there is more than one sibling at the same
 * level (another section, variant, group or page) it reveals a dropdown of those siblings on hover
 * so the reader can jump between them.
 *
 * This is a client component so the trigger/menu — which Radix clones through its `Slot` — is built
 * from serializable props, mirroring `HeaderLinkDropdown`.
 */
export function BreadcrumbItemDropdown(props: {
    /** Link for the crumb. Omitted for non-navigable items such as section groups. */
    href?: string;
    label: string;
    emoji?: string;
    icon?: string;
    /** Class names for the breadcrumb link itself. */
    linkClassName: ClassValue;
    /** All items at the same level, including the current one (flagged `isActive`). */
    siblings: BreadcrumbSibling[];
}) {
    const { href, label, emoji, icon, linkClassName, siblings } = props;

    const content = (
        <>
            {emoji || icon ? (
                <PageIcon page={{ emoji, icon }} style="mr-1 inline size-[1em] shrink-0" />
            ) : null}
            {label}
        </>
    );

    // Navigable crumbs render a link; section groups (no href) render a plain label. An empty href
    // is still a real link — it's the site's first page — so key on `undefined`, not falsiness, and
    // normalize "" to "/" the way the table of contents does.
    const trigger =
        href !== undefined ? (
            <StyledLink href={href || '/'} className={tcls(linkClassName)}>
                {content}
            </StyledLink>
        ) : (
            <span className={tcls(linkClassName, 'cursor-default hover:no-underline')}>
                {content}
            </span>
        );

    // No dropdown when there is nowhere else to go at this level.
    if (siblings.length <= 1) {
        return trigger;
    }

    return (
        <DropdownMenu
            openOnHover
            openDelay={200}
            button={trigger}
            className="max-h-72 overflow-auto text-sm"
        >
            {siblings.map((sibling) => (
                <DropdownMenuItem
                    key={sibling.id}
                    href={sibling.href || '/'}
                    active={sibling.isActive}
                    leadingIcon={
                        sibling.emoji || sibling.icon ? (
                            <PageIcon
                                page={{ emoji: sibling.emoji, icon: sibling.icon }}
                                style="size-3 shrink-0 text-tint-subtle"
                            />
                        ) : undefined
                    }
                >
                    {sibling.title}
                </DropdownMenuItem>
            ))}
        </DropdownMenu>
    );
}
