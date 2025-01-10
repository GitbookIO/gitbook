import { SpaceIntegrationScript } from '@gitbook/api';
import { headers } from 'next/headers';

import { CustomizationRootLayout } from '@/components/RootLayout';
import { getSiteData, getSpaceCustomization } from '@/lib/api';
import { getGitBookContextFromHeaders, GitBookContext } from '@/lib/gitbook-context';

import { getSiteOrSpacePointerForPDF } from './pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the
 * site or space and initializes the CustomizationRootLayout with it.
 */
export default async function PDFRootLayout(props: { children: React.ReactNode }) {
    const ctx = getGitBookContextFromHeaders(await headers());
    const { children } = props;

    const pointer = getSiteOrSpacePointerForPDF(ctx);
    const { customization } = await ('siteId' in pointer
        ? getSiteData(ctx, pointer)
        : getSpaceLayoutData(ctx));

    return (
        <CustomizationRootLayout customization={customization}>{children}</CustomizationRootLayout>
    );
}

/**
 * Fetch all the layout data about a space at once.
 */
async function getSpaceLayoutData(ctx: GitBookContext) {
    const { customization } = await getSpaceCustomization(ctx);

    return {
        customization,
        scripts: [] as SpaceIntegrationScript[],
    };
}
