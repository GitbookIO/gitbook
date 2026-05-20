'use client';

import { Button } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import type { RevisionTag } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { TagIcon } from '../Tag';

const UPDATES_FILTER_SEARCH_PARAM = 'tag';

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

export function UpdatesFilterProvider(props: {
    tagSlugs: string[];
    children: React.ReactNode;
}) {
    const { tagSlugs, children } = props;
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const availableTags = React.useMemo(() => new Set(tagSlugs), [tagSlugs]);

    const sanitizeTags = React.useCallback(
        (tags: string[]) => {
            const next: string[] = [];
            const seen = new Set<string>();

            for (const tag of tags) {
                if (!availableTags.has(tag) || seen.has(tag)) {
                    continue;
                }

                next.push(tag);
                seen.add(tag);
            }

            return next;
        },
        [availableTags]
    );

    const rawSelectedTags = React.useMemo(
        () => searchParams?.getAll(UPDATES_FILTER_SEARCH_PARAM) ?? [],
        [searchParams]
    );

    const selectedTags = React.useMemo(
        () => sanitizeTags(rawSelectedTags),
        [sanitizeTags, rawSelectedTags]
    );

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
        if (!areTagsEqual(rawSelectedTags, selectedTags)) {
            replaceTags(selectedTags);
        }
    }, [rawSelectedTags, replaceTags, selectedTags]);

    const toggleTag = React.useCallback(
        (tag: string) => {
            if (!availableTags.has(tag)) {
                return;
            }

            replaceTags(
                selectedTags.includes(tag)
                    ? selectedTags.filter((currentTag) => currentTag !== tag)
                    : [...selectedTags, tag]
            );
        },
        [availableTags, replaceTags, selectedTags]
    );

    const clearTags = React.useCallback(() => {
        replaceTags([]);
    }, [replaceTags]);

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
    const { selectedTagSet, selectedTags, toggleTag, clearTags } = useUpdatesFilter();
    const isFiltering = selectedTags.length > 0;

    if (tags.length === 0) {
        return null;
    }

    return (
        <div className="shrink-0 border-tint-subtle border-b pt-px pb-4">
            <div className="mb-3 ml-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 font-semibold text-tint text-xs uppercase leading-wider">
                    <Icon icon="tags" className="size-3" />
                    {tagsLabel}
                </div>
                <Button
                    variant="blank"
                    size="xsmall"
                    icon="xmark"
                    label={clearLabel}
                    onClick={isFiltering ? clearTags : undefined}
                    aria-hidden={!isFiltering}
                    tabIndex={isFiltering ? undefined : -1}
                    className={tcls('text-xs', !isFiltering && 'pointer-events-none invisible')}
                />
            </div>
            <div className="flex flex-wrap gap-1.5 px-3">
                {tags.map((tag) => {
                    const selected = selectedTagSet.has(tag.slug);

                    return (
                        <button
                            key={tag.slug}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleTag(tag.slug)}
                            className={tcls(
                                'inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 font-medium text-xs leading-normal transition-colors',
                                'circular-corners:rounded-2xl straight-corners:rounded-xs',
                                'not-focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
                                selected
                                    ? 'bg-primary-original text-contrast-primary-original hover:bg-primary-solid-hover'
                                    : 'bg-tint-5 text-tint-strong hover:bg-tint-hover',
                                isFiltering && !selected && 'opacity-8 hover:opacity-11'
                            )}
                        >
                            <TagIcon tag={tag} />
                            <span className="truncate">{tag.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function areTagsEqual(left: string[], right: string[]): boolean {
    return left.length === right.length && left.every((tag, index) => tag === right[index]);
}

export function FilteredUpdate(props: {
    tagSlugs: string[];
    className?: string;
    children: React.ReactNode;
}) {
    const { tagSlugs, className, children } = props;
    const { selectedTagSet } = useUpdatesFilter();

    const isVisible =
        selectedTagSet.size === 0 || tagSlugs.some((tagSlug) => selectedTagSet.has(tagSlug));

    return (
        <div className={className} hidden={!isVisible}>
            {children}
        </div>
    );
}
