import * as Popover from "@radix-ui/react-popover";

import { tcls } from "@/lib/tailwind";

export const PopoverContent = ({ children, className, ...props }: { children: React.ReactNode; className?: string } & Popover.PopoverContentProps) => <Popover.Content
    {...props}
    className={tcls(
        'text-sm bg-light ring-1 ring-dark/2 rounded shadow-1xs shadow-dark/1 [&_p]:leading-snug dark:bg-dark dark:ring-light/2 dark:shadow-dark/4 -outline-offset-2 outline-2 outline-primary/8 z-20',
        className
    )}
    sideOffset={5}
>
    {children}
</Popover.Content>;

export const PopoverArrow = () => <Popover.Arrow asChild>
    <svg
        width="100%"
        viewBox="0 0 8 5"
        preserveAspectRatio="xMaxYMid meet"
        className='relative z-[2] fill-light stroke-dark/2 [paint-order:stroke_fill] dark:fill-dark dark:stroke-light/2'
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clipPath="url(#clipAnnotation)">
            <path
                d="M0 0L4 4L8 0"
                strokeWidth="2"
                strokeLinecap="round"
                stroke="inherit"
                fill="inherit"
            />
        </g>
        <defs>
            <clipPath id="clipAnnotation">
                <rect width="8" height="5" fill="white" />
            </clipPath>
        </defs>
    </svg>
</Popover.Arrow>;