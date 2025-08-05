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
        pathnames: string[];
        children: React.ReactNode;
        descendants: React.ReactNode;
    } & LinkInsightsProps
) {
    const { href, children, descendants, pathnames, insights } = props;

    const currentPagePath = useCurrentPagePath();
    const isActive = pathnames.some((pathname) => pathname === currentPagePath);
    const defaultIsOpen =
        isActive || pathnames.some((pathname) => currentPagePath.startsWith(`${pathname}/`));
    const [isOpen, setIsOpen] = React.useState(defaultIsOpen);
    const hasBeenToggled = useRef(false);

    // Update the visibility of the children if one of the descendants becomes active.
    React.useEffect(() => {
        if (defaultIsOpen && !hasBeenToggled.current) {
            setIsOpen(defaultIsOpen);
        }
    }, [defaultIsOpen]);

    const handleToggle = (newState: boolean | ((prev: boolean) => boolean)) => {
        hasBeenToggled.current = true;
        if (typeof newState === 'function') {
            setIsOpen(newState);
        } else {
            setIsOpen(newState);
        }
    };

    if (!descendants) {
        return (
            <LinkItem href={href} insights={insights} isActive={isActive}>
                {children}
            </LinkItem>
        );
    }

    return (
        <DescendantsRenderer descendants={descendants} isOpen={isOpen} setIsOpen={handleToggle}>
            {({ descendants, toggler }) => (
                <>
                    <LinkItem
                        href={href}
                        insights={insights}
                        isActive={isActive}
                        onActiveClick={() => handleToggle(!isOpen)}
                    >
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
        onActiveClick?: () => void;
    }
) {
    const { isActive, href, insights, children, onActiveClick } = props;
    const anchorRef = useRef<HTMLAnchorElement>(null);
    useScrollToActiveTOCItem({ anchorRef, isActive });

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (isActive && onActiveClick) {
            event.preventDefault();
            onActiveClick();
        }
    };

    return (
        <Link
            ref={anchorRef}
            href={href}
            insights={insights}
            aria-current={isActive ? 'page' : undefined}
            classNames={[
                'ToggleableLinkItemStyles',
                ...(isActive ? ['ToggleableLinkItemActiveStyles' as const] : []),
            ]}
            onClick={handleClick}
        >
            {children}
        </Link>
    );
}

function DescendantsRenderer(props: {
    descendants: React.ReactNode;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    children: (renderProps: {
        descendants: React.ReactNode;
        toggler: React.ReactNode;
    }) => React.ReactNode;
}) {
    const { descendants, isOpen, setIsOpen } = props;

    return props.children({
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
                'straight-corners:rounded-xs',
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
                    'm-1 grid size-3 shrink-0 text-current opacity-6 transition',
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
