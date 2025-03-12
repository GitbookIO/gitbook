import { PDFPage, generatePDFMetadata } from '@/components/PDF';
import { type SpacePDFRouteParams, getSpacePDFContext } from '@v2/app/~space/[spaceId]/pdf';

export async function generateMetadata({
    params,
}: {
    params: Promise<SpacePDFRouteParams>;
}) {
    const context = await getSpacePDFContext(await params);
    return generatePDFMetadata(context);
}

export default async function Page(props: {
    params: Promise<SpacePDFRouteParams>;
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const { params, searchParams } = props;
    const context = await getSpacePDFContext(await params);
    return <PDFPage context={context} searchParams={await searchParams} />;
}
