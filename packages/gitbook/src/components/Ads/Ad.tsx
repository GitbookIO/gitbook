'use client';

import {
    type SiteAds,
    SiteAdsStatus,
    type SiteInsightsAd,
    type SiteInsightsAdPlacement,
    SiteInsightsTrademarkPlacement,
} from '@gitbook/api';
import * as React from 'react';

import { t, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { useTrackEvent } from '../Insights';
import { useHasBeenInViewport } from '../hooks/useHasBeenInViewport';
import { Link } from '../primitives';
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
    placement: SiteInsightsAdPlacement;
    ignore: boolean;
    style?: ClassValue;
    siteAdsStatus?: SiteAds['status'];
    mode?: 'classic' | 'auto' | 'cover';
}) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [ad, setAd] = React.useState<
        { children: React.ReactNode; insightsAd: SiteInsightsAd | null } | undefined
    >(undefined);
    const trackEvent = useTrackEvent();

    // Track display of the ad
    React.useEffect(() => {
        if (ad?.insightsAd) {
            trackEvent({
                type: 'ad_display',
                ad: ad.insightsAd,
            });
        }
    }, [ad, trackEvent]);

    const hasBeenInViewport = useHasBeenInViewport(containerRef, { threshold: 0.1 });

    // When the container is visible,
    // track an impression on the ad and fetch it
    React.useEffect(() => {
        if (!hasBeenInViewport) {
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
    }, [hasBeenInViewport, zoneId, ignore, placement, mode, siteAdsStatus]);

    return (
        <div ref={containerRef} className={tcls(style)} data-visual-test="removed">
            {ad ? (
                <>
                    {ad.children}
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
    viaUrl.searchParams.set('utm_medium', 'sponsored-by-gitbook');
    viaUrl.searchParams.set('utm_campaign', spaceId);

    return (
        <p className={tcls('mt-2', 'mr-2', 'text-xs', 'text-right', 'text-tint-subtle')}>
            <Link
                target="_blank"
                href={viaUrl.toString()}
                className={tcls('hover:underline')}
                insights={{
                    type: 'trademark_click',
                    placement: SiteInsightsTrademarkPlacement.Ad,
                }}
            >
                {t(language, 'sponsored_via_gitbook')}
            </Link>
        </p>
    );
}
