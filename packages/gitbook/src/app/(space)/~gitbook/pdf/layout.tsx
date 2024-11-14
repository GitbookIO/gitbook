import { SpaceIntegrationScript } from '@gitbook/api';

import { CustomizationRootLayout } from '@/components/RootLayout';
import { getCurrentSiteCustomization, getSpaceCustomization } from '@/lib/api';

import { getSiteOrSpacePointerForPDF } from './pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the
 * site or space and initializes the CustomizationRootLayout with it.
 */
export default async function PDFRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = getSiteOrSpacePointerForPDF();
    const data = await ('siteId' in pointer
        ? getCurrentSiteCustomization(pointer)
        : getSpaceLayoutData(pointer.spaceId));

    const customization = 'customization' in data ? data.customization : data;

    return (
        <CustomizationRootLayout customization={customization}>{children}</CustomizationRootLayout>
    );
}

/**
 * Fetch all the layout data about a space at once.
 */
async function getSpaceLayoutData(spaceId: string) {
    const [customization, scripts] = await Promise.all([
        getSpaceCustomization(spaceId),
        [] as SpaceIntegrationScript[],
    ]);

    return {
        customization,
        scripts,
    };
}
