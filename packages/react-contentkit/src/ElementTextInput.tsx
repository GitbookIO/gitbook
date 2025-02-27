'use client';

import type { ContentKitTextInput } from '@gitbook/api';
import type React from 'react';

import classNames from 'classnames';
import { useContentKitClientContext } from './context';
import { getStateStringValue } from './dynamic';
import type { ContentKitClientElementProps } from './types';

export function ElementTextInput(props: ContentKitClientElementProps<ContentKitTextInput>) {
    const { element } = props;
    const clientContext = useContentKitClientContext();

    const value =
        getStateStringValue(clientContext.state, element.state) ?? element.initialValue ?? '';

    const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
        clientContext.setState({
            [element.state]: event.target.value,
        });
    };

    if (element.multiline) {
        return (
            <textarea
                disabled={element.disabled}
                className={classNames('contentkit-textinput')}
                value={value}
                placeholder={element.placeholder}
                onChange={onChange}
                rows={4}
            />
        );
    }

    return (
        <input
            type={element.inputType ?? 'text'}
            disabled={element.disabled}
            className={classNames('contentkit-textinput')}
            value={value}
            placeholder={element.placeholder}
            onChange={onChange}
        />
    );
}
