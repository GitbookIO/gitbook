'use client';
import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Fragment } from 'react';
import { AIPageLinkSummary } from '../../Adaptive';
import { Button, StyledLink } from '../../primitives';

export function InlineLinkTooltipImpl(props: {
    isSamePage: boolean;
    isExternal: boolean;
    aiSummary?: { pageId: string; spaceId: string };
    breadcrumbs: Array<{ href?: string; label: string; icon?: React.ReactNode }>;
    target: {
        href: string;
        text: string;
        subText?: string;
        icon?: React.ReactNode;
    };
    openInNewTabLabel: string;
    children: React.ReactNode;
}) {
    const { isSamePage, isExternal, aiSummary, openInNewTabLabel, target, breadcrumbs, children } =
        props;

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
                                            {target.icon ? (
                                                <div className="mt-1 text-tint-subtle empty:hidden">
                                                    {target.icon}
                                                </div>
                                            ) : null}
                                            <h5 className="font-semibold">{target.text}</h5>
                                        </div>
                                    </div>
                                    {!isSamePage && target.href ? (
                                        <Button
                                            className={tcls(
                                                '-mx-2 -my-2 ml-auto',
                                                breadcrumbs?.length === 0
                                                    ? 'place-self-center'
                                                    : null
                                            )}
                                            variant="blank"
                                            href={target.href}
                                            target="_blank"
                                            label={openInNewTabLabel}
                                            size="small"
                                            icon="arrow-up-right-from-square"
                                            iconOnly={true}
                                        />
                                    ) : null}
                                </div>
                                {target.subText ? (
                                    <p className="mt-1 text-sm text-tint">{target.subText}</p>
                                ) : null}
                            </div>

                            {aiSummary ? (
                                <div className="border-tint-subtle border-t bg-tint p-4">
                                    <AIPageLinkSummary
                                        targetPageId={aiSummary.pageId}
                                        targetSpaceId={aiSummary.spaceId}
                                        showTrademark
                                    />
                                </div>
                            ) : null}
                        </div>
                        <Tooltip.Arrow
                            className={
                                typeof aiSummary !== 'undefined' ? 'fill-tint-3' : 'fill-tint-1'
                            }
                        />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
