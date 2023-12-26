import { DocumentInlineMention } from '@gitbook/api';
import NextLink from 'next/link';

import { InlineProps } from './Inline';

export async function Mention(props: InlineProps<DocumentInlineMention>) {
    const { inline, context } = props;

    const resolved = await context.resolveContentRef(inline.data.ref);

    if (!resolved) {
        return null;
    }

    return (
        <NextLink
            href={resolved.href}
            className="underline underline-offset-2 text-primary hover:text-primary-700 transition-colors "
        >
            {resolved.text}
        </NextLink>
    );
}
