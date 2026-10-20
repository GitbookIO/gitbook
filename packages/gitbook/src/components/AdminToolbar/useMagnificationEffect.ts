import { type MotionValue, motionValue, useReducedMotion } from 'motion/react';
import React from 'react';

interface MagnificationConfig {
    /** Size of each button in pixels - used for spacing calculations */
    buttonSize?: number;
    /** Maximum scale factor for buttons when mouse is directly over them */
    maxScale?: number;
    /** Distance in pixels from mouse where buttons start scaling */
    influenceRadius?: number;
    /** Multiplier for spacing between buttons - higher values create more space */
    spacingMultiplier?: number;
    /** Controls scaling curve - higher values make scaling more dramatic near mouse */
    scaleExponent?: number;
    /** Padding around container for mouse detection in pixels */
    padding?: number;
}

export const BUTTON_SIZE = 32;
export const MAX_SCALE = 1.25;
/** Tooltip gap above a slot, with room for the button fully magnified (it grows from the bottom). */
export const TOOLTIP_OFFSET = 4 + BUTTON_SIZE * (MAX_SCALE - 1);

const defaultConfig: Required<MagnificationConfig> = {
    buttonSize: BUTTON_SIZE, // Standard button size for 32px (size-8) buttons
    maxScale: MAX_SCALE, // 25% scale increase - noticeable but not overwhelming
    influenceRadius: 80, // ~2.5 button widths of influence
    spacingMultiplier: 1.3, // Creates proportional spacing to scale increase
    scaleExponent: 2.5, // Exponential curve for dramatic close-range scaling
    padding: 10, // Small buffer zone around container edges
};

type SlotMotionValues = { scale: MotionValue<number>; x: MotionValue<number> };

const resetMotionValues = (motionValues: SlotMotionValues[]) => {
    motionValues.forEach(({ scale, x }) => {
        scale.set(1);
        x.set(0);
    });
};

const calculateScale = (
    mouseX: number,
    buttonCenterX: number,
    containerRect: DOMRect,
    config: Required<MagnificationConfig>
) => {
    // Calculate only X-axis distance from mouse to button center
    const distance = Math.abs(mouseX - buttonCenterX);

    if (distance > config.influenceRadius) return 1;

    // Calculate distance from container edge (X-axis only)
    const distanceFromEdge = Math.min(mouseX - containerRect.left, containerRect.right - mouseX);

    // Define the "heart" zone - 8px from center (16x16px total area)
    const heartZoneRadius = 8;

    let baseScale: number;

    if (distance <= heartZoneRadius) {
        // Within the heart zone - always at max scale
        baseScale = config.maxScale;
    } else {
        // Outside heart zone - scale from max to 1 based on distance
        const outerRadius = config.influenceRadius - heartZoneRadius;
        const outerDistance = distance - heartZoneRadius;
        const progress = Math.min(outerDistance / outerRadius, 1);
        const exponentialProgress = (1 - progress) ** config.scaleExponent;
        baseScale = 1 + (config.maxScale - 1) * exponentialProgress;
    }

    // Only apply entry transition if we're very close to the edge (within 10px)
    // This prevents the entry logic from interfering with normal scaling
    if (distanceFromEdge < 10) {
        const entryProgress = distanceFromEdge / 10;
        return 1 + (baseScale - 1) * entryProgress;
    }

    return baseScale;
};

const calculateSpacing = (
    buttonIndex: number,
    scales: number[],
    centers: (number | null)[],
    config: Required<MagnificationConfig>
) => {
    const buttonCenterX = centers[buttonIndex];
    if (buttonCenterX == null) return 0;

    let leftPush = 0;
    let rightPush = 0;

    scales.forEach((otherScale, otherIndex) => {
        const otherCenterX = centers[otherIndex];
        if (otherIndex === buttonIndex || otherCenterX == null) return;

        const distanceBetween = Math.abs(buttonCenterX - otherCenterX);

        // Only apply influence if close enough
        if (distanceBetween < config.influenceRadius * 1.5) {
            const influenceStrength = Math.max(
                0,
                1 - distanceBetween / (config.influenceRadius * 1.5)
            );
            const extraSpace = (otherScale - 1) * config.buttonSize;
            const pushAmount = (extraSpace / 2) * config.spacingMultiplier * influenceStrength;

            if (otherCenterX < buttonCenterX) {
                rightPush += pushAmount;
            } else {
                leftPush += pushAmount;
            }
        }
    });

    return rightPush - leftPush;
};

/**
 * Dock-like magnification of the slots (direct children) of `containerRef`. Returns raw motion
 * values per slot index, meant to be smoothed with springs by the slots.
 */
export function useMagnificationEffect(props: {
    slotCount: number;
    containerRef: React.RefObject<HTMLElement | null>;
    config?: MagnificationConfig;
}) {
    const { slotCount, containerRef, config } = props;
    const reduceMotion = useReducedMotion();
    const finalConfig = React.useMemo(() => ({ ...defaultConfig, ...config }), [config]);

    // Stable across renders, grown as slots are added, so existing springs keep their source.
    const motionValuesRef = React.useRef<SlotMotionValues[]>([]);
    while (motionValuesRef.current.length < slotCount) {
        motionValuesRef.current.push({ scale: motionValue(1), x: motionValue(0) });
    }
    const motionValues = motionValuesRef.current;

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container || reduceMotion) {
            resetMotionValues(motionValues);
            return;
        }

        let frame = 0;
        let pointer = { x: 0, y: 0 };

        // Measured every frame from layout positions (`offsetLeft`), which the slots' transforms
        // don't affect, so nothing goes stale when the toolbar resizes, re-centers or animates in.
        const update = () => {
            frame = 0;
            const rect = container.getBoundingClientRect();
            const inRange =
                pointer.x >= rect.left - finalConfig.padding &&
                pointer.x <= rect.right + finalConfig.padding &&
                pointer.y >= rect.top - finalConfig.padding &&
                pointer.y <= rect.bottom + finalConfig.padding;
            if (!inRange) {
                resetMotionValues(motionValues);
                return;
            }

            const slots = Array.from(container.children) as HTMLElement[];
            // Empty or hidden slots take no space and don't magnify.
            const centers = slots.map((slot) =>
                slot.offsetWidth > 0 ? rect.left + slot.offsetLeft + slot.offsetWidth / 2 : null
            );
            const scales = centers.map((center) =>
                center == null ? 1 : calculateScale(pointer.x, center, rect, finalConfig)
            );
            motionValues.forEach((values, index) => {
                values.scale.set(scales[index] ?? 1);
                values.x.set(calculateSpacing(index, scales, centers, finalConfig));
            });
        };

        const onPointerMove = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') {
                return;
            }
            pointer = { x: event.clientX, y: event.clientY };
            if (!frame) {
                frame = requestAnimationFrame(update);
            }
        };
        const onPointerLeave = () => {
            cancelAnimationFrame(frame);
            frame = 0;
            resetMotionValues(motionValues);
        };

        container.addEventListener('pointermove', onPointerMove);
        container.addEventListener('pointerleave', onPointerLeave);
        return () => {
            cancelAnimationFrame(frame);
            container.removeEventListener('pointermove', onPointerMove);
            container.removeEventListener('pointerleave', onPointerLeave);
        };
    }, [containerRef, finalConfig, motionValues, reduceMotion]);

    return { motionValues };
}
