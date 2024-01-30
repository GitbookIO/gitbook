'use client';

import classNames from 'classnames';
import { OpenAPIV3 } from 'openapi-types';
import React from 'react';

/**
 * Interactive component to show the value of a server variable and let the user change it.
 */
export function OpenAPIServerURLVariable(props: {
    name: string;
    variable: OpenAPIV3.ServerVariableObject;
}) {
    const { variable } = props;
    return <span className={classNames('openapi-url-var')}>{variable.default}</span>;
}
