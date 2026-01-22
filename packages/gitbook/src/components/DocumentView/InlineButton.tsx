import { resolveContentRef, resolveContentRefFallback } from '@/lib/references';
import * as api from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import { Button, type ButtonProps } from '../primitives';
import type { InlineProps } from './Inline';
import { InlineActionButton } from './InlineActionButton';
import { NotFoundRefHoverCard } from './NotFoundRefHoverCard';

export function InlineButton(props: InlineProps<api.DocumentInlineButton>) {
    const { inline } = props;

    const buttonProps: ButtonProps = {
        label: inline.data.label,
        variant: inline.data.kind,
        icon: inline.data.icon as IconName | undefined,
        size: 'medium',
    };

    const ButtonImplementation = () => {
        if ('action' in inline.data && 'query' in inline.data.action) {
            return (
                <InlineActionButton
                    action={inline.data.action.action}
                    query={inline.data.action.query ?? ''}
                    buttonProps={buttonProps}
                />
            );
        }

        if ('ref' in inline.data) {
            return <InlineLinkButton {...props} buttonProps={buttonProps} />;
        }

        return <Button {...buttonProps} disabled />;
    };

    const inlineElement = (
        // Set the leading to have some vertical space between adjacent buttons
        <ButtonImplementation />
    );

    return inlineElement;
}

export async function InlineLinkButton(
    props: InlineProps<api.DocumentInlineButton> & { buttonProps: ButtonProps }
) {
    const { inline, context, buttonProps } = props;

    if (!('ref' in inline.data)) return;

    const resolved =
        context.contentContext && inline.data.ref
            ? await resolveContentRef(inline.data.ref, context.contentContext)
            : null;

    const href =
        resolved?.href ??
        (inline.data.ref ? resolveContentRefFallback(inline.data.ref)?.href : undefined);

    const button = (
        <Button
            {...buttonProps}
            insights={{
                type: 'link_click',
                link: {
                    target: inline.data.ref,
                    position: api.SiteInsightsLinkPosition.Content,
                },
            }}
            href={href}
            disabled={href === undefined}
        />
    );

    if (inline.data.ref && !resolved) {
        return <NotFoundRefHoverCard context={context}>{button}</NotFoundRefHoverCard>;
    }

    return button;
}
