import { CustomizationRootLayout } from '@/components/RootLayout';
import { defaultCustomization } from '@/lib/utils';
import { CustomizationThemeMode } from '@gitbook/api';
import type { GitBookSiteContext, GitBookSpaceContext } from '@v2/lib/context';

/**
 * Layout to be used for rendering the PDF.
 */
export async function PDFRootLayout(props: {
    context: GitBookSpaceContext | GitBookSiteContext;
    children: React.ReactNode;
}) {
    const { context, children } = props;

    return (
        <CustomizationRootLayout
            customization={
                'customization' in context ? context.customization : defaultCustomization()
            }
            forcedTheme={CustomizationThemeMode.Light}
        >
            {children}
        </CustomizationRootLayout>
    );
}
