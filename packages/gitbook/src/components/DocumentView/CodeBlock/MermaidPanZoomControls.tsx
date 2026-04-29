'use client';

import type { PanzoomObject } from '@panzoom/panzoom';

import { Button } from '@/components/primitives';

const PAN_STEP = 50;

/**
 * Navigation and zoom controls for mermaid diagrams, positioned as an overlay.
 */
export function MermaidPanZoomControls(props: { panZoom: PanzoomObject }) {
    const { panZoom } = props;
    const btnProps = {
        variant: 'secondary' as const,
        size: 'xsmall' as const,
        iconOnly: true,
    };

    return (
        <div className="absolute right-3 bottom-3 z-10 grid grid-cols-3 gap-0.5 opacity-0 transition-opacity duration-150 group-focus-within/mermaid:pointer-events-auto group-focus-within/mermaid:opacity-100 group-hover/mermaid:opacity-100 motion-reduce:transition-none">
            {/* Row 1: empty, pan up, zoom in */}
            <div />
            <Button
                {...btnProps}
                icon="chevron-up"
                onClick={() => panZoom.pan(0, PAN_STEP, { relative: true })}
            />
            <Button {...btnProps} icon="plus" onClick={() => panZoom.zoomIn()} />
            {/* Row 2: pan left, reset, pan right */}
            <Button
                {...btnProps}
                icon="chevron-left"
                onClick={() => panZoom.pan(PAN_STEP, 0, { relative: true })}
            />
            <Button {...btnProps} icon="refresh" onClick={() => panZoom.reset()} />
            <Button
                {...btnProps}
                icon="chevron-right"
                onClick={() => panZoom.pan(-PAN_STEP, 0, { relative: true })}
            />
            {/* Row 3: empty, pan down, zoom out */}
            <div />
            <Button
                {...btnProps}
                icon="chevron-down"
                onClick={() => panZoom.pan(0, -PAN_STEP, { relative: true })}
            />
            <Button {...btnProps} icon="minus" onClick={() => panZoom.zoomOut()} />
        </div>
    );
}
