import type { DocumentInlineLink } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';

import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Fragment } from 'react';
import { AIPageLinkSummary } from '../Adaptive/AIPageLinkSummary';
import { Button, StyledLink } from '../primitives';
import type { InlineProps } from './Inline';
import { Inlines } from './Inlines';

export async function InlineLinkTooltip(
    props: InlineProps<DocumentInlineLink> & { children: React.ReactNode }
) {
    const { inline, document, context, ancestorInlines, children } = props;

    const resolved = context.contentContext
        ? await resolveContentRef(inline.data.ref, context.contentContext, {
              resolveAnchorText: true,
          })
        : null;

    if (!context.contentContext || !resolved) {
        return (
            <span title="Broken link" className="underline">
                <Inlines
                    context={context}
                    document={document}
                    nodes={inline.nodes}
                    ancestorInlines={[...ancestorInlines, inline]}
                />
            </span>
        );
    }

    let breadcrumbs = resolved.ancestors;
    const isExternal = inline.data.ref.kind === 'url';
    const isSamePage = inline.data.ref.kind === 'anchor' && inline.data.ref.page === undefined;
    if (isExternal) {
        breadcrumbs = [
            {
                label: 'External link to',
            },
        ];
    }
    if (isSamePage) {
        breadcrumbs = [
            {
                label: 'Jump to section',
                icon: <Icon icon="arrow-down-short-wide" className="size-3" />,
            },
        ];
        resolved.subText = undefined;
    }

    return (
        <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="z-40 w-screen max-w-md animate-present px-4 sm:w-auto">
                        <div className="overflow-hidden rounded-md straight-corners:rounded-none shadow-lg shadow-tint-12/4 ring-1 ring-tint-subtle dark:shadow-tint-1 ">
                            <div className="bg-tint-base p-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col">
                                        {breadcrumbs && breadcrumbs.length > 0 ? (
                                            <div className="mb-1 flex grow flex-wrap items-center gap-x-2 gap-y-0.5 font-semibold text-tint text-xs uppercase leading-tight tracking-wide">
                                                {breadcrumbs.map((crumb, index) => {
                                                    const Tag = crumb.href ? StyledLink : 'div';

                                                    return (
                                                        <Fragment key={crumb.label}>
                                                            {index !== 0 ? (
                                                                <Icon
                                                                    icon="chevron-right"
                                                                    className="size-3 text-tint-subtle"
                                                                />
                                                            ) : null}
                                                            <Tag
                                                                className={tcls(
                                                                    'flex gap-1',
                                                                    crumb.href &&
                                                                        'links-default:text-tint no-underline hover:underline contrast-more:underline contrast-more:decoration-current'
                                                                )}
                                                                href={crumb.href ?? '#'}
                                                            >
                                                                {crumb.icon ? (
                                                                    <span className="mt-0.5 text-tint-subtle empty:hidden">
                                                                        {crumb.icon}
                                                                    </span>
                                                                ) : null}
                                                                {crumb.label}
                                                            </Tag>
                                                        </Fragment>
                                                    );
                                                })}
                                            </div>
                                        ) : null}
                                        <div
                                            className={tcls(
                                                'flex gap-2 leading-snug',
                                                isExternal && 'text-sm [overflow-wrap:anywhere]'
                                            )}
                                        >
                                            {resolved.icon ? (
                                                <div className="mt-1 text-tint-subtle empty:hidden">
                                                    {resolved.icon}
                                                </div>
                                            ) : null}
                                            <h5 className="font-semibold">{resolved.text}</h5>
                                        </div>
                                    </div>
                                    {!isSamePage && resolved.href ? (
                                        <Button
                                            className={tcls(
                                                '-mx-2 -my-2 ml-auto',
                                                breadcrumbs?.length === 0
                                                    ? 'place-self-center'
                                                    : null
                                            )}
                                            variant="blank"
                                            href={resolved.href}
                                            target="_blank"
                                            label="Open in new tab"
                                            size="small"
                                            icon="arrow-up-right-from-square"
                                            iconOnly={true}
                                        />
                                    ) : null}
                                </div>
                                {resolved.subText ? (
                                    <p className="mt-1 text-sm text-tint">{resolved.subText}</p>
                                ) : null}
                            </div>

                            {'customization' in context.contentContext &&
                            context.contentContext.customization.ai?.pageLinkSummaries.enabled &&
                            !isExternal &&
                            'page' in context.contentContext &&
                            (inline.data.ref.kind === 'page' ||
                                inline.data.ref.kind === 'anchor') ? (
                                <div className="border-tint-subtle border-t bg-tint p-4">
                                    <AIPageLinkSummary
                                        currentPageId={context.contentContext.page.id}
                                        currentSpaceId={context.contentContext.space.id}
                                        currentPageTitle={context.contentContext.page.title}
                                        targetPageId={
                                            inline.data.ref.page ?? context.contentContext.page.id
                                        }
                                        targetSpaceId={
                                            inline.data.ref.space ?? context.contentContext.space.id
                                        }
                                        linkTitle={inline.nodes
                                            .map((node) => {
                                                if (node.object === 'text') {
                                                    return node.leaves
                                                        .map((leaf) => leaf.text)
                                                        .join('');
                                                }
                                                return '';
                                            })
                                            .join('')}
                                        linkPreview={`**${resolved.text}**: ${resolved.subText}`}
                                        showTrademark={
                                            context.contentContext.customization.trademark.enabled
                                        }
                                    />
                                </div>
                            ) : null}
                        </div>
                        <Tooltip.Arrow className="fill-tint-1" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
