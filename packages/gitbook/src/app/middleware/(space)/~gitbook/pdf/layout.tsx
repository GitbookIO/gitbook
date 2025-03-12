import { PDFRootLayout } from '@/components/PDF';
import { getV1ContextForPDF } from './pointer';

export default async function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props;
    const context = await getV1ContextForPDF();

    return <PDFRootLayout context={context}>{children}</PDFRootLayout>;
}
