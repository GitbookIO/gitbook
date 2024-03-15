import { DocumentInlineMention } from '@gitbook/api';

import { StyledLink } from '@/components/primitives';

import { InlineProps } from './Inline';

export async function Mention(props: InlineProps<DocumentInlineMention>) {
    const { inline, context } = props;

    const resolved = await context.resolveContentRef(inline.data.ref);

    if (!resolved) {
        return null;
    }

    return <StyledLink href={resolved.href}>{resolved.text}</StyledLink>;
}
