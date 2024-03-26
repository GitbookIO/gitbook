'use client';

import * as Popover from '@radix-ui/react-popover';
import React from 'react';

import { useLanguage, tString } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

export function AnnotationPopover(props: { children: React.ReactNode; body: React.ReactNode }) {
    const { children, body } = props;
    const language = useLanguage();

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    aria-label={tString(language, 'annotation_button_label')}
                    className={tcls(
                        'decoration-dotted',
                        'decoration-1',
                        'underline',
                        'underline-offset-2',
                    )}
                >
                    {children}
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={tcls(
                        'text-sm',
                        'max-w-[280px]',
                        'bg-light',
                        'ring-1',
                        'ring-dark/2',
                        'rounded',
                        'shadow-1xs',
                        'shadow-dark/1',
                        'p-3',
                        '[&_p]:leading-snug',
                        'dark:bg-dark',
                        'dark:ring-light/2',
                        'dark:shadow-dark/4',
                        '-outline-offset-2',
                        'outline-2',
                        'outline-primary/8',
                        'z-20',
                    )}
                    sideOffset={5}
                >
                    {body}
                    <Popover.Arrow asChild>
                        <svg
                            width="100%"
                            viewBox="0 0 8 5"
                            preserveAspectRatio="xMaxYMid meet"
                            className={tcls(
                                'relative',
                                'z-[2]',
                                'fill-light',
                                'stroke-dark/2',
                                '[paint-order:stroke_fill]',
                                'dark:fill-dark',
                                'dark:stroke-light/2',
                            )}
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clip-path="url(#clipAnnotation)">
                                <path
                                    d="M0 0L4 4L8 0"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    stroke="inherit"
                                    fill="inherit"
                                />
                            </g>
                            <defs>
                                <clipPath id="clipAnnotation">
                                    <rect width="8" height="5" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </Popover.Arrow>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
