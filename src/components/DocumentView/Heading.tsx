import { tcls } from '@/lib/tailwind';
import IconHash from '@geist-ui/icons/hash';
import { BlockProps } from './Block';
import { Inlines } from './Inlines';

export function Heading(props: BlockProps<any>) {
    const { block, style, ...contextProps } = props;

    const headingStyle = STYLES[block.type];

    const id = block.meta?.id ?? '';

    return (
        <headingStyle.tag
            id={id}
            className={tcls(headingStyle.className, 'group', 'relative', style)}
        >
            <div
                className={tcls(
                    'absolute',
                    ' -ml-8',
                    'hidden',
                    'items-center',
                    'border-0',
                    'opacity-0',
                    'group-hover:opacity-100',
                    'group-focus:opacity-100',
                    'lg:flex',
                    headingStyle.lineHeight,
                )}
            >
                <a
                    href={`#${id}`}
                    aria-label="Direct link to heading"
                    className={tcls(
                        'flex',
                        'h-6',
                        'w-6',
                        'items-center',
                        'justify-center',
                        'rounded-md',
                        'text-slate-400',
                        'shadow-sm',
                        'ring-1',
                        'ring-slate-900/5',
                        'hover:text-slate-700',
                        'hover:shadow',
                        'hover:ring-slate-900/10',
                        'dark:bg-slate-700',
                        'dark:text-slate-300',
                        'dark:shadow-none',
                        'dark:ring-0',
                    )}
                >
                    <IconHash className={tcls('w-4', 'h-4')} />
                </a>
            </div>

            <Inlines {...contextProps} nodes={block.nodes} />
        </headingStyle.tag>
    );
}

const STYLES = {
    'heading-1': {
        tag: 'h2',
        lineHeight: 'h-9',
        className: ['text-3xl', 'font-semibold'],
    },
    'heading-2': {
        tag: 'h3',
        lineHeight: 'h-8',
        className: ['text-2xl', 'font-semibold'],
    },
    'heading-3': {
        tag: 'h4',
        lineHeight: 'h-6',
        className: ['text-base', 'font-semibold'],
    },
};
