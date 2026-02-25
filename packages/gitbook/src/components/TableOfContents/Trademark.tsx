import type { SiteInsightsTrademarkPlacement } from '@gitbook/api';

import { getSpaceLanguage, tString } from '@/intl/server';
import { tcls } from '@/lib/tailwind';

import type { GitBookSpaceContext } from '@/lib/context';
import { Button, type ButtonProps } from '../primitives';

/**
 * Trademark link to the GitBook.
 */
export function Trademark(
    props: {
        context: GitBookSpaceContext;
        placement: SiteInsightsTrademarkPlacement;
        className?: string;
    } & ButtonProps
) {
    const { context, placement, className, ...buttonProps } = props;
    const { space } = context;
    const language = getSpaceLanguage(context);

    const url = new URL('https://www.gitbook.com');
    url.searchParams.set('utm_source', 'content');
    url.searchParams.set('utm_medium', 'trademark');
    url.searchParams.set('utm_campaign', space.id);

    return (
        <Button
            target="_blank"
            variant="secondary"
            size="large"
            href={url.toString()}
            className={tcls(
                'text-sm',
                'font-semibold',
                'text-tint',

                'items-center',
                'gap-3',

                'bg-transparent',
                'depth-subtle:shadow-none',
                'border-tint-subtle',

                className
            )}
            icon="gitbook"
            label={tString(language, 'powered_by_gitbook')}
            insights={{
                type: 'trademark_click',
                placement,
            }}
            {...buttonProps}
        />
    );
}
