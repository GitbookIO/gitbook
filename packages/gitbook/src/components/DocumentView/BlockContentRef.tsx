import { type DocumentBlockContentRef, SiteInsightsLinkPosition } from '@gitbook/api';

import { Card } from '@/components/primitives';
import { type ResolvedContentRef, resolveContentRef } from '@/lib/references';

import type { BlockProps } from './Block';

export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { block, context, style } = props;

    const resolved = context.contentContext
        ? await resolveContentRef(block.data.ref, context.contentContext, {
              resolveAnchorText: true,
              iconStyle: ['text-xl', 'text-tint'],
          })
        : null;

    if (!resolved) {
        return null;
    }

    const isContentInOtherSpace =
        context.contentContext?.space &&
        'space' in block.data.ref &&
        context.contentContext.space.id !== block.data.ref.space;
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
            insights={{
                type: 'link_click',
                link: {
                    target: block.data.ref,
                    position: SiteInsightsLinkPosition.Content,
                },
            }}
        />
    );
}

async function SpaceRefCard(
    props: { resolved: ResolvedContentRef } & BlockProps<DocumentBlockContentRef>
) {
    const { context, style, resolved } = props;
    const spaceId = context.contentContext?.space.id;

    if (!spaceId) {
        return null;
    }

    return (
        <Card
            href={resolved.href}
            title={resolved.text}
            postTitle={resolved.subText}
            style={style}
        />
    );
}
