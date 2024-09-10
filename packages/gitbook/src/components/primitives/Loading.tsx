import { SVGProps } from 'react';

import { tcls } from '@/lib/tailwind';

export const Loading = (props: Partial<SVGProps<SVGSVGElement>>) => {
    return (
        <svg
            width="100%"
            viewBox="0 0 128 116"
            preserveAspectRatio="xMaxYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-busy
            {...props}
        >
            <path
                className={tcls('animate-[pathLoading_2s_ease_infinite_forwards]')}
                d="M6 59.5V56.291C6 45.8865 11.5194 36.263 20.5 31.0091V31.0091L60.9857 7.32407C63.4452 5.88525 66.4843 5.86317 68.9643 7.26611L116 33.8734L70.4183 60.2148C67.9468 61.6431 64.9014 61.6462 62.4269 60.223L29.9772 41.5592C19.3106 35.4242 6 43.1236 6 55.4288V64.8776C6 73.4486 10.5708 81.3691 17.9918 85.6575L54.59 106.807C62.0198 111.1 71.1766 111.1 78.6064 106.807L116.364 84.9874C120.074 82.8432 122.36 78.883 122.36 74.5975V59.2647C122.36 57.7248 120.692 56.7626 119.359 57.5331L72.6023 84.5529C68.8874 86.6996 64.309 86.6996 60.5941 84.5529L26 64.5617"
                stroke="currentColor"
                pathLength="100"
                fill="none"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6 59.5V56.291C6 45.8865 11.5194 36.263 20.5 31.0091V31.0091L60.9857 7.32407C63.4452 5.88525 66.4843 5.86317 68.9643 7.26611L116 33.8734L70.4183 60.2148C67.9468 61.6431 64.9014 61.6462 62.4269 60.223L29.9772 41.5592C19.3106 35.4242 6 43.1236 6 55.4288V64.8776C6 73.4486 10.5708 81.3691 17.9918 85.6575L54.59 106.807C62.0198 111.1 71.1766 111.1 78.6064 106.807L116.364 84.9874C120.074 82.8432 122.36 78.883 122.36 74.5975V59.2647C122.36 57.7248 120.692 56.7626 119.359 57.5331L72.6023 84.5529C68.8874 86.6996 64.309 86.6996 60.5941 84.5529L26 64.5617"
                stroke="currentColor"
                pathLength="100"
                strokeOpacity="0.24"
                fill="none"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
