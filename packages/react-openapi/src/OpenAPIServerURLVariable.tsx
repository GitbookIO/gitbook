'use client';

import * as React from 'react';
import classNames from 'classnames';
import { OpenAPIV3 } from 'openapi-types';

/**
 * Interactive component to show the value of a server variable and let the user change it.
 */
export function OpenAPIServerURLVariable(props: {
    name: string;
    variable: OpenAPIV3.ServerVariableObject;
}) {
    const { variable } = props;

    if (variable.enum && variable.enum.length > 0) {
        return (<select
            className={classNames(
                'openapi-section-select',
                'openapi-select',
            )}
            value={variable.default}
        >
            {
                variable.enum?.map((value: string) => {
                    return (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    );
                }) ?? null}
        </select>);

    }
    return <span className={classNames('openapi-url-var')}>{variable.default}</span>;
}
