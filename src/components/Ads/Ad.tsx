'use client';
import * as React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

interface AdItem {
    active: string;
    ad_via_link: string;
    backgroundColor: string;
    backgroundHoverColor: string;
    bannerid: string;
    callToAction: string;
    company: string;
    companyTagline: string;
    creativeid: string;
    ctaBackgroundColor: string;
    ctaBackgroundHoverColor: string;
    ctaTextColor: string;
    ctaTextColorHover: string;
    description: string;
    evenodd: string;
    external_id: string;
    height: string;
    i: string;
    identifier: string;
    image: string;
    logo: string;
    longimp: string;
    longlink: string;
    num_slots: string;
    rendering: string;
    statimp: string;
    statlink: string;
    textColor: string;
    textColorHover: string;
    timestamp: string;
    width: string;
    zoneid: string;
    zonekey: string;
    pixel?: string;
}

interface AdsResponse {
    ads: Array<AdItem | {}>;
}

/**
 * Load and render an ad placement.
 * https://docs.buysellads.com/custom-templates
 */
export function Ad({
    zoneId,
    spaceId,
    placement,
    ignore,
    style,
    vertical = true,
}: {
    zoneId: string;
    spaceId: string;
    placement: string;
    ignore: boolean;
    style?: ClassValue;
    vertical?: boolean;
}) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [visible, setVisible] = React.useState(false);
    const [ad, setAd] = React.useState<AdItem | undefined>(undefined);

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

        (async () => {
            const url = new URL(`https://srv.buysellads.com/ads/${zoneId}.json`);
            url.searchParams.set('segment', `placement:${placement}`);
            if (ignore) {
                url.searchParams.set('ignore', 'true');
            }
            if (vertical) {
                url.searchParams.set('v', 'true');
            }

            const res = await fetch(url);
            const json: AdsResponse = await res.json();

            if (cancelled) {
                return;
            }

            if (json.ads.length > 0) {
                setAd(json.ads[0] as AdItem);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [visible, zoneId, ignore, vertical, placement]);

    const viaUrl = new URL('https://www.gitbook.com');
    viaUrl.searchParams.set('utm_source', 'content');
    viaUrl.searchParams.set('utm_medium', 'ads');
    viaUrl.searchParams.set('utm_campaign', spaceId);

    return (
        <div ref={containerRef} className={tcls(style)}>
            {ad ? (
                <>
                    <a
                        className={tcls(
                            'flex',
                            'flex-col',
                            'bg-light-2',
                            'text-dark/7',
                            'dark:bg-dark-2',
                            'dark:text-light/7',
                            'hover:text-dark/9',
                            'dark:hover:text-light/9',
                            'rounded-lg',
                            'p-3',
                        )}
                        href={ad.statlink}
                        rel="sponsored noopener"
                        target="_blank"
                        title={`${ad.company} — ${ad.companyTagline}`}
                    >
                        <div className={tcls('mb-3', 'px-6', 'py-4', 'rounded-md')} style={{ backgroundColor: ad.backgroundColor }}>
                            <img alt="Ads logo" src={ad.logo} />
                        </div>
                        <div className={tcls('flex', 'flex-col', 'mb-4')}>
                            <div className={tcls('text-sm', 'font-semibold', 'mb-2')}>
                                {ad.company} — {ad.companyTagline}
                            </div>
                            <div className={tcls('text-xs')}>{ad.description}</div>
                        </div>
                        <div>
                            <span className={tcls('text-sm', 'rounded-md', 'bg-light-3', 'dark:bg-dark-3', 'py-2', 'px-4')} style={{ backgroundColor: ad.ctaBackgroundColor, color: ad.ctaTextColor }}>
                                {ad.callToAction}
                            </span>
                        </div>
                        {ad.pixel ? <AdPixels rawPixel={ad.pixel} /> : null}
                    </a>
                    <p className={tcls('mt-2', 'mr-2', 'text-xs', 'text-right', 'text-dark/5', 'dark:text-light/5')}>
                        <a target="_blank" href={viaUrl.toString()} className={tcls('hover:underline')}>Ads via GitBook</a>
                    </p>
                </>
            ) : null}
        </div>
    );
}

/**
 * Render attribution or verification pixels.
 * https://docs.buysellads.com/ad-serving-api#pixels
 */
function AdPixels({ rawPixel }: { rawPixel: string }) {
    const pixels = rawPixel.split("||");
    const time = String(Math.round(Date.now() / 1e4) | 0);

    return (
        <div className={tcls('hidden')}>
            {pixels.map((pixel, index) => {
                return (
                    <img
                        key={index}
                        src={pixel.replace("[timestamp]", time)}
                        width="1"
                        height="1"
                        style={{ display: 'none' }}
                        alt="Ads tracking pixel"
                    />
                )
            })}
        </div>
    )
}
