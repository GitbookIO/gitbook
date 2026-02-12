'use client';
import {
    AnimatePresence,
    type MotionValue,
    animate,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
} from 'motion/react';
import React, { isValidElement } from 'react';
import { AnimatedLogo } from './AnimatedLogo';
import { useToolbarControls } from './ToolbarControlsContext';
import {
    getStoredPosition,
    getVisibilityHintDismissed,
    setStoredPosition,
    setVisibilityHintDismissed,
} from './utils';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { Tooltip } from '../primitives';
// import styles from './Toolbar.module.css';
import { getCopyVariants, toolbarEasings } from './transitions';
import { useMagnificationEffect } from './useMagnificationEffect';

const DEBUG = true;

const DURATION_LOGO_APPEARANCE = 2000;
const DELAY_BETWEEN_LOGO_AND_CONTENT = 100;

const ToolbarDraggingContext = React.createContext(false);

interface ToolbarProps {
    children: React.ReactNode;
    minified: boolean;
    onMinifiedChange: (value: boolean) => void;
}

export function Toolbar(props: ToolbarProps) {
    const { children, minified, onMinifiedChange } = props;
    const controls = useToolbarControls();
    const [isReady, setIsReady] = React.useState(false);
    const autoExpandTriggeredRef = React.useRef(false);
    const constraintsRef = React.useRef<HTMLDivElement>(null);
    const innerRef = React.useRef<HTMLDivElement>(null);
    const isDraggingRef = React.useRef(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const prevWidthRef = React.useRef<number | undefined>(undefined);
    const [hintDismissed, setHintDismissed] = React.useState(() =>
        typeof window !== 'undefined' ? getVisibilityHintDismissed() : false
    );

    const shouldAutoExpand = Boolean(controls?.shouldAutoExpand);
    const [shouldAnimateLogo, setShouldAnimateLogo] = React.useState(shouldAutoExpand);

    // Restore saved drag position (synchronous read — no flash)
    const storedPos = React.useMemo(
        () => (typeof window !== 'undefined' ? getStoredPosition() : null),
        []
    );
    const x = useMotionValue(storedPos?.x ?? 0);
    const y = useMotionValue(storedPos?.y ?? 0);

    const savePosition = React.useCallback(() => {
        setStoredPosition({ x: x.get(), y: y.get() });
    }, [x, y]);

    // Wait for page to be ready, then show the toolbar
    React.useEffect(() => {
        const handleLoad = () => {
            setIsReady(true);
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, []);

    // After toolbar appears, wait, then show the full content
    React.useEffect(() => {
        if (!isReady || autoExpandTriggeredRef.current) {
            return;
        }

        if (!shouldAutoExpand) {
            // When we already know the toolbar should stay expanded (e.g. the user previously
            // opened it this session) we short-circuit the auto-expand animation and immediately
            // render the expanded state without replaying the logo animation.
            autoExpandTriggeredRef.current = true;
            setShouldAnimateLogo(false);
            return;
        }

        autoExpandTriggeredRef.current = true;

        // On a fresh session we let the toolbar appear in its compact form, play the logo
        // animation, and only then expand the toolbar. The timeout mirrors the duration of the
        // logo animation so both transitions feel connected.
        const expandAfterTimeout = setTimeout(() => {
            setShouldAnimateLogo(false);
            onMinifiedChange(false);
        }, DURATION_LOGO_APPEARANCE + DELAY_BETWEEN_LOGO_AND_CONTENT);

        return () => clearTimeout(expandAfterTimeout);
    }, [isReady, onMinifiedChange, shouldAutoExpand]);

    React.useEffect(() => {
        if (!minified) {
            // Any manual expansion should stop the logo animation so the icon stays in its
            // "settled" state once the toolbar is open.
            setShouldAnimateLogo(false);
        }
    }, [minified]);

    // Detect pinning state based on actual viewport position
    const debugRef = React.useRef<HTMLDivElement>(null);
    const debugLeftEdgeRef = React.useRef<HTMLDivElement>(null);
    const debugRightEdgeRef = React.useRef<HTMLDivElement>(null);
    const debugArrowRef = React.useRef<HTMLDivElement>(null);
    const lastDecisionRef = React.useRef<'left' | 'right' | 'center'>('center');

    const computePinState = React.useCallback(
        (overrideWidth?: number) => {
            if (!innerRef.current) return 'center' as const;
            const rect = innerRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const edgeThreshold = 80; // px from viewport edge

            // When overrideWidth is provided (e.g. prevWidth), reconstruct where the
            // edges WERE before the resize. The center stays the same because x hasn't
            // been compensated yet and flexbox centering is width-independent.
            let left = rect.left;
            let right = rect.right;
            if (overrideWidth !== undefined) {
                const center = (rect.left + rect.right) / 2;
                left = center - overrideWidth / 2;
                right = center + overrideWidth / 2;
            }

            const pin =
                right > viewportWidth - edgeThreshold
                    ? ('right' as const)
                    : left < edgeThreshold
                      ? ('left' as const)
                      : ('center' as const);

            // Update debug overlays directly via DOM to avoid React re-render lag
            if (DEBUG) {
                // Text overlay
                if (debugRef.current) {
                    const el = debugRef.current;
                    el.textContent = '';
                    const decisionColor = lastDecisionRef.current === 'center' ? '#facc15' : '#4ade80';
                    const liveColor = pin === 'center' ? '#facc15' : '#4ade80';
                    const preInfo =
                        overrideWidth !== undefined
                            ? ` | pre: L${Math.round(left)} R${Math.round(right)}`
                            : '';
                    el.innerHTML = `decision: <span style="color:${decisionColor}">${lastDecisionRef.current}</span> | live: <span style="color:${liveColor}">${pin}</span> | x: ${Math.round(x.get())} y: ${Math.round(y.get())} | rect: L${Math.round(rect.left)} R${Math.round(rect.right)} (vw: ${viewportWidth})${preInfo}`;
                }

                // Edge anchor indicators on the toolbar pill (track live state)
                if (debugLeftEdgeRef.current) {
                    debugLeftEdgeRef.current.style.backgroundColor =
                        pin === 'left' ? '#4ade80' : '#ffffff20';
                    debugLeftEdgeRef.current.style.boxShadow =
                        pin === 'left' ? '0 0 8px #4ade80' : 'none';
                }
                if (debugRightEdgeRef.current) {
                    debugRightEdgeRef.current.style.backgroundColor =
                        pin === 'right' ? '#4ade80' : '#ffffff20';
                    debugRightEdgeRef.current.style.boxShadow =
                        pin === 'right' ? '0 0 8px #4ade80' : 'none';
                }

                // Arrow showing expansion direction (tracks live state so it
                // updates as you drag, showing what WOULD happen on click)
                if (debugArrowRef.current) {
                    debugArrowRef.current.textContent =
                        pin === 'left'
                            ? '→'
                            : pin === 'right'
                              ? '←'
                              : '↔';
                    debugArrowRef.current.style.color =
                        pin === 'center' ? '#facc15' : '#4ade80';
                }
            }

            return pin;
        },
        [x, y]
    );

    // Update debug display reactively when x/y change (direct DOM updates, no re-renders)
    React.useEffect(() => {
        if (!DEBUG) return;
        const unsubX = x.on('change', () => computePinState());
        const unsubY = y.on('change', () => computePinState());
        // Initial computation
        computePinState();
        return () => {
            unsubX();
            unsubY();
        };
    }, [x, y, computePinState]);

    // Compensate drag x position when the toolbar width changes (expand/collapse) so the
    // pinned edge stays anchored. Uses viewport-aware edge detection instead of a fixed
    // x-threshold so it works correctly at any viewport width.
    React.useLayoutEffect(() => {
        if (!innerRef.current) return;

        const newWidth = innerRef.current.offsetWidth;
        const prevWidth = prevWidthRef.current;

        if (prevWidth !== undefined && prevWidth !== newWidth) {
            const delta = newWidth - prevWidth;
            const currentX = x.get();
            const currentY = y.get();
            const expanding = newWidth > prevWidth;

            // Grab the raw post-resize rect for logging
            const rawRect = innerRef.current.getBoundingClientRect();
            const center = (rawRect.left + rawRect.right) / 2;
            const preResizeLeft = center - prevWidth / 2;
            const preResizeRight = center + prevWidth / 2;
            const viewportWidth = window.innerWidth;
            const edgeThreshold = 80;

            // Use prevWidth to reconstruct where the edges WERE before the resize.
            const pin = computePinState(prevWidth);
            lastDecisionRef.current = pin;
            // Refresh debug overlay so "decision" label updates immediately
            computePinState(prevWidth);

            let compensation = 0;
            if (pin === 'right') {
                compensation = -delta / 2;
            } else if (pin === 'left') {
                compensation = delta / 2;
            }

            // eslint-disable-next-line no-console -- temporary debug logging
            console.warn(
                `[Toolbar Pin] ${expanding ? 'EXPAND' : 'COLLAPSE'}\n` +
                    `  Action: ${expanding ? 'minified → expanded' : 'expanded → minified'}\n` +
                    `  Width: ${prevWidth}px → ${newWidth}px (delta: ${delta}px)\n` +
                    `  Motion: x=${Math.round(currentX)}, y=${Math.round(currentY)}\n` +
                    `  Viewport: ${viewportWidth}px, edgeThreshold: ${edgeThreshold}px\n` +
                    `  Post-resize rect (raw): L=${Math.round(rawRect.left)} R=${Math.round(rawRect.right)}\n` +
                    `  Pre-resize rect (reconstructed): L=${Math.round(preResizeLeft)} R=${Math.round(preResizeRight)}\n` +
                    `  Center: ${Math.round(center)}\n` +
                    `  Pin check: left=${Math.round(preResizeLeft)} < ${edgeThreshold}? ${preResizeLeft < edgeThreshold} | right=${Math.round(preResizeRight)} > ${viewportWidth - edgeThreshold}? ${preResizeRight > viewportWidth - edgeThreshold}\n` +
                    `  → Decision: ${pin}\n` +
                    `  → Compensation: ${compensation}px (x: ${Math.round(currentX)} → ${Math.round(currentX + compensation)})`
            );

            if (compensation !== 0) {
                animate(x, currentX + compensation, {
                    type: 'spring',
                    stiffness: 200,
                    damping: 30,
                    mass: 1,
                }).then(savePosition);
            }
        }

        prevWidthRef.current = newWidth;
    }, [minified, x, savePosition, computePinState]);

    // Don't render anything until page is ready
    if (!isReady) {
        return null;
    }

    return (
        <ToolbarDraggingContext.Provider value={isDragging}>
            {/* Hidden SVG filter for glass distortion */}
            <svg aria-hidden="true" className="pointer-events-none fixed size-0">
                <defs>
                    <filter id="glass-distortion">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.016 0.012"
                            numOctaves={3}
                            seed={39}
                            result="noise"
                        />
                        <feGaussianBlur in="noise" stdDeviation={6} result="softNoise" />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="softNoise"
                            scale={160}
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>
            <div
                ref={constraintsRef}
                className="pointer-events-none fixed inset-2 z-40 flex items-end justify-center"
            >
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragElastic={0.04}
                    dragTransition={{
                        power: 0.2,
                        timeConstant: 200,
                        bounceStiffness: 800,
                        bounceDamping: 60,
                    }}
                    style={{ x, y }}
                    onDragStart={() => {
                        isDraggingRef.current = true;
                        setIsDragging(true);
                    }}
                    onDragEnd={() => {
                        setIsDragging(false);
                        requestAnimationFrame(() => {
                            isDraggingRef.current = false;
                        });
                    }}
                    onDragTransitionEnd={savePosition}
                    className="pointer-events-auto relative w-auto max-w-xl cursor-grab active:cursor-grabbing"
                >
                    {/* Visibility peek label — rendered as a sibling before the pill so it paints behind it */}
                    {!hintDismissed && (
                        <motion.div
                            initial={false}
                            animate={{
                                y: !minified && !isDragging ? 0 : 10,
                                opacity: !minified && !isDragging ? 1 : 0,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                            }}
                            className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 flex items-center gap-1.5 rounded-t-xl border border-[#eaeaea] border-b-0 border-solid bg-white px-3"
                            style={{ paddingBlock: '2px' }}
                        >
                            <span className="whitespace-nowrap text-[11px] text-neutral-9">
                                Only visible to your GitBook organization
                            </span>
                            <button
                                type="button"
                                className="pointer-events-auto cursor-pointer rounded border border-tint-5 bg-tint-2 px-1 py-px text-[10px] text-tint-12 transition-colors hover:scale-102 hover:bg-tint-3 dark:border-tint-11/50 dark:bg-white dark:text-tint-1 dark:hover:bg-tint-11/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setVisibilityHintDismissed();
                                    setHintDismissed(true);
                                }}
                            >
                                Dismiss
                            </button>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            ref={innerRef}
                            onClick={() => {
                                if (isDraggingRef.current) return;
                                if (minified) {
                                    setShouldAnimateLogo(false);
                                    onMinifiedChange(false);
                                }
                            }}
                            layout
                            transition={toolbarEasings.spring}
                            className={tcls(
                                minified ? 'cursor-pointer' : 'pr-2 pl-3.5',
                                'relative',
                                'flex',
                                'items-center',
                                'justify-center',
                                'min-h-11',
                                'min-w-12',
                                'h-12',
                                'py-2',
                                'origin-center',
                                'border-[0.5px] border-neutral-5 border-solid dark:border-neutral-8',
                                'bg-[var(--toolbar-bg)]'
                            )}
                            style={
                                {
                                    '--toolbar-bg': '#1f1d1b',
                                    borderRadius: '100px', // This is set on `style` so Framer Motion can correct for distortions
                                    zIndex: 1, // Ensure pill stacks above the peek label sibling
                                } as React.CSSProperties
                            }
                        >
                            {/* Glass effect layer (disabled for now) */}
                            {/* <div className={styles.glassLayer} /> */}

                            {/* Debug: anchor edge indicators */}
                            {DEBUG && (
                                <>
                                    <div
                                        ref={debugLeftEdgeRef}
                                        style={{
                                            position: 'absolute',
                                            left: -1,
                                            top: '15%',
                                            bottom: '15%',
                                            width: 3,
                                            borderRadius: 2,
                                            backgroundColor: '#ffffff20',
                                            transition: 'background-color 0.2s, box-shadow 0.2s',
                                            zIndex: 10,
                                        }}
                                    />
                                    <div
                                        ref={debugRightEdgeRef}
                                        style={{
                                            position: 'absolute',
                                            right: -1,
                                            top: '15%',
                                            bottom: '15%',
                                            width: 3,
                                            borderRadius: 2,
                                            backgroundColor: '#ffffff20',
                                            transition: 'background-color 0.2s, box-shadow 0.2s',
                                            zIndex: 10,
                                        }}
                                    />
                                    <div
                                        ref={debugArrowRef}
                                        style={{
                                            position: 'absolute',
                                            top: -20,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: 16,
                                            fontWeight: 'bold',
                                            pointerEvents: 'none',
                                            zIndex: 10,
                                        }}
                                    />
                                </>
                            )}

                            {/* Logo — double-click to minimize without opening the arc menu */}
                            <motion.div
                                layout
                                onDoubleClick={(e) => {
                                    if (isDraggingRef.current || minified) return;
                                    e.stopPropagation();
                                    onMinifiedChange(true);
                                }}
                            >
                                <AnimatedLogo shouldAnimate={shouldAnimateLogo} />
                            </motion.div>

                            {!minified ? children : null}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Debug overlay for pinning state — updated via DOM ref to avoid re-render lag */}
                {DEBUG && (
                    <>
                        <div
                            ref={debugRef}
                            className="pointer-events-none whitespace-nowrap rounded bg-black/80 px-2 py-1 font-mono text-[10px] text-white"
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 9999,
                            }}
                        />
                        {/* Viewport edge threshold zones */}
                        <div
                            style={{
                                position: 'fixed',
                                left: 0,
                                top: 0,
                                width: 80,
                                height: '100vh',
                                backgroundColor: 'rgba(74, 222, 128, 0.06)',
                                borderRight: '1px dashed rgba(74, 222, 128, 0.3)',
                                pointerEvents: 'none',
                                zIndex: 39,
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    bottom: 80,
                                    right: 4,
                                    fontSize: 9,
                                    color: 'rgba(74, 222, 128, 0.5)',
                                    writingMode: 'vertical-rl',
                                    fontFamily: 'monospace',
                                }}
                            >
                                pin-left zone (80px)
                            </span>
                        </div>
                        <div
                            style={{
                                position: 'fixed',
                                right: 0,
                                top: 0,
                                width: 80,
                                height: '100vh',
                                backgroundColor: 'rgba(74, 222, 128, 0.06)',
                                borderLeft: '1px dashed rgba(74, 222, 128, 0.3)',
                                pointerEvents: 'none',
                                zIndex: 39,
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    bottom: 80,
                                    left: 4,
                                    fontSize: 9,
                                    color: 'rgba(74, 222, 128, 0.5)',
                                    writingMode: 'vertical-rl',
                                    fontFamily: 'monospace',
                                }}
                            >
                                pin-right zone (80px)
                            </span>
                        </div>
                    </>
                )}
            </div>
        </ToolbarDraggingContext.Provider>
    );
}

export function ToolbarBody(props: { children: React.ReactNode }) {
    return <div className="flex flex-col items-start px-3">{props.children}</div>;
}

export function ToolbarButtonGroup(props: { children: React.ReactNode }) {
    const { children } = props;
    const containerRef = React.useRef<HTMLDivElement>(null);

    const buttonChildren = React.Children.toArray(children).filter((child) => !!child);
    const { buttonMotionValues } = useMagnificationEffect({
        childrenCount: buttonChildren.length,
        containerRef,
    });

    return (
        <motion.div
            ref={containerRef}
            variants={toolbarEasings.parent}
            initial="hidden"
            animate="show"
            className="flex items-center gap-1 overflow-visible pr-2 pl-4"
        >
            {buttonChildren.map((child, index) => {
                const childEl = child as React.ReactElement;
                const childKey = childEl.key ?? `toolbar-button-${index}`;
                return (
                    <ToolbarButtonWrapper
                        key={childKey}
                        child={childEl}
                        rawMotionValues={buttonMotionValues[index]}
                    />
                );
            })}
        </motion.div>
    );
}

export interface ToolbarButtonProps extends Omit<React.HTMLProps<HTMLAnchorElement>, 'title'> {
    motionValues?: {
        scale: MotionValue<number>;
        x: MotionValue<number>;
    };
    icon: IconName;
    iconClassName?: string;
    title?: React.ReactNode;
    children?: React.ReactNode;
}

export const ToolbarButton = React.forwardRef<HTMLDivElement, ToolbarButtonProps>((props, ref) => {
    const {
        title,
        disabled,
        motionValues,
        className,
        style,
        href,
        onClick,
        icon,
        iconClassName,
        children,
    } = props;
    const reduceMotion = useReducedMotion();
    const isDragging = React.useContext(ToolbarDraggingContext);

    const anchor = (
        <motion.a
            href={href}
            onClick={onClick}
            target="_blank"
            rel="noopener noreferrer"
            style={
                reduceMotion
                    ? undefined
                    : {
                          scale: motionValues?.scale,
                          x: motionValues?.x,
                          transformOrigin: 'bottom center',
                          zIndex: motionValues?.scale ? 10 : 'auto',
                          ...style,
                      }
            }
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
            }}
            className={tcls(
                'toolbar-button',
                className,
                'relative flex size-8 cursor-pointer items-center justify-center gap-1 truncate rounded-full text-sm transition-colors',
                'text-tint-7 hover:text-tint-1',
                'dark:text-tint-12',
                disabled ? 'cursor-not-allowed opacity-50' : '',
                'bg-[var(--toolbar-bg)]',
                'hover:bg-[color-mix(in_srgb,var(--toolbar-bg)_90%,white)]'
            )}
        >
            <Icon
                icon={icon}
                iconStyle={IconStyle.Solid}
                className={tcls('size-3.5 shrink-0 group-hover:scale-110', iconClassName)}
            />
        </motion.a>
    );

    return (
        <motion.div variants={toolbarEasings.staggeringChild} className="relative" ref={ref}>
            {children ? children : null}
            {title && !isDragging ? <Tooltip label={title}>{anchor}</Tooltip> : anchor}
        </motion.div>
    );
});

ToolbarButton.displayName = 'ToolbarButton';

function ToolbarButtonWrapper(props: {
    child: React.ReactElement;
    rawMotionValues?: { scale: MotionValue<number>; x: MotionValue<number> };
}) {
    const { child, rawMotionValues } = props;

    // Convert the raw motion values to smooth spring easings
    const springScale = useSpring(rawMotionValues?.scale.get() ?? 1, {
        stiffness: 400,
        damping: 30,
    });
    const springX = useSpring(rawMotionValues?.x.get() ?? 0, { stiffness: 400, damping: 30 });

    // Sync springs with raw motion values
    React.useEffect(() => {
        if (!rawMotionValues) return;

        const unsubScale = rawMotionValues.scale.on('change', (v) => springScale.set(v));
        const unsubX = rawMotionValues.x.on('change', (v) => springX.set(v));

        return () => {
            unsubScale();
            unsubX();
        };
    }, [rawMotionValues, springScale, springX]);

    const motionValues = {
        scale: springScale,
        x: springX,
    };

    if (!isValidElement<{ motionValues: typeof motionValues }>(child)) {
        return null;
    }

    return React.cloneElement(child, {
        motionValues,
    });
}

export function ToolbarSeparator() {
    return <div className="h-5 w-px bg-tint-1/3" />;
}

export function ToolbarTitle(props: { prefix?: string; suffix: string }) {
    return (
        <div className="flex items-center gap-1 text-xs ">
            {props.prefix ? <ToolbarTitlePrefix title={props.prefix} /> : null}
            <ToolbarTitleSuffix title={props.suffix} />
        </div>
    );
}

function ToolbarTitlePrefix(props: { title: string }) {
    return (
        <motion.span
            {...getCopyVariants(0)}
            className="truncate font-medium text-neutral-1 dark:text-neutral-12"
        >
            {props.title}
        </motion.span>
    );
}

function ToolbarTitleSuffix(props: { title: string }) {
    return (
        <motion.span
            {...getCopyVariants(1)}
            className="max-w-[20ch] truncate text-neutral-1 dark:text-neutral-12"
        >
            {props.title}
        </motion.span>
    );
}

export function ToolbarSubtitle(props: { subtitle: React.ReactNode }) {
    return (
        <motion.span
            {...getCopyVariants(1)}
            className="inline-flex items-center gap-1 text-neutral-1/80 text-xxs dark:text-neutral-12/80"
        >
            {props.subtitle}
        </motion.span>
    );
}
