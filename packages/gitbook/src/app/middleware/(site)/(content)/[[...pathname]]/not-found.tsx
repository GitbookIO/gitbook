import { SitePageNotFound } from '@/components/SitePage';
import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';

export default async function NotFound() {
    const pointer = await getSiteContentPointer();
    const context = await fetchV1ContextForSitePointer(pointer);

    return <SitePageNotFound context={context} />;
}
