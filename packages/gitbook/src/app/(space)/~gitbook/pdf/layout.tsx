import { CustomizationRootLayout } from '@/components/RootLayout';
import { getSiteLayoutData, getSpaceLayoutData } from '@/lib/api';

import { getSiteOrSpacePointerForPDF } from './pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the
 * site or space and initializes the CustomizationRootLayout with it.
 */
export default async function PDFRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = getSiteOrSpacePointerForPDF();
    const { customization } = await ('siteId' in pointer
        ? getSiteLayoutData(pointer)
        : getSpaceLayoutData(pointer.spaceId));

    return (
        <CustomizationRootLayout customization={customization}>{children}</CustomizationRootLayout>
    );
}
