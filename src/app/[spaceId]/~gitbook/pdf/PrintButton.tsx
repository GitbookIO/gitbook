'use client';

import * as React from 'react';

import { PolymorphicComponentProp } from '@/components/utils/types';

export function PrintButton(props: PolymorphicComponentProp<'button'>) {
    const { className, children, ...rest } = props;

    const onClick = React.useCallback(() => {
        window.print();
    }, []);

    React.useEffect(() => {
        if (process.env.NODE_ENV !== 'development') {
            onClick();
        }
    }, [onClick]);

    return (
        <button {...rest} onClick={onClick} className={className}>
            {children}
        </button>
    );
}
