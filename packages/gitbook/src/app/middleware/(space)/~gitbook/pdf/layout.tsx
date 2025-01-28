import { SpaceIntegrationScript } from '@gitbook/api';

import { CustomizationRootLayout } from '@/components/RootLayout';
import { getSiteData, getSpaceCustomization } from '@/lib/api';

import { getSiteOrSpacePointerForPDF } from './pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the
 * site or space and initializes the CustomizationRootLayout with it.
 */
export default async function PDFRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = await getSiteOrSpacePointerForPDF();
    const { customization } = await ('siteId' in pointer
        ? getSiteData(pointer)
        : getSpaceLayoutData());

    return (
        <CustomizationRootLayout customization={customization}>{children}</CustomizationRootLayout>
    );
}

/**
 * Fetch all the layout data about a space at once.
 */
async function getSpaceLayoutData() {
    const [{ customization }, scripts] = await Promise.all([
        getSpaceCustomization(),
        [] as SpaceIntegrationScript[],
    ]);

    return {
        customization,
        scripts,
    };
}
