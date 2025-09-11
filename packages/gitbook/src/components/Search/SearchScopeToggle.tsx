'use client';

import { tString, useLanguage } from '@/intl/client';
import type { SiteSection } from '@gitbook/api';
import { SegmentedControl, SegmentedControlItem } from '../primitives/SegmentedControl';
import { useSearch } from './useSearch';

/**
 * Toolbar to toggle between search modes (global or scoped to a space).
 * Only visible when the space is in a collection.
 */
export function SearchScopeToggle(props: {
    spaceTitle: string;
    section?: Pick<SiteSection, 'title' | 'icon'>;
    withVariants: boolean;
    withSiteVariants: boolean;
    withSections: boolean;
}) {
    const { spaceTitle, section, withVariants, withSections, withSiteVariants } = props;
    const [state, setSearchState] = useSearch();
    const language = useLanguage();

    if (!state) {
        return null;
    }

    return (
        <>
            {withSections ? (
                <SegmentedControl className="animate-scale-in">
                    <SegmentedControlItem
                        active={state.scope === 'all' && state.depth === 'single'}
                        label={
                            withSiteVariants
                                ? tString(language, 'search_scope_all_depth_single')
                                : tString(language, 'search_scope_all_depth_full')
                        }
                        className={withSiteVariants ? '@max-md:basis-full' : ''}
                        icon={withSiteVariants ? 'bullseye-arrow' : 'infinity'}
                        onClick={() => setSearchState({ ...state, scope: 'all', depth: 'single' })}
                    />
                    <SegmentedControlItem
                        active={state.scope === 'current'}
                        icon={section?.icon ?? 'crosshairs'}
                        label={tString(
                            language,
                            'search_scope_current_depth_single',
                            section?.title
                        )}
                        onClick={() =>
                            setSearchState({ ...state, scope: 'current', depth: 'single' })
                        }
                    />
                    {withSiteVariants ? (
                        <SegmentedControlItem
                            active={state.scope === 'all' && state.depth === 'full'}
                            label={tString(language, 'search_scope_all_depth_full')}
                            icon="infinity"
                            onClick={() =>
                                setSearchState({ ...state, scope: 'all', depth: 'full' })
                            }
                        />
                    ) : null}
                </SegmentedControl>
            ) : null}
            {withVariants && (!withSections || state.scope === 'current') ? (
                <SegmentedControl className="animate-scale-in">
                    <SegmentedControlItem
                        size={state.scope === 'current' ? 'small' : 'medium'}
                        active={state.depth === 'single'}
                        className="py-1"
                        label={tString(language, 'search_scope_current_depth_single', spaceTitle)}
                        onClick={() => setSearchState({ ...state, depth: 'single' })}
                    />
                    <SegmentedControlItem
                        size={state.scope === 'current' ? 'small' : 'medium'}
                        active={state.depth === 'full'}
                        className="py-1"
                        label={tString(language, 'search_scope_current_depth_full')}
                        onClick={() => setSearchState({ ...state, depth: 'full' })}
                    />
                </SegmentedControl>
            ) : null}
        </>
    );
}
