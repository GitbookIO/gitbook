import { ConfirmControlDef } from './ConfirmControl';
import { SingleChoiceControlDef } from './SingleChoiceControl';

const CONTROLS = [SingleChoiceControlDef, ConfirmControlDef];

export type AnyAIControlTool = (typeof CONTROLS)[number];
export type AnyAIControl = ReturnType<AnyAIControlTool['createControl']>;

export function getControlTools(): AnyAIControlTool[] {
    return CONTROLS.filter((control) => control.exposeAsTool);
}
