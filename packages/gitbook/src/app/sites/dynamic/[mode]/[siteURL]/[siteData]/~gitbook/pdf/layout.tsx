import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { PDFRootLayout } from '@/components/PDF';

export default async function RootLayout(props: {
    params: Promise<RouteLayoutParams>;
    children: React.ReactNode;
}) {
    const { params, children } = props;
    const { context } = await getDynamicSiteContext(await params);

    return <PDFRootLayout context={context}>{children}</PDFRootLayout>;
}
