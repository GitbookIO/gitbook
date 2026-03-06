import { SingleChoiceControlDef } from './SingleChoiceControl';

const CONTROLS = [SingleChoiceControlDef];

export type AnyAIControlTool = (typeof CONTROLS)[number];
export type AnyAIControl = ReturnType<AnyAIControlTool['createControl']>;

export function getControlTools(): AnyAIControlTool[] {
    return CONTROLS;
}
