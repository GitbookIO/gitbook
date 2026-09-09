import '../../components/RootLayout/globals.css';
import '../../components/DocumentView/Integration/contentkit.css';
import { IconsProvider } from '@gitbook/icons';
import { getInlineIconSourceKey } from '@gitbook/icons/IconSources';

const iconSources = {
    [getInlineIconSourceKey('regular', 'xmark')]: {
        viewBox: '0 0 384 512',
        markup: '<path fill="currentColor" d="M7.5 105c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l151 151 151-151c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-151 151 151 151c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-151-151-151 151c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l151-151-151-151z" />',
    },
};

export const metadata = {
    title: 'Modal harness',
    description: 'Temporary ContentKit modal harness',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <IconsProvider iconSources={iconSources}>{children}</IconsProvider>
            </body>
        </html>
    );
}
