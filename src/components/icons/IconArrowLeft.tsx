import { SVGProps } from 'react';

export function IconArrowLeft(props: Partial<SVGProps<SVGSVGElement>>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 16 16"
            preserveAspectRatio="xMidYMid meet"
            {...props}
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M6.924 3.576a.6.6 0 0 1 0 .848L3.95 7.4H13.5a.6.6 0 1 1 0 1.2H3.949l2.975 2.976a.6.6 0 0 1-.848.848l-4-4a.6.6 0 0 1 0-.848l4-4a.6.6 0 0 1 .848 0Z"
                clipRule="evenodd"
            />
        </svg>
    );
}
