import { PDFRootLayout } from '@/components/PDF';
import { type SpacePDFRouteParams, getSpacePDFContext } from '@v2/app/~space/[spaceId]/pdf';

export default async function RootLayout(props: {
    params: Promise<SpacePDFRouteParams>;
    children: React.ReactNode;
}) {
    const { params, children } = props;
    const context = await getSpacePDFContext(await params);

    return <PDFRootLayout context={context}>{children}</PDFRootLayout>;
}
