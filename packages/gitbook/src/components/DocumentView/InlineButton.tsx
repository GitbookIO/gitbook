import { isSiteAuthLoginHref } from '@/lib/auth-login-link';
import { resolveContentRefFallback, resolveContentRefInDocument } from '@/lib/references';
import * as api from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import type React from 'react';
import { SiteAuthLoginButton } from '../SiteAuth/SiteAuthLoginLink';
import { Button, type ButtonProps } from '../primitives';
import type { InlineProps } from './Inline';
import { InlineActionButton } from './InlineActionButton';
import { NotFoundRefHoverCard } from './NotFoundRefHoverCard';

export function InlineButton(props: InlineProps<api.DocumentInlineButton>) {
    const { inline, context } = props;

    const buttonProps: ButtonProps = {
        label: inline.data.label,
        variant: inline.data.kind,
        icon: inline.data.icon as IconName | undefined,
        size: 'medium',
    };

    const ButtonImplementation = () => {
        // In print/PDF mode, skip interactive action buttons (AI/search providers are not mounted).
        if (context.mode !== 'print' && 'action' in inline.data && 'query' in inline.data.action) {
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
    const { document, inline, context, buttonProps } = props;

    if (!('ref' in inline.data)) return;

    const resolved =
        context.contentContext && inline.data.ref
            ? await resolveContentRefInDocument(document, inline.data.ref, context.contentContext)
            : null;

    const href =
        resolved?.href ??
        (inline.data.ref ? resolveContentRefFallback(inline.data.ref)?.href : undefined);
    const sharedProps: React.ComponentProps<typeof Button> = {
        ...buttonProps,
        insights: {
            type: 'link_click' as const,
            link: {
                target: inline.data.ref,
                position: api.SiteInsightsLinkPosition.Content,
            },
        },
        href,
        disabled: href === undefined,
    };

    const button =
        href &&
        context.contentContext &&
        isSiteAuthLoginHref(context.contentContext.linker, href) ? (
            <SiteAuthLoginButton {...sharedProps} />
        ) : (
            <Button {...sharedProps} />
        );

    if (inline.data.ref && !resolved) {
        return <NotFoundRefHoverCard context={context}>{button}</NotFoundRefHoverCard>;
    }

    return button;
}
