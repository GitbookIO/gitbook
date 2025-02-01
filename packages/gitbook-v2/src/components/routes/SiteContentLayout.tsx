import { GitBookSiteSpaceContext } from '@v2/lib/context';
import { Footer } from '@/components/Footer';

/**
 * Layout component to render the site content.
 */
export async function SiteContentLayout({
    context,
    children,
}: {
    context: GitBookSiteSpaceContext;
    children: React.ReactNode;
}) {
    const [publishedSite, space] = await Promise.all([
        context.getPublishedContentSite(
            context.organizationId,
            context.siteId,
        ),
        context.getSpaceById(context.spaceId, context.siteShareKey),
    ]);

    return (
        <html lang="en">
            <body>
                <h1>{publishedSite.site.title}</h1>
                {children}
                <Footer
                    space={space}
                    customization={
                        publishedSite.customizations.siteSpaces[context.siteSpaceId] ??
                        publishedSite.customizations.site
                    }
                />
            </body>
        </html>
    );
}
