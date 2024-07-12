import { CustomizationThemedURL, DocumentBlockContentRef } from '@gitbook/api';

import { Card, Emoji } from '@/components/primitives';
import { getSpaceCustomization, ignoreAPIError } from '@/lib/api';
import { ResolvedContentRef } from '@/lib/references';

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

    const kind = block?.data?.ref?.kind;
    if (resolved.active && kind === 'space') {
        return <SpaceRefCard {...props} resolved={resolved} />;
    }

    return (
        <Card
            leadingIcon={resolved.emoji ? <Emoji code={resolved.emoji} style="text-xl" /> : null}
            href={resolved.href}
            title={resolved.text}
            style={style}
        />
    );
}

async function SpaceRefCard(props: { resolved: ResolvedContentRef } & BlockProps<DocumentBlockContentRef>) {
    const { context, style, resolved } = props;
    const spaceId = context.contentRefContext?.space.id;

    if (!spaceId) { return null; }

    const spaceCustomization = await ignoreAPIError(getSpaceCustomization(spaceId));
    const customFavicon = spaceCustomization?.favicon;
    const customEmoji = customFavicon && 'emoji' in customFavicon ? customFavicon.emoji : null;
    const customIcon = customFavicon && 'icon' in customFavicon ? customFavicon.icon : null;

    return (
        <Card
            leadingIcon={customIcon ? <BlockContentRefIcon icon={customIcon} /> : customEmoji ? <Emoji code={customEmoji} style="text-xl" /> : null}
            href={resolved.href}
            title={resolved.text}
            style={style}
        />
    );
}

function BlockContentRefIcon(props: { icon: CustomizationThemedURL }) {
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
