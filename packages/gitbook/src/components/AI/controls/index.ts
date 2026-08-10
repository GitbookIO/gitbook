import { ConfirmControlDef } from './ConfirmControl';
import { MultiChoiceControlDef } from './MultiChoiceControl';
import { SingleChoiceControlDef } from './SingleChoiceControl';

const CONTROLS = [SingleChoiceControlDef, MultiChoiceControlDef, ConfirmControlDef];

export type AnyAIControlTool = (typeof CONTROLS)[number];
export type AnyAIControl = ReturnType<AnyAIControlTool['createControl']>;

export function getControlTools(): AnyAIControlTool[] {
    return CONTROLS.filter((control) => control.exposeAsTool);
}
