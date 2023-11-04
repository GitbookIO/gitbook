import { absoluteHref } from '@/lib/links';
import { tcls } from '@/lib/tailwind';
import { Space } from '@gitbook/api';
import Link from 'next/link';

/**
 * Render the logo for a space using the customization settings.
 * TODO:
 *  - Image logo
 *  - Or fallback to text with icon before
 */
export function HeaderLogo(props: { space: Space; customization: any }) {
    const { space } = props;

    return (
        <Link href={absoluteHref('')} className={tcls('flex-1')}>
            <h1 className={tcls('text-lg', 'text-slate-800', 'font-semibold')}>{space.title}</h1>
        </Link>
    );
}
