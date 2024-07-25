import { SVGProps } from 'react';

export function IconChevronDown(props: Partial<SVGProps<SVGSVGElement>>) {
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
                d="M12.424 5.576a.6.6 0 0 1 0 .848l-4 4a.6.6 0 0 1-.848 0l-4-4a.6.6 0 0 1 .848-.848L8 9.15l3.576-3.575a.6.6 0 0 1 .848 0Z"
                clipRule="evenodd"
            />
        </svg>
    );
}
