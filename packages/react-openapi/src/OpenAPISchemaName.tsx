import classNames from 'classnames';
import { OpenAPIV3 } from 'openapi-types';
import React from 'react';
import { OpenAPISchemaPropertyEntry } from './OpenAPISchema';

interface OpenAPISchemaNameProps {
    propertyName?: string | JSX.Element;
    required?: boolean;
    type?: string;
    deprecated?: boolean;
}

export function OpenAPISchemaName(props: OpenAPISchemaNameProps): JSX.Element {
    const { type, propertyName, required, deprecated } = props;

    return (
        <div className={classNames('openapi-schema-name')}>
            {propertyName ? (
                <span
                    data-deprecated={deprecated}
                    className={classNames('openapi-schema-propertyname')}
                >
                    {propertyName}
                </span>
            ) : null}
            {type ? <span className={classNames('openapi-schema-type')}>{type}</span> : null}
            {required ? (
                <span className={classNames('openapi-schema-required')}>required</span>
            ) : null}
            {deprecated ? (
                <span className={classNames('openapi-deprecated')}>Deprecated</span>
            ) : null}
        </div>
    );
}
