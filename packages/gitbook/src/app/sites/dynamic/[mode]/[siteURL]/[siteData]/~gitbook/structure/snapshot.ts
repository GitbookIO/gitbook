import type { StructurePreviewSnapshot } from '@/components/StructurePreview';
import type { GitBookSiteContext } from '@/lib/context';

export function getStructurePreviewSnapshot(context: GitBookSiteContext): StructurePreviewSnapshot {
    return {
        site: {
            id: context.site.id,
            title: context.site.title,
            proxyOrigin: context.site.proxy?.origin,
        },
        contextId: context.contextId,
        locale: context.locale,
        customization: context.customization,
        structure: context.structure,
        siteSpace: context.siteSpace,
        siteSpaces: context.siteSpaces,
        visibleSiteSpaces: context.visibleSiteSpaces,
        sections: context.sections,
        visibleSections: context.visibleSections,
        revision: {
            pages: context.revision.pages,
            tags: context.revision.tags,
        },
        icons: {
            large: {
                light: context.linker.toPathInSpace('~gitbook/icon?size=large&theme=light'),
                dark: context.linker.toPathInSpace('~gitbook/icon?size=large&theme=dark'),
            },
        },
    };
}
