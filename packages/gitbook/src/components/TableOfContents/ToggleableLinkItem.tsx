'use client';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useCurrentPagePath } from '../hooks';
import { Button, Link, type LinkInsightsProps, type LinkProps, ToggleChevron } from '../primitives';
import { useTOCGroupState } from './useTOCGroupState';

/**
 * Client component for a page document to toggle its children and be marked as active.
 */
export function ToggleableLinkItem(
    props: {
        id: string;
        href: string;
        pathnames: string[];
        children: React.ReactNode;
        descendants: React.ReactNode;
        icon?: React.ReactNode;
        tag?: React.ReactNode;
    } & LinkInsightsProps
) {
    const { id, href, children, descendants, pathnames, insights, icon, tag } = props;

    const currentPagePath = useCurrentPagePath();
    const isActive = pathnames.some((pathname) => pathname === currentPagePath);
    // Auto-expand to reveal the active page; the store keeps this open across navigations and
    // remembers the visitor's own toggles instead of re-deriving (and flickering) on every remount.
    const defaultIsOpen =
        isActive || pathnames.some((pathname) => currentPagePath.startsWith(`${pathname}/`));
    const [isOpen, setIsOpen] = useTOCGroupState(id, defaultIsOpen);

    if (!descendants) {
        return (
            <LinkItem href={href} insights={insights} isActive={isActive}>
                {icon}
                {tag ? (
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        {children}
                        <div className="flex shrink-0 items-center">{tag}</div>
                    </div>
                ) : (
                    children
                )}
            </LinkItem>
        );
    }

    return (
        <DescendantsRenderer
            descendants={descendants}
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
        >
            {({ descendants, toggler }) => (
                <>
                    <LinkItem
                        href={href}
                        insights={insights}
                        isActive={isActive}
                        onActiveClick={() => setIsOpen(!isOpen)}
                    >
                        {icon}
                        {tag ? (
                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                {children}
                                <div className="flex shrink-0 items-center">
                                    {tag}
                                    {toggler}
                                </div>
                            </div>
                        ) : (
                            <>
                                {children}
                                {toggler}
                            </>
                        )}
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

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (isActive && onActiveClick) {
            event.preventDefault();
            onActiveClick();
        }
    };

    return (
        <Link
            data-active={isActive}
            href={href}
            insights={insights}
            aria-current={isActive ? 'page' : undefined}
            classNames={[
                'ToCLinkItemStyles',
                ...(isActive ? ['ToCLinkItemActiveStyles' as const] : []),
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
    onToggle: () => void;
    children: (renderProps: {
        descendants: React.ReactNode;
        toggler: React.ReactNode;
    }) => React.ReactNode;
}) {
    const { descendants, isOpen, onToggle } = props;

    return props.children({
        toggler: <Toggler isLinkActive={isOpen} isOpen={isOpen} onToggle={onToggle} />,
        descendants: <Descendants isVisible={isOpen}>{descendants}</Descendants>,
    });
}

function Toggler(props: {
    isLinkActive: boolean;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const { isOpen, onToggle } = props;
    return (
        <Button
            icon={
                <ToggleChevron
                    open={isOpen}
                    orientation="right-to-down"
                    className="m-0! size-3! opacity-6 group-hover:opacity-11"
                />
            }
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggle();
            }}
            label={undefined}
            size="xsmall"
            iconOnly
            variant="blank"
            aria-hidden="true" // The button has no label or focus so hiding it from screen readers.
            className="-my-0.5 ml-auto min-h-6 min-w-6 text-current hover:bg-tint-base"
            tabIndex={-1} // Prevent focus on the button since it's already inside a clickable link that performs the same toggle action.
        />
    );
}

const show = {
    opacity: 1,
    height: 'auto',
};
const hide = {
    opacity: 0,
    height: 0,
};

function Descendants(props: {
    isVisible: boolean;
    children: React.ReactNode;
}) {
    const { isVisible, children } = props;
    // `initial={false}` renders an already-open group without replaying the expand animation on
    // mount: the layout remounts on navigation, and animating every time looked like the sidebar
    // flickering. Visitor-initiated toggles still animate since they happen after mount.
    return (
        <AnimatePresence initial={false}>
            {isVisible ? (
                <motion.div
                    initial={hide}
                    animate={show}
                    exit={hide}
                    className="flex flex-col overflow-hidden"
                >
                    {children}
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
