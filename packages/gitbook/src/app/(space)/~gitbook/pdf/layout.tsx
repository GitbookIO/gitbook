import { SpaceRootLayout } from '@/components/SpaceRootLayout';
import { getSiteLayoutData, getSpaceLayoutData } from '@/lib/api';

import { getSiteOrSpacePointer } from './pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the site
 * and initializes the SpaceRootLayout with it.
 */
export default async function PDFRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = getSiteOrSpacePointer();
    const { customization } = await ('siteId' in pointer
        ? getSiteLayoutData(pointer)
        : getSpaceLayoutData(pointer.spaceId));

    return <SpaceRootLayout customization={customization}>{children}</SpaceRootLayout>;
}
