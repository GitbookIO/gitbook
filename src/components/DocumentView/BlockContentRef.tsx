import IconFile from '@geist-ui/icons/file';
import { DocumentBlockContentRef } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';

export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { block, context, style } = props;

    const resolved = await resolveContentRef(block.data.ref, context);
    if (!resolved) {
        return null;
    }

    return (
        <a
            href={resolved.href}
            className={tcls(
                'flex',
                'flex-row',
                'items-center',
                'rounded',
                'border',
                'border-dark/2',
                'hover:border-dark/4',
                'px-5',
                'py-2',
                'hover:text-dark',
                'dark:border-light/2',
                'dark:hover:text-light',
                'dark:hover:border-light/4',
                style,
            )}
        >
            <div className={tcls('mr-5')}>
                <IconFile className={tcls('w-6', 'h-6')} />
            </div>
            <div>
                <div className={tcls('text-base')}>{resolved.text}</div>
            </div>
        </a>
    );
}
