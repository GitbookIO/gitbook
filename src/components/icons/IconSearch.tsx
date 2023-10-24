import { SVGProps } from 'react';

export function IconSearch(props: Partial<SVGProps<SVGSVGElement>>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            {...props}
        >
            <path fill="currentColor" fillRule="evenodd" d="M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM2 10.5a8.5 8.5 0 1 1 17 0 8.5 8.5 0 0 1-17 0Z" clipRule="evenodd" /><path fill="currentColor" fillRule="evenodd" d="M15.093 15.093a1 1 0 0 1 1.414 0l5.2 5.2a1 1 0 0 1-1.414 1.414l-5.2-5.2a1 1 0 0 1 0-1.414Z" clipRule="evenodd" /></svg>
    );
};