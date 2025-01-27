import { SiteInsightsAd } from '@gitbook/api';
import * as React from 'react';

import { getResizedImageURL } from '@/lib/images';
import { tcls } from '@/lib/tailwind';

import { AdLink } from './AdLink';
import { AdItem } from './types';

/**
 * Classic rendering for an ad.
 */
export async function AdClassicRendering({
    ad,
    insightsAd,
}: {
    ad: AdItem;
    insightsAd: SiteInsightsAd | null;
}) {
    const smallImgSrc =
        'smallImage' in ad ? await getResizedImageURL(ad.smallImage, { width: 192, dpr: 2 }) : null;
    const logoSrc =
        'logo' in ad ? await getResizedImageURL(ad.logo, { width: 192 - 48, dpr: 2 }) : null;
    return (
        <AdLink
            insightsAd={insightsAd}
            className={tcls(
                'flex',
                'flex-col',
                'gap-4',
                'bg-light-2',
                'text-dark/7',
                'dark:bg-dark-2',
                'dark:text-light/7',
                'hover:text-dark/9',
                'dark:hover:text-light/9',
                'rounded-lg',
                'p-4',
            )}
            href={ad.statlink}
        >
            {smallImgSrc && 'smallImage' in ad ? (
                <div>
                    <img alt="Ads logo" className={tcls('rounded-md')} src={smallImgSrc} />
                </div>
            ) : logoSrc && 'logo' in ad ? (
                <div
                    className={tcls('px-6', 'py-4', 'rounded-md')}
                    style={{ backgroundColor: ad.backgroundColor }}
                >
                    <img alt="Ads logo" src={logoSrc} />
                </div>
            ) : null}
            <div className={tcls('flex', 'flex-col')}>
                <div className={tcls('text-xs')}>{ad.description}</div>
            </div>
        </AdLink>
    );
}
