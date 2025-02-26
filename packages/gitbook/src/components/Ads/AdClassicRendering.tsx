import type { SiteInsightsAd } from '@gitbook/api';
import type { GitBookBaseContext } from '@v2/lib/context';
import { getResizedImageURL } from '@v2/lib/images';

import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
import type { AdItem } from './types';

/**
 * Classic rendering for an ad.
 */
export async function AdClassicRendering({
    ad,
    insightsAd,
    context,
}: {
    ad: AdItem;
    insightsAd: SiteInsightsAd | null;
    context: GitBookBaseContext;
}) {
    const smallImgSrc =
        'smallImage' in ad
            ? await getResizedImageURL(context.imageResizer, ad.smallImage, { width: 192, dpr: 2 })
            : null;
    const logoSrc =
        'logo' in ad
            ? await getResizedImageURL(context.imageResizer, ad.logo, { width: 192 - 48, dpr: 2 })
            : null;
    return (
        <Link
            rel="sponsored noopener"
            target="_blank"
            insights={
                insightsAd
                    ? {
                          type: 'ad_click',
                          ad: insightsAd,
                      }
                    : undefined
            }
            className={tcls(
                'flex',
                'flex-col',
                'gap-4',
                'bg-tint',
                'text-tint',
                'hover:text-tint-strong',
                'rounded-lg',
                'p-4'
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
        </Link>
    );
}
