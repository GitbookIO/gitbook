'use client';

import { Icon } from '@gitbook/icons';
import { motion } from 'framer-motion';
import React, { useRef } from 'react';

import { tcls } from '@/lib/tailwind';

import { useCurrentPagePath } from '../hooks';
import { Link, type LinkInsightsProps, type LinkProps } from '../primitives';
import { useScrollToActiveTOCItem } from './TOCScroller';

/**
 * Client component for a page document to toggle its children and be marked as active.
 */
export function ToggleableLinkItem(
    props: {
        href: string;
        pathname: string;
        children: React.ReactNode;
        descendants: React.ReactNode;
    } & LinkInsightsProps
) {
    const { href, children, descendants, pathname, insights } = props;

    const currentPagePath = useCurrentPagePath();
    const isActive = currentPagePath === pathname;

    if (!descendants) {
        return (
            <LinkItem href={href} insights={insights} isActive={isActive}>
                {children}
            </LinkItem>
        );
    }

    return (
        <DescendantsRenderer
            descendants={descendants}
            defaultIsOpen={isActive || currentPagePath.startsWith(`${pathname}/`)}
        >
            {({ descendants, toggler }) => (
                <>
                    <LinkItem href={href} insights={insights} isActive={isActive}>
                        {children}
                        {toggler}
                    </LinkItem>
                    {descendants}
                </>
            )}
        </DescendantsRenderer>
    );
}

function LinkItem(
    props: Pick<LinkProps, 'href' | 'insights' | 'children'> & {
        isActive: boolean;
    }
) {
    const { isActive, href, insights, children } = props;
    const anchorRef = useRef<HTMLAnchorElement>(null);
    useScrollToActiveTOCItem({ anchorRef, isActive });
    return (
        <Link
            ref={anchorRef}
            href={href}
            insights={insights}
            aria-current={isActive ? 'page' : undefined}
            className={tcls(
                'group/toclink relative transition-colors',
                'flex flex-row justify-between',
                'rounded-md straight-corners:rounded-none p-1.5 pl-3',
                'text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong',
                'hover:contrast-more:text-tint-strong hover:contrast-more:ring-1 hover:contrast-more:ring-tint-12',
                'before:contents[] before:-left-px before:absolute before:inset-y-0',
                'sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px sidebar-list-default:[&+div_a]:rounded-l-none [&+div_a]:pl-5 sidebar-list-default:[&+div_a]:before:w-px',

                isActive && [
                    'font-semibold',
                    'sidebar-list-line:before:w-0.5',

                    'before:bg-primary-solid',
                    'text-primary-subtle',
                    'contrast-more:text-primary',

                    'sidebar-list-pill:bg-primary',
                    '[html.sidebar-list-pill.theme-muted_&]:bg-primary-hover',
                    '[html.sidebar-list-pill.theme-bold.tint_&]:bg-primary-hover',
                    '[html.sidebar-filled.sidebar-list-pill.theme-muted_&]:bg-primary',
                    '[html.sidebar-filled.sidebar-list-pill.theme-bold.tint_&]:bg-primary',

                    'hover:bg-primary-hover',
                    'hover:text-primary',
                    'hover:before:bg-primary-solid-hover',
                    'sidebar-list-pill:hover:bg-primary-hover',

                    'contrast-more:text-primary',
                    'contrast-more:hover:text-primary-strong',
                    'contrast-more:bg-primary',
                    'contrast-more:ring-1',
                    'contrast-more:ring-primary',
                    'contrast-more:hover:ring-primary-hover',
                ]
            )}
        >
            {children}
        </Link>
    );
}

function DescendantsRenderer(props: {
    defaultIsOpen: boolean;
    descendants: React.ReactNode;
    children: (renderProps: {
        descendants: React.ReactNode;
        toggler: React.ReactNode;
    }) => React.ReactNode;
}) {
    const { defaultIsOpen, children, descendants } = props;
    const [isOpen, setIsOpen] = React.useState(defaultIsOpen);

    // Update the visibility of the children if one of the descendants becomes active.
    React.useEffect(() => {
        if (defaultIsOpen) {
            setIsOpen(defaultIsOpen);
        }
    }, [defaultIsOpen]);

    return children({
        toggler: (
            <Toggler
                isLinkActive={isOpen}
                isOpen={isOpen}
                onToggle={() => {
                    setIsOpen((prev) => !prev);
                }}
            />
        ),
        descendants: <Descendants isVisible={isOpen}>{descendants}</Descendants>,
    });
}

function Toggler(props: {
    isLinkActive: boolean;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const { isLinkActive, isOpen, onToggle } = props;
    return (
        <span
            className={tcls(
                'group',
                'relative',
                'rounded-full',
                'straight-corners:rounded-sm',
                'w-5',
                'h-5',
                'after:grid-area-1-1',
                'after:absolute',
                'after:-top-1',
                'after:grid',
                'after:-left-1',
                'after:w-7',
                'after:h-7',
                'hover:bg-tint-active',
                'hover:text-current',
                isLinkActive && 'hover:bg-tint-hover'
            )}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggle();
            }}
        >
            <Icon
                icon="chevron-right"
                className={tcls(
                    'm-1 grid size-3 flex-shrink-0 text-current opacity-6 transition',
                    'group-hover:opacity-11 contrast-more:opacity-11',
                    isOpen ? 'rotate-90' : 'rotate-0'
                )}
            />
        </span>
    );
}

const show = {
    opacity: 1,
    height: 'auto',
};
const hide = {
    opacity: 0,
    height: 0,
    transitionEnd: {
        display: 'none',
    },
};

function Descendants(props: {
    isVisible: boolean;
    children: React.ReactNode;
}) {
    const { isVisible, children } = props;
    return (
        <motion.div
            className="overflow-hidden"
            animate={isVisible ? show : hide}
            initial={isVisible ? show : hide}
        >
            {children}
        </motion.div>
    );
}
