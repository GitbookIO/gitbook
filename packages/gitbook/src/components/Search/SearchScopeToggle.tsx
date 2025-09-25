'use client';

import { tString, useLanguage } from '@/intl/client';
import type { SiteSection } from '@gitbook/api';
import { Button, Checkbox, DropdownMenu, DropdownMenuItem } from '../primitives';
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

    // Whether to include all variants in the search
    const scopeIsExtended = ['extended', 'all'].includes(state.scope);

    return (
        <>
            {withSections ? (
                <div className="mb-2 flex items-center gap-2">
                    <SegmentedControl className="grow animate-scale-in">
                        <SegmentedControlItem
                            active={['default', 'all'].includes(state.scope)}
                            label={tString(language, 'search_scope_all')}
                            icon="infinity"
                            onClick={() =>
                                setSearchState({
                                    ...state,
                                    scope: scopeIsExtended ? 'all' : 'default',
                                })
                            }
                        />
                        <SegmentedControlItem
                            active={['current', 'extended'].includes(state.scope)}
                            icon={section?.icon}
                            label={tString(language, 'search_scope_current', section?.title)}
                            onClick={() =>
                                setSearchState({
                                    ...state,
                                    scope: scopeIsExtended ? 'extended' : 'current',
                                })
                            }
                        />
                    </SegmentedControl>
                    {withSiteVariants ? (
                        <DropdownMenu
                            button={
                                <Button
                                    icon="ellipsis"
                                    iconOnly
                                    size="default"
                                    variant="blank"
                                    label={tString(language, 'more')}
                                    className="shrink-0"
                                    active={scopeIsExtended}
                                />
                            }
                        >
                            <DropdownMenuItem
                                onClick={() =>
                                    setSearchState({
                                        ...state,
                                        scope: (() => {
                                            switch (state.scope) {
                                                case 'extended':
                                                    return 'current';
                                                case 'current':
                                                    return 'extended';
                                                case 'all':
                                                    return 'default';
                                                default:
                                                    return 'all';
                                            }
                                        })(),
                                    })
                                }
                                active={scopeIsExtended}
                            >
                                <div className="flex items-center gap-3">
                                    <Checkbox checked={scopeIsExtended} />
                                    <div className="flex flex-col items-start">
                                        Include all variants
                                        <div className="text-tint-subtle text-xs">
                                            Search content in every language/version
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenu>
                    ) : null}
                </div>
            ) : withVariants ? (
                <SegmentedControl className="mb-2 animate-scale-in">
                    <SegmentedControlItem
                        size={withSections ? 'small' : 'medium'}
                        active={!scopeIsExtended}
                        className="py-1"
                        label={tString(language, 'search_scope_current', spaceTitle)}
                        onClick={() =>
                            setSearchState({
                                ...state,
                                scope: 'default',
                            })
                        }
                    />

                    <SegmentedControlItem
                        size={withSections ? 'small' : 'medium'}
                        active={scopeIsExtended}
                        className="py-1"
                        icon="infinity"
                        label={tString(language, 'search_scope_all')}
                        onClick={() => setSearchState({ ...state, scope: 'all' })}
                    />
                </SegmentedControl>
            ) : null}
        </>
    );
}
