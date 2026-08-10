import type { GitBookIntegrationTool } from '@gitbook/browser-types';
import { integrationsAssistantTools } from '../Integrations';
import { type AnyAIControlTool, getControlTools } from './controls';

export function getTools(
    builtInTools: GitBookIntegrationTool[] = []
): (GitBookIntegrationTool | AnyAIControlTool)[] {
    const integrationTools = integrationsAssistantTools.getState().tools;
    return [...getControlTools(), ...builtInTools, ...integrationTools];
}
