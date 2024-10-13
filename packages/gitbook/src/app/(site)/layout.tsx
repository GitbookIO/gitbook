import { SpaceRootLayout } from '@/components/SpaceRootLayout';
import { getSiteLayoutData, getSpaceLayoutData } from '@/lib/api';
import { getSiteContentPointer } from '@/lib/pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the site
 * and initializes the SpaceRootLayout with it.
 */
export default async function SiteRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = getSiteContentPointer();
    const { customization } = await getSiteLayoutData(pointer);

    return <SpaceRootLayout customization={customization}>{children}</SpaceRootLayout>;
}
