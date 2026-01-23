'use client';

import { t, tString, useLanguage } from '@/intl/client';
import type { SiteSection } from '@gitbook/api';
import { Button, DropdownMenu, DropdownMenuItem, ToggleChevron } from '../primitives';
import { useSearchState, useSetSearchState } from './useSearch';

interface SearchScopeControlProps {
    spaceTitle: string;
    section?: Pick<SiteSection, 'title' | 'icon'>;
    withVariants: boolean;
    withSiteVariants: boolean;
    withSections: boolean;
}

/**
 * Toolbar to toggle between search modes (global or scoped to a space).
 * Only visible when the space is in a collection.
 */
export function SearchScopeControl(props: SearchScopeControlProps) {
    const { withVariants, withSections } = props;

    const state = useSearchState();

    if (!state) {
        return null;
    }

    // Whether to include all variants in the search
    const sectionScopeIsExtended = ['default', 'all'].includes(state.scope);
    const variantScopeIsExtended = ['extended', 'all'].includes(state.scope);

    return (
        <div className="flex items-center gap-1">
            <SearchScopeTitle />
            {withSections ? (
                <SearchScopeSectionControl isExtended={sectionScopeIsExtended} {...props} />
            ) : null}

            {withVariants && (!withSections || !sectionScopeIsExtended) ? (
                <SearchScopeVariantControl isExtended={variantScopeIsExtended} {...props} />
            ) : null}
        </div>
    );
}

function SearchScopeTitle() {
    const language = useLanguage();
    return <span className="mr-1">{t(language, 'search_scope_title')}</span>;
}

function SearchScopeSectionControl(props: SearchScopeControlProps & { isExtended: boolean }) {
    const { isExtended, section } = props;

    const language = useLanguage();
    const setSearchState = useSetSearchState();

    return (
        <DropdownMenu
            button={
                <Button
                    variant="blank"
                    size="small"
                    className="text-tint-strong"
                    icon={isExtended ? undefined : section?.icon}
                    label={tString(
                        language,
                        isExtended ? 'search_scope_section_all' : 'search_scope_section_current',
                        section?.title ?? ''
                    )}
                    trailing={<ToggleChevron />}
                />
            }
        >
            <DropdownMenuItem
                leadingIcon="infinity"
                className="gap-3"
                active={isExtended}
                onClick={() =>
                    setSearchState((prev) => (prev ? { ...prev, scope: 'default' } : null))
                }
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
                active={!isExtended}
                onClick={() =>
                    setSearchState((prev) => (prev ? { ...prev, scope: 'current' } : null))
                }
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
    );
}

function SearchScopeVariantControl(props: SearchScopeControlProps & { isExtended: boolean }) {
    const { isExtended, spaceTitle, withSections } = props;

    const language = useLanguage();
    const setSearchState = useSetSearchState();

    return (
        <DropdownMenu
            button={
                <Button
                    variant="blank"
                    size="small"
                    label={tString(
                        language,
                        isExtended ? 'search_scope_variant_all' : 'search_scope_variant_current',
                        spaceTitle ?? ''
                    )}
                    trailing={<ToggleChevron />}
                />
            }
        >
            <DropdownMenuItem
                className="gap-3"
                active={!isExtended}
                onClick={() =>
                    setSearchState((prev) =>
                        prev ? { ...prev, scope: withSections ? 'current' : 'default' } : null
                    )
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
                active={isExtended}
                onClick={() =>
                    setSearchState((prev) => (prev ? { ...prev, scope: 'extended' } : null))
                }
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
    );
}
