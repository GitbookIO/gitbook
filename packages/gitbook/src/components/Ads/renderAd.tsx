'use server';

import { headers } from 'next/headers';

import { absoluteHref } from '@/lib/links';

import { AdClassicRendering } from './AdClassicRendering';
import { AdCoverRendering } from './AdCoverRendering';
import { AdPixels } from './AdPixels';
import { AdItem, AdsResponse } from './types';

interface FetchAdOptions {
    /** ID of the zone to fetch Ads for */
    zoneId: string;
    /** Mode to render the Ad */
    mode: 'classic' | 'auto' | 'cover' | 'placeholder';
    /** Name of the placement for the ad */
    placement: string;
    /** If true, we'll not track it as an impression */
    ignore: boolean;
}

/**
 * Server action to render the Ad placement.
 * We use a server-action to avoid caching issues with server-side components,
 * and properly access user-agent and IP.
 */
export async function renderAd(options: FetchAdOptions) {
    const { mode } = options;

    const result = mode !== 'placeholder' ? await fetchAd(options) : getPlaceholderAd();
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
    zoneId,
    placement,
    ignore,
}: FetchAdOptions): Promise<{ ad: AdItem; ip: string } | null> {
    const { ip, userAgent } = getUserAgentAndIp();

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

function getPlaceholderAd(): { ad: AdItem; ip: string } {
    const { ip } = getUserAgentAndIp();
    const imageHref = absoluteHref('~gitbook/static/images/ad-rainbow.svg', true);

    return {
        ad: {
            active: '1',
            ad_via_link: '',
            bannerid: '',
            creativeid: '',
            description:
                'Your docs could be this good\nPublish incredible open source docs for free with GitBook',
            evenodd: '0',
            external_id: '',
            height: '0',
            i: '0',
            identifier: '',
            longimp: '',
            longlink: '',
            num_slots: '1',
            rendering: 'carbon',
            smallImage: imageHref,
            statimp: '',
            statlink: 'https://www.gitbook.com/solutions/open-source',
            timestamp: Date.now().toString(),
            width: '0',
            zoneid: '',
            zonekey: '',
        },
        ip,
    };
}

function getUserAgentAndIp() {
    const headersSet = headers();
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
