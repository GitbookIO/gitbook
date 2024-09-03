'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import classNames from 'classnames';
import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIClientContext } from './types';

/**
 * Interactive component to show the value of a server variable and let the user change it.
 */
export function OpenAPIServerURLVariable(props: {
    name: string;
    variable: OpenAPIV3.ServerVariableObject;
    enumIndex?: number;
}) {
    const { enumIndex, name, variable } = props;

    if (variable.enum && variable.enum.length > 0) {
        return (
            <EnumSelect
                name={name}
                variable={variable}
                value={
                    !isNaN(Number(enumIndex))
                        ? enumIndex
                        : variable.enum.findIndex((v) => v === variable.default)
                }
            />
        );
    }

    return <span className={classNames('openapi-url-var')}>{variable.default}</span>;
}

/**
 * Render a select if there is an enum for a Server URL variable
 */
function EnumSelect(props: {
    value?: number;
    name: string;
    variable: OpenAPIV3.ServerVariableObject;
}) {
    const { value, name, variable } = props;
    return (
        <select
            name={name}
            onChange={(e) => {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
            }}
            className={classNames('openapi-select')}
            value={value}
        >
            {variable.enum?.map((value: string, index: number) => {
                return (
                    <option key={value} value={index}>
                        {value}
                    </option>
                );
            }) ?? null}
        </select>
    );
}
