'use client';

import * as React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { renderAd } from './renderAd';

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
    zoneId: string | null;
    spaceId: string;
    placement: string;
    ignore: boolean;
    style?: ClassValue;
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

        const preview = new URL(window.location.href).searchParams.has('adpreview');
        if (!preview && !zoneId) {
            return;
        }

        (async () => {
            const result = await renderAd({
                spaceId,
                placement,
                ignore,
                zoneId: zoneId || 'FAKE_ID',
                mode,
                fake: preview,
            });

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
    }, [visible, spaceId, zoneId, ignore, placement, mode]);

    const viaUrl = new URL('https://www.gitbook.com');
    viaUrl.searchParams.set('utm_source', 'content');
    viaUrl.searchParams.set('utm_medium', 'ads');
    viaUrl.searchParams.set('utm_campaign', spaceId);

    return (
        <div ref={containerRef} className={tcls(style)}>
            {ad ? ad : null}
        </div>
    );
}
