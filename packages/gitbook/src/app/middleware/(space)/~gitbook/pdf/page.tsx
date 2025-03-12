import { PDFPage, generatePDFMetadata } from '@/components/PDF';
import { getV1ContextForPDF } from './pointer';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    const context = await getV1ContextForPDF();
    return generatePDFMetadata(context);
}

export default async function Page(props: {
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const context = await getV1ContextForPDF();
    return <PDFPage context={context} searchParams={await props.searchParams} />;
}
