'use client';

import { t, useLanguage } from '@/intl/client';
import type { SiteSection } from '@gitbook/api';
import { Button, DropdownChevron, DropdownMenu, DropdownMenuItem } from '../primitives';
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
    const { spaceTitle, section, withVariants, withSections } = props;
    const [state, setSearchState] = useSearch();
    const language = useLanguage();

    if (!state) {
        return null;
    }

    // Whether to include all variants in the search
    const sectionScopeIsExtended = ['default', 'all'].includes(state.scope);
    const variantScopeIsExtended = ['extended', 'all'].includes(state.scope);

    return (
        <div className="flex items-center">
            <span className="mr-2">{t(language, 'search_scope_title')}</span>
            {withSections ? (
                <DropdownMenu
                    button={
                        <Button
                            variant="blank"
                            size="medium"
                            className="px-2 text-tint-strong"
                            icon={sectionScopeIsExtended ? undefined : section?.icon}
                        >
                            <div className="flex items-center gap-2">
                                {t(
                                    language,
                                    sectionScopeIsExtended
                                        ? 'search_scope_section_all'
                                        : 'search_scope_section_current',
                                    section?.title ?? ''
                                )}
                                <DropdownChevron />
                            </div>
                        </Button>
                    }
                >
                    <DropdownMenuItem
                        leadingIcon="infinity"
                        className="gap-3"
                        active={sectionScopeIsExtended}
                        onClick={() => setSearchState({ ...state, scope: 'default' })}
                    >
                        <div className="flex flex-col">
                            <span className="text-tint-strong">
                                {t(language, 'search_scope_section_all')}
                            </span>
                            <span className="text-tint-subtle text-xs">
                                {t(language, 'search_scope_section_all_description')}
                            </span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        leadingIcon={section?.icon ?? 'crosshairs'}
                        className="gap-3"
                        active={!sectionScopeIsExtended}
                        onClick={() => setSearchState({ ...state, scope: 'current' })}
                    >
                        <div className="flex flex-col">
                            <span className="text-tint-strong">
                                {t(language, 'search_scope_section_current', section?.title ?? '')}
                            </span>
                            <span className="text-tint-subtle text-xs">
                                {t(language, 'search_scope_section_current_description')}
                            </span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenu>
            ) : null}

            {withVariants && (!withSections || !sectionScopeIsExtended) ? (
                <DropdownMenu
                    button={
                        <Button variant="blank" size="medium" className="px-2">
                            <div className="flex items-center gap-2">
                                <span className="text-tint-strong">
                                    {t(
                                        language,
                                        variantScopeIsExtended
                                            ? 'search_scope_variant_all'
                                            : 'search_scope_variant_current',
                                        spaceTitle ?? ''
                                    )}
                                </span>
                                <DropdownChevron />
                            </div>
                        </Button>
                    }
                >
                    <DropdownMenuItem
                        className="gap-3"
                        active={!variantScopeIsExtended}
                        onClick={() =>
                            setSearchState({
                                ...state,
                                scope: withSections ? 'current' : 'default',
                            })
                        }
                    >
                        <div className="flex flex-col">
                            <span className="text-tint-strong">
                                {t(language, 'search_scope_variant_current', spaceTitle ?? '')}
                            </span>
                            <span className="text-tint-subtle text-xs">
                                {t(language, 'search_scope_variant_current_description')}
                            </span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="gap-3"
                        active={variantScopeIsExtended}
                        onClick={() => setSearchState({ ...state, scope: 'extended' })}
                    >
                        <div className="flex flex-col">
                            <span className="text-tint-strong">
                                {t(language, 'search_scope_variant_all')}
                            </span>
                            <span className="text-tint-subtle text-xs">
                                {t(language, 'search_scope_variant_all_description')}
                            </span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenu>
            ) : null}
        </div>
    );
}
