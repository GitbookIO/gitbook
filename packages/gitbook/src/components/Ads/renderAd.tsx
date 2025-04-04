'use server';

import type { SiteInsightsAd, SiteInsightsAdPlacement } from '@gitbook/api';
import { headers } from 'next/headers';

import { getV1BaseContext } from '@/lib/v1';

import { isV2 } from '@/lib/v2';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
import { AdClassicRendering } from './AdClassicRendering';
import { AdCoverRendering } from './AdCoverRendering';
import { AdPixels } from './AdPixels';
import adRainbow from './assets/ad-rainbow.svg';
import type { AdItem, AdsResponse } from './types';

type FetchAdOptions = FetchLiveAdOptions | FetchPlaceholderAdOptions;

interface FetchLiveAdOptions {
    /**
     * Source of the ad (live: from the platform)
     */
    source: 'live';
    /** ID of the zone to fetch Ads for */
    zoneId: string;
    /** Mode to render the Ad */
    mode: 'classic' | 'auto' | 'cover';
    /** Name of the placement for the ad */
    placement: SiteInsightsAdPlacement;
    /** If true, we'll not track it as an impression */
    ignore: boolean;
}

interface FetchPlaceholderAdOptions {
    /**
     * Source of the ad (placeholder: static placeholder ad)
     */
    source: 'placeholder';
}

/**
 * Server action to render the Ad placement.
 * We use a server-action to avoid caching issues with server-side components,
 * and properly access user-agent and IP.
 */
export async function renderAd(options: FetchAdOptions) {
    const context = isV2() ? await getServerActionBaseContext() : await getV1BaseContext();

    const mode = options.source === 'live' ? options.mode : 'classic';
    const result = options.source === 'live' ? await fetchAd(options) : await getPlaceholderAd();
    if (!result || !result.ad.description || !result.ad.statlink) {
        return null;
    }

    const { ad } = result;

    const insightsAd: SiteInsightsAd | null =
        options.source === 'live'
            ? {
                  placement: options.placement,
                  zoneId: options.zoneId,
                  domain: 'company' in ad ? ad.company : '',
              }
            : null;

    return {
        children: (
            <>
                {mode === 'classic' || !('callToAction' in ad) ? (
                    <AdClassicRendering ad={ad} insightsAd={insightsAd} context={context} />
                ) : (
                    <AdCoverRendering ad={ad} insightsAd={insightsAd} context={context} />
                )}
                {ad.pixel ? <AdPixels rawPixel={ad.pixel} /> : null}
            </>
        ),
        insightsAd,
    };
}

async function fetchAd({
    zoneId,
    placement,
    ignore,
}: FetchLiveAdOptions): Promise<{ ad: AdItem; ip: string } | null> {
    const { ip, userAgent } = await getUserAgentAndIp();

    const url = new URL(`https://srv.buysellads.com/ads/${zoneId}.json`);
    url.searchParams.set('segment', `placement:${placement}`);
    url.searchParams.set('v', 'true');
    url.searchParams.set('forwardedip', ip);
    url.searchParams.set('useragent', userAgent);
    if (ignore) {
        url.searchParams.set('ignore', 'true');
    }

    const res = await fetch(url);
    const json: AdsResponse = await res.json();

    const first = json.ads[0];
    if (first && 'active' in first) {
        return { ad: first, ip };
    }

    return null;
}

async function getPlaceholderAd(): Promise<{ ad: AdItem; ip: string }> {
    const { ip } = await getUserAgentAndIp();

    return {
        ad: {
            active: '1',
            ad_via_link: '',
            bannerid: '',
            creativeid: '',
            description:
                'Your docs could be this good.\nPublish incredible open source docs for free with GitBook',
            evenodd: '0',
            external_id: '',
            height: '0',
            i: '0',
            identifier: '',
            longimp: '',
            longlink: '',
            num_slots: '1',
            rendering: 'carbon',
            smallImage: adRainbow.src,
            statimp: '',
            statlink:
                'https://www.gitbook.com/solutions/open-source?utm_campaign=sponsored-content&utm_medium=ad&utm_source=content',
            timestamp: Date.now().toString(),
            width: '0',
            zoneid: '',
            zonekey: '',
        },
        ip,
    };
}

async function getUserAgentAndIp() {
    const headersSet = await headers();
    const ip =
        headersSet.get('x-gitbook-ipv4') ??
        headersSet.get('x-gitbook-ip') ??
        headersSet.get('cf-pseudo-ipv4') ??
        headersSet.get('cf-connecting-ip') ??
        headersSet.get('x-forwarded-for') ??
        '';
    const userAgent = headersSet.get('user-agent') ?? '';

    return { ip, userAgent };
}
