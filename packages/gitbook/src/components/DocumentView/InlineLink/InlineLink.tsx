import { type DocumentInlineLink, SiteInsightsLinkPosition } from '@gitbook/api';

import { getSpaceLanguage, tString } from '@/intl/server';
import { type TranslationLanguage, languages } from '@/intl/translations';
import { type ResolvedContentRef, resolveContentRef } from '@/lib/references';
import { Icon } from '@gitbook/icons';
import { HoverCard, HoverCardRoot, HoverCardTrigger, StyledLink } from '../../primitives';
import type { InlineProps } from '../Inline';
import { Inlines } from '../Inlines';
import { InlineLinkTooltip } from './InlineLinkTooltip';

export async function InlineLink(props: InlineProps<DocumentInlineLink>) {
    const { inline, document, context, ancestorInlines } = props;

    const resolved = context.contentContext
        ? await resolveContentRef(inline.data.ref, context.contentContext, {
              // We don't want to resolve the anchor text here, as it can be very expensive and will block rendering if there is a lot of anchors link.
              resolveAnchorText: false,
          })
        : null;
    const { contentContext } = context;

    const language = contentContext ? getSpaceLanguage(contentContext) : languages.en;

    if (!contentContext || !resolved) {
        return (
            <HoverCardRoot>
                <HoverCardTrigger>
                    <span className="cursor-not-allowed underline">
                        <Inlines
                            context={context}
                            document={document}
                            nodes={inline.nodes}
                            ancestorInlines={[...ancestorInlines, inline]}
                        />
                    </span>
                </HoverCardTrigger>
                <HoverCard className="flex flex-col gap-1 p-4">
                    <div className="flex items-center gap-2">
                        <Icon icon="ban" className="size-4 text-tint-subtle" />
                        <h5 className="font-semibold">{tString(language, 'notfound_title')}</h5>
                    </div>
                    <p className="text-sm text-tint">{tString(language, 'notfound_link')}</p>
                </HoverCard>
            </HoverCardRoot>
        );
    }
    const isExternal = inline.data.ref.kind === 'url';
    const isMailto = resolved.href.startsWith('mailto:');
    const content = (
        <StyledLink
            href={resolved.href}
            insights={{
                type: 'link_click',
                link: {
                    target: inline.data.ref,
                    position: SiteInsightsLinkPosition.Content,
                },
            }}
        >
            <Inlines
                context={context}
                document={document}
                nodes={inline.nodes}
                ancestorInlines={[...ancestorInlines, inline]}
            />
            {isMailto ? (
                <Icon
                    icon="envelope"
                    className="ml-1 inline size-3 links-accent:text-tint-subtle"
                />
            ) : isExternal ? (
                <Icon
                    icon="arrow-up-right"
                    className="ml-0.5 inline size-3 links-accent:text-tint-subtle"
                />
            ) : null}
        </StyledLink>
    );

    if (context.withLinkPreviews) {
        return (
            <InlineLinkTooltipWrapper inline={inline} language={language} resolved={resolved}>
                {content}
            </InlineLinkTooltipWrapper>
        );
    }

    return content;
}

/**
 * An SSR component that renders a link with a tooltip.
 * Essentially it pulls the minimum amount of props from the context to render the tooltip.
 */
function InlineLinkTooltipWrapper(props: {
    inline: DocumentInlineLink;
    children: React.ReactNode;
    resolved: ResolvedContentRef;
    language: TranslationLanguage;
}) {
    const { inline, language, resolved, children } = props;

    let breadcrumbs = resolved.ancestors ?? [];
    const isMailto = resolved.href.startsWith('mailto:');
    const isExternal = inline.data.ref.kind === 'url';
    const isSamePage = inline.data.ref.kind === 'anchor' && inline.data.ref.page === undefined;

    if (isMailto) {
        resolved.text = resolved.text.split('mailto:')[1] ?? resolved.text;
        breadcrumbs = [
            {
                label: tString(language, 'link_tooltip_email'),
            },
        ];
    } else if (isExternal) {
        breadcrumbs = [
            {
                label: tString(language, 'link_tooltip_external_link'),
            },
        ];
    } else if (isSamePage) {
        breadcrumbs = [
            {
                label: tString(language, 'link_tooltip_page_anchor'),
                icon: <Icon icon="arrow-down-short-wide" className="size-3" />,
            },
        ];
        resolved.subText = undefined;
    }

    return (
        <InlineLinkTooltip
            breadcrumbs={breadcrumbs}
            isExternal={isExternal}
            isSamePage={isSamePage}
            openInNewTabLabel={tString(language, 'open_in_new_tab')}
            target={{
                href: resolved.href,
                text: resolved.text,
                subText: resolved.subText,
                icon: resolved.icon,
            }}
        >
            {children}
        </InlineLinkTooltip>
    );
}
