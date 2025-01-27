'use client';

import { SiteInsightsAd } from '@gitbook/api';
import { useTrackEvent } from '../Insights';

/**
 * Link to an ad with an event being captured when clicked.
 */
export function AdLink(props: {
    insightsAd: SiteInsightsAd | null;
    children: React.ReactNode;
} & React.ComponentProps<'a'>) {
    const { insightsAd, children, ...rest } = props;
    const trackEvent = useTrackEvent();

    return (
        <a rel="sponsored noopener"
            target="_blank"
            onClick={() => {
                if (!insightsAd) {
                    return;
                }

                trackEvent({
                    type: 'ad_click',
                    ad: insightsAd,
                });
            }}
            {...rest}
        >
            {children}
        </a>
    );
}