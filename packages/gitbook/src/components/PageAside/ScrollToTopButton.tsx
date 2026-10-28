'use client';
import type { ComponentPropsWithRef } from 'react';

export function ScrollToTopButton(props: Omit<ComponentPropsWithRef<'button'>, 'type'>) {
    return (
        <button
            {...props}
            type="button"
            onClick={(event) => {
                props.onClick?.(event);

                if (!event.isDefaultPrevented()) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }}
        />
    );
}
