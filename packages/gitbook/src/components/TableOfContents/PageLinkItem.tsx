import { RevisionPageLink } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { Emoji, Link } from '@/components/primitives';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

export async function PageLinkItem(props: { page: RevisionPageLink; context: ContentRefContext }) {
    const { page, context } = props;

    const resolved = await resolveContentRef(page.target, context);

    return (
        <li className={tcls('flex', 'flex-col')}>
            <Link
                href={resolved?.href ?? '#'}
                className={tcls(
                    'flex',
                    'flex-row',
                    'justify-start',
                    'items-center',
                    'gap-3',
                    'pl-5',
                    'pr-1.5',
                    'py-1.5',
                    'text-sm',
                    'transition-colors',
                    'duration-100',
                    'text-dark/8',
                    'rounded-md',
                    'straight-corners:rounded-none',
                    'dark:text-light/7',
                    'font-normal',
                    'hover:bg-dark/1',
                    'dark:hover:bg-light/2',
                )}
            >
                {page.emoji ? <Emoji code={page.emoji} /> : null}
                {page.title}
                <Icon
                    icon="arrow-up-right-from-square"
                    className={tcls(
                        'size-3',
                        'mr-1',
                        'mt-1',
                        'place-self-start',
                        'shrink-0',
                        'text-current',
                        'transition-colors',
                        '[&>path]:transition-[opacity]',
                        '[&>path]:[opacity:0.40]',
                        'group-hover:[&>path]:[opacity:1]',
                    )}
                />
            </Link>
        </li>
    );
}
