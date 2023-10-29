import Image from 'next/image'

import { BlockProps } from './Block';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { ClassValue, tcls } from '@/lib/tailwind';
import { getNodeFragmentByName, isNodeEmpty } from '@/lib/document';
import { Inlines } from './Inlines';

export function Images(props: BlockProps<any>) {
    const { block, style, ...contextProps } = props;

    return (
        <div className={tcls(
            'w-full',
            'flex',
            'flex-row',
            block.data.align === 'center' && 'justify-center',
            block.data.align === 'right' && 'justify-end',
            block.data.align === 'left' && 'justify-start',
            style,
            block.data.fullWidth ? 'max-w-full' : null,
        )}>
            {block.nodes.map((node: any, i: number) => (
                <ImageBlock
                    key={node.key}
                    block={node}
                    style={[i > 0 && 'mt-4', style]}
                    siblings={block.nodes.length}
                    {...contextProps}
                />
            ))}
        </div>
    );
}

async function ImageBlock(props: {
    block: any;
    style: ClassValue;
    context: ContentRefContext;
    siblings: number;
}) {
    const { block, context, siblings } = props;

    const [src, darkSrc] = await Promise.all([
        resolveContentRef(block.data.ref, context),
        block.data.darkRef ? resolveContentRef(block.data.darkRef, context) : null
    ]);

    if (!src) {
        return null;
    }

    const caption = getNodeFragmentByName(block, 'caption');

    const image = (
        <img alt={block.data.alt} src={src.href} className={tcls('rounded')} />
    );

    if (!caption || isNodeEmpty(caption)) {
        return image;
    }

    return (
        <picture className={tcls('relative')}>
            {image}
            <figcaption className={tcls('text-sm', 'text-center', 'mt-2', 'text-slate-500')}>
                <Inlines nodes={caption.nodes[0].nodes} context={context} />
            </figcaption>
        </picture>
    );
}
