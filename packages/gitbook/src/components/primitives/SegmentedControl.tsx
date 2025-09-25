import { type ClassValue, tcls } from '@/lib/tailwind';
import { Button, type ButtonProps } from './Button';

export function SegmentedControl(props: { children: React.ReactNode; className?: ClassValue }) {
    const { children, className } = props;

    return (
        <div
            role="toolbar"
            aria-orientation="horizontal"
            className={tcls(
                'flex flex-wrap gap-1 circular-corners:rounded-3xl rounded-corners:rounded-lg bg-tint p-1',
                className
            )}
        >
            {children}
        </div>
    );
}

export function SegmentedControlItem(props: ButtonProps) {
    const { size = 'medium', className, ...rest } = props;

    return (
        <Button
            variant="blank"
            size={size}
            className={tcls(
                'shrink grow justify-center whitespace-normal not-contrast-more:data-[active=true]:bg-tint-base',
                className
            )}
            {...rest}
        />
    );
}
