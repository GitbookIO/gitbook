'use client';
import {
    AnimatePresence,
    type MotionValue,
    motion,
    useReducedMotion,
    useSpring,
} from 'motion/react';
import React, { isValidElement } from 'react';
import { AnimatedLogo } from './AnimatedLogo';
import { useToolbarControls } from './ToolbarControlsContext';
import { ToolbarVisibilityHint } from './ToolbarVisibilityHint';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { Tooltip } from '../primitives';
import { getCopyVariants, toolbarEasings } from './transitions';
import { useMagnificationEffect } from './useMagnificationEffect';

const DURATION_LOGO_APPEARANCE = 2000;
const DELAY_BETWEEN_LOGO_AND_CONTENT = 100;

const PILL_STYLE = {
    '--toolbar-bg': '#1f1d1b',
    borderRadius: '100px', // Set on `style` so Framer Motion can correct for distortions
    zIndex: 1, // Ensure pill stacks above the peek label sibling
} as React.CSSProperties;

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

    const shouldAutoExpand = Boolean(controls?.shouldAutoExpand);
    const [shouldAnimateLogo, setShouldAnimateLogo] = React.useState(shouldAutoExpand);

    // Track when the pill's layout animation finishes so the hint label
    // only appears once the toolbar is fully expanded.
    const [showHint, setShowHint] = React.useState(!minified);

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
            // “settled” state once the toolbar is open.
            setShouldAnimateLogo(false);
        } else {
            // Hide the hint immediately when minimizing — it will reappear
            // once the next expand animation completes.
            setShowHint(false);
        }
    }, [minified]);

    // Don't render anything until page is ready
    if (!isReady) {
        return null;
    }

    return (
        <motion.div className="-translate-x-1/2 fixed bottom-5 left-1/2 z-40 w-auto max-w-xl transform px-4">
            <ToolbarVisibilityHint show={showHint} />

            <AnimatePresence mode="wait">
                <motion.div
                    onClick={() => {
                        if (minified) {
                            setShouldAnimateLogo(false);
                            onMinifiedChange(false);
                        }
                    }}
                    layout
                    onLayoutAnimationComplete={() => {
                        if (!minified) {
                            setShowHint(true);
                        }
                    }}
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
                    style={PILL_STYLE}
                >
                    {/* Logo — double-click to minimize */}
                    <motion.div
                        layout
                        onDoubleClick={(e) => {
                            if (minified) return;
                            e.stopPropagation();
                            window.getSelection()?.removeAllRanges();
                            onMinifiedChange(true);
                        }}
                    >
                        <AnimatedLogo shouldAnimate={shouldAnimateLogo} />
                    </motion.div>

                    {!minified ? children : null}
                </motion.div>
            </AnimatePresence>
        </motion.div>
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
            {title ? <Tooltip label={title}>{anchor}</Tooltip> : anchor}
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
