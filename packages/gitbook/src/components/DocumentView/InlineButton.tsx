import { resolveContentRef, resolveContentRefFallback } from '@/lib/references';
import * as api from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import { Button } from '../primitives';
import type { InlineProps } from './Inline';
import { NotFoundRefHoverCard } from './NotFoundRefHoverCard';

export async function InlineButton(props: InlineProps<api.DocumentInlineButton>) {
    const { inline, context } = props;

    const resolved = context.contentContext
        ? await resolveContentRef(inline.data.ref, context.contentContext)
        : null;

    const href = resolved?.href ?? resolveContentRefFallback(inline.data.ref)?.href;

    const inlineElement = (
        // Set the leading to have some vertical space between adjacent buttons
        <span className="inline-button leading-12 [&:has(+.inline-button)]:mr-2">
            <Button
                href={href}
                label={inline.data.label}
                // TODO: use a variant specifically for user-defined buttons.
                variant={inline.data.kind}
                className="leading-normal"
                disabled={href === undefined}
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

    if (!resolved) {
        return <NotFoundRefHoverCard context={context}>{inlineElement}</NotFoundRefHoverCard>;
    }

    return inlineElement;
}
