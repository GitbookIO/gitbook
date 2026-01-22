import {
    type ContentRef,
    type DocumentBlockContentRef,
    SiteInsightsLinkPosition,
} from '@gitbook/api';

import { Card, type CardProps } from '@/components/primitives';
import {
    type ResolvedContentRef,
    resolveContentRefFallback,
    resolveContentRefInDocument,
} from '@/lib/references';

import type { BlockProps } from './Block';
import { NotFoundRefHoverCard } from './NotFoundRefHoverCard';

export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { document, block, context, style } = props;

    const resolved = context.contentContext
        ? await resolveContentRefInDocument(document, block.data.ref, context.contentContext, {
              resolveAnchorText: true,
              iconStyle: ['text-xl', 'text-tint'],
          })
        : null;

    if (!resolved) {
        const fallback = resolveContentRefFallback(block.data.ref);
        if (!fallback) {
            return null;
        }
        return (
            <NotFoundRefHoverCard context={context}>
                <BlockContentRefCard
                    contentRef={block.data.ref}
                    resolved={fallback}
                    style={style}
                />
            </NotFoundRefHoverCard>
        );
    }

    return <BlockContentRefCard contentRef={block.data.ref} resolved={resolved} style={style} />;
}

function BlockContentRefCard(
    props: {
        resolved: ResolvedContentRef;
        contentRef: ContentRef;
    } & Omit<CardProps, 'href' | 'title'>
) {
    const { ref, resolved, contentRef, ...rest } = props;
    return (
        <Card
            ref={ref}
            leadingIcon={resolved.icon ? resolved.icon : null}
            href={resolved.href}
            title={resolved.text}
            insights={{
                type: 'link_click',
                link: {
                    target: contentRef,
                    position: SiteInsightsLinkPosition.Content,
                },
            }}
            {...rest}
        />
    );
}
