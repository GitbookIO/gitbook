import { CustomizationRootLayout } from '@/components/RootLayout';
import { defaultCustomizationForSpace } from '@/lib/utils';

import { getV1ContextForPDF } from './pointer';

/**
 * Layout to be used for the site root. It fetches the customization data for the
 * site or space and initializes the CustomizationRootLayout with it.
 */
export default async function PDFRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const context = await getV1ContextForPDF();

    return (
        <CustomizationRootLayout
            customization={
                'customization' in context ? context.customization : defaultCustomizationForSpace()
            }
        >
            {children}
        </CustomizationRootLayout>
    );
}
