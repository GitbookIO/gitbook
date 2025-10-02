'use client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { motion } from 'motion/react';
import React from 'react';
import { FanConfigPane } from './FanConfigPane';
import { ToolbarButton, type ToolbarButtonProps } from './Toolbar';
import styles from './Toolbar.module.css';
import { type FanConfig, useFanConfig } from './useFanConfig';

interface HideToolbarButtonProps {
    motionValues?: ToolbarButtonProps['motionValues'];
    onSessionClose?: () => void; // hides for current session
    onPersistentClose?: () => void; // stores preference in browser
    onMinify?: () => void; // just minimize the toolbar
}

/**
 * Hide menu trigger. Expands a macOS Dock-like submenu with 3 labeled actions.
 */
export function HideToolbarButton(props: HideToolbarButtonProps) {
    const { motionValues, onSessionClose, onPersistentClose, onMinify } = props;

    const [open, setOpen] = React.useState(false);
    const [config, setConfig] = useFanConfig();
    const [showPane, setShowPane] = React.useState(false);

    React.useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get('fan') === '1') setShowPane(true);
        const onKey = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'f') setShowPane((v) => !v);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const items = [
        {
            id: 'persistent-close',
            icon: 'eye-slash',
            label: 'Close until enabled again',
            description: 'Preference stored in the browser, clear your cache to reset',
            onClick: () => onPersistentClose?.(),
        },
        {
            id: 'session-close',
            icon: 'x',
            label: 'Close for one session',
            description: 'Reopens next time you visit the site',
            onClick: () => onSessionClose?.(),
        },
        {
            id: 'minimize',
            icon: 'minus',
            label: 'Minimize',
            description: 'Reduces the toolbar to its minimum size',
            onClick: () => onMinify?.(),
        },
    ];

    // Create a stable fallback motion value
    // const fallbackScale = useMotionValue(1);

    // // Always call useTransform to avoid hook order issues
    // const arcMagnificationScale = useTransform(
    //     motionValues?.scale || fallbackScale,
    //     (val) => val * 0.8
    // );

    const sharedMotionStyle = motionValues
        ? {
              // We also apply the magnification effect to the arc menu. However, we reduce the scaling factor to 0.8 so it's less intense.
              //   scale: arcMagnificationScale,
              //   scale: motionValues?.scale,
              x: motionValues.x,
              transformOrigin: 'bottom center',
          }
        : undefined;

    return (
        <ToolbarButton
            title={open ? 'Hide options' : 'Hide toolbar'}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen((v) => !v);
            }}
            motionValues={motionValues}
            icon="eye-slash"
        >
            {/* Expanding arc menu */}
            {open && (
                <motion.div
                    className={styles.arcMenu}
                    style={
                        {
                            ...sharedMotionStyle,
                            '--start-distance': `${config.startOffset}px`,
                            '--spread-distance': `${config.spread}px`,
                        } as React.CSSProperties
                    }
                >
                    <div
                        className={styles.arcMenuPath}
                        style={
                            {
                                '--arc-width': `${config.arcWidth}px`,
                                '--arc-height': `${config.arcHeight}px`,
                                '--arc-radius': `${config.arcRadius}%`,
                                width: `${config.arcWidth}px`,
                                height: `${config.arcHeight}px`,
                                border: config.debug ? '3px dashed red' : 'none',
                            } as React.CSSProperties
                        }
                    >
                        {items.map((item, index) => (
                            <ArcToolbarButton
                                index={index}
                                staggerIndex={items.length - 1 - index}
                                config={config}
                                key={item.icon}
                                title={item.label}
                                onClick={() => {
                                    setOpen(false);
                                    item.onClick?.();
                                }}
                                icon={item.icon as IconName}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* </div> */}
            <FanConfigPane config={config} setConfig={setConfig} visible={showPane} />
        </ToolbarButton>
    );
}

export function ArcToolbarButton(
    props: ToolbarButtonProps & {
        index: number;
        staggerIndex?: number;
        config: FanConfig;
    }
) {
    const {
        index,
        staggerIndex = index,
        title,
        disabled,
        className,
        onClick,
        icon,
        iconClassName,
        config,
    } = props;

    const targetOffset = `calc(var(--start-distance) + ${index} * var(--spread-distance))`;

    // Calculate rotation based on position along the arc
    const calculateRotation = () => {
        const baseRotation = 95; // Starting rotation for index 0
        const rotationStep = 18; // Degrees to subtract per index

        // Simple linear decrease
        return baseRotation - index * rotationStep;
    };

    const itemRotation = calculateRotation();

    return (
        <div className="pointer-events-none">
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick?.();
                }}
                style={
                    {
                        '--target-offset-distance': targetOffset,
                        '--start-distance': `${config.startOffset}px`,
                        '--arc-duration': `${config.speed}s`,
                        '--arc-delay': `${(staggerIndex ?? 0) * config.staggerMs}ms`,
                        '--rotation-offset': `${itemRotation}deg`,
                        offsetPath: 'border-box',
                        offsetDistance: targetOffset,
                        offsetAnchor: '0% 40%',
                        offsetRotate: `auto ${itemRotation}deg`,
                    } as React.CSSProperties
                }
                className={tcls(
                    'group',
                    'pointer-events-auto',
                    'absolute',
                    'top-0',
                    'left-0',
                    'w-40',
                    styles.arcMenuItem,
                    className
                )}
            >
                <div
                    className={tcls(
                        'flex',
                        'w-8',
                        'h-8',
                        'shrink-0',
                        'items-center',
                        'justify-center',
                        'gap-1',
                        'text-sm',
                        'rounded-full',
                        'border',
                        'truncate',
                        'text-tint-1',
                        'dark:text-tint-12',
                        'cursor-pointer',
                        'transition-colors',
                        'shadow-1xs',
                        // Button background
                        'bg-neutral-800/90 hover:bg-neutral-800 dark:bg-neutral-900/80 dark:hover:bg-neutral-900',
                        disabled ? 'cursor-not-allowed opacity-50' : '',
                        'hover:scale-105'
                    )}
                    style={{
                        background: 'linear-gradient(rgb(51, 53, 57), rgb(50, 52, 56))',
                        boxShadow: 'rgba(255, 255, 255, 0.15) 0px 1px 1px 0px inset',
                        outline: 'unset',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                    }}
                >
                    <div
                        className="group-hover:-rotate-3 flex items-center justify-center rounded-full p-1 group-hover:scale-105"
                        style={{ background: 'linear-gradient(rgb(50, 52, 56), rgb(51, 53, 57))' }}
                    >
                        <Icon
                            icon={icon as IconName}
                            iconStyle={IconStyle.Solid}
                            className={tcls('size-4 shrink-0', iconClassName)}
                        />
                    </div>
                </div>
                <span
                    className={tcls(
                        'whitespace-nowrap rounded-lg bg-neutral-800/90 px-3 py-1 font-normal text-neutral-3 text-sm transition-transform hover:bg-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-3 dark:hover:bg-neutral-900',
                        'group-hover:rotate-2 group-hover:scale-105 group-hover:bg-neutral-900 group-hover:text-neutral-1'
                    )}
                >
                    {title}
                </span>
            </button>
        </div>
    );
}
