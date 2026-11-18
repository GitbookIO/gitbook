import React from 'react';

import { Icon } from '@gitbook/icons';

import { Tooltip } from '../primitives';
import { getPageResultPresentation } from './getPageResultHref';
import { HighlightQuery } from './HighlightQuery';
import type { ComputedPageResult } from './search-types';
import { SearchResultItem } from './SearchResultItem';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

export const SearchPageResultItem = React.forwardRef(function SearchPageResultItem(
    props: {
        query: string;
        item: ComputedPageResult;
        active: boolean;
        style?: React.CSSProperties;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active, style, ...rest } = props;
    const language = useLanguage();

    const { preview: bestSection, description, href } = getPageResultPresentation(item);
    const preview = bestSection
        ? [bestSection.title, bestSection.body].filter(Boolean).join(' · ')
        : undefined;

    const insights = {
        type: 'search_open_result' as const,
        query,
        result: {
            pageId: item.pageId,
            spaceId: item.spaceId,
        },
    };

    return (
        <SearchResultItem
            ref={ref}
            href={href}
            active={active}
            data-testid="search-page-result"
            action={tString(language, 'view')}
            insights={insights}
            aria-label={tString(language, 'search_page_result_title', item.title)}
            style={{
                ...style,
            }}
            {...rest}
        >
            <Breadcrumbs breadcrumbs={item.breadcrumbs} />
            <p className="line-clamp-1 font-heading text-base font-semibold leading-snug text-tint-strong">
                <HighlightQuery query={query} text={item.title} />
            </p>
            <div
                className={tcls(
                    'relative h-5 w-full transition-[height] duration-300',
                    !preview && !description ? 'h-0' : ''
                )}
                style={{ transitionDelay: style?.animationDelay }}
            >
                {preview ? (
                    <p
                        className="animate-blur-in absolute inset-0 line-clamp-1 origin-left text-sm"
                        style={{ animationDelay: style?.animationDelay }}
                    >
                        <HighlightQuery query={query} text={preview} />
                    </p>
                ) : null}

                {description ? (
                    <p
                        className={tcls(
                            'absolute inset-0 line-clamp-1 origin-left text-sm',
                            preview ? 'hidden animate-blur-out' : ''
                        )}
                        style={{ animationDelay: style?.animationDelay }}
                    >
                        <HighlightQuery query={query} text={description} />
                    </p>
                ) : null}
            </div>
        </SearchResultItem>
    );
});

/** Widest a single crumb gets, so one long title can't collapse the rest by itself. */
const CRUMB_MAX_WIDTH = 200;

/**
 * One line of breadcrumbs that shows the whole path when it fits. When it doesn't, the levels next
 * to the root fold into a "⋯" in second place, moving toward the result until the line fits; the
 * last crumb is cut short only once everything between is folded. The folded levels show on a
 * deliberate hover only, so moving the mouse across results doesn't pop them up.
 */
const Breadcrumbs = (props: { breadcrumbs: ComputedPageResult['breadcrumbs'] }) => {
    const { breadcrumbs = [] } = props;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const measureRef = React.useRef<HTMLDivElement>(null);
    const [folded, setFolded] = React.useState(0);
    const labelsKey = breadcrumbs.map((crumb) => crumb.label).join('\n');

    React.useLayoutEffect(() => {
        const container = containerRef.current;
        const measure = measureRef.current;
        if (!container || !measure || !labelsKey) {
            return;
        }
        const update = () => {
            const widths = Array.from(measure.children, (element) =>
                Math.min(element.getBoundingClientRect().width, CRUMB_MAX_WIDTH)
            );
            const ellipsisWidth = widths.pop() ?? 0;
            const separatorWidth =
                (widths.pop() ?? 0) + 2 * Number.parseFloat(getComputedStyle(container).columnGap);
            setFolded(
                countFoldedCrumbs(widths, container.clientWidth, separatorWidth, ellipsisWidth)
            );
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(container);
        return () => observer.disconnect();
    }, [labelsKey]);

    const first = breadcrumbs[0];
    if (!first) return null;

    const hidden = breadcrumbs.slice(1, 1 + folded);
    const shown = breadcrumbs.slice(1 + folded);
    const separator = <Icon icon="chevron-right" className="size-2 shrink-0" />;
    const textClassName = 'text-xs font-normal whitespace-nowrap';

    return (
        <div
            ref={containerRef}
            className={tcls(
                'relative flex min-w-0 items-center gap-x-2 overflow-hidden text-tint/7 transition-colors group-[.is-active]:text-tint contrast-more:text-tint',
                textClassName
            )}
        >
            <div
                ref={measureRef}
                aria-hidden
                className="invisible absolute left-0 top-0 flex items-center"
            >
                {breadcrumbs.map((crumb, index) => (
                    <span key={index}>{crumb.label}</span>
                ))}
                {separator}
                <Icon icon="ellipsis" className="size-3" />
            </div>
            <CrumbLabel label={first.label} className="shrink-0" />
            {hidden.length > 0 ? (
                <>
                    {separator}
                    <Tooltip
                        delay={1000}
                        label={
                            <span className="flex flex-col py-0.5">
                                {hidden.map((crumb, index) => (
                                    <span key={index}>{crumb.label}</span>
                                ))}
                            </span>
                        }
                    >
                        <span className="flex shrink-0 items-center">
                            <Icon icon="ellipsis" className="size-3" />
                            <span className="sr-only">
                                {hidden.map((crumb) => crumb.label).join(' › ')}
                            </span>
                        </span>
                    </Tooltip>
                </>
            ) : null}
            {shown.map((crumb, index) => (
                <React.Fragment key={index}>
                    {separator}
                    <CrumbLabel
                        label={crumb.label}
                        className={index === shown.length - 1 ? 'min-w-[3ch] shrink' : 'shrink-0'}
                    />
                </React.Fragment>
            ))}
        </div>
    );
};

const CrumbLabel = (props: { label: string; className: string }) => {
    const { label, className } = props;
    const ref = React.useRef<HTMLSpanElement>(null);
    const [truncated, setTruncated] = React.useState(false);

    React.useLayoutEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }
        const update = () => setTruncated(element.scrollWidth > element.clientWidth);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <span
            ref={ref}
            className={tcls('max-w-[200px] truncate', className)}
            title={truncated ? label : undefined}
        >
            {label}
        </span>
    );
};

/**
 * How many crumbs after the first to fold into the "⋯" so the line fits `available` pixels. The
 * first and last crumbs never fold; when even folding everything between doesn't fit, the last
 * crumb is cut short instead.
 */
function countFoldedCrumbs(
    widths: number[],
    available: number,
    separatorWidth: number,
    ellipsisWidth: number
): number {
    const foldable = Math.max(widths.length - 2, 0);
    for (let folded = 0; folded <= foldable; folded++) {
        const visible = widths.filter((_, index) => index === 0 || index > folded);
        const items = visible.length + (folded > 0 ? 1 : 0);
        const total =
            visible.reduce((sum, width) => sum + width, 0) +
            (folded > 0 ? ellipsisWidth : 0) +
            (items - 1) * separatorWidth;
        if (total <= available + 0.5) {
            return folded;
        }
    }
    return foldable;
}
