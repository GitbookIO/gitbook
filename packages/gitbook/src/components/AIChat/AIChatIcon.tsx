import type React from 'react';

interface AIChatIconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
    size?: number;
}

const AIChatIcon = ({ className = 'size-4', size, ...props }: AIChatIconProps) => {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...(size && { width: size, height: size })}
            {...props}
        >
            <title>Docs Assistant</title>
            <path
                d="M12.8916 1.06265C12.921 0.979101 13.0392 0.979127 13.0685 1.06267C13.239 1.5478 13.3439 1.84646 13.516 2.1032C13.6683 2.33042 13.8578 2.53033 14.0766 2.6945C14.3239 2.88 14.6165 3.00068 15.0919 3.19671C15.1761 3.23142 15.1761 3.3506 15.0919 3.38531C14.6165 3.58134 14.3239 3.70203 14.0766 3.88752C13.8578 4.05169 13.6683 4.2516 13.516 4.47882C13.3439 4.73556 13.239 5.03423 13.0685 5.51937C13.0392 5.60291 12.921 5.60292 12.8916 5.51938C12.7212 5.03423 12.6162 4.73557 12.4442 4.47882C12.2919 4.2516 12.1023 4.05169 11.8835 3.88752C11.6363 3.70202 11.3436 3.58134 10.8682 3.38531C10.7841 3.3506 10.7841 3.23141 10.8683 3.1967C11.3436 3.00067 11.6363 2.87999 11.8835 2.6945C12.1023 2.53033 12.2919 2.33042 12.4442 2.1032C12.6162 1.84646 12.7212 1.54779 12.8916 1.06265Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
            <path
                d="M9.479 10.2734C9.479 11.2369 8.6115 11.2578 7.54138 11.2578C6.47126 11.2578 5.60376 11.2369 5.60376 10.2734"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
            <path
                d="M9.47913 6.77344L9.47913 7.77344"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
            <path
                d="M5.60388 6.77344L5.60388 7.77344"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
            <path
                d="M13.2813 8.875L13.2813 10.125C13.2813 12.3341 11.4904 14.125 9.28125 14.125L1.80165 14.125L1.80165 6.78125C1.80165 4.57211 3.59251 2.78125 5.80165 2.78125L7.67889 2.78125"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default AIChatIcon;
