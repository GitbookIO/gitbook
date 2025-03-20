'use client';

import type { ResolvedContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import type { CustomizationAnnouncement } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import Link from 'next/link';
import React from 'react';
import { CONTAINER_STYLE } from '../layout';
import { linkStyles } from '../primitives';
import { announcementStore } from './useAnnouncementGlobalState';

export function AnnouncementBanner(props: {
    announcement: CustomizationAnnouncement;
    contentRef: ResolvedContentRef | null;
}) {
    const { announcement, contentRef } = props;
    const [show, setShow] = React.useState(true);
    const { visible, at, setVisible } = announcementStore.getState();

    React.useEffect(() => {
        const daysSinceLastInteraction = Math.floor((Date.now() - at) / (1000 * 60 * 60 * 24));
        setShow(visible || daysSinceLastInteraction > 7);
    }, [visible, at]);

    const hasLink = announcement.link && contentRef?.href;
    const closeable = announcement.style !== 'danger';

    const Tag = hasLink ? Link : 'div';
    const style = BANNER_STYLES[announcement.style];

    return !closeable || show === true ? (
        <div className="scroll-nojump theme-bold:bg-header-background pt-4 pb-2">
            <div className={tcls('relative', CONTAINER_STYLE)}>
                <Tag
                    href={contentRef?.href ?? ''}
                    className={tcls(
                        'flex w-full items-start justify-center overflow-hidden rounded-md straight-corners:rounded-none px-4 py-3 text-neutral-strong text-sm theme-bold:ring-1 theme-gradient:ring-1 ring-inset transition-colors',
                        style.container,
                        closeable && 'pr-12',
                        hasLink && style.hover
                    )}
                >
                    <Icon
                        icon={style.icon as IconName}
                        className={`mt-0.5 mr-3 size-4 shrink-0 ${style.iconColor}`}
                    />
                    <div>
                        {announcement.message}
                        {hasLink ? (
                            <div className={tcls(linkStyles, style.link, 'ml-1 inline')}>
                                {contentRef?.icon ? (
                                    <span className='mr-1 ml-2 *:inline'>{contentRef?.icon}</span>
                                ) : null}
                                {announcement.link?.title && (
                                    <span className="mr-1">{announcement.link?.title}</span>
                                )}
                                <Icon
                                    icon={
                                        announcement.link?.to.kind === 'url'
                                            ? 'arrow-up-right'
                                            : 'chevron-right'
                                    }
                                    className={tcls('mb-0.5 inline size-3')}
                                />
                            </div>
                        ) : null}
                    </div>
                </Tag>
                {closeable ? (
                    <button
                        className={`absolute top-0 right-4 mt-2 mr-2 rounded straight-corners:rounded-none p-1.5 transition-all hover:ring-1 sm:right-6 md:right-8 ${style.close}`}
                        type="button"
                        onClick={() => {
                            setVisible(false);
                            setShow(false);
                        }}
                    >
                        <Icon icon="close" className="size-4" />
                    </button>
                ) : null}
            </div>
        </div>
    ) : null;
}

const BANNER_STYLES = {
    info: {
        container: 'bg-info ring-info-subtle',
        hover: 'hover:bg-info-hover active:bg-info-active',
        icon: 'circle-info',
        iconColor: 'text-info-subtle',
        close: 'hover:bg-tint-base hover:ring-info-subtle',
        link: '',
    },
    warning: {
        container: 'bg-warning decoration-warning/6 ring-warning-subtle',
        hover: 'hover:bg-warning-hover',
        icon: 'circle-exclamation',
        iconColor: 'text-warning-subtle',
        close: 'hover:bg-tint-base hover:ring-warning-subtle',
        link: 'links-default:text-warning links-default:hover:text-warning-strong links-default:decoration-warning/6 links-accent:decoration-warning',
    },
    danger: {
        container: 'bg-danger decoration-danger/6 ring-danger-subtle',
        hover: 'hover:bg-danger-hover',
        icon: 'triangle-exclamation',
        iconColor: 'text-danger-subtle',
        close: 'hover:bg-tint-base hover:ring-danger-subtle',
        link: 'links-default:text-danger links-default:hover:text-danger-strong links-default:decoration-danger/6 links-accent:decoration-danger',
    },
    success: {
        container: 'bg-success decoration-success/6 ring-success-subtle',
        hover: 'hover:bg-success-hover',
        icon: 'circle-check',
        iconColor: 'text-success-subtle',
        close: 'hover:bg-tint-base hover:ring-success-subtle',
        link: 'links-default:text-success links-default:hover:text-success-strong links-default:decoration-success/6 links-accent:decoration-success',
    },
};
