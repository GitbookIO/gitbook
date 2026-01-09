import type { SiteInsightsTrademarkPlacement } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { getSpaceLanguage, tString } from '@/intl/server';
import { tcls } from '@/lib/tailwind';

import type { GitBookSpaceContext } from '@/lib/context';
import { Button } from '../primitives';

/**
 * Trademark link to the GitBook.
 */
export function Trademark(props: {
    context: GitBookSpaceContext;
    placement: SiteInsightsTrademarkPlacement;
    className?: string;
}) {
    const { context, placement, className } = props;
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

                'flex',
                'flex-row',
                'items-center',
                'px-5',
                'py-4',
                'gap-3',
                'whitespace-normal',

                'bg-transparent',
                'depth-subtle:shadow-none',
                'border-tint-subtle',

                className
            )}
            icon={<Icon icon="gitbook" className="size-5 shrink-0" />}
            label={tString(language, 'powered_by_gitbook')}
            insights={{
                type: 'trademark_click',
                placement,
            }}
        />
    );
}
