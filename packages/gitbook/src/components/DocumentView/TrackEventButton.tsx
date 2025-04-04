'use client';
import { tcls } from '@/lib/tailwind';
import { useTrackEvent } from '../Insights';
import { LoadingButton } from '../primitives';

export function TrackEventButton(props: {
    action: any;
    resolved: { url: string; text: string };
}) {
    const { action, resolved } = props;
    const trackEvent = useTrackEvent();

    return (
        <LoadingButton
            onClick={async () => {
                trackEvent({ type: 'action_click', action: action });
                window.open(resolved.url, '_blank', 'noopener noreferrer');
            }}
            href={resolved.url}
            variant="primary"
            size="medium"
            className={tcls(
                'theme-bold:bg-header-link theme-bold:text-header-background theme-bold:shadow-none theme-bold:hover:bg-header-link theme-bold:hover:text-header-background theme-bold:hover:shadow-none'
            )}
            // insights={{
            //     type: 'link_click',
            //     link: {
            //         target: linkTarget,
            //         position: SiteInsightsLinkPosition.Header,
            //     },
            // }}
        >
            {resolved.text}
        </LoadingButton>
    );
}
