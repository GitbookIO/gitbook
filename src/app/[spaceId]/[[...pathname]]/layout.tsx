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
                        --primary-color-500: ${customization.styling.primaryColor.light};
                    }
                    .dark {
                        --primary-color-500: ${customization.styling.primaryColor.dark};
                    }
                `}</style>
            </head>
            <body className={tcls(inter.className, 'bg-white', 'dark:bg-slate-950')}>
                {children}
            </body>
        </html>
    );
}
