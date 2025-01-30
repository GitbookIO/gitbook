import { GitBookSiteContext } from "@/lib/context";


export async function SiteContentPage({
    context,
}: {
    context: GitBookSiteContext
}) {
    const { api } = context;
    const { data: site } = await api.orgs.getSiteById(context.organizationId, context.siteId);

    return (
        <div>
            <h1>{site.title}</h1>
            <p>Found site {site.id}</p>
        </div>
    )
}

