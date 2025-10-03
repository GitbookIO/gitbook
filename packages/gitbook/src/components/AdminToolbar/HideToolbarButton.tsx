'use client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { motion } from 'motion/react';
import React, { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { ToolbarButton, type ToolbarButtonProps } from './Toolbar';
import styles from './Toolbar.module.css';
import { useToolbarControls } from './ToolbarControlsContext';

const ARC_DURATION_SECONDS = 0.4;
const ARC_STAGGER_MS = 80;
const BASE_ROTATION_DEG = 95;
const ROTATION_STEP_DEG = 18;

interface HideToolbarButtonProps {
    motionValues?: ToolbarButtonProps['motionValues'];
}

/**
 * Hide menu trigger. Expands a macOS Dock-like submenu with 3 labeled actions.
 */
export function HideToolbarButton(props: HideToolbarButtonProps) {
    const { motionValues } = props;
    const [open, setOpen] = React.useState(false);
    const controls = useToolbarControls();

    const ref = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleClickOutsideArcMenu = (event: Event) => {
        // Don't close the arc if we are clicking  clicking on the button itself
        if (buttonRef.current?.contains(event.target as Node)) {
            return;
        }
        setOpen(false);
    };
    useOnClickOutside(ref, handleClickOutsideArcMenu);

    // Close arc menu on scroll
    React.useEffect(() => {
        if (!open) return;

        const handleScroll = () => setOpen(false);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [open]);

    const items = React.useMemo(
        () =>
            [
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
            ].filter(Boolean) as Array<ArcMenuItem>,
        [controls]
    );

    const sharedMotionStyle = motionValues
        ? {
              x: motionValues.x,
          }
        : undefined;

    return (
        <ToolbarButton
            ref={buttonRef}
            title={open ? 'Hide options' : 'Hide toolbar'}
            onClick={() => {
                setOpen((v) => !v);
            }}
            motionValues={motionValues}
            icon="eye-slash"
        >
            {/* Expanding arc menu */}
            {open && (
                <motion.div
                    className={tcls('pointer-events-none absolute inset-0', styles.arcMenu)}
                    style={sharedMotionStyle as React.CSSProperties | undefined}
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
                                staggerIndex={items.length - 1 - index}
                                key={item.icon}
                                {...item}
                                onClick={() => {
                                    setOpen(false);
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
    description: string;
    onClick?: () => void;
};

type ArcToolbarButtonProps = Pick<ArcMenuItem, 'label' | 'icon' | 'onClick'> & {
    index: number;
    staggerIndex?: number;
    disabled?: boolean;
    className?: string;
    iconClassName?: string;
};

export function ArcToolbarButton(props: ArcToolbarButtonProps) {
    const {
        index,
        staggerIndex = index,
        label,
        disabled,
        className,
        onClick = () => {},
        icon,
        iconClassName,
    } = props;

    const targetOffset = `calc(var(--start-distance) + ${index} * var(--spread-distance))`;

    // Calculate rotation based on position along the arc
    const calculateRotation = () => {
        return BASE_ROTATION_DEG - index * ROTATION_STEP_DEG;
    };

    const itemRotation = calculateRotation();

    return (
        <div className="pointer-events-none">
            <button
                type="button"
                onClick={() => {
                    onClick();
                }}
                style={
                    {
                        '--target-offset-distance': targetOffset,
                        '--arc-duration': `${ARC_DURATION_SECONDS}s`,
                        '--arc-delay': `${(staggerIndex ?? 0) * ARC_STAGGER_MS}ms`,
                        '--rotation-offset': `${itemRotation}deg`,
                        offsetPath: 'border-box',
                        offsetDistance: targetOffset,
                        offsetAnchor: '0% 40%',
                        offsetRotate: `auto ${itemRotation}deg`,
                    } as React.CSSProperties
                }
                className={tcls(
                    'group',
                    'absolute',
                    'top-0',
                    'left-0',
                    'w-40',
                    'opacity-0',
                    'pointer-events-auto',
                    'flex',
                    'items-center',
                    'gap-2',
                    styles.arcMenuItem,
                    className
                )}
            >
                <div
                    className={tcls(
                        'flex shrink-0 items-center justify-center gap-1',
                        'h-8 w-8 rounded-full border',
                        'truncate text-sm',
                        'cursor-pointer transition-colors',
                        'group-hover:-rotate-5 group-hover:scale-105',
                        disabled ? 'cursor-not-allowed opacity-50' : '',
                        'text-tint-1 dark:text-tint-12',
                        'bg-[linear-gradient(110deg,rgba(51,53,57,1)_0%,rgba(50,52,56,1)_100%)]',
                        'dark:[background:linear-gradient(110deg,rgba(255,255,255,1)_0%,rgba(240,246,248,1)_100%)]',
                        'border border-solid dark:border-[rgb(255_255_255_/_40%)]'
                    )}
                    style={{
                        background: 'linear-gradient(rgb(51, 53, 57), rgb(50, 52, 56))',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: 'rgba(255, 255, 255, 0.15) 0px 1px 1px 0px inset',
                    }}
                >
                    <Icon
                        icon={icon as IconName}
                        iconStyle={IconStyle.Solid}
                        className={tcls('size-4 shrink-0 group-hover:scale-110', iconClassName)}
                    />
                </div>
                <span
                    className={tcls(
                        'whitespace-nowrap rounded-lg px-3 py-1 font-normal text-sm transition-transform',
                        'group-hover:rotate-2 group-hover:scale-105',
                        'text-neutral-1 dark:text-neutral-12',
                        'bg-[linear-gradient(110deg,rgba(51,53,57,1)_0%,rgba(50,52,56,1)_100%)]'
                    )}
                >
                    {label}
                </span>
            </button>
        </div>
    );
}
