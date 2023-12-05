import { DocumentBlockHint } from '@gitbook/api';
import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getBlockTextStyle } from './spacing';

export function Hint(props: BlockProps<DocumentBlockHint>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;
    const hintStyle = HINT_STYLES[block.data.style];
    const firstLine = getBlockTextStyle(block.nodes[0]);
    const RenderIcon = HINT_STYLES[block.data.style].icon;

    return (
        <div
            className={tcls(
                'px-4',
                'py-4',
                'transition-colors',
                'rounded-md',
                hintStyle.style,
                style,
            )}
        >
            <div className={tcls('flex', 'flex-row')}>
                <div
                    className={tcls(
                        'flex',
                        'items-start',
                        'justify-center',
                        'pr-3',
                        'mix-blend-luminosity',
                        'dark:mix-blend-plus-lighter',
                        firstLine.lineHeight,
                    )}
                >
                    <RenderIcon />
                </div>
                <Blocks
                    {...contextProps}
                    ancestorBlocks={[...ancestorBlocks, block]}
                    nodes={block.nodes}
                    style={['flex-1', 'space-y-4', 'dark:[&>*]:mix-blend-plus-lighter']}
                />
            </div>
        </div>
    );
}

const InfoIcon = () => (
    <div
        className={tcls(
            'flex',
            'flex-col',
            'w-[22px]',
            'h-[22px]',
            'bg-dark/3',
            'rounded-full',
            'dark:bg-light/3',
        )}
    >
        <div
            className={tcls(
                'grid',
                'w-[4px]',
                'h-[4px]',
                'translate-y-[calc(5px)]',
                'translate-x-[calc(9px)]',
                'will-change-transform',
            )}
        >
            <div
                className={tcls(
                    'animate-[pingAlt_8s_ease_infinite_forwards]',
                    'bg-[repeating-radial-gradient(var(--tw-gradient-stops))] from-dark/1 from-30% via-dark/3 via-65% to-dark/4 to-100%',
                    'grid-area-1-1',
                    'w-[4px]',
                    'h-[4px]',
                    'rounded',
                    'dark:from-light/1 dark:via-light/1 dark:to-light/6',
                )}
            ></div>
            <div
                className={tcls(
                    'animate-[pulse_4s_ease_infinite]',
                    'grid-area-1-1',
                    'w-[4px]',
                    'h-[4px]',
                    'bg-dark/7',
                    'rounded',
                    'dark:bg-light/8',
                )}
            ></div>
        </div>
        <div
            className={tcls(
                'w-[2px]',
                'h-[7px]',
                'bg-dark/7',
                'rounded',
                'dark:bg-light/8',
                'translate-y-[calc(6px)]',
                'translate-x-[calc(10px)]',
                'will-change-transform',
            )}
        ></div>
    </div>
);

const WarningIcon = () => (
    <div className={tcls('grid', 'w-[22px]', 'h-[22px]')}>
        <div
            className={tcls(
                'grid-area-1-1',
                'translate-y-[calc(4px)]',
                'translate-x-[calc(10px)]',
                'will-change-transform',
            )}
        >
            <div
                className={tcls(
                    'animate-[wiggleAlt_4s_ease_infinite_forwards]',
                    'bg-dark/7',
                    'w-[2px]',
                    'h-[7px]',
                    'rounded',
                    'dark:bg-yellow/8',
                    'will-change-transform',
                )}
            ></div>
        </div>

        <div
            className={tcls(
                'grid-area-1-1',
                'grid',
                'w-[4px]',
                'h-[4px]',
                'translate-y-[calc(12px)]',
                'translate-x-[calc(9px)]',
                'will-change-transform',
            )}
        >
            <div
                className={tcls(
                    'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dark/2 from-0% via-dark/2 via-55% to-dark to-100%',
                    'grid-area-1-1',
                    'w-[4px]',
                    'h-[4px]',
                    'rounded',
                    'dark:from-light/2 dark:via-light/2 dark:to-light/8',
                )}
            ></div>
            <div
                className={tcls(
                    'grid-area-1-1',
                    'w-[4px]',
                    'h-[4px]',
                    'bg-dark/7',
                    'rounded',
                    'dark:bg-yellow/8',
                )}
            ></div>
        </div>
        <div
            className={tcls(
                'w-[14px]',
                'h-[14px]',
                'grid',
                'justify-center',
                'items-center',
                'content-center',
                'translate-y-[calc(-7px)]',
                'translate-x-[calc(4px)]',
            )}
        >
            <div
                className={tcls(
                    'triangle',
                    'grid-area-1-1',
                    'opacity-6',
                    'dark:bg-yellow',
                    'dark:opacity-3',
                )}
            ></div>
        </div>
    </div>
);

const DangerIcon = () => (
    <div className={tcls('grid', 'w-[22px]', 'h-[22px]')}>
        <div
            className={tcls(
                'grid-area-1-1',
                'translate-y-[calc(4px)]',
                'translate-x-[calc(10px)]',
                'will-change-transform',
            )}
        >
            <div
                className={tcls(
                    'animate-[wiggleAlt_4s_ease_infinite_forwards]',
                    'bg-dark/7',
                    'w-[2px]',
                    'h-[7px]',
                    'rounded',
                    'dark:bg-pomegranate/8',
                    'will-change-transform',
                )}
            ></div>
        </div>

        <div
            className={tcls(
                'grid-area-1-1',
                'grid',
                'w-[4px]',
                'h-[4px]',
                'translate-y-[calc(12px)]',
                'translate-x-[calc(9px)]',
                'will-change-transform',
            )}
        >
            <div
                className={tcls(
                    'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dark/2 from-0% via-dark/2 via-55% to-dark to-100%',
                    'grid-area-1-1',
                    'w-[4px]',
                    'h-[4px]',
                    'rounded',
                    'dark:from-light/2 dark:via-light/2 dark:to-light/8',
                )}
            ></div>
            <div
                className={tcls(
                    'grid-area-1-1',
                    'w-[4px]',
                    'h-[4px]',
                    'bg-dark/7',
                    'rounded',
                    'dark:bg-pomegranate/8',
                )}
            ></div>
        </div>
        <div
            className={tcls(
                'w-[22px]',
                'h-[24px]',
                'grid',
                'justify-center',
                'items-center',
                'content-center',
                'translate-y-[calc(-9px)]',
                'translate-x-[calc(0.25px)]',
            )}
        >
            <svg
                className={tcls(
                    'grid-area-1-1',
                    'text-pomegranate/6',
                    'dark:text-pomegranate/4',
                    'animate-[pulse_4s_ease_infinite]',
                )}
                width="100%"
                height="100%"
                viewBox="0 0 18 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M8.09091 0.524864C8.65346 0.200077 9.34654 0.200077 9.90909 0.524864L16.7512 4.47514C17.3137 4.79992 17.6603 5.40015 17.6603 6.04973V13.9503C17.6603 14.5998 17.3137 15.2001 16.7512 15.5249L9.90909 19.4751C9.34654 19.7999 8.65346 19.7999 8.09091 19.4751L1.24884 15.5249C0.686289 15.2001 0.339746 14.5998 0.339746 13.9503V6.04973C0.339746 5.40015 0.686289 4.79992 1.24884 4.47514L8.09091 0.524864Z"
                    fill="currentColor"
                />
            </svg>
        </div>
    </div>
);

const SuccessIcon = () => (
    <div className={tcls('grid', 'w-[22px]', 'h-[22px]')}>
        <div
            className={tcls(
                'grid-area-1-1',
                'grid',
                'translate-y-[calc(7px)]',
                'translate-x-[calc(5px)]',
                'will-change-transform',
                'z-[1]',
                'relative',
            )}
        >
            <svg
                className={tcls('grid-area-1-1', 'text-dark/6', 'dark:text-teal')}
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    className={tcls('animate-[stroke_8s_ease_infinite_forwards]')}
                    pathLength="100"
                    d="M1.5 3.5L4 6L9 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
            <svg
                className={tcls('grid-area-1-1', 'text-dark/5', 'dark:text-teal/6')}
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    pathLength="100"
                    d="M1.5 3.5L4 6L9 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </div>
        <div
            className={tcls(
                'grid-area-1-1',
                'w-[21px]',
                'h-[21px]',
                'grid',
                'rounded',
                'bg-sky',
                'dark:shadow-sky/1',
                'dark:bg-teal/4',
                'justify-center',
                'items-center',
                'content-center',
                'translate-y-[calc(0px)]',
                'translate-x-[calc(0px)]',
            )}
        ></div>
    </div>
);

const HINT_STYLES: {
    [style in DocumentBlockHint['data']['style']]: {
        icon: React.ComponentType;
        style: ClassValue;
    };
} = {
    info: {
        icon: InfoIcon,
        style: [
            'bg-gradient-to-b',
            'from-dark/2',
            'to-dark/1',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-light/[0.02]',
            'dark:from-light/[0.03]',
            'dark:to-light/1',
        ],
    },
    warning: {
        icon: WarningIcon,
        style: [
            'bg-gradient-to-b',
            'from-yellow/6',
            'to-yellow/5',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-yellow/[0.02]',
            'dark:from-yellow/1',
            'dark:to-yellow/2',
        ],
    },
    danger: {
        icon: DangerIcon,
        style: [
            'bg-gradient-to-b',
            'from-pomegranate/4',
            'to-pomegranate/3',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-pomegranate/1',
            'dark:from-pomegranate/1',
            'dark:to-pomegranate/2',
        ],
    },
    success: {
        icon: SuccessIcon,
        style: [
            'bg-gradient-to-b',
            'from-teal/4',
            'to-teal/3',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-teal/1',
            'dark:from-teal/1',
            'dark:to-teal/2',
        ],
    },
};
