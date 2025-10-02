'use client';
import React from 'react';

export type FanConfig = {
    arcWidth: number;
    arcHeight: number;
    arcRadius: number;
    spread: number;
    startOffset: number;
    rotationOffsetDeg: number;
    staggerMs: number;
    speed: number; // 1 = baseline, >1 faster, <1 slower
    debug: boolean;
};

export const defaultFanConfig: FanConfig = {
    arcWidth: 505,
    arcHeight: 400,
    arcRadius: 35,
    spread: 45,
    startOffset: -250,
    rotationOffsetDeg: 80,
    staggerMs: 80,
    speed: 0.4,
    debug: false,
};

const STORAGE_KEY = 'gitbook_toolbar_fan_config';

export function useFanConfig(): [FanConfig, React.Dispatch<React.SetStateAction<FanConfig>>] {
    const [config, setConfig] = React.useState<FanConfig>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? { ...defaultFanConfig, ...JSON.parse(raw) } : defaultFanConfig;
        } catch {
            return defaultFanConfig;
        }
    });

    React.useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch {}
    }, [config]);

    return [config, setConfig];
}
