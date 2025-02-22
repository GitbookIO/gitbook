import { GitBookSiteContext } from '@v2/lib/context';

export async function SiteContentPage({ context }: { context: GitBookSiteContext }) {
    const { dataFetcher } = context;
    const { site } = await dataFetcher.getPublishedContentSite(context);

    return (
        <div>
            <p>Found site {site.id}</p>
        </div>
    );
}
