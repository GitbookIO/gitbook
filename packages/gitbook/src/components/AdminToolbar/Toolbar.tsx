'use client';
import { AnimatePresence, type MotionValue, motion, useReducedMotion } from 'motion/react';
import React from 'react';
import { AnimatedLogo } from './AnimatedLogo';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import { Tooltip } from '../primitives';
import { getCopyVariants, minifyButtonAnimation, toolbarEasings } from './transitions';
import { useMagnificationEffect } from './useMagnificationEffect';

const DURATION_LOGO_APPEARANCE = 2000;
const DELAY_BETWEEN_LOGO_AND_CONTENT = 100;

interface ToolbarProps {
    children: React.ReactNode;
    label: React.ReactNode;
}

export function Toolbar(props: ToolbarProps) {
    const { children, label } = props;
    const [minified, setMinified] = React.useState(true);
    const [showToolbarControls, setShowToolbarControls] = React.useState(false);
    const [isReady, setIsReady] = React.useState(false);

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

    // After toolbar appears, wait then show the full content
    React.useEffect(() => {
        if (isReady) {
            const expandAfterTimeout = setTimeout(() => {
                setMinified(false);
            }, DURATION_LOGO_APPEARANCE + DELAY_BETWEEN_LOGO_AND_CONTENT);

            return () => clearTimeout(expandAfterTimeout);
        }
    }, [isReady]);

    // Don't render anything until page is ready
    if (!isReady) {
        return null;
    }

    return (
        <Tooltip label={label}>
            <motion.div
                onMouseEnter={() => setShowToolbarControls(true)}
                onMouseLeave={() => setShowToolbarControls(false)}
                className="-translate-x-1/2 fixed bottom-5 left-1/2 z-40 w-auto max-w-xl transform px-4"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        onClick={() => {
                            if (minified) {
                                setMinified((prev) => !prev);
                            }
                        }}
                        layout
                        transition={toolbarEasings.spring}
                        className={tcls(
                            minified ? 'cursor-pointer px-2' : 'pr-2 pl-3.5',
                            'flex',
                            'items-center',
                            'justify-center',
                            'min-h-11',
                            'min-w-12',
                            'h-12',
                            'py-2',
                            'border-tint-1/3',
                            'backdrop-blur-sm',
                            'origin-center',
                            'bg-[linear-gradient(110deg,rgba(20,23,28,0.90)_0%,rgba(20,23,28,0.80)_100%)]',
                            'dark:bg-[linear-gradient(110deg,rgba(256,256,256,0.90)_0%,rgba(256,256,256,0.80)_100%)]'
                        )}
                        initial={{
                            scale: 1,
                            opacity: 1,
                        }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            boxShadow: minified
                                ? '0 4px 40px 8px rgba(0, 0, 0, .2), 0 0 0 .5px rgba(0, 0, 0, .4), inset 0 .5px 0 0 hsla(0, 0%, 100%, .15)'
                                : '0 4px 40px 8px rgba(0, 0, 0, .4), 0 0 0 .5px rgba(0, 0, 0, .8), inset 0 .5px 0 0 hsla(0, 0%, 100%, .3)',
                        }}
                        style={{
                            borderRadius: '100px', // This is set on `style` so Framer Motion can correct for distortions
                        }}
                    >
                        {/* Logo with stroke segments animation in blue-tints */}
                        <motion.div layout>
                            <AnimatedLogo />
                        </motion.div>

                        {!minified ? children : null}

                        {!minified && showToolbarControls && (
                            <MinifyButton setMinified={setMinified} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </Tooltip>
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
                const motionValues = buttonMotionValues[index];
                const childEl = child as React.ReactElement;
                return React.cloneElement(childEl, {
                    key: index,
                    motionValues,
                });
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
}

export function ToolbarButton(props: ToolbarButtonProps) {
    const { title, disabled, motionValues, className, style, href, onClick, icon, iconClassName } =
        props;
    const reduceMotion = useReducedMotion();

    return (
        <motion.div variants={toolbarEasings.staggeringChild}>
            <Tooltip label={title}>
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
                        'flex',
                        'relative',
                        'items-center',
                        'justify-center',
                        'gap-1',
                        'text-sm',
                        'rounded-full',
                        'border-neutral-500',
                        'outline-neutral-800',
                        'outline-1',
                        'border',
                        'truncate',
                        'text-tint-1',
                        'dark:text-tint-12',
                        'cursor-pointer',
                        'transition-colors',
                        'size-8',
                        'bg-tint-1/3',
                        'hover:bg-tint-1/4',
                        'dark:bg-tint-3',
                        'dark:hover:bg-tint-1',
                        disabled ? 'cursor-not-allowed opacity-50' : '',
                        'shadow-1xs'
                    )}
                >
                    <Icon icon={icon} className={tcls('size-4', iconClassName)} />
                </motion.a>
            </Tooltip>
        </motion.div>
    );
}

export function ToolbarSeparator() {
    return <div className="h-5 w-px bg-tint-1/3" />;
}

export function ToolbarTitle(props: { prefix: string; suffix: string }) {
    return (
        <div className="flex items-center gap-1 text-xs ">
            <ToolbarTitlePrefix title={props.prefix} />
            <ToolbarTitleSuffix title={props.suffix} />
        </div>
    );
}

function ToolbarTitlePrefix(props: { title: string }) {
    return (
        <motion.span
            {...getCopyVariants(0)}
            className="font-light text-neutral-7 dark:text-neutral-3"
        >
            {props.title}
        </motion.span>
    );
}

function ToolbarTitleSuffix(props: { title: string }) {
    return (
        <motion.span
            {...getCopyVariants(1)}
            className="max-w-[24ch] truncate font-semibold text-neutral-3 dark:text-neutral-2"
        >
            {props.title}
        </motion.span>
    );
}

export function ToolbarSubtitle(props: { subtitle: React.ReactNode }) {
    return (
        <motion.span
            {...getCopyVariants(1)}
            className="text-neutral-7 text-xxs dark:text-neutral-2"
        >
            {props.subtitle}
        </motion.span>
    );
}

function MinifyButton(props: { setMinified: (minified: boolean) => void }) {
    return (
        <Tooltip label="Minify">
            <motion.div
                {...minifyButtonAnimation}
                transition={{
                    duration: 0.2,
                }}
                whileHover={{
                    scale: 1.05,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    props.setMinified(true);
                }}
                className={tcls(
                    '-top-2 -right-4 absolute flex size-4 cursor-pointer items-center justify-center rounded-full border',
                    'border-neutral-500 bg-neutral-700 hover:border-neutral-400 hover:bg-neutral-600',
                    'dark:border-neutral-400 dark:bg-neutral-200 dark:hover:border-neutral-200 dark:hover:bg-neutral-100'
                )}
            >
                <Icon icon="minus" className="size-2 text-neutral-1 dark:text-neutral-9" />
            </motion.div>
        </Tooltip>
    );
}
