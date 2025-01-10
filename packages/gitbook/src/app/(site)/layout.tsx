import { headers } from 'next/headers';

import { CustomizationRootLayout } from '@/components/RootLayout';
import { getSiteData } from '@/lib/api';
import { getGitBookContextFromHeaders } from '@/lib/gitbook-context';
import { getSiteContentPointer } from '@/lib/pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the site
 * and initializes the CustomizationRootLayout with it.
 */
export default async function SiteRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;
    const ctx = getGitBookContextFromHeaders(await headers());

    const pointer = getSiteContentPointer(ctx);
    const { customization } = await getSiteData(ctx, pointer);

    return (
        <CustomizationRootLayout customization={customization}>{children}</CustomizationRootLayout>
    );
}
