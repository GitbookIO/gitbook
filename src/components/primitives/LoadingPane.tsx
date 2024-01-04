import { ClassValue, tcls } from '@/lib/tailwind';

type TileSizes = 12 | 24 | 48 | 96;

export const LoadingPane = (props: {
    style?: ClassValue;
    tile?: TileSizes;
    pulse?: boolean;
    gridStyle?: ClassValue;
}) => {
    const { style, tile, pulse, gridStyle } = props;

    const tileStyle = (() => {
        switch (tile) {
            case 12:
                return '[mask:conic-gradient(from_90deg_at_1px_1px,_#0000_90deg,_#0003_0)_calc(50%+1px)_calc(0%+47px)_/_12px_12px]';
            case 24:
                return '[mask:conic-gradient(from_90deg_at_1px_1px,_#0000_90deg,_#0003_0)_calc(50%+1px)_calc(0%+47px)_/_24px_24px]';
            case 48:
                return '[mask:conic-gradient(from_90deg_at_1px_1px,_#0000_90deg,_#0003_0)_calc(50%+1px)_calc(0%+47px)_/_48px_48px]';
            case 96:
                return '[mask:conic-gradient(from_90deg_at_1px_1px,_#0000_90deg,_#0003_0)_calc(50%+1px)_calc(0%+47px)_/_96px_96px]';
            default:
                return '[mask:conic-gradient(from_90deg_at_1px_1px,_#0000_90deg,_#0003_0)_calc(50%+1px)_calc(0%+47px)_/_48px_48px]';
        }
    })();

    return (
        <div
            className={tcls(
                'ring-1',
                'ring-dark/2',
                'overflow-hidden',
                'relative',
                'grid',
                'dark:ring-light/1',
                style,
            )}
        >
            <div
                className={tcls(
                    'w-full',
                    'bg-dark-4/4',
                    'dark:bg-light-3/1',
                    'grid',
                    'grid-area-1-1',
                    'overflow-hidden',
                    tileStyle,
                )}
            >
                <div
                    className={tcls(
                        'aspect-square',
                        'from-dark-5',
                        'to-transparent',
                        'grid-area-1-1',
                        'relative',
                        'origin-[50%_50%]',
                        'top-[50%]',
                        'self-stretch',
                        'bg-transparent',
                        'will-change-transform',

                        pulse
                            ? 'animate-[pulseAlt_6s_cubic-bezier(.44,.12,.29,.94)_infinite]'
                            : 'animate-[rotateLoop_2s_linear_infinite]',
                        pulse
                            ? `[background-image:radial-gradient(circle_closest-side,_var(--tw-gradient-stops)_0,_var(--tw-gradient-stops)_33%,_var(--tw-gradient-stops)_66%)]`
                            : `[background-image:conic-gradient(from_-90deg_at_50%_50%,_var(--tw-gradient-stops)_0deg,_var(--tw-gradient-stops)_90deg,_var(--tw-gradient-stops)_280deg)]`,
                        pulse
                            ? ['from-primary-600/7', 'dark:from-primary-200']
                            : ['dark:from-light-5/6'],
                        gridStyle,
                    )}
                ></div>
                {/*                 <div
                    className={tcls(
                        'w-full',
                        'h-[inherit]',
                        'grid-area-1-1',
                        'bg-light',
                        'dark:bg-dark',
                        '[mask-position:50%_0%]',
                        tileStyle,
                    )}
                ></div> */}
            </div>
        </div>
    );
};
