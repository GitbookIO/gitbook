import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import type React from 'react';

interface AIChatIconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
    size?: number;
    state?: 'default' | 'intro' | 'thinking' | 'working' | 'done' | 'error' | 'confirm';
    trademark?: boolean;
}

export const AIChatIcon = ({
    className = 'size-4',
    size,
    trademark = true,
    state = 'default',
    ...props
}: AIChatIconProps) => {
    if (!trademark) {
        return (
            <Icon
                icon="sparkle"
                className={tcls(
                    className,
                    (state === 'thinking' || state === 'working') &&
                        'animate-[spin_2s_infinite_forwards_cubic-bezier(0.16,1,0.3,1)]',
                    state === 'intro' && 'animate-[spin_2s_forwards_cubic-bezier(0.16,1,0.3,1)]'
                )}
            />
        );
    }

    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            preserveAspectRatio="xMaxYMid meet"
            className={className}
            aria-busy={state === 'thinking'}
            overflow="visible"
            {...props}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>GitBook Assistant</title>

            {/* Sparkle */}
            <path
                d="M12.8916 1.06265C12.921 0.979101 13.0392 0.979127 13.0685 1.06267C13.239 1.5478 13.3439 1.84646 13.516 2.1032C13.6683 2.33042 13.8578 2.53033 14.0766 2.6945C14.3239 2.88 14.6165 3.00068 15.0919 3.19671C15.1761 3.23142 15.1761 3.3506 15.0919 3.38531C14.6165 3.58134 14.3239 3.70203 14.0766 3.88752C13.8578 4.05169 13.6683 4.2516 13.516 4.47882C13.3439 4.73556 13.239 5.03423 13.0685 5.51937C13.0392 5.60291 12.921 5.60292 12.8916 5.51938C12.7212 5.03423 12.6162 4.73557 12.4442 4.47882C12.2919 4.2516 12.1023 4.05169 11.8835 3.88752C11.6363 3.70202 11.3436 3.58134 10.8682 3.38531C10.7841 3.3506 10.7841 3.23141 10.8683 3.1967C11.3436 3.00067 11.6363 2.87999 11.8835 2.6945C12.1023 2.53033 12.2919 2.33042 12.4442 2.1032C12.6162 1.84646 12.7212 1.54779 12.8916 1.06265Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
                className={tcls(
                    state === 'intro' &&
                        'animate-[fadeIn_.5s_.7s_both,spin_2s_1s_forwards_cubic-bezier(.43,1.54,.64,1)]',
                    (state === 'working' || state === 'thinking') &&
                        'animate-[fadeIn_.5s_.3s_both,spin_2s_1s_infinite_forwards_cubic-bezier(0.16,1,0.3,1)]',
                    state === 'done' && 'animate-[fadeOut_.5s_both]',
                    state === 'confirm' && 'animate-[fadeOut_.5s_both]',
                    state === 'default' && 'animate-[fadeIn_0s_both]',
                    state === 'error' && 'hidden'
                )}
                style={{ transformOrigin: '13px 3.5px' }}
            />

            {/* Error */}
            <g
                clipPath="url(#clip0_153_2034)"
                className={tcls(
                    'text-danger-subtle',
                    state === 'error' ? 'animate-[fadeIn_.5s_.3s_both]' : 'hidden'
                )}
            >
                <path
                    d="M13.0312 1.42059L13.0312 3.95184"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
                <path
                    d="M13.0312 6.00253V6.00263"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
            </g>

            {/* Check */}
            <path
                d="M10.8051 3.71161L12.2401 5.27411L14.823 2.14911"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={tcls(
                    state === 'done'
                        ? 'animate-[fadeIn_.5s_.3s_both]'
                        : 'animate-[fadeOut_.5s_both]',
                    state === 'intro' && 'hidden',
                    state === 'confirm' && 'hidden'
                )}
            />

            {/* Confirm */}
            <path
                className={tcls(
                    'fill-primary-9',
                    state === 'confirm'
                        ? 'animate-[fadeIn_.5s_.3s_both,bounceSmall_1s_infinite_both]'
                        : state === 'thinking'
                          ? 'animate-[fadeOut_.5s_both]'
                          : 'hidden'
                )}
                d="M12.9463 5.24512C13.3688 5.24422 13.713 5.58625 13.7139 6.00879C13.7146 6.43114 13.3725 6.77338 12.9502 6.77441C12.5279 6.77505 12.1845 6.43408 12.1836 6.01172C12.1828 5.58953 12.5242 5.24649 12.9463 5.24512ZM13.0391 0.0751953C14.0688 0.0730893 14.9049 0.90586 14.9072 1.93555C14.9084 2.5063 14.6484 3.04679 14.2012 3.40137L13.7773 3.7373C13.6151 3.86604 13.5201 4.06239 13.5205 4.26953V4.30371C13.5211 4.62139 13.2639 4.879 12.9463 4.87988C12.6288 4.88032 12.3701 4.62417 12.3691 4.30664V4.27246C12.3679 3.71272 12.6238 3.18263 13.0625 2.83496L13.4854 2.49902C13.6565 2.36341 13.7562 2.1568 13.7559 1.93848C13.755 1.54463 13.4358 1.22503 13.042 1.22559H12.9385C12.488 1.22679 12.1225 1.59352 12.123 2.04395L12.124 2.21875C12.1245 2.53649 11.8676 2.79522 11.5498 2.7959C11.2321 2.79653 10.9746 2.53928 10.9736 2.22168L10.9727 2.04688C10.9706 0.960578 11.8493 0.0778178 12.9355 0.0751953H13.0391Z"
            />

            {/* Background */}
            <path
                d="M3.5625 8.78512L7.26347 10.9219C7.88227 11.2791 8.64467 11.2791 9.26347 10.9219L14.25 8.0429C14.5833 7.85045 15 8.09101 15 8.47591V10.2777C15 10.4563 14.9047 10.6214 14.75 10.7107L9.26347 13.8784C8.64467 14.2356 7.88228 14.2356 7.26347 13.8784L3.5625 11.7416C2.70833 11.2978 1 9.93199 1 8.01949M1 8.01949C1 6.6448 1.84765 5.98698 2.62903 5.71701C3.15426 5.53555 3.71577 5.70568 4.19701 5.98353L7.26347 7.75395C7.88228 8.11122 8.64467 8.11122 9.26347 7.75395L10.9095 6.80362M1 8.01949C1 6.4945 2.03973 5.30731 2.5596 4.90434L7.37937 2.12165C7.79013 1.88449 8.26417 1.80476 8.71747 1.88245"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={tcls(state === 'intro' && 'animate-[fadeIn_2s_forwards]')}
            />

            {/* Logo */}
            <mask
                id="mask0_220_25"
                style={{ maskType: 'alpha' }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="1"
                width="16"
                height="14"
            >
                <path
                    d="M3.5625 8.78512L7.26347 10.9219C7.88227 11.2791 8.64467 11.2791 9.26347 10.9219L14.25 8.0429C14.5833 7.85045 15 8.09101 15 8.47591V10.2777C15 10.4563 14.9047 10.6214 14.75 10.7107L9.26347 13.8784C8.64467 14.2356 7.88228 14.2356 7.26347 13.8784L3.5625 11.7416C2.70833 11.2978 1 9.93199 1 8.01949M1 8.01949C1 6.6448 1.84765 5.98698 2.62903 5.71701C3.15426 5.53555 3.71577 5.70568 4.19701 5.98353L7.26347 7.75395C7.88228 8.11122 8.64467 8.11122 9.26347 7.75395L10.9095 6.80362M1 8.01949C1 6.4945 2.03973 5.30731 2.5596 4.90434L7.37937 2.12165C7.79013 1.88449 8.26417 1.80476 8.71747 1.88245"
                    stroke="currentColor"
                    pathLength="100"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </mask>
            <g mask="url(#mask0_220_25)">
                <path
                    d="M3.5625 8.78512L7.26347 10.9219C7.88227 11.2791 8.64467 11.2791 9.26347 10.9219L14.25 8.0429C14.5833 7.85045 15 8.09101 15 8.47591V10.2777C15 10.4563 14.9047 10.6214 14.75 10.7107L9.26347 13.8784C8.64467 14.2356 7.88228 14.2356 7.26347 13.8784L3.5625 11.7416C2.70833 11.2978 1 9.93199 1 8.01949C1 6.6448 1.84765 5.98698 2.62903 5.71701C3.15426 5.53555 3.71577 5.70568 4.19701 5.98353L7.26347 7.75395C7.88228 8.11122 8.64467 8.11122 9.26347 7.75395L14.1991 4.90434L9.37937 2.12165C8.76057 1.76438 7.99907 1.76386 7.38027 2.12113C5.89314 2.97972 3.20298 4.53289 2.5596 4.90434C1.77376 5.35804 1 6.11597 1.00148 7.9207"
                    stroke="currentColor"
                    pathLength="100"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={tcls(
                        (state === 'thinking' || state === 'working') &&
                            'animate-[pathLoading_2s_infinite_both]',
                        state === 'intro' && 'animate-[pathEnter_2s_both]',
                        state === 'done' && 'animate-[pathEnter_1s_forwards_ease]'
                    )}
                />
            </g>
        </svg>
    );
};
