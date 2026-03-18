'use client';

import type { PanzoomObject } from '@panzoom/panzoom';

import { Button } from '@/components/primitives';

const PAN_STEP = 50;

/**
 * Navigation and zoom controls for mermaid diagrams, positioned as an overlay.
 */
export function MermaidPanZoomControls(props: { panZoom: PanzoomObject }) {
    const { panZoom } = props;

    return (
        <div className="absolute right-3 bottom-3 z-10 grid grid-cols-3 gap-0.5">
            {/* Row 1: empty, pan up, zoom in */}
            <div />
            <Button
                label="Pan up"
                icon="chevron-up"
                variant="secondary"
                size="xsmall"
                iconOnly
                onClick={() => panZoom.pan(0, PAN_STEP, { relative: true })}
            />
            <Button
                label="Zoom in"
                icon="plus"
                variant="secondary"
                size="xsmall"
                iconOnly
                onClick={() => panZoom.zoomIn()}
            />
            {/* Row 2: pan left, reset, pan right */}
            <Button
                label="Pan left"
                icon="chevron-left"
                variant="secondary"
                size="xsmall"
                iconOnly
                onClick={() => panZoom.pan(PAN_STEP, 0, { relative: true })}
            />
            <Button
                label="Reset view"
                icon="refresh"
                variant="secondary"
                size="xsmall"
                iconOnly
                onClick={() => panZoom.reset()}
            />
            <Button
                label="Pan right"
                icon="chevron-right"
                variant="secondary"
                size="xsmall"
                iconOnly
                onClick={() => panZoom.pan(-PAN_STEP, 0, { relative: true })}
            />
            {/* Row 3: empty, pan down, zoom out */}
            <div />
            <Button
                label="Pan down"
                icon="chevron-down"
                variant="secondary"
                size="xsmall"
                iconOnly
                onClick={() => panZoom.pan(0, -PAN_STEP, { relative: true })}
            />
            <Button
                label="Zoom out"
                icon="minus"
                variant="secondary"
                size="xsmall"
                iconOnly
                onClick={() => panZoom.zoomOut()}
            />
        </div>
    );
}
