import type { SiteSections } from '@/lib/context';

/** Whether the published header should show section navigation. */
export function shouldRenderSiteSectionNavigation(sections: SiteSections | null): boolean {
    return Boolean(
        sections &&
        (sections.list.length > 1 ||
            sections.list.some((item) => item.object === 'site-section-group'))
    );
}
