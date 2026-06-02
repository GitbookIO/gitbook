'use client';

import type { PanzoomObject } from '@panzoom/panzoom';

import { Button } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

/**
 * Zoom and fullscreen controls for mermaid diagrams, grouped into a single vertical
 * toolbar positioned in the bottom-right corner. Panning is done by dragging the diagram.
 */
export function MermaidPanZoomControls(props: {
    panZoom: PanzoomObject;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}) {
    const { panZoom, isFullscreen, onToggleFullscreen } = props;
    const btnProps = {
        variant: 'secondary' as const,
        size: 'xsmall' as const,
        iconOnly: true,
        className: tcls('p-1 [&_svg]:size-3.5 opacity-90'),
        // Non-interactive tooltips: the Tooltip primitive makes their popper wrapper
        // pointer-transparent so it can't steal the hover that reveals these controls.
        tooltipProps: {
            rootProps: { disableHoverableContent: true },
        },
    };

    return (
        <div
            className={tcls(
                'absolute right-2 bottom-2 z-10 flex flex-col items-center gap-0.5 rounded-lg transition-opacity duration-150 group-focus-within/mermaid:pointer-events-auto group-focus-within/mermaid:opacity-100 group-hover/mermaid:opacity-100 motion-reduce:transition-none',
                // Keep the controls always visible in fullscreen, otherwise only reveal on hover/focus.
                isFullscreen ? 'opacity-100' : 'opacity-0'
            )}
        >
            <Button {...btnProps} icon="plus" label="Zoom in" onClick={() => panZoom.zoomIn()} />
            <Button
                {...btnProps}
                icon="arrows-to-dot"
                label="Reset view"
                onClick={() => panZoom.reset()}
            />
            <Button {...btnProps} icon="minus" label="Zoom out" onClick={() => panZoom.zoomOut()} />

            <div className="my-0.5 h-px w-4 bg-tint-subtle" />

            <Button
                {...btnProps}
                icon={isFullscreen ? 'compress' : 'expand'}
                label={isFullscreen ? 'Exit full page' : 'View in full page'}
                onClick={onToggleFullscreen}
            />
        </div>
    );
}
