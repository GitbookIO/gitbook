'use client';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import * as React from 'react';
import { useScrollListener } from '../hooks/useScrollListener';
import { Button } from './Button';

/**
 * A container that encapsulates a scrollable area with usability features.
 * - Faded edges when there is more content than the container can display.
 * - Buttons to advance the scroll position.
 * - Auto-scroll to the active item when it's initially active.
 */
export type ScrollContainerProps = {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;

    /** Optional class(es) to apply when there the container can be scrolled on the leading (left or top) edge */
    leadingEdgeScrollClassName?: string;

    /** Optional class(es) to apply when there the container can be scrolled on the trailing (right or bottom) edge */
    trailingEdgeScrollClassName?: string;

    /** The direction of the scroll container. */
    orientation: 'horizontal' | 'vertical';

    /** Whether to fade out the edges of the container. */
    fadeEdges?: ('leading' | 'trailing')[];

    /** The ID or ref of the active item to scroll to. */
    active?: string | React.RefObject<HTMLElement | null>;
} & React.HTMLAttributes<HTMLDivElement>;

export function ScrollContainer(props: ScrollContainerProps) {
    const {
        children,
        className,
        contentClassName,
        orientation,
        fadeEdges = ['leading', 'trailing'],
        active,
        leadingEdgeScrollClassName,
        trailingEdgeScrollClassName,
        ...rest
    } = props;

    const containerRef = React.useRef<HTMLDivElement>(null);

    const [scrollPosition, setScrollPosition] = React.useState(0);
    const [scrollSize, setScrollSize] = React.useState(0);

    const language = useLanguage();

    useScrollListener(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        setScrollSize(
            orientation === 'horizontal'
                ? container.scrollWidth - container.clientWidth - 1
                : container.scrollHeight - container.clientHeight - 1
        );

        setScrollPosition(
            orientation === 'horizontal' ? container.scrollLeft : container.scrollTop
        );
    }, containerRef);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        // Update max scroll position using resize observer
        const ro = new ResizeObserver((entries) => {
            const [entry] = entries;
            if (entry) {
                setScrollSize(
                    orientation === 'horizontal'
                        ? entry.target.scrollWidth - entry.target.clientWidth - 1
                        : entry.target.scrollHeight - entry.target.clientHeight - 1
                );
            }
        });

        ro.observe(container);

        return () => ro.disconnect();
    }, [orientation]);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        if (!active) {
            return;
        }
        const activeItem =
            typeof active === 'string'
                ? containerRef.current?.querySelector(active)
                : active.current;
        if (!activeItem || !container.contains(activeItem)) {
            return;
        }
        scrollToElementInContainer(activeItem, container);
    }, [active]);

    const scrollFurther = () => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        container.scrollTo({
            top: orientation === 'vertical' ? scrollPosition + container.clientHeight : undefined,
            left: orientation === 'horizontal' ? scrollPosition + container.clientWidth : undefined,
            behavior: 'smooth',
        });
    };

    const scrollBack = () => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        container.scrollTo({
            top: orientation === 'vertical' ? scrollPosition - container.clientHeight : undefined,
            left: orientation === 'horizontal' ? scrollPosition - container.clientWidth : undefined,
            behavior: 'smooth',
        });
    };

    return (
        <div
            className={tcls(
                'group/scroll-container relative flex overflow-hidden',
                className,
                scrollPosition > 0 ? leadingEdgeScrollClassName : '',
                scrollPosition < scrollSize ? trailingEdgeScrollClassName : ''
            )}
            {...rest}
        >
            {/* Scrollable content */}
            <div
                className={tcls(
                    'flex shrink grow',
                    orientation === 'horizontal' ? 'no-scrollbar' : 'hide-scrollbar',
                    orientation === 'horizontal' ? 'overflow-x-scroll' : 'flex-col overflow-y-auto',
                    fadeEdges.includes('leading') && scrollPosition > 0
                        ? orientation === 'horizontal'
                            ? 'mask-l-from-[calc(100%-2rem)]'
                            : 'mask-t-from-[calc(100%-2rem)]'
                        : '',
                    fadeEdges.includes('trailing') && scrollPosition < scrollSize
                        ? orientation === 'horizontal'
                            ? 'mask-r-from-[calc(100%-2rem)]'
                            : 'mask-b-from-[calc(100%-2rem)]'
                        : '',
                    contentClassName
                )}
                ref={containerRef}
            >
                {children}
            </div>

            {/* Scroll buttons back & forward */}
            <Button
                icon={orientation === 'horizontal' ? 'chevron-left' : 'chevron-up'}
                iconOnly
                size="xsmall"
                variant="secondary"
                tabIndex={-1}
                className={tcls(
                    'bg-tint-base!',
                    orientation === 'horizontal'
                        ? '-translate-y-1/2! top-1/2 left-0 ml-2'
                        : '-translate-x-1/2! top-0 left-1/2 mt-2',
                    'absolute z-10 not-pointer-none:block hidden scale-0 opacity-0 transition-[scale,opacity]',
                    scrollPosition > 0
                        ? 'not-pointer-none:group-hover/scroll-container:scale-100 not-pointer-none:group-hover/scroll-container:opacity-11'
                        : 'pointer-events-none'
                )}
                onClick={scrollBack}
                label={tString(language, 'scroll_back')}
            />
            <Button
                icon={orientation === 'horizontal' ? 'chevron-right' : 'chevron-down'}
                iconOnly
                size="xsmall"
                variant="secondary"
                tabIndex={-1}
                className={tcls(
                    'bg-tint-base!',
                    orientation === 'horizontal'
                        ? '-translate-y-1/2! top-1/2 right-0 mr-2'
                        : '-translate-x-1/2! bottom-0 left-1/2 mb-2',
                    'absolute z-10 not-pointer-none:block hidden scale-0 transition-[scale,opacity]',
                    scrollPosition < scrollSize
                        ? 'not-pointer-none:group-hover/scroll-container:scale-100 not-pointer-none:group-hover/scroll-container:opacity-11'
                        : 'pointer-events-none'
                )}
                onClick={scrollFurther}
                label={tString(language, 'scroll_further')}
            />
        </div>
    );
}

/**
 * Scroll to an element in a container.
 */
function scrollToElementInContainer(element: Element, container: HTMLElement) {
    const containerRect = container.getBoundingClientRect();
    const rect = element.getBoundingClientRect();

    return container.scrollTo({
        top:
            container.scrollTop +
            (rect.top - containerRect.top) -
            container.clientHeight / 2 +
            rect.height / 2,
        left:
            container.scrollLeft +
            (rect.left - containerRect.left) -
            container.clientWidth / 2 +
            rect.width / 2,
        behavior: 'auto',
    });
}
