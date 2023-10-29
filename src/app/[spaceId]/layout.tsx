import { Inter } from 'next/font/google';
import './globals.css';
import { tcls } from '@/lib/tailwind';

const inter = Inter({ subsets: ['latin'] });

export default function SpaceRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={tcls(inter.className, 'bg-white', 'dark:bg-slate-950')}>
                {children}
            </body>
        </html>
    );
}
