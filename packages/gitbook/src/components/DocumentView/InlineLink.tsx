import { type DocumentInlineLink, SiteInsightsLinkPosition } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';

import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Fragment } from 'react';
import { Button, StyledLink } from '../primitives';
import type { InlineProps } from './Inline';
import { Inlines } from './Inlines';

export async function InlineLink(props: InlineProps<DocumentInlineLink>) {
    const { inline, document, context, ancestorInlines } = props;

    const resolved = context.contentContext
        ? await resolveContentRef(inline.data.ref, context.contentContext, {
              resolveAnchorText: true,
          })
        : null;

    if (!resolved) {
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
    if (isExternal) {
        breadcrumbs = [
            {
                label: 'External link to',
            },
        ];
    }

    return (
        <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
                <Tooltip.Trigger>
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
                        {isExternal ? (
                            <Icon
                                icon="arrow-up-right"
                                className="ml-0.5 inline size-3 links-accent:text-tint-subtle"
                            />
                        ) : null}
                    </StyledLink>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="z-40 flex w-[100vw] max-w-md animate-present px-4">
                        <div className="grow items-center overflow-hidden rounded-md straight-corners:rounded-none shadow-lg shadow-tint-12/4 ring-1 ring-tint-subtle dark:shadow-tint-1 ">
                            <div className="bg-tint-base p-4">
                                {breadcrumbs ? (
                                    <div className="mb-1 flex gap-4">
                                        <div className="flex grow flex-wrap items-center gap-x-2 gap-y-0.5 font-semibold text-tint text-xs uppercase leading-tight tracking-wide">
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
                                                            href={crumb.href ?? ''}
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
                                        {resolved.href ? (
                                            <Button
                                                className="-mx-2 -my-2 ml-auto"
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
                                {resolved.subText ? (
                                    <p className="mt-1 text-sm text-tint">{resolved.subText}</p>
                                ) : null}
                            </div>

                            {!isExternal ? (
                                <div className="border-tint-subtle border-t bg-tint p-4">
                                    <div className="mb-1 flex items-center gap-1 font-semibold text-tint text-xs uppercase leading-tight tracking-wide">
                                        <Icon icon="sparkle" className="size-3" />
                                        <h6 className="text-tint">AI Summary</h6>
                                    </div>
                                    <p>
                                        This integration synchronizes your docs with the code
                                        repository so that your API spec updates in GitBook mirror
                                        any changes made in GitHub or GitLab, keeping your content
                                        aligned with your code.
                                    </p>

                                    <div className="-m-2 mt-0 flex flex-col rounded-md p-2 text-sm">
                                        <details className="-mx-2 rounded-md px-2 py-1 transition-colors has-[summary:hover]:bg-tint-hover">
                                            <summary className="flex items-center gap-1 text-tint hover:cursor-pointer">
                                                <Icon
                                                    icon="circle-question"
                                                    className="size-3 shrink-0"
                                                />
                                                Who can configure it?
                                            </summary>
                                            <div className="mt-1">
                                                Administrators and creators set it up.
                                            </div>
                                        </details>
                                        <details className="-mx-2 rounded-md px-2 py-1 transition-colors has-[summary:hover]:bg-tint-hover">
                                            <summary className="flex items-center gap-1 text-tint hover:cursor-pointer">
                                                <Icon
                                                    icon="circle-question"
                                                    className="size-3 shrink-0"
                                                />
                                                Does it sync both ways?
                                            </summary>
                                            <div className="mt-1">
                                                Edits in GitBook and commits on GitHub or GitLab
                                                update each other.
                                            </div>
                                        </details>
                                        <details className="-mx-2 rounded-md px-2 py-1 transition-colors has-[summary:hover]:bg-tint-hover">
                                            <summary className="flex items-center gap-1 text-tint hover:cursor-pointer">
                                                <Icon
                                                    icon="circle-question"
                                                    className="size-3 shrink-0"
                                                />
                                                Which platforms connect?
                                            </summary>
                                            <div className="mt-1">
                                                It works with GitHub and GitLab.
                                            </div>
                                        </details>
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                type="text"
                                                className="w-full rounded-md px-4 py-1 text-sm ring-1 ring-tint-subtle"
                                                placeholder="Ask AI about this page"
                                            />
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                label="Ask question"
                                                iconOnly={true}
                                                icon="paper-plane-alt"
                                            />
                                        </div>
                                    </div>
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
