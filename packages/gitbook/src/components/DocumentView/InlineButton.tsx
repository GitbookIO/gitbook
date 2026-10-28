import type React from 'react';

import * as api from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

import { Button, type ButtonProps } from '../primitives';
import { SiteAuthLoginButton } from '../SiteAuth/SiteAuthLoginLink';
import type { InlineProps } from './Inline';
import { InlineActionButton } from './InlineActionButton';
import { NotFoundRefHoverCard } from './NotFoundRefHoverCard';
import { getSelectAction } from './selectAction';
import { SelectActionButton } from './SelectActionButton';
import { isSiteAuthLoginHref } from '@/lib/auth-login-link';
import { resolveContentRefFallback, resolveContentRefInDocument } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

// Editor button sizes render one step smaller here; the editor default (`large`) keeps the previous `medium`.
const BUTTON_SIZE_MAP: Record<
    NonNullable<api.DocumentInlineButton['data']['size']>,
    ButtonProps['size']
> = {
    small: 'xsmall',
    medium: 'small',
    large: 'medium',
};

// Only content buttons take the site's secondary colour; the `secondary` variant also styles site chrome.
const SECONDARY_COLOR_CLASSES = tcls(
    'bg-secondary',
    'depth-flat:bg-secondary-base',
    'text-secondary',
    'hover:bg-secondary-hover',
    'hover:not-disabled:depth-flat:bg-secondary-hover',
    'hover:not-disabled:text-secondary',
    'contrast-more:bg-secondary-subtle',
    'disabled:text-secondary/8',
    'border-secondary',
    'hover:border-secondary-hover',
    'disabled:border-secondary',
    'shadow-secondary/6',
    'dark:shadow-secondary-1',
    'contrast-more:border-secondary-12',
    'contrast-more:hover:outline-secondary-12',
    'contrast-more:hover:border-secondary-12',
    'contrast-more:focus-visible:border-secondary-12',
    'contrast-more:focus-visible:outline-secondary-12'
);

export function InlineButton(props: InlineProps<api.DocumentInlineButton>) {
    const { inline, context } = props;

    const buttonProps: ButtonProps = {
        label: inline.data.label,
        variant: inline.data.kind,
        icon: inline.data.icon as IconName | undefined,
        size: BUTTON_SIZE_MAP[inline.data.size ?? 'large'],
        className: inline.data.kind === 'secondary' ? SECONDARY_COLOR_CLASSES : undefined,
    };

    const ButtonImplementation = () => {
        // Skip the select action in print/PDF: the client store isn't mounted, so it falls through
        // to the plain disabled button below.
        const selectAction = context.mode !== 'print' ? getSelectAction(inline.data) : null;
        if (selectAction) {
            return <SelectActionButton value={selectAction.value} buttonProps={buttonProps} />;
        }

        // In print/PDF mode, skip interactive action buttons (AI/search providers are not mounted).
        if (context.mode !== 'print' && 'action' in inline.data && 'query' in inline.data.action) {
            return (
                <InlineActionButton
                    action={inline.data.action.action}
                    query={inline.data.action.query ?? ''}
                    scope={
                        inline.data.action.action === 'search'
                            ? inline.data.action.scope
                            : undefined
                    }
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
