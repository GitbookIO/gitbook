import * as React from 'react';

import { hexToRgba } from '@/lib/colors';
import { getResizedImageURL } from '@/lib/images';
import { tcls } from '@/lib/tailwind';

import { AdCover } from './types';

/**
 * Cover rendering for an ad.
 */
export async function AdCoverRendering({ ad }: { ad: AdCover }) {
    const largeImage = await getResizedImageURL(ad.largeImage, { width: 128, dpr: 2 });

    return (
        <a
            className={tcls(
                'group/ad',
                'relative',
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
                'overflow-hidden',
                'shadow-sm',
            )}
            style={{ backgroundColor: ad.backgroundColor, color: ad.textColor ?? '#ffffff' }}
            href={ad.statlink}
            rel="sponsored noopener"
            target="_blank"
        >
            <div
                className={tcls(
                    'absolute',
                    'inset-0',
                    'bg-center',
                    'bg-cover',
                    'bg-no-repeat',
                    'z-0',
                )}
                style={{
                    backgroundImage: `url(${largeImage})`,
                }}
            />

            <div className={tcls('z-[2]')}>
                <img
                    alt="Large image"
                    src={largeImage}
                    className={tcls(
                        'rounded-md',
                        'shadow-md',
                        'max-h-32',
                        'group-hover/ad:max-h-16',
                        'transition-all',
                    )}
                />
            </div>
            <div className={tcls('z-[2]')}>
                <img alt={ad.company} src={ad.logo} className={tcls('max-w-36', 'max-h-12')} />
            </div>
            <div className={tcls('flex', 'flex-col', 'z-[2]')}>
                <div className={tcls('text-sm', 'font-semibold', 'mb-2')}>{ad.companyTagline}</div>
                <div
                    className={tcls(
                        'text-xs',
                        'h-0',
                        'opacity-0',
                        'group-hover/ad:h-16',
                        'group-hover/ad:opacity-10',
                        'transition-all',
                    )}
                >
                    {ad.description}
                </div>
            </div>
            <div className={tcls('z-[2]')}>
                <span
                    className={tcls(
                        'text-sm',
                        'font-semibold',
                        'shadow-lg',
                        'rounded-md',
                        'bg-white',
                        'py-2',
                        'px-4',
                    )}
                    style={{
                        backgroundColor: ad.ctaBackgroundColor,
                        color: ad.ctaTextColor ?? ad.backgroundColor,
                    }}
                >
                    {ad.callToAction}
                </span>
            </div>
            <div
                className={tcls('absolute', 'inset-0', 'backdrop-blur', 'z-[1]')}
                style={{
                    backgroundColor: hexToRgba(ad.backgroundColor, 0.8),
                }}
            />
        </a>
    );
}
