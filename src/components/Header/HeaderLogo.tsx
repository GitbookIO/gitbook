import { absoluteHref } from '@/lib/links';
import { ClassValue, tcls } from '@/lib/tailwind';
import { Collection, CustomizationSettings, Space } from '@gitbook/api';
import Link from 'next/link';
import { Image } from '@/components/utils';

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
        <Link
            href={absoluteHref('')}
            className={tcls('group/headerlogo', 'flex', 'flex-row', 'items-center')}
        >
            {customization.header.logo ? (
                <Image
                    alt="Logo"
                    src={customization.header.logo}
                    fetchPriority="high"
                    style={['max-w-50', 'h-8']}
                />
            ) : (
                <LogoFallback {...props} />
            )}
        </Link>
    );
}

function LogoFallback(props: HeaderLogoProps) {
    const { collection, space, customization, textStyle } = props;
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    return (
        <>
            <Image
                alt="Logo"
                src={
                    customIcon ?? {
                        light: absoluteHref('.gitbook/icon?size=medium&theme=light'),
                        dark: absoluteHref('.gitbook/icon?size=medium&theme=dark'),
                    }
                }
                fetchPriority="high"
                style={['w-8', 'h-8']}
            />

            <h1 className={tcls('text-lg', 'text-slate-800', 'font-semibold', 'ms-3', textStyle)}>
                {collection ? collection.title : space.title}
            </h1>
        </>
    );
}
