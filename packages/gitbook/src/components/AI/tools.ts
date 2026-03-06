import type { GitBookIntegrationTool } from '@gitbook/browser-types';
import { integrationsAssistantTools } from '../Integrations';
import { type AnyAIControlTool, getControlTools } from './controls';

export function getTools(): (GitBookIntegrationTool | AnyAIControlTool)[] {
    const integrationTools = integrationsAssistantTools.getState().tools;
    return [...getControlTools(), ...integrationTools];
}
