'use client';

import {
    Button,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownSubMenu,
    ToggleChevron,
} from '../primitives';
import { findSearchSection, type SearchSection, type SearchSectionItem } from './search-props';
import { useSearchState, useSetSearchState } from './useSearch';
import { t, tString, useLanguage } from '@/intl/client';

interface SearchScopeControlProps {
    spaceTitle: string;
    section?: SearchSection;
    sections: SearchSectionItem[];
    withVariants: boolean;
    withSiteVariants: boolean;
    withSections: boolean;
}

/**
 * Toolbar to toggle between search modes (global or scoped to a space).
 * Only visible when the space is in a collection.
 */
export function SearchScopeControl(props: SearchScopeControlProps) {
    const { section, sections, withVariants, withSections } = props;

    const state = useSearchState();

    if (!state?.open) {
        return null;
    }

    // Whether to include all variants in the search
    const sectionScopeIsExtended = ['default', 'all'].includes(state.scope);
    const variantScopeIsExtended = ['extended', 'all'].includes(state.scope);
    const independentlySelectedSection = state.section
        ? findSearchSection(sections, state.section)
        : undefined;
    const hasIndependentlySelectedSection = Boolean(
        independentlySelectedSection && independentlySelectedSection.id !== section?.id
    );

    return (
        <div className="flex items-center">
            <SearchScopeTitle />
            {withSections ? (
                <SearchScopeSectionControl isExtended={sectionScopeIsExtended} {...props} />
            ) : null}

            {withVariants &&
            !hasIndependentlySelectedSection &&
            (!withSections || !sectionScopeIsExtended) ? (
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
    const { isExtended, section, sections } = props;

    const language = useLanguage();
    const setSearchState = useSetSearchState();
    const state = useSearchState();
    const independentlySelectedSection = state?.section
        ? findSearchSection(sections, state.section)
        : undefined;
    const selectedSection = independentlySelectedSection ?? section;
    const searchesAllSections = isExtended && !independentlySelectedSection;

    return (
        <DropdownMenu
            button={
                <Button
                    variant="blank"
                    size="small"
                    className="text-tint-strong"
                    icon={searchesAllSections ? undefined : selectedSection?.icon}
                    label={tString(
                        language,
                        searchesAllSections
                            ? 'search_scope_section_all'
                            : 'search_scope_section_current',
                        selectedSection?.title ?? ''
                    )}
                    trailing={<ToggleChevron />}
                />
            }
        >
            <DropdownMenuItem
                leadingIcon="infinity"
                className="gap-3"
                active={searchesAllSections}
                onClick={() =>
                    setSearchState((prev) =>
                        prev ? { ...prev, scope: 'default', section: null } : null
                    )
                }
            >
                <div className="flex flex-col">
                    <span className="text-tint-strong">
                        {t(language, 'search_scope_section_all')}
                    </span>
                    <span className="text-xs text-tint-subtle">
                        {t(language, 'search_scope_section_all_description')}
                    </span>
                </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {sections.map((item) => (
                <SearchSectionMenuItem
                    key={item.id}
                    item={item}
                    currentSectionId={section?.id}
                    selectedSectionId={searchesAllSections ? undefined : selectedSection?.id}
                />
            ))}
        </DropdownMenu>
    );
}

function SearchSectionMenuItem(props: {
    item: SearchSectionItem;
    currentSectionId?: string;
    selectedSectionId?: string;
}) {
    const { item, currentSectionId, selectedSectionId } = props;
    const setSearchState = useSetSearchState();

    if (item.object === 'site-section-group') {
        return (
            <DropdownSubMenu label={item.title}>
                {item.children.map((child) => (
                    <SearchSectionMenuItem
                        key={child.id}
                        item={child}
                        currentSectionId={currentSectionId}
                        selectedSectionId={selectedSectionId}
                    />
                ))}
            </DropdownSubMenu>
        );
    }

    return (
        <DropdownMenuItem
            leadingIcon={item.icon ?? 'crosshairs'}
            active={item.id === selectedSectionId}
            onClick={() =>
                setSearchState((prev) =>
                    prev
                        ? {
                              ...prev,
                              scope: item.id === currentSectionId ? 'current' : 'extended',
                              section: item.id === currentSectionId ? null : item.id,
                          }
                        : null
                )
            }
        >
            <span className="text-tint-strong">{item.title}</span>
        </DropdownMenuItem>
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
                    <span className="text-xs text-tint-subtle">
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
                    <span className="text-xs text-tint-subtle">
                        {t(language, 'search_scope_variant_all_description')}
                    </span>
                </div>
            </DropdownMenuItem>
        </DropdownMenu>
    );
}
