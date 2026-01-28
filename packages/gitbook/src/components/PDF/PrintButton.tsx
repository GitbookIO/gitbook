'use client';

import type { ComponentPropsWithRef } from 'react';

export function PrintButton(props: ComponentPropsWithRef<'button'>) {
    return <button {...props} data-testid="print-button" onClick={() => window.print()} />;
}
