'use client';

import * as React from 'react';

import { PolymorphicComponentProp } from '@/components/utils/types';

export function PrintButton(props: PolymorphicComponentProp<'button'>) {
    const { className, children, ...rest } = props;

    const onClick = React.useCallback(() => {
        window.print();
    }, []);

    return (
        <button {...rest} onClick={onClick} className={className}>
            {children}
        </button>
    );
}
