import type { ResolvedContentRef } from '@/lib/references';
import type { DocumentInlineLink } from '@gitbook/api';
import type React from 'react';

import { getSpaceLanguage } from '@/intl/server';
import { tString } from '@/intl/translate';
import { languages } from '@/intl/translations';
import { Icon } from '@gitbook/icons';
import type { GitBookAnyContext } from '@v2/lib/context';
import { InlineLinkTooltipClient } from './InlineLinkTooltipClient';

export function InlineLinkTooltip(props: {
    inline: DocumentInlineLink;
    context: GitBookAnyContext;
    children: React.ReactNode;
    resolved: ResolvedContentRef;
}) {
    const { inline, context, resolved, children } = props;

    let breadcrumbs = resolved.ancestors ?? [];
    const language =
        'customization' in context ? getSpaceLanguage(context.customization) : languages.en;
    const isExternal = inline.data.ref.kind === 'url';
    const isSamePage = inline.data.ref.kind === 'anchor' && inline.data.ref.page === undefined;
    if (isExternal) {
        breadcrumbs = [
            {
                label: tString(language, 'link_tooltip_external_link'),
            },
        ];
    }
    if (isSamePage) {
        breadcrumbs = [
            {
                label: tString(language, 'link_tooltip_page_anchor'),
                icon: <Icon icon="arrow-down-short-wide" className="size-3" />,
            },
        ];
        resolved.subText = undefined;
    }

    const aiSummary: { pageId: string; spaceId: string } | undefined = (() => {
        if (isExternal) {
            return;
        }

        if (isSamePage) {
            return;
        }

        if (!('customization' in context) || !context.customization.ai?.pageLinkSummaries.enabled) {
            return;
        }

        if (!('page' in context) || !('page' in inline.data.ref)) {
            return;
        }

        if (inline.data.ref.kind === 'page' || inline.data.ref.kind === 'anchor') {
            return {
                pageId: resolved.page?.id ?? inline.data.ref.page ?? context.page.id,
                spaceId: inline.data.ref.space ?? context.space.id,
            };
        }
    })();

    return (
        <InlineLinkTooltipClient
            breadcrumbs={breadcrumbs}
            isExternal={isExternal}
            isSamePage={isSamePage}
            aiSummary={aiSummary}
            language={language}
            target={{
                href: resolved.href,
                text: resolved.text,
                subText: resolved.subText,
                icon: resolved.icon,
            }}
        >
            {children}
        </InlineLinkTooltipClient>
    );
}
