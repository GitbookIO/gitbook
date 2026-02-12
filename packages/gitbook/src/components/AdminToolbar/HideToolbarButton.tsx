'use client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { motion } from 'motion/react';
import React, { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { ToolbarButton, type ToolbarButtonProps } from './Toolbar';
import styles from './Toolbar.module.css';
import { useToolbarControls } from './ToolbarControlsContext';

// Params for the expanding arc defined separately for easier tweaking.
const ARC_PARAMS = {
    arcWidth: 505,
    arcHeight: 400,
    arcRadius: 34,
    startDistance: -240,
    spreadDistance: 45,
    fromDistance: -286,
    fromSpread: 0,
    durationSeconds: 0.6,
    staggerMs: 80,
    baseRotationDeg: 95,
    rotationStepDeg: 18,
    offsetAnchorY: 40,
} as const;

interface HideToolbarButtonProps {
    motionValues?: ToolbarButtonProps['motionValues'];
}

/**
 * Hide menu trigger. Expands a macOS Dock-like submenu with 3 labeled actions.
 */
export function HideToolbarButton(props: HideToolbarButtonProps) {
    const { motionValues } = props;
    const [open, setOpen] = React.useState(false);
    const [closing, setClosing] = React.useState(false);
    const controls = useToolbarControls();
    const closingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const ref = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const close = React.useCallback(() => {
        if (!open || closing) return;
        setClosing(true);

        // Clear any existing timeout
        if (closingTimeoutRef.current) {
            clearTimeout(closingTimeoutRef.current);
        }

        // Wait for the exit animation to complete before unmounting
        const totalDuration = ARC_PARAMS.durationSeconds * 1000 + 3 * ARC_PARAMS.staggerMs;
        closingTimeoutRef.current = setTimeout(() => {
            setOpen(false);
            setClosing(false);
            closingTimeoutRef.current = null;
        }, totalDuration);
    }, [open, closing]);

    // Clean up timeout on unmount
    React.useEffect(() => {
        return () => {
            if (closingTimeoutRef.current) {
                clearTimeout(closingTimeoutRef.current);
            }
        };
    }, []);

    const handleClickOutsideArcMenu = (event: Event) => {
        // Don't close the arc if we are clicking on the button itself
        if (buttonRef.current?.contains(event.target as Node)) {
            return;
        }
        close();
    };
    // @ts-expect-error wrong type for ref
    useOnClickOutside(ref, handleClickOutsideArcMenu);

    // Close arc menu on scroll or resize
    React.useEffect(() => {
        if (!open) return;

        const handleClose = () => close();
        window.addEventListener('scroll', handleClose, { passive: true });
        window.addEventListener('resize', handleClose, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleClose);
            window.removeEventListener('resize', handleClose);
        };
    }, [open, close]);

    const items = [
        controls?.minimize
            ? {
                  id: 'minimize',
                  icon: 'minus',
                  label: 'Minimize',
                  onClick: controls.minimize,
              }
            : null,
        controls?.closeSession
            ? {
                  id: 'session-close',
                  icon: 'xmark',
                  label: 'Close for one session',
                  onClick: controls.closeSession,
              }
            : null,
        controls?.closePersistent
            ? {
                  id: 'persistent-close',
                  icon: 'ban',
                  label: "Don't show again",
                  onClick: controls.closePersistent,
              }
            : null,
    ].filter(Boolean) as Array<ArcMenuItem>;

    const sharedMotionStyle = motionValues
        ? {
              x: motionValues.x,
          }
        : undefined;

    return (
        <ToolbarButton
            ref={buttonRef}
            title={open ? undefined : 'Hide toolbar'}
            className={
                open || closing
                    ? 'border-[0.5px] border-neutral-5 border-solid dark:border-neutral-8'
                    : undefined
            }
            onClick={() => {
                if (open || closing) {
                    close();
                } else {
                    setOpen(true);
                }
            }}
            motionValues={motionValues}
            icon="gear"
        >
            {/* Expanding arc menu */}
            {(open || closing) && (
                <motion.div
                    className={tcls('pointer-events-none absolute inset-0', styles.arcMenu)}
                    style={
                        {
                            ...sharedMotionStyle,
                            '--arc-width': `${ARC_PARAMS.arcWidth}px`,
                            '--arc-height': `${ARC_PARAMS.arcHeight}px`,
                            '--arc-radius': `${ARC_PARAMS.arcRadius}%`,
                            '--start-distance': `${ARC_PARAMS.startDistance}px`,
                            '--spread-distance': `${ARC_PARAMS.spreadDistance}px`,
                        } as React.CSSProperties
                    }
                >
                    <div
                        className={tcls(
                            'pointer-events-none absolute left-0 overflow-visible',
                            styles.arcMenuPath
                        )}
                        ref={ref}
                    >
                        {items.map((item, index) => (
                            <ArcToolbarButton
                                index={index}
                                staggerIndex={closing ? index : items.length - 1 - index}
                                key={item.id}
                                closing={closing}
                                {...item}
                                onClick={() => {
                                    close();
                                    item.onClick?.();
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </ToolbarButton>
    );
}

type ArcMenuItem = {
    id: string;
    icon: IconName;
    label: string;
    onClick?: () => void;
};

type ArcToolbarButtonProps = Pick<ArcMenuItem, 'label' | 'icon' | 'onClick'> & {
    index: number;
    staggerIndex?: number;
    closing?: boolean;
    disabled?: boolean;
    className?: string;
    iconClassName?: string;
};

export function ArcToolbarButton(props: ArcToolbarButtonProps) {
    const {
        index,
        staggerIndex = index,
        closing = false,
        label,
        disabled,
        className,
        onClick,
        icon,
        iconClassName,
    } = props;

    const targetOffset = `calc(var(--start-distance) + ${index} * var(--spread-distance))`;
    const fromOffset = `calc(${ARC_PARAMS.fromDistance}px + ${index} * ${ARC_PARAMS.fromSpread}px)`;

    const itemRotation = ARC_PARAMS.baseRotationDeg - index * ARC_PARAMS.rotationStepDeg;

    return (
        <div className="pointer-events-none">
            <button
                type="button"
                onClick={onClick ? () => onClick() : undefined}
                style={
                    {
                        '--from-offset-distance': fromOffset,
                        '--target-offset-distance': targetOffset,
                        '--arc-duration': `${ARC_PARAMS.durationSeconds}s`,
                        '--arc-delay': `${(staggerIndex ?? 0) * ARC_PARAMS.staggerMs}ms`,
                        '--rotation-offset': `${itemRotation}deg`,
                        offsetPath: 'border-box',
                        offsetDistance: fromOffset,
                        offsetAnchor: `0% ${ARC_PARAMS.offsetAnchorY}%`,
                        offsetRotate: 'auto 90deg',
                    } as React.CSSProperties
                }
                className={tcls(
                    'group',
                    'absolute',
                    'top-0',
                    'left-0',
                    'w-40',
                    'pointer-events-auto',
                    'flex',
                    'items-center',
                    'gap-2',
                    closing ? styles.arcMenuItemExit : styles.arcMenuItem,
                    className
                )}
            >
                <div className="flex items-center gap-2">
                    <div
                        className={tcls(
                            'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center gap-1 truncate rounded-full text-sm transition-colors',
                            'border-[0.5px] border-neutral-5 border-solid dark:border-neutral-8',
                            'group-hover:scale-105',
                            disabled ? 'cursor-not-allowed opacity-50' : '',
                            'bg-[var(--toolbar-bg)] text-tint-7 hover:text-tint-1 dark:text-tint-12',
                            'group-hover:bg-[color-mix(in_srgb,var(--toolbar-bg)_90%,white)]'
                        )}
                    >
                        <Icon
                            icon={icon as IconName}
                            iconStyle={IconStyle.Solid}
                            className={tcls(
                                'size-3.5 shrink-0 group-hover:scale-110',
                                iconClassName
                            )}
                        />
                    </div>
                    <span
                        className={tcls(
                            'whitespace-nowrap rounded-lg border-[0.5px] border-neutral-5 border-solid bg-[var(--toolbar-bg)] px-3 py-1 font-normal text-neutral-1 text-sm transition-[background-color,transform] group-hover:scale-105 group-hover:bg-[color-mix(in_srgb,var(--toolbar-bg)_90%,white)] dark:border-neutral-8 dark:text-neutral-12',
                            closing ? styles.arcLabelFadeOut : styles.arcLabelFadeIn
                        )}
                    >
                        {label}
                    </span>
                </div>
            </button>
        </div>
    );
}
