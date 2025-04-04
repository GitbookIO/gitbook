'use client';

import { tcls } from '@/lib/tailwind';
import { useTransition } from 'react';
import { Button, type ButtonProps } from './Button';

export function LoadingButton({ href, onClick, className, ...rest }: ButtonProps & { onClick: () => Promise<void> }) {
    const [isPending, startTransition] = useTransition();

    const handleClick = (e) => {
        e.preventDefault();
        startTransition(onClick);
        return false;
    }
    return <Button className={tcls(className, isPending ? 'animate-pulse' : '')} {...rest} onClick={handleClick} />
}
