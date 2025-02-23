import { getDynamicSiteContext, RouteParams } from '@v2/app/utils';
import { SiteContentLayout } from '@v2/components/routes/SiteContentLayout';

export default async function RootLayout({
    params,
    children,
}: {
    params: Promise<RouteParams>;
    children: React.ReactNode;
}) {
    const context = await getDynamicSiteContext(await params);
    return <SiteContentLayout context={context}>{children}</SiteContentLayout>;
}
