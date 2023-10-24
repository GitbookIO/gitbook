import { SVGProps } from 'react';

export function IconArrowRight(props: Partial<SVGProps<SVGSVGElement>>) {
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
                d="M9.076 3.576a.6.6 0 0 1 .848 0l4 4a.6.6 0 0 1 0 .848l-4 4a.6.6 0 0 1-.848-.848L12.052 8.6H2.5a.6.6 0 0 1 0-1.2h9.552L9.076 4.424a.6.6 0 0 1 0-.848Z"
                clipRule="evenodd"
            />
        </svg>
    );
}
