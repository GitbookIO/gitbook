'use client';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { type ClassValue, tcls } from '@/lib/tailwind';
import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { Button } from './Button';

export function SideSheet(
    props: {
        side: 'left' | 'right';
        open?: boolean;
        toggleClass?: string;
        modal?: true | false | 'mobile';
        onClose?: () => void;
        withShim?: boolean;
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
        withShim,
        withCloseButton,
        onClose,
        ...rest
    } = props;

    const isMobile = useIsMobile();
    const isModal = modal === 'mobile' ? isMobile : modal;

    const [open, setOpen] = React.useState(openState ?? false);

    // Use prop if provided (controlled), otherwise use internal state (uncontrolled)
    const isOpen = openState !== undefined ? openState : open;

    const handleClose = React.useCallback(() => {
        if (openState !== undefined) {
            // Controlled mode: notify parent
            onClose?.();
        } else {
            // Uncontrolled mode: update internal state
            setOpen(false);
            if (toggleClass) {
                document.body.classList.remove(toggleClass);
            }
        }
    }, [openState, onClose, toggleClass]);

    React.useEffect(() => {
        if (!toggleClass) {
            return;
        }

        const callback = (mutationList: MutationRecord[]) => {
            for (const mutation of mutationList) {
                if (mutation.attributeName === 'class') {
                    const shouldBeOpen = document.body.classList.contains(toggleClass);
                    if (openState !== undefined) {
                        // Controlled mode: notify parent if state should change
                        if (shouldBeOpen !== openState) {
                            if (shouldBeOpen) {
                                // Opening via class - no callback, just sync
                                // Parent should handle this via toggleClass observation
                            } else {
                                onClose?.();
                            }
                        }
                    } else {
                        // Uncontrolled mode: update internal state
                        setOpen(shouldBeOpen);
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(document.body, { attributes: true });

        return () => observer.disconnect();
    }, [toggleClass, openState, onClose]);

    return (
        <>
            {isModal && withShim ? (
                <SideSheetShim className={isOpen ? '' : 'hidden opacity-0'} onClick={handleClose} />
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
                    'fixed inset-y-0 z-50',
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

export function SideSheetShim(props: { className?: ClassValue; onClick?: () => void }) {
    const { className, onClick } = props;
    return (
        <div
            id="side-sheet-shim"
            onClick={() => {
                onClick?.();
            }}
            onKeyUp={(e) => {
                if (e.key === 'Escape') {
                    onClick?.();
                }
            }}
            className={tcls(
                'fixed inset-0 z-40 items-start bg-tint-base/3 not-hydrated:opacity-0 starting:opacity-0 backdrop-blur-md transition-[opacity,display,filter] transition-discrete duration-250',
                className
            )}
        />
    );
}

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
