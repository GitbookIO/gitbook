import { CustomizationRootLayout } from '@/components/RootLayout';
import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';

/**
 * Layout to be used for the site root. It fetches the customization data for the site
 * and initializes the CustomizationRootLayout with it.
 */
export default async function SiteRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = await getSiteContentPointer();
    const { customization } = await fetchV1ContextForSitePointer(pointer);

    return (
        <CustomizationRootLayout customization={customization}>{children}</CustomizationRootLayout>
    );
}
