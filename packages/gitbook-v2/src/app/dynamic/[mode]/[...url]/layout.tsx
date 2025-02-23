import { SiteContentLayout } from '@v2/components/routes/SiteContentLayout';
import { createDynamicSiteContext } from '@v2/lib/context';

export default async function RootLayout({
    params,
    children,
}: {
    params: Promise<{ mode: string; url: string[] }>;
    children: React.ReactNode;
}) {
    const { mode, url } = await params;
    const context = await createDynamicSiteContext(url);

    return <SiteContentLayout context={context}>{children}</SiteContentLayout>;
}
