import { absoluteHref } from '@/lib/links';
import { ClassValue, tcls } from '@/lib/tailwind';
import { Collection, Space } from '@gitbook/api';
import Link from 'next/link';

/**
 * Render the logo for a space using the customization settings.
 * TODO:
 *  - Image logo
 *  - Or fallback to text with icon before
 */
export function HeaderLogo(props: {
    collection: Collection | null;
    space: Space;
    customization: any;

    /** Style applied when the logo is a text one */
    textStyle?: ClassValue;
}) {
    const { collection, space, textStyle } = props;

    return (
        <Link href={absoluteHref('')} className={tcls('group/headerlogo')}>
            <h1 className={tcls('text-lg', 'text-slate-800', 'font-semibold', textStyle)}>
                {collection ? collection.title : space.title}
            </h1>
        </Link>
    );
}
