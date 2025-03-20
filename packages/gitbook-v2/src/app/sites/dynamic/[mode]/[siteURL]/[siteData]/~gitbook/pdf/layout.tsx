import { PDFRootLayout } from '@/components/PDF';
import { type RouteLayoutParams, getDynamicSiteContext } from '@v2/app/utils';

export default async function RootLayout(props: {
    params: Promise<RouteLayoutParams>;
    children: React.ReactNode;
}) {
    const { params, children } = props;
    const { context } = await getDynamicSiteContext(await params);

    return <PDFRootLayout context={context}>{children}</PDFRootLayout>;
}
