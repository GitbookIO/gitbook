import { type ContentRef, type DocumentInlineLink, SiteInsightsLinkPosition } from '@gitbook/api';

import { getSpaceLanguage, tString } from '@/intl/server';
import { type TranslationLanguage, languages } from '@/intl/translations';
import {
    type ResolvedContentRef,
    resolveContentRef,
    resolveContentRefFallback,
} from '@/lib/references';
import { Icon } from '@gitbook/icons';
import { StyledLink } from '../../primitives';
import type { InlineProps } from '../Inline';
import { Inlines } from '../Inlines';
import { NotFoundRefHoverCard } from '../NotFoundRefHoverCard';
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

    const inlinesElement = (
        <Inlines
            context={context}
            document={document}
            nodes={inline.nodes}
            ancestorInlines={[...ancestorInlines, inline]}
        />
    );

    if (!resolved) {
        const fallback = resolveContentRefFallback(inline.data.ref);
        return (
            <NotFoundRefHoverCard context={context}>
                {fallback ? (
                    <InlineLinkAnchor href={fallback.href} contentRef={inline.data.ref} isExternal>
                        {inlinesElement}
                    </InlineLinkAnchor>
                ) : (
                    <span className="cursor-not-allowed underline">{inlinesElement}</span>
                )}
            </NotFoundRefHoverCard>
        );
    }
    const anchorElement = (
        <InlineLinkAnchor
            href={resolved.href}
            contentRef={inline.data.ref}
            isExternal={inline.data.ref.kind === 'url'}
        >
            {inlinesElement}
        </InlineLinkAnchor>
    );

    if (context.withLinkPreviews) {
        const language = contentContext ? getSpaceLanguage(contentContext) : languages.en;

        return (
            <InlineLinkTooltipWrapper inline={inline} language={language} resolved={resolved}>
                {anchorElement}
            </InlineLinkTooltipWrapper>
        );
    }

    return anchorElement;
}

function InlineLinkAnchor(props: {
    href: string;
    contentRef: ContentRef;
    isExternal?: boolean;
    children: React.ReactNode;
}) {
    const { href, isExternal, contentRef, children } = props;
    const isMailto = href.startsWith('mailto:');
    return (
        <StyledLink
            href={href}
            insights={{
                type: 'link_click',
                link: {
                    target: contentRef,
                    position: SiteInsightsLinkPosition.Content,
                },
            }}
        >
            {children}
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
