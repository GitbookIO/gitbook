import rawMetrics from './data/metrics.json' with { type: 'json' };

type IconViewBox = [number, number, number, number];

type IconMetrics = {
    originalViewBox: IconViewBox;
    safeViewBox: IconViewBox;
};

const iconMetrics = rawMetrics as unknown as Record<string, IconMetrics>;

/**
 * Lookup the safe rendering metrics for a given icon asset.
 */
export function getIconMetrics(style: string, icon: string): IconMetrics | null {
    return iconMetrics[`${style}/${icon}`] ?? null;
}
