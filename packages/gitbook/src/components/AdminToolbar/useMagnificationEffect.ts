import { type MotionValue, motionValue } from 'framer-motion';
import React from 'react';

interface ButtonMotionValues {
    scale: MotionValue<number>;
    x: MotionValue<number>;
}

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

const defaultConfig: Required<MagnificationConfig> = {
    buttonSize: 32, // Standard button size for 32px (size-8) buttons
    maxScale: 1.25, // 25% scale increase - noticeable but not overwhelming
    influenceRadius: 80, // ~2.5 button widths of influence
    spacingMultiplier: 1.3, // Creates proportional spacing to scale increase
    scaleExponent: 2.5, // Exponential curve for dramatic close-range scaling
    padding: 10, // Small buffer zone around container edges
};

// Helper functions for cleaner code
const createMotionValues = (count: number): ButtonMotionValues[] =>
    Array.from({ length: count }, () => ({
        scale: motionValue(1),
        x: motionValue(0),
    }));

const resetMotionValues = (motionValues: ButtonMotionValues[]) => {
    motionValues.forEach(({ scale, x }) => {
        scale.set(1);
        x.set(0);
    });
};

const captureButtonPositions = (buttons: HTMLElement[]) => {
    // Reset transforms to get original positions
    buttons.forEach((button) => {
        button.style.transform = '';
    });
    return buttons.map((button) => {
        const rect = button.getBoundingClientRect();
        return {
            left: rect.left,
            width: rect.width,
            top: rect.top,
            height: rect.height,
        };
    });
};

const calculateScale = (
    mouseX: number,
    mouseY: number,
    buttonCenterX: number,
    buttonCenterY: number,
    containerRect: DOMRect,
    config: Required<MagnificationConfig>
) => {
    // Calculate 2D distance from mouse to button center
    const deltaX = mouseX - buttonCenterX;
    const deltaY = mouseY - buttonCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > config.influenceRadius) return 1;

    // Calculate distance from container edge
    const distanceFromEdgeX = Math.min(mouseX - containerRect.left, containerRect.right - mouseX);
    const distanceFromEdgeY = Math.min(mouseY - containerRect.top, containerRect.bottom - mouseY);
    const distanceFromEdge = Math.min(distanceFromEdgeX, distanceFromEdgeY);

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
    buttonEffects: Array<{ scale: number; translateX: number }>,
    positions: Array<{ left: number; width: number; top: number; height: number }>,
    config: Required<MagnificationConfig>
) => {
    const currentPos = positions[buttonIndex];
    if (!currentPos) return 0;

    const buttonCenterX = currentPos.left + currentPos.width / 2;
    let leftPush = 0;
    let rightPush = 0;

    buttonEffects.forEach((otherEffect, otherIndex) => {
        if (otherIndex === buttonIndex) return;

        const otherPos = positions[otherIndex];
        if (!otherPos) return;

        const otherCenterX = otherPos.left + otherPos.width / 2;
        const distanceBetween = Math.abs(buttonCenterX - otherCenterX);

        // Only apply influence if close enough
        if (distanceBetween < config.influenceRadius * 1.5) {
            const influenceStrength = Math.max(
                0,
                1 - distanceBetween / (config.influenceRadius * 1.5)
            );
            const extraSpace = (otherEffect.scale - 1) * config.buttonSize;
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

export function useMagnificationEffect(props: {
    childrenCount: number;
    containerRef: React.RefObject<HTMLElement>;
    config?: MagnificationConfig;
}) {
    const { childrenCount, containerRef, config } = props;
    const [buttonMotionValues, setButtonMotionValues] = React.useState<ButtonMotionValues[]>([]);
    const originalPositionsRef = React.useRef<
        Array<{ left: number; width: number; top: number; height: number }>
    >([]);

    const finalConfig = React.useMemo(() => ({ ...defaultConfig, ...config }), [config]);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const buttons = Array.from(container.querySelectorAll('.toolbar-button')) as HTMLElement[];

        if (buttons.length !== childrenCount) {
            console.error(
                `Button count (${buttons.length}) does not match children count (${childrenCount})`
            );
            return;
        }

        // Initialize motion values if button count changed
        if (buttonMotionValues.length !== buttons.length) {
            setButtonMotionValues(createMotionValues(buttons.length));
        }

        const handleMouseMove = (event: MouseEvent) => {
            const buttons = Array.from(
                container.querySelectorAll('.toolbar-button')
            ) as HTMLElement[];

            // Capture positions if needed
            if (originalPositionsRef.current.length !== buttons.length) {
                originalPositionsRef.current = captureButtonPositions(buttons);
            }

            const containerRect = container.getBoundingClientRect();
            const { clientX: mouseX, clientY: mouseY } = event;

            // Check if mouse is in range
            const isInRange =
                mouseX >= containerRect.left - finalConfig.padding &&
                mouseX <= containerRect.right + finalConfig.padding &&
                mouseY >= containerRect.top - finalConfig.padding &&
                mouseY <= containerRect.bottom + finalConfig.padding;

            if (!isInRange) {
                resetMotionValues(buttonMotionValues);
                return;
            }

            // Calculate scales for all buttons
            const buttonEffects = buttons.map((_, index) => {
                const pos = originalPositionsRef.current[index];
                if (!pos) return { scale: 1, translateX: 0 };

                const buttonCenterX = pos.left + pos.width / 2;
                const buttonCenterY = pos.top + pos.height / 2;
                const scale = calculateScale(
                    mouseX,
                    mouseY,
                    buttonCenterX,
                    buttonCenterY,
                    containerRect,
                    finalConfig
                );
                return { scale, translateX: 0 };
            });

            // Calculate spacing for all buttons
            buttonEffects.forEach((effect, index) => {
                effect.translateX = calculateSpacing(
                    index,
                    buttonEffects,
                    originalPositionsRef.current,
                    finalConfig
                );
            });

            // Update motion values
            buttonEffects.forEach((effect, index) => {
                const motionValue = buttonMotionValues[index];
                if (motionValue) {
                    motionValue.scale.set(effect.scale);
                    motionValue.x.set(effect.translateX);
                }
            });
        };

        const handleMouseLeave = () => resetMotionValues(buttonMotionValues);

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [finalConfig, containerRef, buttonMotionValues, childrenCount]);

    return { buttonMotionValues };
}
