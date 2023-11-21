import { DocumentInlineLink } from '@gitbook/api';
import NextLink from 'next/link';

import { resolveContentRef } from '@/lib/references';

import { InlineProps } from './Inline';
import { Inlines } from './Inlines';

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
        <NextLink href={resolved.href} className="underline text-primary hover:text-primary-700">
            <Inlines context={context} nodes={inline.nodes} />
        </NextLink>
    );
}
