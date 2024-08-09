import * as React from 'react';

import { tcls } from '@/lib/tailwind';

/**
 * Render attribution or verification pixels.
 * https://docs.buysellads.com/ad-serving-api#pixels
 */
export function AdPixels({ rawPixel }: { rawPixel: string }) {
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
