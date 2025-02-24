import { DocumentInlineLink, SiteInsightsLinkPosition } from '@gitbook/api';

import { InlineProps } from './Inline';
import { Inlines } from './Inlines';
import { Link } from '../primitives';
import { resolveContentRef } from '@/lib/references';

export async function InlineLink(props: InlineProps<DocumentInlineLink>) {
    const { inline, document, context, ancestorInlines } = props;

    const resolved = context.contentContext ? await resolveContentRef(inline.data.ref, context.contentContext) : null;

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
        <Link
            href={resolved.href}
            className="underline underline-offset-2 text-primary-subtle hover:text-primary contrast-more:text-primary contrast-more:hover:text-primary-strong transition-colors"
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
        </Link>
    );
}
