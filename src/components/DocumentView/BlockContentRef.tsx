import { resolveContentRef } from '@/lib/references';
import { DocumentBlockContentRef } from '@gitbook/api';
import { BlockProps } from './Block';
import { tcls } from '@/lib/tailwind';
import IconFile from '@geist-ui/icons/file';

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
                'border-slate-200',
                'hover:border-slate-300',
                'px-5',
                'py-2',
                'text-slate-500',
                'hover:text-slate-700',
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
