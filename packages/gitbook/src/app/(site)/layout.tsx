import { SpaceRootLayout } from '@/components/SpaceRootLayout';
import { getSiteLayoutData, getSpaceLayoutData } from '@/lib/api';
import { getSiteContentPointer } from '@/lib/pointer';

/**
 * Layout shared between the content and the PDF renderer.
 * It takes care of setting the theme and the language.
 */
export default async function SiteRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const pointer = getSiteContentPointer();
    const { customization } = await getSiteLayoutData(pointer);

    return <SpaceRootLayout customization={customization}>{children}</SpaceRootLayout>;
}
