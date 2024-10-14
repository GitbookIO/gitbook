import { CustomizationRootLayout } from '@/components/RootLayout';
import { getSiteLayoutData, getSpaceLayoutData } from '@/lib/api';
import { getSiteContentPointer } from '@/lib/pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the site
 * and initializes the CustomizationRootLayout with it.
 */
export default async function SiteRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = getSiteContentPointer();
    const { customization } = await getSiteLayoutData(pointer);

    return (
        <CustomizationRootLayout customization={customization}>{children}</CustomizationRootLayout>
    );
}
