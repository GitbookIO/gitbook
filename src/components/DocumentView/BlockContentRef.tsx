import { CustomizationThemedURL, DocumentBlockContentRef } from '@gitbook/api';

import { Card, Emoji } from '@/components/primitives';

import { BlockProps } from './Block';
import { Image } from '../utils';



export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { block, context, style } = props;

    const resolved = await context.resolveContentRef(block.data.ref, {
        resolveAnchorText: true,
    });

    if (!resolved) {
        return null;
    }
    
    return (
        <Card
            leadingIcon={resolved.icon ? <BlockContentRefIcon icon={resolved.icon} /> : resolved.emoji ? <Emoji code={resolved.emoji} style="text-xl" /> : null}
            href={resolved.href}
            title={resolved.text}
            style={style}
        />
    );
}

function BlockContentRefIcon(props: { icon: string | CustomizationThemedURL }) {
    const { icon } = props;
            
    return icon ? <Image 
        priority='lazy' 
        alt=""
        sources={{
            light: {
                src: typeof icon ==='string' ? icon : icon.light,
                size: { width: 256, height: 256 },
            },
            dark: {
                src:  typeof icon ==='string' ? icon : icon.dark,
                size: { width: 256, height: 256 },
            },
        }}
        sizes={[{ width: 24 }]}
        className="size-6 flex-1 object-contain"
    /> : null;
}
