import { DocumentBlockContentRef } from '@gitbook/api';

import { LogoIcon } from '@/components/icons';
import { Card, Emoji } from '@/components/primitives';
import { getSpaceCustomization, ignoreAPIError } from '@/lib/api';
import { ResolvedContentRef } from '@/lib/references';

import { BlockProps } from './Block';

export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { block, context, style } = props;

    const resolved = await context.resolveContentRef(block.data.ref, {
        resolveAnchorText: true,
    });

    if (!resolved) {
        return null;
    }

    const isContentInOtherSpace =
        context.contentRefContext?.space &&
        'space' in block.data.ref &&
        context.contentRefContext.space.id !== block.data.ref.space;
    const kind = block?.data?.ref?.kind;
    if ((resolved.active && kind === 'space') || isContentInOtherSpace) {
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

async function SpaceRefCard(
    props: { resolved: ResolvedContentRef } & BlockProps<DocumentBlockContentRef>,
) {
    const { context, style, resolved } = props;
    const spaceId = context.contentRefContext?.space.id;

    if (!spaceId) {
        return null;
    }

    const spaceCustomization = await ignoreAPIError(getSpaceCustomization(spaceId));
    const customFavicon = spaceCustomization?.favicon;
    const customEmoji = customFavicon && 'emoji' in customFavicon ? customFavicon.emoji : undefined;
    const customIcon = customFavicon && 'icon' in customFavicon ? customFavicon.icon : undefined;

    return (
        <Card
            leadingIcon={
                <LogoIcon
                    icon={customIcon}
                    emoji={customEmoji}
                    alt=""
                    sizes={[{ width: 24 }]}
                    style={['object-contain', 'size-6']}
                />
            }
            href={resolved.href}
            title={resolved.subText ?? resolved.text}
            postTitle={resolved.subText ? resolved.text : undefined}
            style={style}
        />
    );
}
