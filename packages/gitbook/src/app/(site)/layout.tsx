import { CustomizationRootLayout } from '@/components/RootLayout';
import { getSiteData } from '@/lib/api';
import { checkIsFromMiddleware } from '@/lib/pages';
import { getSiteContentPointer } from '@/lib/pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the site
 * and initializes the CustomizationRootLayout with it.
 */
export default async function SiteRootLayout(props: { children: React.ReactNode }) {
    const fromMiddleware = await checkIsFromMiddleware();
    if (!fromMiddleware) {
        return (
            <html lang="en">
                <body className="font-[sans-serif]">
                    <main>{props.children}</main>
                </body>
            </html>
        );
    }

    const pointer = await getSiteContentPointer();
    const { customization } = await getSiteData(pointer);

    return (
        <CustomizationRootLayout customization={customization}>
            {props.children}
        </CustomizationRootLayout>
    );
}
