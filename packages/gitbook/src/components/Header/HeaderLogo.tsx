import type { GitBookSiteContext } from '@v2/lib/context';

import { Image } from '@/components/utils';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
import { CurrentContentIcon } from './CurrentContentIcon';

interface HeaderLogoProps {
    context: GitBookSiteContext;
}

/**
 * Render the logo for a space using the customization settings.
 */

export async function HeaderLogo(props: HeaderLogoProps) {
    const { context } = props;
    const { customization, linker } = context;

    return (
        <Link
            href={linker.toAbsoluteURL(linker.toPathInSpace(''))}
            className={tcls('group/headerlogo', 'min-w-0', 'shrink', 'flex', 'items-center')}
        >
            {customization.header.logo ? (
                <Image
                    alt="Logo"
                    resize={context.imageResizer}
                    sources={{
                        light: {
                            src: customization.header.logo.light,
                        },
                        dark: customization.header.logo.dark
                            ? {
                                  src: customization.header.logo.dark,
                              }
                            : null,
                    }}
                    sizes={[
                        {
                            media: '(max-width: 1024px)',
                            width: 160,
                        },
                        {
                            width: 260,
                        },
                    ]}
                    priority="high"
                    style={tcls(
                        'rounded',
                        'straight-corners:rounded-sm',
                        'overflow-hidden',
                        'shrink',
                        'min-w-0',
                        'max-w-40',
                        'lg:max-w-64',
                        'site-header-none:page-no-toc:lg:max-w-56',
                        'max-h-10',
                        'lg:max-h-12',
                        'h-full',
                        'w-auto'
                    )}
                />
            ) : (
                <LogoFallback {...props} />
            )}
        </Link>
    );
}

function LogoFallback(props: HeaderLogoProps) {
    const { context } = props;
    const { site } = context;

    return (
        <>
            <CurrentContentIcon
                context={context}
                alt=""
                sizes={[{ width: 32 }]}
                style={['object-contain', 'size-8']}
                fetchPriority="high"
            />
            <div
                className={tcls(
                    'text-pretty',
                    'line-clamp-2',
                    'tracking-tight',
                    'max-w-[18ch]',
                    'lg:max-w-[24ch]',
                    'font-semibold',
                    'ms-3',
                    'text-base/tight',
                    'lg:text-lg/tight',
                    'text-tint-strong',
                    'theme-bold:text-header-link'
                )}
            >
                {site.title}
            </div>
        </>
    );
}
