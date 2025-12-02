'use client';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { type ClassValue, tcls } from '@/lib/tailwind';
import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { Button } from './Button';

/**
 * SideSheet - A slide-in panel component that can appear from the left or right side.
 *
 * Supports both controlled and uncontrolled modes:
 * - Controlled: Provide both `open` and `onOpenChange` props. Parent manages state.
 * - Uncontrolled: Omit `open` prop. Component manages its own state internally.
 */
export function SideSheet(
    props: {
        /** Which side the sheet slides in from */
        side: 'left' | 'right';
        /**
         * Optional CSS class to monitor and sync with `document.body.classList`.
         * When set, a MutationObserver watches for the class and syncs the sheet state accordingly.
         * Adding this class opens the sheet, removing it closes it.
         * Works in both controlled and uncontrolled modes.
         */
        toggleClass?: string;
        /**
         * Modal behavior: true (always modal), false (never modal), or 'mobile' (modal only on mobile).
         * Defaults to 'mobile'.
         */
        modal?: true | false | 'mobile';
        /**
         * Controls visibility. If provided, component is controlled (parent manages state).
         * If undefined, component is uncontrolled (manages its own state).
         */
        open?: boolean;
        /** Called when the open state changes. Receives the new state (true/false). Only used in controlled mode. */
        onOpenChange?: (open: boolean) => void;
        /** Show a backdrop overlay when modal */
        withScrim?: boolean;
        /** Show a close button when modal */
        withCloseButton?: boolean;
    } & React.HTMLAttributes<HTMLDivElement>
) {
    const {
        side,
        children,
        className,
        toggleClass,
        open: openState,
        modal = 'mobile',
        withScrim,
        withCloseButton,
        onOpenChange,
        ...rest
    } = props;

    const isMobile = useIsMobile();
    const isModal = modal === 'mobile' ? isMobile : modal;

    // Internal state for uncontrolled mode (only used when open prop is undefined)
    const [open, setOpen] = React.useState(openState ?? false);

    // Determine actual open state: controlled (from prop) or uncontrolled (from internal state)
    const isOpen = openState !== undefined ? openState : open;

    const handleClose = React.useCallback(() => {
        if (openState !== undefined) {
            // Controlled mode: parent manages state, notify via callback with new state
            onOpenChange?.(false);
        } else {
            // Uncontrolled mode: update internal state and sync body class if needed
            setOpen(false);
            if (toggleClass) {
                document.body.classList.remove(toggleClass);
            }
        }
    }, [openState, onOpenChange, toggleClass]);

    // Sync the sheet state with the body class if the toggleClass is set
    React.useEffect(() => {
        if (!toggleClass) {
            return;
        }

        const callback = (mutationList: MutationRecord[]) => {
            for (const mutation of mutationList) {
                if (mutation.attributeName === 'class') {
                    const shouldBeOpen = document.body.classList.contains(toggleClass);
                    if (openState !== undefined) {
                        // Controlled mode: sync with parent's state
                        // Notify parent of state change via onOpenChange
                        if (shouldBeOpen !== openState) {
                            onOpenChange?.(shouldBeOpen);
                        }
                    } else {
                        // Uncontrolled mode: sync internal state with body class
                        setOpen(shouldBeOpen);
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(document.body, { attributes: true });

        return () => observer.disconnect();
    }, [toggleClass, openState, onOpenChange]);

    return (
        <>
            {isModal && withScrim ? (
                <SideSheetScrim
                    className={isOpen ? '' : 'hidden opacity-0 backdrop-blur-none'}
                    onClick={handleClose}
                />
            ) : null}

            <aside
                className={tcls(
                    'side-sheet',
                    isOpen
                        ? side === 'left'
                            ? 'hydrated:animate-enter-from-left'
                            : 'hydrated:animate-enter-from-right'
                        : side === 'left'
                          ? 'hydrated:animate-exit-to-left'
                          : 'hydrated:animate-exit-to-right',
                    'fixed inset-y-0 z-41', // Above the side sheet scrim on z-40
                    side === 'left' ? 'left-0' : 'right-0',
                    withCloseButton ? (side === 'left' ? 'mr-16' : 'ml-16') : '',
                    isOpen ? '' : 'hidden',
                    className
                )}
                aria-expanded={isOpen}
                aria-modal={isModal}
                {...rest}
            >
                {children}
                {isModal && withCloseButton ? (
                    <SideSheetCloseButton
                        className={tcls(
                            side === 'left' ? 'left-full ml-4' : 'right-full mr-4',
                            isOpen ? 'animate-blur-in' : 'hidden animate-blur-out'
                        )}
                        onClick={handleClose}
                    />
                ) : null}
            </aside>
        </>
    );
}

/** Backdrop overlay shown behind the modal sheet */
export function SideSheetScrim(props: { className?: ClassValue; onClick?: () => void }) {
    const { className, onClick } = props;
    return (
        <div
            id="side-sheet-scrim"
            onClick={() => {
                onClick?.();
            }}
            onKeyUp={(e) => {
                if (e.key === 'Escape') {
                    onClick?.();
                }
            }}
            className={tcls(
                'fixed inset-0 z-40 items-start bg-tint-base/3 not-hydrated:opacity-0 starting:opacity-0 backdrop-blur-md starting:backdrop-blur-none transition-[opacity,display,backdrop-filter] transition-discrete duration-250 dark:bg-tint-base/6',
                className
            )}
        />
    );
}

/** Close button displayed outside the sheet when modal */
export function SideSheetCloseButton(props: { className?: ClassValue; onClick?: () => void }) {
    const { className, onClick } = props;
    const language = useLanguage();
    return (
        <Button
            icon="xmark"
            variant="secondary"
            size="default"
            iconOnly
            label={tString(language, 'close')}
            className={tcls('absolute top-4 bg-tint-base! transition-discrete', className)}
            onClick={() => {
                onClick?.();
            }}
        />
    );
}
