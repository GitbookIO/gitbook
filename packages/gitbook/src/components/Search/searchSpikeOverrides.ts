// Spike only: lets a measurement harness switch the search arms from the browser without a rebuild,
// via `localStorage.gb_search_spike = '{"direct": false, "debounceMs": 200}'`.
// Delete this module (and its two call sites in useSearchResults.ts) when the spike ends.

const STORAGE_KEY = 'gb_search_spike';

type SearchSpikeOverrides = {
    /** `false` forces the search route, `true` uses the API directly whenever the page allows it. */
    direct?: boolean;
    /** Replaces the search debounce. */
    debounceMs?: number;
};

export function getSearchSpikeOverrides(): SearchSpikeOverrides {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return {};
        }

        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return {};
        }

        const { direct, debounceMs } = parsed as Record<string, unknown>;
        return {
            direct: typeof direct === 'boolean' ? direct : undefined,
            debounceMs:
                typeof debounceMs === 'number' && Number.isFinite(debounceMs) && debounceMs >= 0
                    ? debounceMs
                    : undefined,
        };
    } catch {
        return {};
    }
}
