import { SiteContentPage } from '@v2/components/routes/SiteContentPage';
import { createDynamicSiteContext } from '@v2/lib/context';

export default async function Page({ params }: { params: Promise<{ url: string[] }> }) {
    const { url } = await params;
    const context = await createDynamicSiteContext(url);

    return <SiteContentPage context={context} />;
}
