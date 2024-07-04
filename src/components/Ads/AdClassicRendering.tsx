import * as React from 'react';

import { tcls } from '@/lib/tailwind';

import { AdItem } from './types';

/**
 * Classic rendering for an ad.
 */
export function AdClassicRendering({ ad }: { ad: AdItem }) {
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
                    <img alt="Ads logo" className={tcls('rounded-md')} src={ad.smallImage} />
                </div>
            ) : (
                <div
                    className={tcls('px-6', 'py-4', 'rounded-md')}
                    style={{ backgroundColor: ad.backgroundColor }}
                >
                    <img alt="Ads logo" src={ad.logo} />
                </div>
            )}
            <div className={tcls('flex', 'flex-col')}>
                {/* <div className={tcls('text-sm', 'font-semibold', 'mb-2')}>
                    {ad.company} — {ad.companyTagline}
                </div> */}
                <div className={tcls('text-xs')}>{ad.description}</div>
            </div>
        </a>
    );
}
