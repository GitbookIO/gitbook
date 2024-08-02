import { DocumentBlockContentRef } from '@gitbook/api';

import { Card, Emoji } from '@/components/primitives';
import { getSpaceCustomization, ignoreAPIError } from '@/lib/api';
import { ResolvedContentRef } from '@/lib/references';

import { BlockProps } from './Block';
import { SpaceIcon } from '../Space/SpaceIcon';

export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { block, context, style } = props;

    const resolved = await context.resolveContentRef(block.data.ref, {
        resolveAnchorText: true,
        iconStyle: ['text-xl', 'text-dark/6', 'dark:text-light/6'],
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
            leadingIcon={resolved.icon ? resolved.icon : null}
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
                <SpaceIcon
                    icon={customIcon}
                    emoji={customEmoji}
                    alt=""
                    sizes={[{ width: 24 }]}
                    style={['object-contain', 'size-6']}
                />
            }
            href={resolved.href}
            title={resolved.text}
            postTitle={resolved.subText}
            style={style}
        />
    );
}
