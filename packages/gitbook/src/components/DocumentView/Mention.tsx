import { type DocumentInlineMention, SiteInsightsLinkPosition } from '@gitbook/api';

import { StyledLink } from '@/components/primitives';
import { resolveContentRefInDocument } from '@/lib/references';

import type { InlineProps } from './Inline';

export async function Mention(props: InlineProps<DocumentInlineMention>) {
    const { document, inline, context } = props;

    const resolved = context.contentContext
        ? await resolveContentRefInDocument(document, inline.data.ref, context.contentContext, {
              resolveAnchorText: true,
          })
        : null;

    if (!resolved) {
        return null;
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
            {resolved.text}
        </StyledLink>
    );
}
