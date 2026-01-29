'use client';

import type { ComponentPropsWithRef } from 'react';

export function PrintButton(props: Omit<ComponentPropsWithRef<'button'>, 'onClick'>) {
    return <button {...props} data-testid="print-button" onClick={() => window.print()} />;
}
