import { type DocumentInlineLink, SiteInsightsLinkPosition } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';
import { StyledLink } from '../primitives';
import type { InlineProps } from './Inline';
import { renderInlines } from './Inlines';

export async function InlineLink(props: InlineProps<DocumentInlineLink>) {
    const { inline, document, context, ancestorInlines } = props;

    const resolved = context.contentContext
        ? await resolveContentRef(inline.data.ref, context.contentContext, {
              // We don't want to resolve the anchor text here, as it can be very expensive and will block rendering if there is a lot of anchors link.
              resolveAnchorText: false,
          })
        : null;

    if (!context.contentContext || !resolved) {
        return (
            <span title="Broken link" className="underline">
                {renderInlines({
                    context,
                    document,
                    nodes: inline.nodes,
                    ancestorInlines: [...ancestorInlines, inline],
                })}
            </span>
        );
    }

    return (
        <StyledLink
            href={resolved.href}
            insights={{
                type: 'link_click',
                link: {
                    target: inline.data.ref,
                    position: SiteInsightsLinkPosition.Content,
                },
            }}
        >
            {renderInlines({
                context,
                document,
                nodes: inline.nodes,
                ancestorInlines: [...ancestorInlines, inline],
            })}
        </StyledLink>
    );
}
