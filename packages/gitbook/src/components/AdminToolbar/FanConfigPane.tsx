'use client';
import React from 'react';
import type { FanConfig } from './useFanConfig';

const STYLE_ID = 'fan-config-pane-tweakpane';
const TWEAKPANE_CSS_URL = 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.css';

export function FanConfigPane(props: {
    config: FanConfig;
    setConfig: React.Dispatch<React.SetStateAction<FanConfig>>;
    visible?: boolean;
}) {
    const { config, setConfig, visible = false } = props;
    const hostRef = React.useRef<HTMLDivElement | null>(null);
    const paneRef = React.useRef<any>(null);
    const paneStateRef = React.useRef<FanConfig | null>(null);
    const cssLoadedRef = React.useRef<boolean>(false);

    // Load tweakpane CSS on demand (only once)
    React.useEffect(() => {
        if (!visible || cssLoadedRef.current) return;
        if (document.getElementById(STYLE_ID)) {
            cssLoadedRef.current = true;
            return;
        }
        const link = document.createElement('link');
        link.id = STYLE_ID;
        link.rel = 'stylesheet';
        link.href = TWEAKPANE_CSS_URL;
        document.head.appendChild(link);
        cssLoadedRef.current = true;
    }, [visible]);

    // Initialise tweakpane when visible
    React.useEffect(() => {
        if (!visible || !hostRef.current || paneRef.current) return;
        let disposed = false;

        const setup = async () => {
            const mod: any = await import('tweakpane');
            if (disposed) return;
            const PaneCtor = mod.Pane ?? mod.default?.Pane ?? mod;
            // Create a clean object with values for Tweakpane
            const paneValues = {
                arcWidth: Number(config.arcWidth) || 220,
                arcHeight: Number(config.arcHeight) || 380,
                arcRadius: Number(config.arcRadius) || 220,
                startOffset: Number(config.startOffset) || 220,
                spread: Number(config.spread) || 380,
                rotationOffsetDeg: Number(config.rotationOffsetDeg) || 0,
                staggerMs: Number(config.staggerMs) || 90,
                speed: Number(config.speed) || 1,
                debug: Boolean(config.debug),
            };

            paneStateRef.current = paneValues;
            const pane = new PaneCtor({ container: hostRef.current, title: 'Fan Config' });
            paneRef.current = pane;

            const sliderBindings: Array<{
                key: keyof FanConfig;
                options: any;
            }> = [
                { key: 'arcWidth', options: { label: 'Ellipse width', min: 80, max: 600, step: 5 } },
                { key: 'arcHeight', options: { label: 'Ellipse height', min: 80, max: 600, step: 5 } },
                { key: 'arcRadius', options: { label: 'Ellipse radius', min: 0, max: 50, step: 5 } },
                { key: 'startOffset', options: { label: 'Start offset', min: -600, max: 600, step: 5 } },
                { key: 'spread', options: { label: 'Spread', min: -200, max: 200, step: 5 } },
                {
                    key: 'rotationOffsetDeg',
                    options: { label: 'Rotation offset (deg)', min: -90, max: 90, step: 1 },
                },
                { key: 'staggerMs', options: { label: 'Stagger (ms)', min: 0, max: 250, step: 5 } },
                { key: 'speed', options: { label: 'Speed', min: 0.25, max: 3, step: 0.05 } },
            ];

            sliderBindings.forEach(({ key, options }) => {
                const binding = pane.addBinding(paneValues, key as string, options);
                binding.on('change', (ev: any) => {
                    if (paneStateRef.current) {
                        paneStateRef.current[key] = ev.value;
                    }
                    setConfig((prev) => ({ ...prev, [key]: ev.value }));
                });
            });

            const debugBinding = pane.addBinding(paneValues, 'debug', { label: 'Debug path' });
            debugBinding.on('change', (ev: any) => {
                if (paneStateRef.current) {
                    paneStateRef.current.debug = ev.value;
                }
                setConfig((prev) => ({ ...prev, debug: ev.value }));
            });
        };

        setup();

        return () => {
            disposed = true;
            if (paneRef.current) {
                try {
                    paneRef.current.dispose();
                } catch {}
                paneRef.current = null;
                paneStateRef.current = null;
            }
        };
    }, [visible, setConfig]);

    // Synchronise pane when config is updated externally
    React.useEffect(() => {
        if (!paneRef.current || !paneStateRef.current) return;
        let refresh = false;
        const state = paneStateRef.current;
        (Object.keys(config) as Array<keyof FanConfig>).forEach((key) => {
            if (state[key] !== config[key]) {
                state[key] = config[key];
                refresh = true;
            }
        });
        if (refresh) {
            try {
                paneRef.current.refresh();
            } catch {}
        }
    }, [config]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                right: 400,
                bottom: 12,
                zIndex: 99999,
                background: 'rgba(20,20,20,.85)',
                borderRadius: 8,
                padding: 6,
                color: 'white',
            }}
        >
            <div ref={hostRef} />
        </div>
    );
}
