import { Link } from '../primitives';
import { CurrentContentIcon } from './CurrentContentIcon';
import { Image } from '@/components/utils';
import type { GitBookSiteContext } from '@/lib/context';
import { resolveContentRef } from '@/lib/references';

interface HeaderLogoProps {
    context: GitBookSiteContext;
}

/**
 * Render the logo for a space using the customization settings.
 */

export async function HeaderLogo(props: HeaderLogoProps) {
    const { context } = props;
    const { customization, linker } = context;

    const primaryLink = customization.header.primaryLink
        ? await resolveContentRef(customization.header.primaryLink, context)
        : null;

    return (
        <Link href={primaryLink?.href ?? linker.toPathInSite('')} className="header-logo">
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
                    style="header-logo-img"
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
                style="header-logo-icon"
                fetchPriority="high"
            />
            <div className="header-logo-text">{site.title}</div>
        </>
    );
}
