import { type ClassValue, tcls } from '@/lib/tailwind';
import { matchString } from './HighlightQuery.utils';

/**
 * Match a string against a query and render the matching text in bold.
 */
export function HighlightQuery(props: {
    /** Query to match in the `text` */
    query: string;
    /** Text input */
    text: string;
    /** Style to apply on matching parts (default to primary) */
    highlight?: ClassValue;
}): React.ReactElement {
    const {
        query,
        text,
        highlight = [
            '-z-1',
            'relative',
            'text-bold',
            'bg-primary',
            'text-contrast-primary',
            'px-0.5',
            '-mx-0.5',
            'py-0.5',
            'rounded-sm',
            'straight-corners:rounded-xs',
            'transition-colors',
            'group-hover:bg-primary-active',
            'group-hover:text-contrast-primary-active',
            'group-[.is-active]:bg-primary-active',
            'group-[.is-active]:text-contrast-primary-active',
        ],
    } = props;
    const matches = matchString(text, query);

    return (
        <span className={tcls('relative z-2 whitespace-break-spaces')}>
            {matches.map((entry, index) => (
                <span key={index} className={tcls(entry.match ? highlight : null)}>
                    {entry.text}
                </span>
            ))}
        </span>
    );
}
