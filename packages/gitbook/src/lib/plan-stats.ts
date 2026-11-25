// TEMP: measures what the site page plan saves; remove once the plan is validated in production.
import { AsyncLocalStorage } from 'node:async_hooks';
import { identify } from 'object-identity';
import * as React from 'react';

import type { GitBookDataFetcher } from '@/lib/data';
import type { ImageResizer } from '@/lib/images';
import { getLogger } from '@/lib/logger';

/** Set while the plan runs, so its calls can be told apart from the render's. */
export const planScope = new AsyncLocalStorage<true>();

type Entry = {
    label: string;
    example?: Record<string, string>;
    planStart?: number;
    planEnd?: number;
    renderAsk?: number;
    renderEnd?: number;
};

export type PlanStats = {
    now: () => number;
    t0: number;
    planStart?: number;
    entries: Map<string, Entry>;
};

export function createPlanStats(now: () => number = Date.now): PlanStats {
    return { now, t0: now(), entries: new Map() };
}

/** Render calls made before this are the site context fetch, not gaps in the plan. */
export function markPlanStart(stats: PlanStats) {
    stats.planStart ??= stats.now();
}

/** One per request; outside a render scope this just returns a fresh, unused object. */
export const getRequestPlanStats = React.cache(() => createPlanStats());

/** Record the first plan call and the first render call of a request, keyed by method and args. */
export function recordCall(
    stats: PlanStats,
    label: string,
    args: unknown,
    promise: Promise<unknown>,
    inPlan: boolean
) {
    const key = `${label}:${identify(args)}`;
    let entry = stats.entries.get(key);
    if (!entry) {
        entry = { label };
        stats.entries.set(key, entry);
    }
    const current = entry;
    const settled = () => stats.now();
    if (inPlan && current.planStart === undefined) {
        current.planStart = stats.now();
        promise.then(
            () => {
                current.planEnd = settled();
            },
            () => {
                current.planEnd = settled();
            }
        );
    } else if (!inPlan && current.renderAsk === undefined) {
        current.renderAsk = stats.now();
        current.example = pickIds(args);
        promise.then(
            () => {
                current.renderEnd = settled();
            },
            () => {
                current.renderEnd = settled();
            }
        );
    }
}

/** Only id-like string fields, so logs never carry share keys, tokens or content. */
function pickIds(args: unknown): Record<string, string> | undefined {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
        return undefined;
    }
    const ids: Record<string, string> = {};
    for (const [key, value] of Object.entries(args)) {
        if (key.endsWith('Id') && typeof value === 'string') {
            ids[key] = value;
        }
    }
    return ids;
}

export function summarizePlanStats(stats: PlanStats) {
    let used = 0;
    let beforePlan = 0;
    let savedMsTotal = 0;
    let savedMsMax = 0;
    const wasted: Record<string, number> = {};
    const notPlanned: Record<
        string,
        { count: number; maxMs: number; example?: Record<string, string> }
    > = {};
    const saved: { label: string; ms: number }[] = [];

    for (const entry of stats.entries.values()) {
        const { planStart, planEnd, renderAsk, renderEnd } = entry;
        if (planStart !== undefined && renderAsk !== undefined) {
            used++;
            if (planEnd !== undefined) {
                // Without the plan the render would have started this call itself when it asked.
                const withoutPlan = renderAsk + (planEnd - planStart);
                const withPlan = Math.max(renderAsk, planEnd);
                const ms = Math.max(0, withoutPlan - withPlan);
                savedMsTotal += ms;
                savedMsMax = Math.max(savedMsMax, ms);
                saved.push({ label: entry.label, ms });
            }
        } else if (planStart !== undefined) {
            wasted[entry.label] = (wasted[entry.label] ?? 0) + 1;
        } else if (
            renderAsk !== undefined &&
            stats.planStart !== undefined &&
            renderAsk < stats.planStart
        ) {
            beforePlan++;
        } else if (renderAsk !== undefined) {
            const item = (notPlanned[entry.label] ??= {
                count: 0,
                maxMs: 0,
                example: entry.example,
            });
            item.count++;
            if (renderEnd !== undefined) {
                item.maxMs = Math.max(item.maxMs, renderEnd - renderAsk);
            }
        }
    }

    return {
        used,
        savedMsTotal,
        savedMsMax,
        topSaved: saved.sort((a, b) => b.ms - a.ms).slice(0, 5),
        wasted,
        beforePlan,
        notPlanned,
    };
}

export function logPlanStats(stats: PlanStats) {
    const summary = summarizePlanStats(stats);
    // One JSON string so log tooling keeps nested fields (console truncates objects at depth 2).
    getLogger()
        .subLogger('data-plan')
        .info(
            'site-page-plan.stats',
            JSON.stringify({ elapsedMs: stats.now() - stats.t0, ...summary })
        );
}

function record<T>(label: string, args: unknown, promise: Promise<T>): Promise<T> {
    try {
        recordCall(getRequestPlanStats(), label, args, promise, planScope.getStore() === true);
    } catch {
        // Measuring must never break a fetch.
    }
    return promise;
}

/** Wrap a request's data fetcher so each call is timed; `withToken` fetchers aren't measured. */
export function measureDataFetcher(fetcher: GitBookDataFetcher): GitBookDataFetcher {
    return new Proxy(fetcher, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof prop !== 'string' || prop === 'api' || prop === 'withToken') {
                return value;
            }
            if (typeof value !== 'function') {
                return value;
            }
            return (...args: unknown[]) =>
                record(prop, args[0], (value as (...a: unknown[]) => Promise<unknown>)(...args));
        },
    });
}

export function measureImageResizer(resizer: ImageResizer): ImageResizer {
    return {
        ...resizer,
        getImageSize: (input, options) =>
            record('getImageSize', [input, options], resizer.getImageSize(input, options)),
    };
}
