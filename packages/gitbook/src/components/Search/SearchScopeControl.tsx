'use client';

import { t, useLanguage } from '@/intl/client';
import type { SiteSection } from '@gitbook/api';
import { Button, DropdownChevron, DropdownMenu, DropdownMenuItem } from '../primitives';
import { useSearch } from './useSearch';

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

    const [state] = useSearch();
    const language = useLanguage();

    if (!state) {
        return null;
    }

    // Whether to include all variants in the search
    const sectionScopeIsExtended = ['default', 'all'].includes(state.scope);
    const variantScopeIsExtended = ['extended', 'all'].includes(state.scope);

    return (
        <div className="flex items-center gap-1">
            <span className="mr-1">{t(language, 'search_scope_title')}</span>
            {withSections ? (
                <SearchScopeSectionControl isExtended={sectionScopeIsExtended} {...props} />
            ) : null}

            {withVariants && (!withSections || !sectionScopeIsExtended) ? (
                <SearchScopeVariantControl isExtended={variantScopeIsExtended} {...props} />
            ) : null}
        </div>
    );
}

function SearchScopeSectionControl(props: SearchScopeControlProps & { isExtended: boolean }) {
    const { isExtended, section } = props;

    const language = useLanguage();
    const [, setSearchState] = useSearch();

    return (
        <DropdownMenu
            button={
                <Button
                    variant="blank"
                    size="medium"
                    className="px-2 text-tint-strong"
                    icon={isExtended ? undefined : section?.icon}
                >
                    <div className="flex items-center gap-2">
                        {t(
                            language,
                            isExtended
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
    const [, setSearchState] = useSearch();

    return (
        <DropdownMenu
            button={
                <Button variant="blank" size="medium" className="px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-tint-strong">
                            {t(
                                language,
                                isExtended
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
