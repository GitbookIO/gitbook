import { Collection, CustomizationSettings, Space } from '@gitbook/api';
import Link from 'next/link';

import { HeaderMobileMenu } from '@/components/Header/HeaderMobileMenu';
import { Image } from '@/components/utils';
import { absoluteHref } from '@/lib/links';
import { ClassValue, tcls } from '@/lib/tailwind';

interface HeaderLogoProps {
    collection: Collection | null;
    space: Space;
    customization: CustomizationSettings;
    /** Style applied when the logo is a text one */
    textStyle?: ClassValue;
}

/**
 * Render the logo for a space using the customization settings.
 */
export function HeaderLogo(props: HeaderLogoProps) {
    const { customization } = props;

    return (
        <div className={tcls('flex', 'flex-row', 'gap-3')}>
            <HeaderMobileMenu className={tcls('lg:hidden')} />
            <Link
                href={absoluteHref('')}
                className={tcls('group/headerlogo', 'flex', 'flex-row', 'items-center', 'shrink-0')}
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
                                width: 128,
                            },
                            {
                                width: 192,
                            },
                        ]}
                        priority="high"
                        style={tcls(
                            'max-w-[8rem]',
                            'lg:max-w-[12rem]',
                            'max-h-[3rem]',
                            'rounded',
                            'overflow-hidden',
                            'object-contain',
                        )}
                    />
                ) : (
                    <>
                        <LogoFallback {...props} />
                    </>
                )}
            </Link>
        </div>
    );
}

function LogoFallback(props: HeaderLogoProps) {
    const { collection, space, customization, textStyle } = props;
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    return (
        <>
            <Image
                alt="Logo"
                sources={
                    customIcon
                        ? {
                              light: {
                                  src: customIcon.light,
                                  size: { aspectRatio: 1 },
                              },
                              dark: customIcon.dark
                                  ? {
                                        src: customIcon.dark,
                                        size: { aspectRatio: 1 },
                                    }
                                  : null,
                          }
                        : {
                              light: {
                                  src: absoluteHref('.gitbook/icon?size=medium&theme=light'),
                                  size: { width: 256, height: 256 },
                              },
                              dark: {
                                  src: absoluteHref('.gitbook/icon?size=medium&theme=dark'),
                                  size: { width: 256, height: 256 },
                              },
                          }
                }
                sizes={[]}
                fetchPriority="high"
                style={['w-8', 'h-8', 'rounded', 'overflow-hidden', 'border', 'border-dark/2']}
            />

            <h1
                className={tcls(
                    'textwrap-balance',
                    'flex',
                    'leading-tight',
                    'tracking-tight',
                    'max-w-[13ch]',
                    'lg:max-w-none',
                    'lg:text-lg/tight',
                    'font-semibold',
                    'ms-3',
                    textStyle,
                )}
            >
                {collection ? collection.title : space.title}
            </h1>
        </>
    );
}
