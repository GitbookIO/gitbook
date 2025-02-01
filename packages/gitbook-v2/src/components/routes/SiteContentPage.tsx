import { GitBookSiteContext } from '@v2/lib/context';

export async function SiteContentPage({ context }: { context: GitBookSiteContext }) {
    const { api } = context;
    const { data } = await api.orgs.getPublishedContentSite(context.organizationId, context.siteId);

    return (
        <div>
            <p>Found site {data.site.id}</p>
        </div>
    );
}
