import { type DocumentInlineMention, SiteInsightsLinkPosition } from '@gitbook/api';

import { StyledLink } from '@/components/primitives';
import { resolveContentRef } from '@/lib/references';
import { toSlimTrackEvent } from '../Insights';

import type { InlineProps } from './Inline';

export async function Mention(props: InlineProps<DocumentInlineMention>) {
    const { inline, context } = props;

    const resolved = context.contentContext
        ? await resolveContentRef(inline.data.ref, context.contentContext, {
              resolveAnchorText: true,
          })
        : null;

    if (!resolved) {
        return null;
    }

    return (
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
            {resolved.text}
        </StyledLink>
    );
}
