import { RevisionPageLink } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { Link } from '@/components/primitives';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { TOCPageIcon } from './TOCPageIcon';

export async function PageLinkItem(props: { page: RevisionPageLink; context: ContentRefContext }) {
    const { page, context } = props;

    const resolved = await resolveContentRef(page.target, context);

    return (
        <li className={tcls('flex', 'flex-col')}>
            <Link
                href={resolved?.href ?? '#'}
                className={tcls(
                    'flex',
                    'justify-start',
                    'items-center',
                    'gap-3',
                    'p-1.5',
                    'pl-3',
                    'text-sm',
                    'transition-colors',
                    'duration-100',
                    'text-dark/8',
                    'rounded-md',
                    'straight-corners:rounded-none',
                    'before:content-none',
                    'dark:text-light/7',
                    'font-normal',
                    'hover:bg-dark/1',
                    'dark:hover:bg-light/2',
                )}
                insights={{
                    target: page.target,
                    position: 'sidebar',
                }}
            >
                <TOCPageIcon page={page} />
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
