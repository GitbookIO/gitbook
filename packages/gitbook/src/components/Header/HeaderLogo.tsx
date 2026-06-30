import type { GitBookSiteContext } from '@/lib/context';

import { Image } from '@/components/utils';

import { resolveContentRef } from '@/lib/references';
import { Link } from '../primitives';
import { CurrentContentIcon } from './CurrentContentIcon';
import {
    HEADER_LOGO_CONTAINER_CLASS,
    HEADER_LOGO_IMAGE_CLASS,
    HEADER_LOGO_IMAGE_SIZES,
    HeaderLogoContent,
} from './HeaderLogoContent';

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
        <Link
            href={primaryLink?.href ?? linker.toPathInSite('')}
            className={HEADER_LOGO_CONTAINER_CLASS}
        >
            <HeaderLogoContent
                logo={customization.header.logo ? <LogoImage context={context} /> : null}
                fallbackIcon={<LogoFallbackIcon context={context} />}
                title={context.site.title}
            />
        </Link>
    );
}

function LogoImage(props: HeaderLogoProps) {
    const { context } = props;
    const { customization } = context;

    if (!customization.header.logo) {
        return null;
    }

    return (
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
            sizes={HEADER_LOGO_IMAGE_SIZES}
            preload
            style={HEADER_LOGO_IMAGE_CLASS}
        />
    );
}

function LogoFallbackIcon(props: HeaderLogoProps) {
    const { context } = props;

    return (
        <CurrentContentIcon
            context={context}
            alt=""
            sizes={[{ width: 32 }]}
            style={['object-contain', 'size-8']}
            fetchPriority="high"
        />
    );
}
