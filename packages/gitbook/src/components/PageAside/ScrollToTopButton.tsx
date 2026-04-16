'use client';
import type { ComponentPropsWithRef } from 'react';

export function ScrollToTopButton(props: ComponentPropsWithRef<'button'>) {
    return (
        <button
            {...props}
            onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
        />
    );
}
