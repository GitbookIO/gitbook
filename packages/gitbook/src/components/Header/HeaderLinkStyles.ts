import { CustomizationSearchStyle } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

export function getHeaderLinkDropdownClassName(searchStyle: CustomizationSearchStyle) {
    return tcls(
        'shrink',
        searchStyle === CustomizationSearchStyle.Prominent && 'right-0 left-auto'
    );
}

export function getHeaderLinkMoreDropdownClassName(searchStyle: CustomizationSearchStyle) {
    return tcls(
        'max-md:right-0 max-md:left-auto',
        searchStyle === CustomizationSearchStyle.Prominent && 'right-0 left-auto'
    );
}
