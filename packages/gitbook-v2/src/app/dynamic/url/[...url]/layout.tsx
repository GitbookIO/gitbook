import { SiteContentLayout } from '@/components/routes/SiteContentLayout';
import { createDynamicSiteContext } from '@/lib/context';

export default async function RootLayout({
    params,
    children,
  }: {
    params: Promise<{ url: string[] }>
    children: React.ReactNode
  }) {
    const { url } = await params;
    const context = await createDynamicSiteContext(url);
   
    return <SiteContentLayout context={context}>{children}</SiteContentLayout>;
}
