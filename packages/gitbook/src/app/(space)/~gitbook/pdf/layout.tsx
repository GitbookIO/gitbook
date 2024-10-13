import { SpaceRootLayout } from '@/components/SpaceRootLayout';
import { getSpaceLayoutData } from '@/lib/api';
import { getSpacePointer } from '@/lib/pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the site
 * and initializes the SpaceRootLayout with it.
 */
export default async function PDFRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = getSpacePointer();
    const { customization } = await getSpaceLayoutData(pointer.spaceId);

    return <SpaceRootLayout customization={customization}>{children}</SpaceRootLayout>;
}
