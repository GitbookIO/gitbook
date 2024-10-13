import { SpaceRootLayout } from '@/components/SpaceRootLayout';
import { getSpaceLayoutData } from '@/lib/api';
import { getSpacePointer } from '@/lib/pointer';

/**
 * Layout shared between the content and the PDF renderer.
 * It takes care of setting the theme and the language.
 */
export default async function PDFRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = getSpacePointer();
    const { customization } = await getSpaceLayoutData(pointer.spaceId);

    return <SpaceRootLayout customization={customization}>{children}</SpaceRootLayout>;
}
