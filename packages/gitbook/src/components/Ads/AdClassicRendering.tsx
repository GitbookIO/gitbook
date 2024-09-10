import * as React from 'react';

import { getResizedImageURL } from '@/lib/images';
import { tcls } from '@/lib/tailwind';

import { AdItem } from './types';

/**
 * Classic rendering for an ad.
 */
export async function AdClassicRendering({ ad }: { ad: AdItem }) {
    return (
        <a
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
            rel="sponsored noopener"
            target="_blank"
        >
            {'smallImage' in ad ? (
                <div>
                    <img
                        alt="Ads logo"
                        className={tcls('rounded-md')}
                        src={await getResizedImageURL(ad.smallImage, { width: 192, dpr: 2 })}
                    />
                </div>
            ) : (
                <div
                    className={tcls('px-6', 'py-4', 'rounded-md')}
                    style={{ backgroundColor: ad.backgroundColor }}
                >
                    <img
                        alt="Ads logo"
                        src={await getResizedImageURL(ad.logo, { width: 192 - 48, dpr: 2 })}
                    />
                </div>
            )}
            <div className={tcls('flex', 'flex-col')}>
                <div className={tcls('text-xs')}>{ad.description}</div>
            </div>
        </a>
    );
}
