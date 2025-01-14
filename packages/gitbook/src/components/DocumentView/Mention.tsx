import { DocumentInlineMention, SiteInsightsLinkPosition } from '@gitbook/api';

import { StyledLink } from '@/components/primitives';

import { InlineProps } from './Inline';

export async function Mention(props: InlineProps<DocumentInlineMention>) {
    const { inline, context } = props;

    const resolved = await context.resolveContentRef(inline.data.ref, {
        resolveAnchorText: true,
    });

    if (!resolved) {
        return null;
    }

    return (
        <StyledLink
            href={resolved.href}
            insights={{
                target: inline.data.ref,
                position: SiteInsightsLinkPosition.Content,
            }}
        >
            {resolved.text}
        </StyledLink>
    );
}
