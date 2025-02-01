import { GitBookSiteContext } from '@v2/lib/context';

/**
 * Layout component to render the site content.
 */
export async function SiteContentLayout({
    context,
    children,
}: {
    context: GitBookSiteContext;
    children: React.ReactNode;
}) {
    const { api } = context;
    const { data: publishedSite } = await api.orgs.getPublishedContentSite(
        context.organizationId,
        context.siteId,
    );

    return (
        <html lang="en">
            <body>
                <h1>{publishedSite.site.title}</h1>
                {children}
            </body>
        </html>
    );
}
