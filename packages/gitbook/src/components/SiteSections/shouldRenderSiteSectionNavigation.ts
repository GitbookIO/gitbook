import type { SiteSections } from '@/lib/context';

/** Whether the published layout should show section navigation. */
export function shouldRenderSiteSectionNavigation(sections: SiteSections | null): boolean {
    return Boolean(
        sections &&
        (sections.list.length > 1 ||
            sections.list.some((item) => item.object === 'site-section-group'))
    );
}

/** Whether search should offer a scope across multiple content sections. */
export function hasMultipleSiteSections(sections: SiteSections | null): boolean {
    if (!sections) {
        return false;
    }

    const countSections = (items: SiteSections['list']): number =>
        items.reduce((count, item) => {
            switch (item.object) {
                case 'site-section':
                    return count + 1;
                case 'site-section-group':
                    return count + countSections(item.children);
                case 'site-external-link':
                    return count;
            }
        }, 0);

    return countSections(sections.list) > 1;
}
