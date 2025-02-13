interface OpenAPISchemaNameProps {
    propertyName?: string | JSX.Element;
    required?: boolean;
    type?: string;
    deprecated?: boolean;
}

/**
 * Display the schema name row.
 * It includes the property name, type, required and deprecated status.
 */
export function OpenAPISchemaName(props: OpenAPISchemaNameProps): JSX.Element {
    const { type, propertyName, required, deprecated } = props;

    return (
        <div className="openapi-schema-name">
            {propertyName ? (
                <span data-deprecated={deprecated} className="openapi-schema-propertyname">
                    {propertyName}
                </span>
            ) : null}
            {type ? <span className="openapi-schema-type">{type}</span> : null}
            {required ? <span className="openapi-schema-required">required</span> : null}
            {deprecated ? <span className="openapi-deprecated">Deprecated</span> : null}
        </div>
    );
}
