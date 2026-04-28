import type { GitBookSiteContext } from '@/lib/context';

import { Image } from '@/components/utils';
import { tcls } from '@/lib/tailwind';

import { resolveContentRef } from '@/lib/references';
import { Link } from '../primitives';
import { CurrentContentIcon } from './CurrentContentIcon';

interface HeaderLogoProps {
    context: GitBookSiteContext;
}

/**
 * We previously gave the logo too much height, making it too big to look good.
 * As a response, many orgs added padding inside their logos to make them look better.
 * The new logo max-height looks better but might make existing logos look too small.
 * To avoid disruption, we only use the new (correct) logo height for logos updated after this date.
 */
const HEADER_COMPACT_LOGO_DATE = '2026-04-28T00:00:00.000Z';

/**
 * Render the logo for a space using the customization settings.
 */

export async function HeaderLogo(props: HeaderLogoProps) {
    const { context } = props;
    const { customization, linker } = context;
    const canUseCompactHeaderLogo =
        customization.updatedAt &&
        !Number.isNaN(Date.parse(customization.updatedAt)) &&
        Date.parse(customization.updatedAt) < Date.parse(HEADER_COMPACT_LOGO_DATE);

    const primaryLink = customization.header.primaryLink
        ? await resolveContentRef(customization.header.primaryLink, context)
        : null;

    return (
        <Link
            href={primaryLink?.href ?? linker.toPathInSite('')}
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
                    preload
                    style={tcls(
                        'overflow-hidden',
                        'shrink',
                        'min-w-0',
                        'max-w-40',
                        'lg:max-w-64',
                        'lg:site-header-none:page-no-toc:max-w-56',
                        canUseCompactHeaderLogo ? 'max-h-8' : 'max-h-10',
                        'h-full',
                        'w-full',
                        'object-contain',
                        'object-left'
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
