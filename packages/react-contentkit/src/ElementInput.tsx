import type {
    ContentKitButton,
    ContentKitCheckbox,
    ContentKitCodeBlock,
    ContentKitInput,
    ContentKitRadio,
    ContentKitSelect,
    ContentKitSwitch,
    ContentKitTextInput,
} from '@gitbook/api';
import classNames from 'classnames';
import { ElementButton } from './ElementButton';
import { ElementCodeBlock } from './ElementCodeBlock';
import { ElementIcon } from './ElementIcon';
import { ElementTextInput } from './ElementTextInput';
import type { ContentKitServerContext } from './types';

export function ElementInput(props: {
    element: ContentKitInput;
    context: ContentKitServerContext;
    state: object;
}) {
    const { element, context, state } = props;
    const { label, element: childElement } = element;

    return (
        <div className={classNames('contentkit-form')}>
            {label ? <label className="contentkit-label">{label}</label> : null}
            {getInputElement({ element: childElement, context, state })}
        </div>
    );
}

function getInputElement(props: {
    element:
        | ContentKitTextInput
        | ContentKitSelect
        | ContentKitSwitch
        | ContentKitRadio
        | ContentKitCheckbox
        | ContentKitButton
        | ContentKitCodeBlock;
    context: ContentKitServerContext;
    state: object;
}) {
    const { element, context, state } = props;

    //!!TODO add support for:
    // - select
    // - switch
    // - radio
    // - checkbox

    switch (element.type) {
        case 'textinput':
            return <ElementTextInput element={element} />;
        case 'button':
            return (
                <ElementButton
                    element={element}
                    icon={
                        element.icon ? <ElementIcon icon={element.icon} context={context} /> : null
                    }
                    trailingIcon={
                        element.trailingIcon ? (
                            <ElementIcon icon={element.trailingIcon} context={context} />
                        ) : null
                    }
                />
            );
        case 'codeblock':
            return <ElementCodeBlock element={element} context={context} state={state} />;
    }
}
