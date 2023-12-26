'use client';

import * as React from 'react';

export function OpenPrintDialog(props: {}) {
    React.useEffect(() => {
        if (process.env.NODE_ENV !== 'development') {
            window.print();
        }
    }, []);

    return null;
}
