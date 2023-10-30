import NextLink from 'next/link';
import { InlineProps } from './Inline';
import { resolveContentRef } from '@/lib/references';
import { Inlines } from './Inlines';
import { DocumentInlineLink } from '@gitbook/api';

export async function Link(props: InlineProps<DocumentInlineLink>) {
    const { inline, context } = props;

    const resolved = await resolveContentRef(inline.data.ref, context);

    if (!resolved) {
        return (
            <span title="Broken link" className="underline">
                <Inlines context={context} nodes={inline.nodes} />
            </span>
        );
    }

    return (
        <NextLink
            href={resolved.href}
            className="underline text-primary-600 hover:text-primary-800"
        >
            <Inlines context={context} nodes={inline.nodes} />
        </NextLink>
    );
}
