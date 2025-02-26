import { type DocumentInlineLink, SiteInsightsLinkPosition } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';

import { StyledLink } from '../primitives';
import type { InlineProps } from './Inline';
import { Inlines } from './Inlines';

export async function InlineLink(props: InlineProps<DocumentInlineLink>) {
    const { inline, document, context, ancestorInlines } = props;

    const resolved = context.contentContext
        ? await resolveContentRef(inline.data.ref, context.contentContext)
        : null;

    if (!resolved) {
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
            <Inlines
                context={context}
                document={document}
                nodes={inline.nodes}
                ancestorInlines={[...ancestorInlines, inline]}
            />
        </StyledLink>
    );
}
