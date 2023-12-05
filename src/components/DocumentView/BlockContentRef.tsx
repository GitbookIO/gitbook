import ChevronRight from '@geist-ui/icons/chevronRight';
import { DocumentBlockContentRef } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';

export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { block, context, style } = props;
    const kind = block?.data?.ref?.kind;

    const resolved = await resolveContentRef(block.data.ref, context);
    if (!resolved) {
        return null;
    }

    return (
        <a
            href={resolved.href}
            className={tcls(
                'group',
                'flex',
                'flex-row',
                'justify-between',
                'items-center',
                'gap-0.5',
                'ring-1',
                'ring-dark/3',
                'rounded',
                'px-5',
                'py-3',
                'transition-shadow',
                'hover:ring-primary/6',
                'hover:ring-primary/8',
                'dark:ring-light/2',
                'dark:hover:text-light',
                'dark:hover:ring-primary-300/4',
                style,
            )}
        >
            <span className={tcls('flex', 'flex-col')}>
                <span className={tcls('uppercase', 'text-xs', 'text-dark/7', 'dark:text-light/6')}>
                    {kind}
                </span>

                <span
                    className={tcls('text-base', 'transition-colors', 'group-hover:text-primary')}
                >
                    {resolved.text}
                </span>
            </span>
            <ChevronRight
                className={tcls(
                    'w-4',
                    'h-4',
                    'stroke-dark/7',
                    'transition-all',
                    'group-hover:translate-x-0.5',
                    'group-hover:stroke-primary/8',
                    'dark:stroke-light/6',
                )}
            />
        </a>
    );
}
