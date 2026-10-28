import { CustomizationDefaultThemeMode } from '@gitbook/api';

import { CustomizationRootLayout } from '@/components/RootLayout';
import type { GitBookSiteContext, GitBookSpaceContext } from '@/lib/context';

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
            context={context}
            forcedTheme={CustomizationDefaultThemeMode.Light}
        >
            {children}
        </CustomizationRootLayout>
    );
}
