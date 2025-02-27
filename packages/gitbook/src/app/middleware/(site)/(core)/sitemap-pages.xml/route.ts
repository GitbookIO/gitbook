import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';
import { servePagesSitemap } from '@/routes/sitemap';

export const runtime = 'edge';

export async function GET() {
    const pointer = await getSiteContentPointer();
    const context = await fetchV1ContextForSitePointer(pointer);

    return servePagesSitemap(context);
}
