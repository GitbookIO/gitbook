import { type DocumentInlineLink, SiteInsightsLinkPosition } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';
import { Icon } from '@gitbook/icons';
import { toSlimTrackEvent } from '../Insights';
import { StyledLink } from '../primitives';
import type { InlineProps } from './Inline';
import { InlineLinkTooltip } from './InlineLinkTooltip';
import { Inlines } from './Inlines';

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
                <Inlines
                    context={context}
                    document={document}
                    nodes={inline.nodes}
                    ancestorInlines={[...ancestorInlines, inline]}
                />
            </span>
        );
    }
    const isExternal = inline.data.ref.kind === 'url';

    return (
        <InlineLinkTooltip inline={inline} context={context.contentContext} resolved={resolved}>
            <StyledLink
                href={resolved.href}
                insights={toSlimTrackEvent({
                    type: 'link_click',
                    link: {
                        target: inline.data.ref,
                        position: SiteInsightsLinkPosition.Content,
                    },
                })}
            >
                <Inlines
                    context={context}
                    document={document}
                    nodes={inline.nodes}
                    ancestorInlines={[...ancestorInlines, inline]}
                />
                {isExternal ? (
                    <Icon
                        icon="arrow-up-right"
                        className="ml-0.5 inline size-3 links-accent:text-tint-subtle"
                    />
                ) : null}
            </StyledLink>
        </InlineLinkTooltip>
    );
}
