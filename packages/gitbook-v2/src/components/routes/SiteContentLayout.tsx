import { GitBookSiteContext } from '@/lib/context';

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
    const { data: site } = await api.orgs.getSiteById(context.organizationId, context.siteId);

    return (
        <html lang="en">
            <body>
                <h1>{site.title}</h1>
                {children}
            </body>
        </html>
    );
}
