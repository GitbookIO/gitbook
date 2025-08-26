import { resolveContentRef } from '@/lib/references';
import * as api from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
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
        // Set the leading to have some vertical space between adjacent buttons
        <span className="inline-button leading-12 [&:has(+.inline-button)]:mr-2">
            <Button
                href={resolved.href}
                label={inline.data.label}
                // TODO: use a variant specifically for user-defined buttons.
                variant={inline.data.kind}
                className="leading-normal"
                icon={inline.data.icon as IconName | undefined}
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
