import { CustomizationDefaultThemeMode } from '@gitbook/api';

import { PRINT_STYLES } from './printStyles';
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
            <style href="pdf-print" precedence="blocks">
                {PRINT_STYLES}
            </style>
            {children}
        </CustomizationRootLayout>
    );
}
