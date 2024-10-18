'use client';

import { SiteAds, SiteAdsStatus } from '@gitbook/api';
import * as React from 'react';

import { t, useLanguage } from '@/intl/client';
import { ClassValue, tcls } from '@/lib/tailwind';

import { renderAd } from './renderAd';

/**
 * Zone ID provided by BuySellAds for the preview.
 */
const PREVIEW_ZONE_ID = 'CVAIKKQM';

/**
 * Fetch and render the Ad placement.
 * https://docs.buysellads.com/ad-serving-api
 */
export function Ad({
    zoneId,
    spaceId,
    placement,
    ignore,
    siteAdsStatus,
    style,
    mode = 'auto',
}: {
    zoneId: string | null;
    spaceId: string;
    placement: string;
    ignore: boolean;
    style?: ClassValue;
    siteAdsStatus?: SiteAds['status'];
    mode?: 'classic' | 'auto' | 'cover';
}) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [visible, setVisible] = React.useState(false);
    const [ad, setAd] = React.useState<React.ReactNode | undefined>(undefined);

    // Observe the container visibility
    React.useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1,
            },
        );

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    // When the container is visible,
    // track an impression on the ad and fetch it
    React.useEffect(() => {
        if (!visible) {
            return;
        }

        let cancelled = false;

        const previewParam = new URL(window.location.href).searchParams.get('ads_preview');
        const preview = !!previewParam;
        const realZoneId = preview ? PREVIEW_ZONE_ID : zoneId;
        const showPlaceholderAd =
            previewParam === 'placeholder' ||
            (siteAdsStatus &&
                (siteAdsStatus === SiteAdsStatus.Pending ||
                    siteAdsStatus === SiteAdsStatus.InReview));

        if (!realZoneId && !showPlaceholderAd) {
            return;
        }

        (async () => {
            const result = showPlaceholderAd
                ? await renderAd({ source: 'placeholder' })
                : realZoneId
                  ? await renderAd({
                        placement,
                        ignore: ignore || preview,
                        zoneId: realZoneId,
                        mode,
                        source: 'live',
                    })
                  : undefined;

            if (cancelled) {
                return;
            }

            if (result) {
                setAd(result);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [visible, zoneId, ignore, placement, mode, siteAdsStatus]);

    const viaUrl = new URL('https://www.gitbook.com');
    viaUrl.searchParams.set('utm_source', 'content');
    viaUrl.searchParams.set('utm_medium', 'ads');
    viaUrl.searchParams.set('utm_campaign', spaceId);

    return (
        <div ref={containerRef} className={tcls(style)}>
            {ad ? (
                <>
                    {ad}
                    <AdSponsoredLink spaceId={spaceId} />
                </>
            ) : null}
        </div>
    );
}

function AdSponsoredLink(props: { spaceId: string }) {
    const { spaceId } = props;
    const language = useLanguage();

    const viaUrl = new URL('https://www.gitbook.com');
    viaUrl.searchParams.set('utm_source', 'content');
    viaUrl.searchParams.set('utm_medium', 'sponsoring');
    viaUrl.searchParams.set('utm_campaign', spaceId);

    return (
        <p
            className={tcls(
                'mt-2',
                'mr-2',
                'text-xs',
                'text-right',
                'text-dark/5',
                'dark:text-light/5',
            )}
        >
            <a target="_blank" href={viaUrl.toString()} className={tcls('hover:underline')}>
                {t(language, 'sponsored_via_gitbook')}
            </a>
        </p>
    );
}
