import { getContentPointer } from '@/app/(site)/fetch';
import { SpaceRootLayout } from '@/components/SpaceRootLayout';
import { getSiteLayoutData, getSpaceLayoutData } from '@/lib/api';

/**
 * Layout shared between the content and the PDF renderer.
 * It takes care of setting the theme and the language.
 */
export default async function PDFRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = getContentPointer();
    const { customization } = await ('siteId' in pointer
        ? getSiteLayoutData(pointer)
        : getSpaceLayoutData(pointer.spaceId));

    return <SpaceRootLayout customization={customization}>{children}</SpaceRootLayout>;
}
