'use client';

import {
    type CustomizationAnnouncement,
    SiteInsightsLinkPosition,
    type TranslationLanguage,
} from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import { CONTAINER_STYLE } from '../layout';
import { Button, Link } from '../primitives';
import { LinkStyles } from '../primitives/styles';
import { ANNOUNCEMENT_CSS_CLASS, ANNOUNCEMENT_STORAGE_KEY } from './constants';
import { tString, useLanguage } from '@/intl/client';
import { setLocalStorageItem } from '@/lib/browser';
import { cx } from '@/lib/classnames';
import type { ResolvedContentRef } from '@/lib/references';
import { getLocalizedMessage, getLocalizedTitle } from '@/lib/sites';
import { tcls } from '@/lib/tailwind';

/**
 * Client-side component to enable closing the banner
 */
export function AnnouncementBanner(props: {
    announcement: CustomizationAnnouncement;
    locale: TranslationLanguage | undefined;
    contentRef: ResolvedContentRef | null;
}) {
    const { announcement, locale, contentRef } = props;

    const language = useLanguage();
    const message = getLocalizedMessage(announcement, locale);
    const linkTitle = announcement.link ? getLocalizedTitle(announcement.link, locale) : undefined;

    const hasLink = announcement.link && contentRef?.href;
    const closeable = announcement.style !== 'danger';

    const Tag = hasLink ? Link : 'div';
    const style = BANNER_STYLES[announcement.style];

    return (
        <div data-gb-announcement-banner className="announcement" data-nosnippet="">
            <div className="chrome-shift">
                <div className={cx(CONTAINER_STYLE, 'relative')}>
                    <Tag
                        href={contentRef?.href ?? ''}
                        className={cx(
                            'announcement-box',
                            `announcement-${announcement.style}`,
                            closeable && 'announcement-closeable',
                            hasLink && 'announcement-linked'
                        )}
                        insights={
                            announcement.link
                                ? {
                                      type: 'link_click',
                                      link: {
                                          target: announcement.link.to,
                                          position: SiteInsightsLinkPosition.Announcement,
                                      },
                                  }
                                : undefined
                        }
                    >
                        <Icon icon={style.icon as IconName} className="announcement-icon" />
                        <div>
                            {message}
                            {hasLink ? (
                                <div className={tcls(LinkStyles, style.link, 'ml-1 inline')}>
                                    {contentRef?.icon ? (
                                        <span className="ml-2 mr-1 *:inline">
                                            {contentRef?.icon}
                                        </span>
                                    ) : null}
                                    {linkTitle ? <span className="mr-1">{linkTitle}</span> : null}
                                    <Icon
                                        icon={
                                            announcement.link?.to.kind === 'url'
                                                ? 'arrow-up-right'
                                                : 'chevron-right'
                                        }
                                        className="mb-0.5 inline size-3"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </Tag>
                    {closeable ? (
                        <Button
                            iconOnly
                            icon="close"
                            label={tString(language, 'close')}
                            variant="blank"
                            size="small"
                            onClick={dismissAnnouncement}
                            className={`absolute right-4 top-0 mr-1.5 mt-1.5 rounded-sm p-1.5 transition-all hover:ring-1 straight-corners:rounded-none circular-corners:rounded-lg sm:right-6 md:right-8 ${style.close}`}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

/**
 * Dismiss the announcement banner and store the dismissal state in local storage.
 * @see AnnouncementScript
 */
function dismissAnnouncement() {
    setLocalStorageItem(ANNOUNCEMENT_STORAGE_KEY, {
        visible: false,
        at: Date.now(),
    });

    document.documentElement.classList.add(ANNOUNCEMENT_CSS_CLASS);
}

const BANNER_STYLES = {
    info: {
        icon: 'circle-info',
        close: 'hover:ring-info-subtle',
        link: '',
    },
    warning: {
        icon: 'circle-exclamation',
        close: 'hover:ring-warning-subtle',
        link: 'links-default:text-warning hover:links-default:text-warning-strong links-default:decoration-warning/6 links-accent:decoration-warning',
    },
    danger: {
        icon: 'triangle-exclamation',
        close: 'hover:ring-danger-subtle',
        link: 'links-default:text-danger hover:links-default:text-danger-strong links-default:decoration-danger/6 links-accent:decoration-danger',
    },
    success: {
        icon: 'circle-check',
        close: 'hover:ring-success-subtle',
        link: 'links-default:text-success hover:links-default:text-success-strong links-default:decoration-success/6 links-accent:decoration-success',
    },
};
