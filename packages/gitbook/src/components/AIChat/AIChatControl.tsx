'use client';

import type { AnyAIControl } from '../AI/controls';

export function AIChatControl(props: { control: AnyAIControl }) {
    const { control } = props;
    return control.render();
}
