import * as api from '@gitbook/api';
import { Button } from '../primitives';
import type { InlineProps } from './Inline';

export async function InlineButton(props: InlineProps<api.DocumentInlineButton>) {
    const { inline, context } = props;

    if (!context.contentContext) {
        throw new Error('InlineButton requires a contentContext');
    }

    const resolved = await context.getContentRef(inline.data.ref);

    if (!resolved) {
        return null;
    }

    return (
        // Set the leading to have some vertical space between adjacent buttons
        <span className="inline-button leading-[3rem] [&:has(+.inline-button)]:mr-2">
            <Button
                href={resolved.href}
                label={inline.data.label}
                // TODO: use a variant specifically for user-defined buttons.
                variant={inline.data.kind}
                className="leading-normal"
                insights={{
                    type: 'link_click',
                    link: {
                        target: inline.data.ref,
                        position: api.SiteInsightsLinkPosition.Content,
                    },
                }}
            />
        </span>
    );
}
