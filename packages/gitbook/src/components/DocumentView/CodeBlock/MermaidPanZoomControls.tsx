'use client';

import type { PanzoomObject } from '@panzoom/panzoom';

import { Button } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

const PAN_STEP = 50;

/**
 * Navigation and zoom controls for mermaid diagrams, grouped into a single floating
 * toolbar positioned in the bottom-right corner. The toolbar reads top-to-bottom as
 * three clusters: fullscreen, pan, then zoom.
 */
export function MermaidPanZoomControls(props: {
    panZoom: PanzoomObject;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}) {
    const { panZoom, isFullscreen, onToggleFullscreen } = props;
    const btnProps = {
        variant: 'blank' as const,
        size: 'xsmall' as const,
        iconOnly: true,
        className: 'p-1 [&_svg]:size-3.5',
        // Non-interactive tooltips: the Tooltip primitive makes their popper wrapper
        // pointer-transparent so it can't steal the hover that reveals these controls.
        tooltipProps: {
            rootProps: { disableHoverableContent: true },
        },
    };

    return (
        <div
            className={tcls(
                'absolute right-2 bottom-2 z-10 flex flex-col items-center gap-0.5 rounded-lg bg-tint-base/5 p-0.5 backdrop-blur-xs transition-opacity duration-150 hover:bg-tint-base/8 group-focus-within/mermaid:pointer-events-auto group-focus-within/mermaid:opacity-100 group-hover/mermaid:opacity-100 motion-reduce:transition-none',
                // Keep the controls always visible in fullscreen, otherwise only reveal on hover/focus.
                isFullscreen ? 'opacity-100' : 'opacity-0'
            )}
        >
            <Button
                {...btnProps}
                icon={isFullscreen ? 'compress' : 'expand'}
                label={isFullscreen ? 'Exit full page' : 'View in full page'}
                onClick={onToggleFullscreen}
            />

            <Divider />

            {/* Pan cluster: directional cross with reset in the center. */}
            <div className="grid grid-cols-3 gap-0.5">
                <div />
                <Button
                    {...btnProps}
                    icon="chevron-up"
                    label="Pan up"
                    onClick={() => panZoom.pan(0, PAN_STEP, { relative: true })}
                />
                <div />
                <Button
                    {...btnProps}
                    icon="chevron-left"
                    label="Pan left"
                    onClick={() => panZoom.pan(PAN_STEP, 0, { relative: true })}
                />
                <Button
                    {...btnProps}
                    icon="arrows-to-dot"
                    label="Reset view"
                    onClick={() => panZoom.reset()}
                />
                <Button
                    {...btnProps}
                    icon="chevron-right"
                    label="Pan right"
                    onClick={() => panZoom.pan(-PAN_STEP, 0, { relative: true })}
                />
                <div />
                <Button
                    {...btnProps}
                    icon="chevron-down"
                    label="Pan down"
                    onClick={() => panZoom.pan(0, -PAN_STEP, { relative: true })}
                />
                <div />
            </div>

            <Divider />

            {/* Zoom cluster. */}
            <div className="flex gap-0.5">
                <Button
                    {...btnProps}
                    icon="minus"
                    label="Zoom out"
                    onClick={() => panZoom.zoomOut()}
                />
                <Button
                    {...btnProps}
                    icon="plus"
                    label="Zoom in"
                    onClick={() => panZoom.zoomIn()}
                />
            </div>
        </div>
    );
}

function Divider() {
    return <div className="h-px w-full bg-tint-subtle" />;
}
