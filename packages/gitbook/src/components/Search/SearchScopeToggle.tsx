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
                    {/* `Default` scope = current section's current variant + best match in other sections */}
                    <SegmentedControlItem
                        active={
                            withSiteVariants
                                ? state.scope === 'default'
                                : ['default', 'all'].includes(state.scope)
                        }
                        label={
                            withSiteVariants
                                ? tString(language, 'search_scope_default')
                                : tString(language, 'search_scope_all')
                        }
                        className={withSiteVariants ? '@max-md:basis-full' : ''}
                        icon={withSiteVariants ? 'bullseye-arrow' : 'infinity'}
                        onClick={() => setSearchState({ ...state, scope: 'default' })}
                    />

                    {/* `Current` scope = current section's current variant (with further variant scope selection if necessary) */}
                    <SegmentedControlItem
                        active={state.scope === 'current' || state.scope === 'extended'}
                        icon={section?.icon ?? 'crosshairs'}
                        label={tString(language, 'search_scope_current', section?.title)}
                        onClick={() => setSearchState({ ...state, scope: 'current' })}
                    />

                    {/* `All` scope = all content on the site. Only visible if site has variants, otherwise it's the same as default */}
                    {withSiteVariants ? (
                        <SegmentedControlItem
                            active={state.scope === 'all'}
                            label={tString(language, 'search_scope_all')}
                            icon="infinity"
                            onClick={() => setSearchState({ ...state, scope: 'all' })}
                        />
                    ) : null}
                </SegmentedControl>
            ) : null}
            {withVariants &&
            (!withSections || state.scope === 'current' || state.scope === 'extended') ? (
                <SegmentedControl className="animate-scale-in">
                    {/* `Current` scope = current section's current variant. `Default` on sites without sections. */}
                    <SegmentedControlItem
                        size={withSections ? 'small' : 'medium'}
                        active={
                            withSections
                                ? state.scope === 'current'
                                : ['default', 'current'].includes(state.scope)
                        }
                        className="py-1"
                        label={tString(language, 'search_scope_current', spaceTitle)}
                        onClick={() =>
                            setSearchState({
                                ...state,
                                scope: withSections ? 'current' : 'default',
                            })
                        }
                    />

                    {/* `Extended` scope = all variants of the current section. `All` on sites without sections. */}
                    <SegmentedControlItem
                        size={withSections ? 'small' : 'medium'}
                        active={
                            withSections
                                ? state.scope === 'extended'
                                : ['extended', 'all'].includes(state.scope)
                        }
                        className="py-1"
                        label={tString(language, 'search_scope_extended')}
                        onClick={() =>
                            setSearchState({ ...state, scope: withSections ? 'extended' : 'all' })
                        }
                    />
                </SegmentedControl>
            ) : null}
        </>
    );
}
