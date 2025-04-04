import { getVisitorAuthClaims } from '@/lib/adaptive';
import { getDataOrNull } from '@v2/lib/data';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import type { InlineProps } from './Inline';
import { TrackEventButton } from './TrackEventButton';

export async function InlineAction(props: InlineProps<any>) {
    const { inline, context } = props;

    if (!context.contentContext) {
        throw new Error('inline action requires a contentContext');
    }

    const action = inline.data.action;

    if (action.type === 'url') {
        return <TrackEventButton action={inline.data.action} resolved={{ url: action.url, text: action.text }} />
    }

    // API action

    const { dataFetcher } = context.contentContext;
    
        const siteData = await getSiteURLDataFromMiddleware();
        const claims = getVisitorAuthClaims(siteData)
    const resolved = await getDataOrNull(dataFetcher.getAction({ url: inline.data.action.url, claims }));

    if (!resolved) {
        throw new Error('inline action not found');
    }

    return <TrackEventButton action={inline.data.action} resolved={resolved} />
}
