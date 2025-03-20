'use client';

import type { ResolvedContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import type { CustomizationAnnouncement } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import Link from 'next/link';
import { CONTAINER_STYLE } from '../layout';
import { linkStyles } from '../primitives';

export function AnnouncementBanner(props: {
    announcement: CustomizationAnnouncement;
    contentRef: ResolvedContentRef | null;
}) {
    const { announcement, contentRef } = props;

    const hasLink = announcement.link && contentRef?.href;

    const Tag = hasLink ? Link : 'div';
    const style = BANNER_STYLES[announcement.style];
    // const linkIcon = announcement.link?.to.kind == 'url' : 'chevron-right';

    return (
        <div className={tcls('mt-4', 'mb-2', CONTAINER_STYLE)}>
            <Tag
                href={contentRef?.href ?? ''}
                className={tcls(
                    'flex items-center justify-center gap-3 rounded-md straight-corners:rounded-none px-4 py-3 text-neutral-strong text-sm transition-colors',
                    style.background,
                    hasLink && style.hover
                )}
            >
                <Icon
                    icon={style.icon as IconName}
                    className={`size-4 shrink-0 ${style.iconColor}`}
                />
                <div>
                    {announcement.message}
                    {hasLink ? (
                        announcement.link?.title ? (
                            // When there's a link, the whole banner is always clickable.
                            // Since we can't nest links inside links, we make this span *look* like a link.
                            <span className={tcls(linkStyles, style.link, 'ml-1')}>
                                {announcement.link.title}
                                {contentRef?.icon ?? (
                                    <Icon icon="chevron-right" className="ml-1 inline size-2" />
                                )}
                            </span>
                        ) : (
                            (contentRef?.icon ?? <Icon icon="chevron-right" className="size-3" />)
                        )
                    ) : null}
                </div>
            </Tag>
        </div>
    );
}

const BANNER_STYLES = {
    info: {
        background: 'bg-info',
        hover: 'hover:bg-info-hover',
        icon: 'circle-info',
        iconColor: 'text-info-subtle',
        link: '',
    },
    warning: {
        background: 'bg-warning decoration-warning/6',
        hover: 'hover:bg-warning-hover',
        icon: 'circle-exclamation',
        iconColor: 'text-warning-subtle',
        link: 'links-default:text-warning links-default:hover:text-warning-strong links-default:decoration-warning/6 links-accent:decoration-warning',
    },
    danger: {
        background: 'bg-danger',
        hover: 'hover:bg-danger-hover',
        icon: 'triangle-exclamation',
        iconColor: 'text-danger-subtle',
        link: 'links-default:text-danger links-default:hover:text-danger-strong links-default:decoration-danger/6 links-accent:decoration-danger',
    },
    success: {
        background: 'bg-success',
        hover: 'hover:bg-success-hover',
        icon: 'circle-check',
        iconColor: 'text-success-subtle',
        link: 'links-default:text-success links-default:hover:text-success-strong links-default:decoration-success/6 links-accent:decoration-success',
    },
};
