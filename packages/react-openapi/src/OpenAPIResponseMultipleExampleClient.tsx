'use client';

import { OpenAPIV3 } from '@scalar/openapi-types';
import React, { cloneElement, ReactNode } from 'react';

export function OpenAPIResponseMultipleExampleClient(props: {
    examples: OpenAPIV3.ExampleObject[];
    children: ReactNode;
}) {
    const { examples, children: Comp } = props;

    const examplesWithId = examples.map((example, index) => ({
        ...example,
        id: `example-${index}`,
    }));

    const [selectedExample, setSelectedExample] = React.useState(examplesWithId[0]);

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = examplesWithId.find((ex) => ex.id === e.target.value);

        if (!selected) return;

        setSelectedExample(selected);
    };

    return (
        <>
            {/* {typeof children === 'function' ? children({ example: selectedExample }) : children} */}

            {cloneElement(Comp, { code: selectedExample?.value })}

            <div className="openapi-tabs-footer">
                <select onChange={handleSelect} value={selectedExample?.id}>
                    {examplesWithId.map((example, index) => (
                        <option key={index} value={example.id}>
                            {example.summary || `Example ${index + 1}`}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
}
