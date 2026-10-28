'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import type { RevisionTag } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { TagIcon } from '../Tag';
import { Button } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import {
    UPDATES_FILTER_KEY_ATTR,
    UPDATES_FILTER_SEARCH_PARAM,
    UPDATES_TAG_ATTR,
    UPDATES_TAG_CHIP_SELECTED_ATTR,
    UPDATES_TAG_CHIP_UNSELECTED_DIMMED_ATTR,
    UPDATES_TAG_CHIP_UNSELECTED_PLAIN_ATTR,
    UPDATES_TAG_CLEAR_ATTR,
    UPDATES_TAG_FILTER_ATTR,
    normalizeUpdatesFilterTags,
    updatesFilterStyleKey,
} from '@/lib/updates';

type UpdatesFilterContextValue = {
    selectedTags: string[];
    selectedTagSet: Set<string>;
    toggleTag: (tag: string) => void;
    clearTags: () => void;
};

const emptyUpdatesFilterContext: UpdatesFilterContextValue = {
    selectedTags: [],
    selectedTagSet: new Set(),
    toggleTag: () => {},
    clearTags: () => {},
};

const UpdatesFilterContext = React.createContext<UpdatesFilterContextValue | null>(null);

export function UpdatesFilterProvider(props: { tagSlugs: string[]; children: React.ReactNode }) {
    const { tagSlugs, children } = props;
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const availableTags = React.useMemo(() => new Set(tagSlugs), [tagSlugs]);

    const sanitizeTags = React.useCallback(
        (tags: string[]) => normalizeUpdatesFilterTags(tags, availableTags),
        [availableTags]
    );

    const rawSelectedTags = React.useMemo(
        () => searchParams?.getAll(UPDATES_FILTER_SEARCH_PARAM) ?? [],
        [searchParams]
    );

    const urlSelectedTags = React.useMemo(
        () => sanitizeTags(rawSelectedTags),
        [sanitizeTags, rawSelectedTags]
    );
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
    const selectedTagsRef = React.useRef(selectedTags);
    const styleKey = React.useMemo(() => updatesFilterStyleKey(tagSlugs), [tagSlugs]);

    // Clean up on unmount so a nav to a page with no filterable updates doesn't leave a stale
    // stylesheet hiding everything (see UPDATES_FILTER_KEY_ATTR).
    React.useLayoutEffect(() => {
        document.documentElement.setAttribute(UPDATES_FILTER_KEY_ATTR, styleKey);

        return () => {
            document.documentElement.removeAttribute(UPDATES_FILTER_KEY_ATTR);
            document.documentElement.removeAttribute(UPDATES_TAG_FILTER_ATTR);
        };
    }, [styleKey]);

    const replaceTags = React.useCallback(
        (nextTags: string[]) => {
            const params = new URLSearchParams(searchParams?.toString());
            params.delete(UPDATES_FILTER_SEARCH_PARAM);

            for (const tag of sanitizeTags(nextTags)) {
                params.append(UPDATES_FILTER_SEARCH_PARAM, tag);
            }

            const query = params.toString();
            const hash = typeof window === 'undefined' ? '' : window.location.hash;
            router.replace(`${pathname}${query ? `?${query}` : ''}${hash}`, { scroll: false });
        },
        [pathname, router, sanitizeTags, searchParams]
    );

    React.useEffect(() => {
        if (!areTagsEqual(rawSelectedTags, urlSelectedTags)) {
            replaceTags(urlSelectedTags);
        }
    }, [rawSelectedTags, replaceTags, urlSelectedTags]);

    // Layout effect so the filter attribute is applied before paint, avoiding a flash in the chip UI.
    React.useLayoutEffect(() => {
        applyTagFilterAttribute(urlSelectedTags);

        if (areTagsEqual(selectedTagsRef.current, urlSelectedTags)) {
            return;
        }

        selectedTagsRef.current = urlSelectedTags;
        setSelectedTags(urlSelectedTags);
    }, [urlSelectedTags]);

    // Keep tag clicks responsive while the URL update from router.replace is still pending.
    const updateSelectedTags = React.useCallback(
        (getNextTags: (currentTags: string[]) => string[]) => {
            const nextTags = sanitizeTags(getNextTags(selectedTagsRef.current));

            selectedTagsRef.current = nextTags;
            setSelectedTags(nextTags);
            applyTagFilterAttribute(nextTags);
            replaceTags(nextTags);
        },
        [replaceTags, sanitizeTags]
    );

    const toggleTag = React.useCallback(
        (tag: string) => {
            if (!availableTags.has(tag)) {
                return;
            }

            updateSelectedTags((currentTags) =>
                currentTags.includes(tag)
                    ? currentTags.filter((currentTag) => currentTag !== tag)
                    : [...currentTags, tag]
            );
        },
        [availableTags, updateSelectedTags]
    );

    const clearTags = React.useCallback(() => {
        updateSelectedTags(() => []);
    }, [updateSelectedTags]);

    const selectedTagSet = React.useMemo(() => new Set(selectedTags), [selectedTags]);
    const value = React.useMemo(
        () => ({
            selectedTags,
            selectedTagSet,
            toggleTag,
            clearTags,
        }),
        [selectedTags, selectedTagSet, toggleTag, clearTags]
    );

    return <UpdatesFilterContext.Provider value={value}>{children}</UpdatesFilterContext.Provider>;
}

export function useUpdatesFilter(): UpdatesFilterContextValue {
    return React.useContext(UpdatesFilterContext) ?? emptyUpdatesFilterContext;
}

export function UpdatesTagFilters(props: {
    tags: RevisionTag[];
    tagsLabel: string;
    clearLabel: string;
}) {
    const { tags, tagsLabel, clearLabel } = props;
    const { toggleTag, clearTags } = useUpdatesFilter();

    if (tags.length === 0) {
        return null;
    }

    return (
        <div className="shrink-0 border-b border-tint-subtle pb-4 pt-px">
            <div className="mb-3 ml-3 flex items-center justify-between gap-2">
                <div className="leading-wider flex items-center gap-1 text-xs font-semibold uppercase text-tint">
                    <Icon icon="tags" className="size-3" />
                    {tagsLabel}
                </div>
                {/* Visible/clickable only while a filter is active — see generateUpdatesFilterCSS. */}
                <Button
                    variant="blank"
                    size="xsmall"
                    icon="xmark"
                    label={clearLabel}
                    onClick={clearTags}
                    {...{ [UPDATES_TAG_CLEAR_ATTR]: '' }}
                    className="pointer-events-none invisible text-xs"
                />
            </div>
            <div className="flex flex-wrap gap-1.5 px-3">
                {tags.map((tag) => (
                    <TagChip key={tag.slug} tag={tag} onToggle={toggleTag} />
                ))}
            </div>
        </div>
    );
}

const CHIP_CLASS =
    'inline-flex max-w-full rounded-full circular-corners:rounded-2xl straight-corners:rounded-xs not-focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary';

const CHIP_VARIANT_CLASS =
    'max-w-full items-center gap-1 rounded-full px-2 py-1 font-medium text-xs leading-normal transition-colors circular-corners:rounded-2xl straight-corners:rounded-xs';

function TagChip(props: { tag: RevisionTag; onToggle: (tag: string) => void }) {
    const { tag, onToggle } = props;
    const { selectedTagSet } = useUpdatesFilter();
    const onClick = () => onToggle(tag.slug);

    return (
        <button
            type="button"
            aria-pressed={selectedTagSet.has(tag.slug)}
            onClick={onClick}
            className={CHIP_CLASS}
        >
            <span
                {...{ [UPDATES_TAG_CHIP_SELECTED_ATTR]: tag.slug }}
                className={tcls(
                    CHIP_VARIANT_CLASS,
                    'hidden bg-primary-original text-contrast-primary-original hover:bg-primary-solid-hover'
                )}
            >
                <TagIcon tag={tag} />
                <span className="truncate">{tag.label}</span>
            </span>
            <span
                {...{ [UPDATES_TAG_CHIP_UNSELECTED_DIMMED_ATTR]: tag.slug }}
                className={tcls(
                    CHIP_VARIANT_CLASS,
                    'hidden bg-tint-5 text-tint-strong opacity-8 hover:bg-tint-hover hover:opacity-11'
                )}
            >
                <TagIcon tag={tag} />
                <span className="truncate">{tag.label}</span>
            </span>
            <span
                {...{ [UPDATES_TAG_CHIP_UNSELECTED_PLAIN_ATTR]: tag.slug }}
                className={tcls(
                    CHIP_VARIANT_CLASS,
                    'flex bg-tint-5 text-tint-strong hover:bg-tint-hover'
                )}
            >
                <TagIcon tag={tag} />
                <span className="truncate">{tag.label}</span>
            </span>
        </button>
    );
}

function areTagsEqual(left: string[], right: string[]): boolean {
    return left.length === right.length && left.every((tag, index) => tag === right[index]);
}

/** Mirrors the active filter onto `<html>`, matching what the pre-paint script does on first load. */
function applyTagFilterAttribute(tags: string[]) {
    if (typeof document === 'undefined') {
        return;
    }

    if (tags.length > 0) {
        document.documentElement.setAttribute(UPDATES_TAG_FILTER_ATTR, tags.join(' '));
    } else {
        document.documentElement.removeAttribute(UPDATES_TAG_FILTER_ATTR);
    }
}

/** Visibility is driven purely by CSS against `data-update-tags` (see generateUpdatesFilterCSS). */
export function FilteredUpdate(props: {
    tagSlugs: string[];
    className?: string;
    children: React.ReactNode;
}) {
    const { tagSlugs, className, children } = props;

    return (
        <div className={className} {...{ [UPDATES_TAG_ATTR]: tagSlugs.join(' ') }}>
            {children}
        </div>
    );
}
