import { PDFPage, generatePDFMetadata } from '@/components/PDF';
import { type RouteLayoutParams, getDynamicSiteContext } from '@v2/app/utils';

export async function generateMetadata({
    params,
}: {
    params: Promise<RouteLayoutParams>;
}) {
    const context = await getDynamicSiteContext(await params);
    return generatePDFMetadata(context);
}

export default async function Page(props: {
    params: Promise<RouteLayoutParams>;
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const { params, searchParams } = props;
    const context = await getDynamicSiteContext(await params);
    return <PDFPage context={context} searchParams={await searchParams} />;
}
