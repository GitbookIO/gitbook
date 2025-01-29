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
                    data-testid="annotation-button"
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
                        'bg-gray',
                        'ring-1',
                        'ring-gray',
                        'rounded',
                        'shadow-1xs',
                        'shadow-gray-12/1',
                        'dark:shadow-gray-1/2',
                        'p-3',
                        '[&_p]:leading-snug',
                        '-outline-offset-2',
                        'outline-2',
                        'outline-primary/8',
                        'z-20',
                    )}
                    sideOffset={4}
                >
                    {body}
                    <Popover.Arrow asChild>
                        <svg
                            viewBox="0 0 8 5"
                            className={tcls(
                                'relative',
                                'z-[2]',
                                'fill-gray-3', // Same as bg-gray
                                'stroke-gray-7', // Same as ring-gray
                                '[paint-order:stroke_fill]',
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
