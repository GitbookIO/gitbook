import {
    Collection,
    CustomizationHeaderPreset,
    CustomizationSettings,
    Site,
    SiteCustomizationSettings,
    Space,
} from '@gitbook/api';

import { HeaderMobileMenu } from '@/components/Header/HeaderMobileMenu';
import { Image } from '@/components/utils';
import { absoluteHref } from '@/lib/links';
import { tcls } from '@/lib/tailwind';
import { getContentTitle } from '@/lib/utils';

import { Link } from '../primitives';
import { SpaceIcon } from '../Space/SpaceIcon';

interface HeaderLogoProps {
    site: Site | null;
    space: Space;
    customization: CustomizationSettings | SiteCustomizationSettings;
}

/**
 * Render the logo for a space using the customization settings.
 */

export function HeaderLogo(props: HeaderLogoProps) {
    const { customization } = props;

    return (
        <Link
            href={absoluteHref('')}
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
    const { site, space, customization } = props;
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
                    customization.header.preset === CustomizationHeaderPreset.Default ||
                        customization.header.preset === CustomizationHeaderPreset.None
                        ? ['text-dark', 'dark:text-light']
                        : 'text-header-link',
                )}
            >
                {getContentTitle(space, customization, site)}
            </div>
        </>
    );
}
