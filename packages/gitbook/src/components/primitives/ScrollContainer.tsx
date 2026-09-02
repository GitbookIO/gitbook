'use client';

import * as React from 'react';

import { useScrollOverflow } from '../hooks/useScrollOverflow';
import { Button, type ButtonProps } from './Button';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

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

    /** The direction of the scroll container. */
    orientation: 'horizontal' | 'vertical';

    leading?: {
        /** Whether to fade out the leading edge of the container. */
        fade: boolean;
        /** Whether to show a button to scroll back. */
        button: boolean | ButtonProps;
        /** Optional class(es) to apply when there the container can be scrolled on the leading (left or top) edge */
        className?: string;
    };

    trailing?: {
        /** Whether to fade out the trailing edge of the container. */
        fade: boolean;
        /** Whether to show a button to scroll forward. */
        button: boolean | ButtonProps;
        /** Optional class(es) to apply when there the container can be scrolled on the trailing (right or bottom) edge */
        className?: string;
    };

    /** The ID or ref of the active item to scroll to. */
    active?: string | React.RefObject<HTMLElement | null>;

    /** Scroll by one page of fully visible direct children instead of one viewport. */
    scrollByVisibleItems?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function ScrollContainer(props: ScrollContainerProps) {
    const {
        children,
        className,
        contentClassName,
        orientation,
        active,
        scrollByVisibleItems = false,
        leading = { fade: true, button: true },
        trailing = { fade: true, button: true },
        ...rest
    } = props;

    const containerRef = React.useRef<HTMLDivElement>(null);

    const language = useLanguage();

    const { scrollPosition, scrollSize } = useScrollOverflow(orientation, containerRef);

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

        if (scrollByVisibleItems) {
            scrollByItemsInContainer(container, orientation, 'forward');
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

        if (scrollByVisibleItems) {
            scrollByItemsInContainer(container, orientation, 'backward');
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
                'group/scroll-container relative flex shrink grow',
                orientation === 'horizontal' ? 'min-w-0' : 'min-h-0',
                className,
                scrollPosition > 0 ? leading?.className : '',
                scrollPosition < scrollSize ? trailing?.className : ''
            )}
            {...rest}
        >
            {/* Scrollable content */}
            <div
                className={tcls(
                    'flex flex-1 overflow-hidden',
                    orientation === 'horizontal' ? 'min-w-0' : 'min-h-0',
                    orientation === 'horizontal' ? 'no-scrollbar' : 'hide-scrollbar',
                    orientation === 'horizontal' ? 'overflow-x-scroll' : 'flex-col overflow-y-auto',
                    leading.fade && scrollPosition > 0
                        ? orientation === 'horizontal'
                            ? 'mask-l-from-[calc(100%-1rem)]'
                            : 'mask-t-from-[calc(100%-1rem)]'
                        : '',
                    trailing.fade && scrollPosition < scrollSize
                        ? orientation === 'horizontal'
                            ? 'mask-r-from-[calc(100%-1rem)]'
                            : 'mask-b-from-[calc(100%-1rem)]'
                        : '',
                    contentClassName
                )}
                ref={containerRef}
            >
                {children}
            </div>

            {/* Scroll buttons back & forward */}
            {leading.button !== false ? (
                <Button
                    icon={orientation === 'horizontal' ? 'chevron-left' : 'chevron-up'}
                    iconOnly
                    size="xsmall"
                    variant="secondary"
                    tabIndex={-1}
                    onClick={scrollBack}
                    label={tString(language, 'scroll_back')}
                    {...(typeof leading.button === 'object' ? leading.button : {})}
                    className={tcls(
                        'bg-tint-base!',
                        orientation === 'horizontal'
                            ? '-translate-y-1/2! top-1/2 left-0 ml-2'
                            : '-translate-x-1/2! top-0 left-1/2 mt-2',
                        'absolute z-10 not-pointer-none:block hidden scale-0 opacity-0 transition-[scale,opacity]',
                        scrollPosition > 0
                            ? 'not-pointer-none:group-hover/scroll-container:scale-100 not-pointer-none:group-hover/scroll-container:opacity-11'
                            : 'pointer-events-none',
                        typeof leading.button === 'object' ? leading.button.className : ''
                    )}
                />
            ) : null}
            {trailing.button !== false ? (
                <Button
                    icon={orientation === 'horizontal' ? 'chevron-right' : 'chevron-down'}
                    iconOnly
                    size="xsmall"
                    variant="secondary"
                    tabIndex={-1}
                    onClick={scrollFurther}
                    label={tString(language, 'scroll_further')}
                    {...(typeof trailing.button === 'object' ? trailing.button : {})}
                    className={tcls(
                        'bg-tint-base!',
                        orientation === 'horizontal'
                            ? '-translate-y-1/2! top-1/2 right-0 mr-2'
                            : '-translate-x-1/2! bottom-0 left-1/2 mb-2',
                        'absolute z-10 not-pointer-none:block hidden scale-0 transition-[scale,opacity]',
                        scrollPosition < scrollSize
                            ? 'not-pointer-none:group-hover/scroll-container:scale-100 not-pointer-none:group-hover/scroll-container:opacity-11'
                            : 'pointer-events-none',
                        typeof trailing.button === 'object' ? trailing.button.className : ''
                    )}
                />
            ) : null}
        </div>
    );
}

const EDGE_EPSILON = 1;

/**
 * Scroll a direct-child track by the number of items currently visible in the snapport.
 * Scroll padding is excluded from the measurement because it is the carousel's peek area.
 */
export function scrollByItemsInContainer(
    container: HTMLElement,
    orientation: 'horizontal' | 'vertical',
    direction: 'forward' | 'backward'
) {
    const children = Array.from(container.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement
    );
    const bounds = getScrollBounds(container, orientation);
    const items = children
        .map((element, index) => ({ element, index, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => {
            const size = orientation === 'horizontal' ? rect.width : rect.height;
            return size > 0;
        })
        .map((item, index) => ({ ...item, index }));
    const visibleItems = items.filter(({ rect }) => {
        const start = orientation === 'horizontal' ? rect.left : rect.top;
        const end = orientation === 'horizontal' ? rect.right : rect.bottom;
        return start >= bounds.start - EDGE_EPSILON && end <= bounds.end + EDGE_EPSILON;
    });

    // A track narrower than its viewport, or one whose children have not laid out yet, should
    // retain the regular viewport behavior rather than getting stuck at its current position.
    if (visibleItems.length === 0) {
        scrollByViewport(container, orientation, direction);
        return;
    }

    const pageSize = visibleItems.length;
    const firstVisibleItem = visibleItems[0];
    const lastVisibleItem = visibleItems[visibleItems.length - 1];
    if (!firstVisibleItem || !lastVisibleItem) {
        scrollByViewport(container, orientation, direction);
        return;
    }
    const targetIndex =
        direction === 'forward' ? lastVisibleItem.index + 1 : firstVisibleItem.index - pageSize;
    const maxScroll = getMaxScroll(container, orientation);

    if (targetIndex < 0) {
        scrollToPosition(container, orientation, 0);
        return;
    }

    const target = items.find((item) => item.index === targetIndex);
    if (!target) {
        scrollToPosition(container, orientation, maxScroll);
        return;
    }

    const targetStart = orientation === 'horizontal' ? target.rect.left : target.rect.top;
    const targetPosition =
        (orientation === 'horizontal' ? container.scrollLeft : container.scrollTop) +
        targetStart -
        bounds.start;

    scrollToPosition(container, orientation, Math.min(Math.max(targetPosition, 0), maxScroll));
}

function getScrollBounds(container: HTMLElement, orientation: 'horizontal' | 'vertical') {
    const rect = container.getBoundingClientRect();
    const computedStyle = typeof window !== 'undefined' ? window.getComputedStyle(container) : null;
    const leadingPadding = Number.parseFloat(
        computedStyle?.[orientation === 'horizontal' ? 'scrollPaddingLeft' : 'scrollPaddingTop'] ??
            ''
    );
    const trailingPadding = Number.parseFloat(
        computedStyle?.[
            orientation === 'horizontal' ? 'scrollPaddingRight' : 'scrollPaddingBottom'
        ] ?? ''
    );
    const start = orientation === 'horizontal' ? rect.left : rect.top;
    const end = orientation === 'horizontal' ? rect.right : rect.bottom;

    return {
        start: start + (Number.isFinite(leadingPadding) ? leadingPadding : 0),
        end: end - (Number.isFinite(trailingPadding) ? trailingPadding : 0),
    };
}

function getMaxScroll(container: HTMLElement, orientation: 'horizontal' | 'vertical') {
    return Math.max(
        orientation === 'horizontal'
            ? container.scrollWidth - container.clientWidth
            : container.scrollHeight - container.clientHeight,
        0
    );
}

function scrollToPosition(
    container: HTMLElement,
    orientation: 'horizontal' | 'vertical',
    position: number
) {
    container.scrollTo({
        top: orientation === 'vertical' ? position : undefined,
        left: orientation === 'horizontal' ? position : undefined,
        behavior: 'smooth',
    });
}

function scrollByViewport(
    container: HTMLElement,
    orientation: 'horizontal' | 'vertical',
    direction: 'forward' | 'backward'
) {
    const position = orientation === 'horizontal' ? container.scrollLeft : container.scrollTop;
    const distance = orientation === 'horizontal' ? container.clientWidth : container.clientHeight;
    const maxScroll = getMaxScroll(container, orientation);
    const target = Math.min(
        Math.max(position + (direction === 'forward' ? distance : -distance), 0),
        maxScroll
    );

    scrollToPosition(container, orientation, target);
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
        // Use 'auto' to avoid additional scroll animations when scrolling to an element
        // as this may be called during layout/initialization when the page is not fully loaded.
        behavior: 'auto',
    });
}
