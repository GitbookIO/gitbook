import type * as api from '@gitbook/api';
import type { InsightsEventName, TrackEventInput } from './InsightsProvider';

type SlimTrackEventName =
    | 'pv' // page_view
    | 'so' // search_open
    | 'stq' // search_type_query
    | 'sor' // search_open_result
    | 'ppf' // page_post_feedback
    | 'ppfc' // page_post_feedback_comment
    | 'aq' // ask_question
    | 'lc' // link_click
    | 'aco' // api_client_open
    | 'acr' // api_client_request
    | 'tc' // trademark_click
    | 'ac' // ad_click
    | 'ad'; // ad_display

type BaseSlimTrackEvent<T extends SlimTrackEventName> = {
    t: T; // type
};

export type SlimTrackEventInput<T extends SlimTrackEventName = SlimTrackEventName> = T extends 'pv'
    ? BaseSlimTrackEvent<'pv'>
    : T extends 'so'
      ? BaseSlimTrackEvent<'so'>
      : T extends 'stq'
        ? BaseSlimTrackEvent<'stq'> & { q: string }
        : T extends 'sor'
          ? BaseSlimTrackEvent<'sor'> & { q: string; r: { s: string; p: string } }
          : T extends 'ppf'
            ? BaseSlimTrackEvent<'ppf'> & { f: { r: api.PageFeedbackRating } }
            : T extends 'ppfc'
              ? BaseSlimTrackEvent<'ppfc'> & { f: { r: api.PageFeedbackRating; c: string } }
              : T extends 'aq'
                ? BaseSlimTrackEvent<'aq'> & { q: string }
                : T extends 'lc'
                  ? BaseSlimTrackEvent<'lc'> & {
                        l: { t: api.ContentRef; p: api.SiteInsightsLinkPosition };
                    }
                  : T extends 'aco'
                    ? BaseSlimTrackEvent<'aco'> & { o: api.OpenAPIOperationPointer }
                    : T extends 'acr'
                      ? BaseSlimTrackEvent<'acr'> & { o: api.OpenAPIOperationPointer }
                      : T extends 'tc'
                        ? BaseSlimTrackEvent<'tc'> & { p: api.SiteInsightsTrademarkPlacement }
                        : T extends 'ac'
                          ? BaseSlimTrackEvent<'ac'> & { a: api.SiteInsightsAd }
                          : T extends 'ad'
                            ? BaseSlimTrackEvent<'ad'> & { a: api.SiteInsightsAd }
                            : never;

export function expandSlimTrackEvent<EventName extends SlimTrackEventName = SlimTrackEventName>(
    input: SlimTrackEventInput<EventName>
) {
    switch (input.t) {
        case 'pv':
            return { type: 'page_view' as const };
        case 'so':
            return { type: 'search_open' as const };
        case 'stq':
            return { type: 'search_type_query' as const, query: input.q };
        case 'sor':
            return {
                type: 'search_open_result' as const,
                query: input.q,
                result: { spaceId: input.r.s, pageId: input.r.p },
            };
        case 'ppf':
            return { type: 'page_post_feedback' as const, feedback: { rating: input.f.r } };
        case 'ppfc':
            return {
                type: 'page_post_feedback_comment' as const,
                feedback: { rating: input.f.r, comment: input.f.c },
            };
        case 'aq':
            return { type: 'ask_question' as const, query: input.q };
        case 'lc':
            return {
                type: 'link_click' as const,
                link: { target: input.l.t, position: input.l.p },
            };
        case 'aco':
            return { type: 'api_client_open' as const, operation: input.o };
        case 'acr':
            return { type: 'api_client_request' as const, operation: input.o };
        case 'tc':
            return { type: 'trademark_click' as const, placement: input.p };
        case 'ac':
            return { type: 'ad_click' as const, ad: input.a };
        case 'ad':
            return { type: 'ad_display' as const, ad: input.a };
        default:
            throw new Error('Unknown slim event');
    }
}

export function toSlimTrackEvent<EventName extends InsightsEventName>(
    event: TrackEventInput<EventName>
) {
    switch (event.type) {
        case 'page_view':
            return { t: 'pv' as const };
        case 'search_open':
            return { t: 'so' as const };
        case 'search_type_query': {
            const _event = event as unknown as TrackEventInput<'search_type_query'>;
            return { t: 'stq' as const, q: _event.query };
        }
        case 'search_open_result': {
            const _event = event as unknown as TrackEventInput<'search_open_result'>;
            return {
                t: 'sor' as const,
                q: _event.query,
                r: { s: _event.result.spaceId, p: _event.result.pageId },
            };
        }
        case 'page_post_feedback': {
            const _event = event as unknown as TrackEventInput<'page_post_feedback'>;
            return { t: 'ppf' as const, f: { r: _event.feedback.rating } };
        }
        case 'page_post_feedback_comment': {
            const _event = event as unknown as TrackEventInput<'page_post_feedback_comment'>;
            return {
                t: 'ppfc' as const,
                f: { r: _event.feedback.rating, c: _event.feedback.comment },
            };
        }
        case 'ask_question': {
            const _event = event as unknown as TrackEventInput<'ask_question'>;
            return { t: 'aq' as const, q: _event.query };
        }
        case 'link_click': {
            const _event = event as unknown as TrackEventInput<'link_click'>;
            return { t: 'lc' as const, l: { t: _event.link.target, p: _event.link.position } };
        }
        case 'api_client_open': {
            const _event = event as unknown as TrackEventInput<'api_client_open'>;
            return { t: 'aco' as const, o: _event.operation };
        }
        case 'api_client_request': {
            const _event = event as unknown as TrackEventInput<'api_client_request'>;
            return { t: 'acr' as const, o: _event.operation };
        }
        case 'trademark_click': {
            const _event = event as unknown as TrackEventInput<'trademark_click'>;
            return { t: 'tc' as const, p: _event.placement };
        }
        case 'ad_click': {
            const _event = event as unknown as TrackEventInput<'ad_click'>;
            return { t: 'ac' as const, a: _event.ad };
        }
        case 'ad_display': {
            const _event = event as unknown as TrackEventInput<'ad_display'>;
            return { t: 'ad' as const, a: _event.ad };
        }
        default:
            throw new Error('Unknown event type');
    }
}
