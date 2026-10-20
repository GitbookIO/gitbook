'use client';
import { type MotionValue, motion, useReducedMotion, useSpring } from 'motion/react';
import React from 'react';

import { Icon, type IconName, IconStyle } from '@gitbook/icons';

import { Tooltip } from '../primitives';
import { AnimatedLogo } from './AnimatedLogo';
import { useToolbarControls } from './ToolbarControlsContext';
import { ToolbarVisibilityHint } from './ToolbarVisibilityHint';
import { getCopyVariants, toolbarEasings } from './transitions';
import { TOOLTIP_OFFSET, useMagnificationEffect } from './useMagnificationEffect';
import { tcls } from '@/lib/tailwind';

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
        <motion.div
            data-testid="admin-toolbar"
            // Centered with `inset-x-0 mx-auto`: at `left-1/2` it could only grow to half the viewport,
            // which pushed the logo out of the pill.
            className="fixed inset-x-0 bottom-5 z-40 mx-auto w-fit max-w-xl px-4"
        >
            <ToolbarVisibilityHint show={showHint} />

            <motion.div
                onClick={() => {
                    if (minified) {
                        setShouldAnimateLogo(false);
                        onMinifiedChange(false);
                    }
                }}
                // Only minifying and expanding animate: content width changes (e.g. the date
                // format) would otherwise run a bouncy scale animation that stretches the content.
                layout
                layoutDependency={minified}
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
                    layoutDependency={minified}
                    onDoubleClick={(e) => {
                        if (minified) return;
                        e.stopPropagation();
                        window.getSelection()?.removeAllRanges();
                        onMinifiedChange(true);
                    }}
                >
                    <AnimatedLogo shouldAnimate={shouldAnimateLogo} />
                </motion.div>

                {/* A layout child, so it's counter-scaled while the pill expands. */}
                {!minified ? (
                    <motion.div
                        layout
                        layoutDependency={minified}
                        className="flex min-w-0 items-center"
                    >
                        {children}
                    </motion.div>
                ) : null}
            </motion.div>
        </motion.div>
    );
}

export function ToolbarBody(props: { children: React.ReactNode }) {
    // Shrinks so a long title truncates, but keeps room for the longest date format.
    return <div className="flex min-w-40 flex-col items-start px-3">{props.children}</div>;
}

const MAGNIFICATION_SPRING = { stiffness: 400, damping: 30 };

/** A button's magnification, and the unscaled box to place its tooltip against. */
type ToolbarSlot = {
    scale: MotionValue<number>;
    x: MotionValue<number>;
    anchorRef: React.RefObject<HTMLDivElement | null>;
};

const ToolbarSlotContext = React.createContext<ToolbarSlot | null>(null);

/** The magnification of the toolbar button group slot this is rendered in, if any. */
export function useToolbarSlot() {
    return React.useContext(ToolbarSlotContext);
}

export function ToolbarButtonGroup(props: { children: React.ReactNode }) {
    const { children } = props;
    const containerRef = React.useRef<HTMLDivElement>(null);

    const buttonChildren = React.Children.toArray(children).filter((child) => !!child);
    const { motionValues } = useMagnificationEffect({
        slotCount: buttonChildren.length,
        containerRef,
    });

    return (
        <motion.div
            ref={containerRef}
            variants={toolbarEasings.parent}
            initial="hidden"
            animate="show"
            // `relative`: the magnification measures slots by their `offsetLeft` in here.
            className="relative flex items-center gap-1 overflow-visible pl-4 pr-2"
        >
            {buttonChildren.map((child, index) => {
                const values = motionValues[index];
                return values ? (
                    <ToolbarSlot
                        key={React.isValidElement(child) && child.key ? child.key : index}
                        scale={values.scale}
                        x={values.x}
                    >
                        {child}
                    </ToolbarSlot>
                ) : null;
            })}
        </motion.div>
    );
}

/**
 * One button of a group: staggers in, and smooths its magnification for the button inside.
 * Collapses when the button renders nothing, so it leaves no gap.
 */
function ToolbarSlot(props: {
    scale: MotionValue<number>;
    x: MotionValue<number>;
    children: React.ReactNode;
}) {
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const scale = useSpring(props.scale, MAGNIFICATION_SPRING);
    const x = useSpring(props.x, MAGNIFICATION_SPRING);
    const slot = React.useMemo(() => ({ scale, x, anchorRef }), [scale, x]);

    return (
        <motion.div
            ref={anchorRef}
            variants={toolbarEasings.staggeringChild}
            className="relative empty:hidden"
        >
            <ToolbarSlotContext.Provider value={slot}>{props.children}</ToolbarSlotContext.Provider>
        </motion.div>
    );
}

export interface ToolbarButtonProps extends Omit<React.HTMLProps<HTMLAnchorElement>, 'title'> {
    icon: IconName;
    iconClassName?: string;
    title?: React.ReactNode;
    children?: React.ReactNode;
}

export const ToolbarButton = React.forwardRef<HTMLDivElement, ToolbarButtonProps>((props, ref) => {
    const { title, disabled, className, style, href, onClick, icon, iconClassName, children } =
        props;
    const reduceMotion = useReducedMotion();
    const slot = useToolbarSlot();

    const anchor = (
        <motion.a
            href={href}
            onClick={onClick}
            target="_blank"
            rel="noopener noreferrer"
            style={
                reduceMotion || !slot
                    ? style
                    : { scale: slot.scale, x: slot.x, transformOrigin: 'bottom center', ...style }
            }
            className={tcls(
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
                className={tcls('size-3.5 shrink-0', iconClassName)}
            />
        </motion.a>
    );

    return (
        <div className="relative" ref={ref}>
            {children ? children : null}
            {/* Anchored to the unscaled slot with room for full magnification, so the gap doesn't
            depend on how far the spring has grown when the tooltip opens. */}
            {title ? (
                <Tooltip
                    label={title}
                    anchor={slot?.anchorRef}
                    sideOffset={slot ? TOOLTIP_OFFSET : 4}
                >
                    {anchor}
                </Tooltip>
            ) : (
                anchor
            )}
        </div>
    );
});

ToolbarButton.displayName = 'ToolbarButton';

export function ToolbarTitle(props: {
    prefix?: string;
    /** What a short prefix stands for, e.g. "Change request #54" for "#54". */
    prefixLabel?: string;
    suffix: string;
}) {
    const { prefix, prefixLabel, suffix } = props;
    // One tooltip for the whole title: the short prefix spelled out, and the full, often
    // truncated, subject.
    const label = prefixLabel ? (
        <span className="flex flex-col">
            <span className="opacity-70 text-xxs">{prefixLabel}</span>
            <span className="font-medium">{suffix}</span>
        </span>
    ) : prefix ? (
        `${prefix}${suffix}`
    ) : (
        suffix
    );
    return (
        <Tooltip label={label}>
            <div className="flex min-w-0 max-w-full items-center gap-1 text-xs">
                {prefix ? <ToolbarTitlePrefix title={prefix} /> : null}
                <ToolbarTitleSuffix title={suffix} />
            </div>
        </Tooltip>
    );
}

function ToolbarTitlePrefix(props: { title: string }) {
    // Kept whole: prefixes are short, and the suffix is the one to truncate.
    return (
        <motion.span
            {...getCopyVariants(0)}
            className="shrink-0 whitespace-nowrap font-medium text-neutral-1 dark:text-neutral-12"
        >
            {props.title}
        </motion.span>
    );
}

function ToolbarTitleSuffix(props: { title: string }) {
    return (
        <motion.span
            {...getCopyVariants(1)}
            className="min-w-0 max-w-[28ch] truncate font-bold text-neutral-1 dark:text-neutral-12"
        >
            {props.title}
        </motion.span>
    );
}

export function ToolbarSubtitle(props: { subtitle: React.ReactNode }) {
    return (
        <motion.span
            {...getCopyVariants(1)}
            className="text-neutral-1/80 dark:text-neutral-12/80 flex min-w-0 max-w-full items-center gap-1 whitespace-nowrap text-xxs"
        >
            {props.subtitle}
        </motion.span>
    );
}
