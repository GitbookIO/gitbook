'use client';

import IconHeart from '@geist-ui/icons/heart';
import * as React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { AdClassicRendering } from './AdClassicRendering';
import { AdCoverRendering } from './AdCoverRendering';
import { AdItem, AdsResponse } from './types';

/**
 * Fetch and render the Ad placement.
 * https://docs.buysellads.com/ad-serving-api
 */
export function Ad({
    zoneId,
    spaceId,
    placement,
    ignore,
    style,
    mode = 'auto',
}: {
    zoneId: string;
    spaceId: string;
    placement: string;
    ignore: boolean;
    style?: ClassValue;
    mode?: 'classic' | 'auto' | 'cover';
}) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [visible, setVisible] = React.useState(false);
    const [failed, setFailed] = React.useState(false);
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
            url.searchParams.set('v', 'true');
            if (ignore) {
                url.searchParams.set('ignore', 'true');
            }

            try {
                const res = await fetch(url);
                const json: AdsResponse = await res.json();

                if (cancelled) {
                    return;
                }

                const first = json.ads[0];
                if (first && 'active' in first) {
                    setAd(first);
                }
            } catch (error) {
                console.error(
                    'Failed to fetch ad, it might have been blocked by a ad-blocker',
                    error,
                );
                setFailed(true);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [visible, zoneId, ignore, placement]);

    const viaUrl = new URL('https://www.gitbook.com');
    viaUrl.searchParams.set('utm_source', 'content');
    viaUrl.searchParams.set('utm_medium', 'ads');
    viaUrl.searchParams.set('utm_campaign', spaceId);

    if (ad) {
        console.log('ad', ad);
    }

    return (
        <div ref={containerRef} className={tcls(style)}>
            {ad ? (
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
                            Ads via GitBook
                        </a>
                    </p>
                </>
            ) : failed ? (
                <AdBlockerPlaceholder />
            ) : null}
        </div>
    );
}

/**
 * Render attribution or verification pixels.
 * https://docs.buysellads.com/ad-serving-api#pixels
 */
function AdPixels({ rawPixel }: { rawPixel: string }) {
    const pixels = rawPixel.split('||');
    const time = String(Math.round(Date.now() / 1e4) | 0);

    return (
        <div className={tcls('hidden')}>
            {pixels.map((pixel, index) => {
                return (
                    <img
                        key={index}
                        src={pixel.replace('[timestamp]', time)}
                        width="1"
                        height="1"
                        style={{ display: 'none' }}
                        alt="Ads tracking pixel"
                    />
                );
            })}
        </div>
    );
}

/**
 * Placeholder when visitor has an ad-blocker.
 */
function AdBlockerPlaceholder() {
    return (
        <div
            className={tcls(
                'flex',
                'flex-col',
                'gap-3',
                'bg-light-2',
                'text-dark/7',
                'dark:bg-dark-2',
                'dark:text-light/7',
                'rounded-lg',
                'p-4',
            )}
        >
            <div className={tcls('flex', 'flex-row', 'gap-2', 'items-center')}>
                <IconHeart className={tcls('w-4', 'h-4', 'text-primary-500')} />
                <p className={tcls('text-xs', 'font-semibold')}>Ad disabled</p>
            </div>
            <p className={tcls('text-xs')}>
                {`It looks like you're using an adblocker. Whitelist this site to help support this
                project.`}
            </p>
        </div>
    );
}
