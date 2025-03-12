'use client';

import * as React from 'react';

import type { PolymorphicComponentProp } from '@/components/utils/types';

export function PrintButton(props: PolymorphicComponentProp<'button'>) {
    const { className, children, ...rest } = props;

    const onClick = React.useCallback(() => {
        window.print();
    }, []);

    return (
        <button {...rest} data-testid="print-button" onClick={onClick} className={className}>
            {children}
        </button>
    );
}
