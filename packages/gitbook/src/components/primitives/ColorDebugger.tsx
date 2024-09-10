import React from 'react';

import { tcls } from '@/lib/tailwind';

import { ThemeToggler } from '../ThemeToggler';

/**
 * Styled version of Next.js Link component.
 */
interface ColorIndex {
    base: string;
    opacities: string[];
}

const darkColorIndex: Record<string, ColorIndex> = {
    0: {
        base: 'bg-dark-1',
        opacities: [
            'bg-dark-1/10',
            'bg-dark-1/9',
            'bg-dark-1/8',
            'bg-dark-1/7',
            'bg-dark-1/6',
            'bg-dark-1/5',
            'bg-dark-1/4',
            'bg-dark-1/3',
            'bg-dark-1/2',
            'bg-dark-1/1',
        ],
    },
    1: {
        base: 'bg-dark',
        opacities: [
            'bg-dark/10',
            'bg-dark/9',
            'bg-dark/8',
            'bg-dark/7',
            'bg-dark/6',
            'bg-dark/5',
            'bg-dark/4',
            'bg-dark/3',
            'bg-dark/2',
            'bg-dark/1',
        ],
    },
    2: {
        base: 'bg-dark-2',
        opacities: [
            'bg-dark-2/10',
            'bg-dark-2/9',
            'bg-dark-2/8',
            'bg-dark-2/7',
            'bg-dark-2/6',
            'bg-dark-2/5',
            'bg-dark-2/4',
            'bg-dark-2/3',
            'bg-dark-2/2',
            'bg-dark-2/1',
        ],
    },
    3: {
        base: 'bg-dark-3',
        opacities: [
            'bg-dark-3/10',
            'bg-dark-3/9',
            'bg-dark-3/8',
            'bg-dark-3/7',
            'bg-dark-3/6',
            'bg-dark-3/5',
            'bg-dark-3/4',
            'bg-dark-3/3',
            'bg-dark-3/2',
            'bg-dark-3/1',
        ],
    },
    4: {
        base: 'bg-dark-4',
        opacities: [
            'bg-dark-4/10',
            'bg-dark-4/9',
            'bg-dark-4/8',
            'bg-dark-4/7',
            'bg-dark-4/6',
            'bg-dark-4/5',
            'bg-dark-4/4',
            'bg-dark-4/3',
            'bg-dark-4/2',
            'bg-dark-4/1',
        ],
    },
};

const lightColorIndex: Record<string, ColorIndex> = {
    0: {
        base: 'bg-light-1',
        opacities: [
            'bg-light-1/10',
            'bg-light-1/9',
            'bg-light-1/8',
            'bg-light-1/7',
            'bg-light-1/6',
            'bg-light-1/5',
            'bg-light-1/4',
            'bg-light-1/3',
            'bg-light-1/2',
            'bg-light-1/1',
        ],
    },
    1: {
        base: 'bg-light',
        opacities: [
            'bg-light/10',
            'bg-light/9',
            'bg-light/8',
            'bg-light/7',
            'bg-light/6',
            'bg-light/5',
            'bg-light/4',
            'bg-light/3',
            'bg-light/2',
            'bg-light/1',
        ],
    },
    2: {
        base: 'bg-light-2',
        opacities: [
            'bg-light-2/10',
            'bg-light-2/9',
            'bg-light-2/8',
            'bg-light-2/7',
            'bg-light-2/6',
            'bg-light-2/5',
            'bg-light-2/4',
            'bg-light-2/3',
            'bg-light-2/2',
            'bg-light-2/1',
        ],
    },
    3: {
        base: 'bg-light-3',
        opacities: [
            'bg-light-3/10',
            'bg-light-3/9',
            'bg-light-3/8',
            'bg-light-3/7',
            'bg-light-3/6',
            'bg-light-3/5',
            'bg-light-3/4',
            'bg-light-3/3',
            'bg-light-3/2',
            'bg-light-3/1',
        ],
    },
    4: {
        base: 'bg-light-4',
        opacities: [
            'bg-light-4/10',
            'bg-light-4/9',
            'bg-light-4/8',
            'bg-light-4/7',
            'bg-light-4/6',
            'bg-light-4/5',
            'bg-light-4/4',
            'bg-light-4/3',
            'bg-light-4/2',
            'bg-light-4/1',
        ],
    },
};

export function ColorDebugger() {
    return (
        <div
            className={tcls(
                'flex',
                'w-100',
                'top-0',
                'left-0',
                'z-50',
                'transition-colors',
                'duration-200',
                'bg-light',
                'hover:bg-black',
                'dark:bg-dark',
                'dark:hover:bg-white',
            )}
        >
            <div className={tcls('flex', 'place-self-start')}>
                <ThemeToggler />
            </div>

            {Object.keys(darkColorIndex).map((key) => {
                return (
                    <React.Fragment key={key}>
                        <div className={tcls('flex', 'w-full', 'flex-col')}>
                            <div
                                className={tcls(
                                    'flex',
                                    'justify-center',
                                    'items-center',
                                    'text-xs',
                                    'w-full',
                                    'h-6',
                                    'aspect-square',
                                    darkColorIndex[key].base,
                                )}
                            >
                                BASE {darkColorIndex[key].base}
                            </div>
                            {darkColorIndex[key].opacities.map((opacity, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={tcls(
                                            'w-full',
                                            'h-5',
                                            'flex',
                                            'justify-center',
                                            'items-center',
                                            'text-xs',
                                            opacity,
                                        )}
                                    >
                                        {opacity}
                                    </div>
                                );
                            })}
                            <div
                                className={tcls(
                                    'flex',
                                    'justify-center',
                                    'items-center',
                                    'text-xs',
                                    'w-full',
                                    'h-6',
                                    'aspect-square',
                                    lightColorIndex[key].base,
                                )}
                            >
                                BASE {lightColorIndex[key].base}
                            </div>
                            {lightColorIndex[key].opacities.map((opacity, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={tcls(
                                            'w-full',
                                            'h-5',
                                            'flex',
                                            'justify-center',
                                            'items-center',
                                            'text-xs',
                                            opacity,
                                        )}
                                    >
                                        {opacity}
                                    </div>
                                );
                            })}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
