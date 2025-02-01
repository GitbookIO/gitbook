import classNames from 'classnames';
import { OpenAPIV3 } from 'openapi-types';
import React from 'react';
import { OpenAPISchemaPropertyEntry } from './OpenAPISchema';

interface OpenAPISchemaNameProps {
    propertyName?: string | JSX.Element;
    required?: boolean;
    type: string;
}

export function OpenAPISchemaName(props: OpenAPISchemaNameProps): JSX.Element {
    const { type, propertyName, required } = props;

    return (
        <div className={classNames('openapi-schema-name')}>
            {propertyName ? (
                <span className={classNames('openapi-schema-propertyname')}>{propertyName}</span>
            ) : null}
            <span className={classNames('openapi-schema-type')}>{type}</span>
            {required ? (
                <span className={classNames('openapi-schema-required')}>required</span>
            ) : null}
        </div>
    );
}
