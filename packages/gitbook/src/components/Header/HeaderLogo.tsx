import {
    CustomizationSettings,
    Site,
    SiteCustomizationSettings,
} from '@gitbook/api';

import { Image } from '@/components/utils';
import { getAbsoluteHref } from '@/lib/links';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
import { SpaceIcon } from '../Space/SpaceIcon';

interface HeaderLogoProps {
    site: Site;
    customization: CustomizationSettings | SiteCustomizationSettings;
}

/**
 * Render the logo for a space using the customization settings.
 */

export async function HeaderLogo(props: HeaderLogoProps) {
    const { customization } = props;
    const href = await getAbsoluteHref('');

    return (
        <Link
            href={href}
            className={tcls('group/headerlogo', 'min-w-0', 'shrink', 'flex', 'items-center')}
        >
            {customization.header.logo ? (
                <Image
                    alt="Logo"
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
                        'max-h-10',
                        'lg:max-h-12',
                        'h-full',
                        'w-auto',
                    )}
                />
            ) : (
                <LogoFallback {...props} />
            )}
        </Link>
    );
}

function LogoFallback(props: HeaderLogoProps) {
    const { site, customization } = props;
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : undefined;
    const customEmoji = 'emoji' in customization.favicon ? customization.favicon.emoji : undefined;

    return (
        <>
            <SpaceIcon
                icon={customIcon}
                emoji={customEmoji}
                alt=""
                sizes={[{ width: 32 }]}
                style={['object-contain', 'size-8']}
                fetchPriority="high"
            />
            <div
                className={tcls(
                    'text-pretty',
                    'line-clamp-3',
                    'tracking-tight',
                    'max-w-[18ch]',
                    'lg:max-w-[24ch]',
                    'font-semibold',
                    'ms-3',
                    'text-base/tight',
                    'lg:text-lg/tight',
                    'text-tint-strong',
                    'theme-bold:text-header-link',
                )}
            >
                {site.title}
            </div>
        </>
    );
}
