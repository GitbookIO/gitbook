'use server';

import { IpAndUserAgent } from '@/lib/gitbook-context';

import { AdClassicRendering } from './AdClassicRendering';
import { AdCoverRendering } from './AdCoverRendering';
import { AdPixels } from './AdPixels';
import adRainbow from './assets/ad-rainbow.svg';
import { AdItem, AdsResponse } from './types';

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
    placement: string;
    /** If true, we'll not track it as an impression */
    ignore: boolean;
    /** IP and User-Agent to use for the request */
    ipAndUserAgent: IpAndUserAgent;
}

interface FetchPlaceholderAdOptions {
    /**
     * Source of the ad (placeholder: static placeholder ad)
     */
    source: 'placeholder';
    /** IP and User-Agent to use for the request */
    ipAndUserAgent: IpAndUserAgent;
}

/**
 * Server action to render the Ad placement.
 * We use a server-action to avoid caching issues with server-side components,
 * and properly access user-agent and IP.
 */
export async function renderAd(options: FetchAdOptions) {
    const mode = options.source === 'live' ? options.mode : 'classic';

    const result =
        options.source === 'live' ? await fetchAd(options) : await getPlaceholderAd(options);
    if (!result || !result.ad.description || !result.ad.statlink) {
        return null;
    }

    const { ad } = result;

    return (
        <>
            {mode === 'classic' || !('callToAction' in ad) ? (
                <AdClassicRendering ad={ad} />
            ) : (
                <AdCoverRendering ad={ad} />
            )}
            {ad.pixel ? <AdPixels rawPixel={ad.pixel} /> : null}
        </>
    );
}

async function fetchAd({
    ipAndUserAgent,
    zoneId,
    placement,
    ignore,
}: FetchLiveAdOptions): Promise<{ ad: AdItem; ip: string } | null> {
    const { ip, userAgent } = ipAndUserAgent;
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

function getPlaceholderAd(options: FetchPlaceholderAdOptions): { ad: AdItem; ip: string } {
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
        ip: options.ipAndUserAgent.ip,
    };
}
