'use server';

import { headers } from "next/headers";
import { AdsResponse } from "./types";
import { AdClassicRendering } from "./AdClassicRendering";
import { AdCoverRendering } from "./AdCoverRendering";
import { AdPixels } from "./AdPixels";
import { tcls } from "@/lib/tailwind";

interface FetchAdOptions {
    /** ID of the zone to fetch Ads for */
    zoneId: string;
    /** ID of the space */
    spaceId: string;
    /** Mode to render the Ad */
    mode: 'classic' | 'auto' | 'cover';
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
    const { spaceId, mode } = options;
    const ad = await fetchAd(options);
    if (!ad || !ad.description || !ad.statlink) {
        return null;
    }

    const viaUrl = new URL('https://www.gitbook.com');
    viaUrl.searchParams.set('utm_source', 'content');
    viaUrl.searchParams.set('utm_medium', 'ads');
    viaUrl.searchParams.set('utm_campaign', spaceId);

    return (
        <>
            {mode === 'classic' || !('callToAction' in ad) ? (
                <AdClassicRendering ad={ad} />
            ) : (
                <AdCoverRendering ad={ad} />
            )}
            {ad.pixel ? <AdPixels rawPixel={ad.pixel} /> : null}
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
                <a
                    target="_blank"
                    href={viaUrl.toString()}
                    className={tcls('hover:underline')}
                >
                    Sponsored via GitBook
                </a>
            </p>
        </>
    )
}

async function fetchAd({ zoneId, placement, ignore }: FetchAdOptions) {
    const headersSet = headers();
    const ip = headersSet.get("x-forwarded-for") ?? '';
    const userAgent = headersSet.get("user-agent") ?? '';

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
        return first;
    }

    return null;
}
