import type * as api from '@gitbook/api';
import type { InsightsEventName, TrackEventInput } from './InsightsProvider';

export type SlimTrackEventInput =
    | { t: 'pv' }
    | { t: 'so' }
    | { t: 'stq'; q: string }
    | { t: 'sor'; q: string; r: { s: string; p: string } }
    | { t: 'ppf'; f: { r: api.PageFeedbackRating } }
    | { t: 'ppfc'; f: { r: api.PageFeedbackRating; c: string } }
    | { t: 'aq'; q: string }
    | { t: 'lc'; l: { t: api.ContentRef; p: api.SiteInsightsLinkPosition } }
    | { t: 'aco'; o: api.OpenAPIOperationPointer }
    | { t: 'acr'; o: api.OpenAPIOperationPointer }
    | { t: 'tc'; p: api.SiteInsightsTrademarkPlacement }
    | { t: 'ac'; a: api.SiteInsightsAd }
    | { t: 'ad'; a: api.SiteInsightsAd };

export function expandSlimTrackEvent(
    input: SlimTrackEventInput
): TrackEventInput<InsightsEventName> {
    switch (input.t) {
        case 'pv':
            return { type: 'page_view' };
        case 'so':
            return { type: 'search_open' };
        case 'stq':
            return { type: 'search_type_query', query: input.q };
        case 'sor':
            return {
                type: 'search_open_result',
                query: input.q,
                result: { spaceId: input.r.s, pageId: input.r.p },
            };
        case 'ppf':
            return { type: 'page_post_feedback', feedback: { rating: input.f.r } };
        case 'ppfc':
            return {
                type: 'page_post_feedback_comment',
                feedback: { rating: input.f.r, comment: input.f.c },
            };
        case 'aq':
            return { type: 'ask_question', query: input.q };
        case 'lc':
            return {
                type: 'link_click',
                link: { target: input.l.t, position: input.l.p },
            };
        case 'aco':
            return { type: 'api_client_open', operation: input.o };
        case 'acr':
            return { type: 'api_client_request', operation: input.o };
        case 'tc':
            return { type: 'trademark_click', placement: input.p };
        case 'ac':
            return { type: 'ad_click', ad: input.a };
        case 'ad':
            return { type: 'ad_display', ad: input.a };
        default:
            throw new Error('Unknown slim event');
    }
}

export function toSlimTrackEvent(event: TrackEventInput<InsightsEventName>): SlimTrackEventInput {
    switch (event.type) {
        case 'page_view':
            return { t: 'pv' };
        case 'search_open':
            return { t: 'so' };
        case 'search_type_query':
            return { t: 'stq', q: event.query };
        case 'search_open_result':
            return {
                t: 'sor',
                q: event.query,
                r: { s: event.result.spaceId, p: event.result.pageId },
            };
        case 'page_post_feedback':
            return { t: 'ppf', f: { r: event.feedback.rating } };
        case 'page_post_feedback_comment':
            return { t: 'ppfc', f: { r: event.feedback.rating, c: event.feedback.comment } };
        case 'ask_question':
            return { t: 'aq', q: event.query };
        case 'link_click':
            return { t: 'lc', l: { t: event.link.target, p: event.link.position } };
        case 'api_client_open':
            return { t: 'aco', o: event.operation };
        case 'api_client_request':
            return { t: 'acr', o: event.operation };
        case 'trademark_click':
            return { t: 'tc', p: event.placement };
        case 'ad_click':
            return { t: 'ac', a: event.ad };
        case 'ad_display':
            return { t: 'ad', a: event.ad };
        default:
            throw new Error('Unknown event type');
    }
}
