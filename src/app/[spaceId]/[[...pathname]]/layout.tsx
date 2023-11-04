import shadesOf from 'tailwind-shades';
import { Inter } from 'next/font/google';
import { tcls } from '@/lib/tailwind';
import { PagePathParams, fetchPageData } from '../fetch';

const inter = Inter({ subsets: ['latin'] });

export default async function SpaceRootLayout(props: {
    children: React.ReactNode;
    params: PagePathParams;
}) {
    const { children, params } = props;
    const { customization } = await fetchPageData(params);

    return (
        <html lang={customization.internationalization.locale}>
            <head>
                <style>{`
                    :root {
                        ${generateCSSVariable(
                            'primary-color',
                            customization.styling.primaryColor.light,
                        )}
                    }
                    .dark {
                        ${generateCSSVariable(
                            'primary-color',
                            customization.styling.primaryColor.dark,
                        )}
                    }
                `}</style>
            </head>
            <body className={tcls(inter.className, 'bg-white', 'dark:bg-slate-950')}>
                {children}
            </body>
        </html>
    );
}

function generateCSSVariable(name: string, color: string) {
    const shades: Record<number, string> = shadesOf(color);

    return Object.entries(shades)
        .map(([key, value]) => {
            return `--${name}-${key}: ${value};`;
        })
        .join('\n');
}
