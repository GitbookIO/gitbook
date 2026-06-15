import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import { SiteLayoutClientContexts } from '@/components/SiteLayout';
import { StructurePreview, type StructurePreviewSnapshot } from '@/components/StructurePreview';
import { getThemeFromMiddleware } from '@/lib/middleware';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function Page(props: PageProps) {
    const { context } = await getDynamicSiteContext(await props.params);
    const forcedTheme = await getThemeFromMiddleware();
    const snapshot: StructurePreviewSnapshot = {
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

    return (
        <CustomizationRootLayout
            htmlClassName="sheet-open:gutter-stable"
            bodyClassName="site-background"
            forcedTheme={forcedTheme}
            context={context}
        >
            <SiteLayoutClientContexts
                contextId={context.contextId}
                forcedTheme={
                    forcedTheme ??
                    (context.customization.themes.toggeable
                        ? undefined
                        : context.customization.themes.default)
                }
                defaultTheme={context.customization.themes.default}
                themeStorageKey={`gitbook-theme-structure:${context.site.id}`}
                externalLinksTarget={context.customization.externalLinks.target}
                proxyOrigin={context.site.proxy?.origin}
            >
                <StructurePreview initialSnapshot={snapshot} />
            </SiteLayoutClientContexts>
        </CustomizationRootLayout>
    );
}
