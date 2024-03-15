import { DocumentInlineLink } from '@gitbook/api';

import { InlineProps } from './Inline';
import { Inlines } from './Inlines';
import { Link } from '../primitives';

export async function InlineLink(props: InlineProps<DocumentInlineLink>) {
    const { inline, document, context } = props;

    const resolved = await context.resolveContentRef(inline.data.ref);

    if (!resolved) {
        return (
            <span title="Broken link" className="underline">
                <Inlines context={context} document={document} nodes={inline.nodes} />
            </span>
        );
    }

    return (
        <Link
            href={resolved.href}
            className="underline underline-offset-2 text-primary hover:text-primary-700 transition-colors "
        >
            <Inlines context={context} document={document} nodes={inline.nodes} />
        </Link>
    );
}
