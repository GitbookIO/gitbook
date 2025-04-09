import { resolveContentRef } from '@/lib/references';
import * as api from '@gitbook/api';
import { Button } from '../primitives';
import type { InlineProps } from './Inline';

export async function InlineButton(props: InlineProps<api.DocumentInlineButton>) {
    const { inline, context } = props;

    if (!context.contentContext) {
        throw new Error('InlineButton requires a contentContext');
    }

    const resolved = await resolveContentRef(inline.data.ref, context.contentContext);

    if (!resolved) {
        return null;
    }

    return (
        <Button
            href={resolved.href}
            label={inline.data.label}
            // TODO: use a variant specifically for user-defined buttons.
            variant={inline.data.kind}
            insights={{
                type: 'link_click',
                link: {
                    target: inline.data.ref,
                    position: api.SiteInsightsLinkPosition.Content,
                },
            }}
        />
    );
}
