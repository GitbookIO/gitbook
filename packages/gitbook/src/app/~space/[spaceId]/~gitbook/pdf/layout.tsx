import { type SpacePDFRouteParams, getSpacePDFContext } from '@/app/~space/[spaceId]/pdf';
import { PDFRootLayout } from '@/components/PDF';

export default async function RootLayout(props: {
    params: Promise<SpacePDFRouteParams>;
    children: React.ReactNode;
}) {
    const { params, children } = props;
    const context = await getSpacePDFContext(await params);

    return <PDFRootLayout context={context}>{children}</PDFRootLayout>;
}
