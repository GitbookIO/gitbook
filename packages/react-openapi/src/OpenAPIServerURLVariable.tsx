'use client';

import clsx from 'clsx';
import type { OpenAPIV3 } from '@gitbook/openapi-parser';

/**
 * Interactive component to show the value of a server variable and let the user change it.
 */
export function OpenAPIServerURLVariable(props: {
    name: string;
    variable: OpenAPIV3.ServerVariableObject;
}) {
    const { variable } = props;
    return <span className={clsx('openapi-url-var')}>{variable.default}</span>;
}
