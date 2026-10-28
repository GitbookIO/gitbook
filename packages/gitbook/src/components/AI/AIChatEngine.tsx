'use client';

import assertNever from 'assert-never';
import * as React from 'react';

import {
    AIMessageRole,
    AIMessageStepPhase,
    type AIStreamResponse,
    type AIMessageContext,
    type AIStreamResponseToolCallPending,
    SiteInsightsDisplayContext,
} from '@gitbook/api';

import { getInsightsSession } from '../Insights';
import { ConfirmControlDef, ConfirmControlOutputSchema } from './controls/ConfirmControl';
import { type RenderAIMessageOptions, streamAIChatResponse } from './server-actions';
import { getTools } from './tools';
import {
    type AIChatMessageActivity,
    type StreamAIChatInput,
    type StreamAIChatResponse,
    globalState,
} from './useAIChat';
import { useLeaveAgentFeedbackTool, useLeaveUserFeedbackTool } from './useLeaveFeedbackTools';
import { useNavigateToPageTool } from './useNavigateToPageTool';
import {
    type ResponseToRate,
    useSubmitAssistantFeedbackTool,
} from './useSubmitAssistantFeedbackTool';
import { useSubmitPageFeedbackTool } from './useSubmitPageFeedbackTool';
import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';

/**
 * Streams AI responses and runs the assistant's tools; mounted by `AIChatProvider` on first use.
 */
export function AIChatEngine(props: {
    renderMessageOptions?: RenderAIMessageOptions;
    withPageFeedback: boolean;
    messageContextRef: React.RefObject<AIMessageContext>;
    responseToRateRef: React.RefObject<ResponseToRate>;
    reportedAgentFeedbackRef: React.RefObject<boolean>;
    postMessageRef: React.RefObject<((input: { message: string }) => void) | null>;
    engineRef: React.RefObject<StreamAIChatResponse | null>;
    pendingStreams: StreamAIChatInput[];
}) {
    const {
        renderMessageOptions,
        withPageFeedback,
        messageContextRef,
        responseToRateRef,
        reportedAgentFeedbackRef,
        postMessageRef,
        engineRef,
        pendingStreams,
    } = props;

    const language = useLanguage();
    const displayContext = renderMessageOptions?.asEmbeddable
        ? SiteInsightsDisplayContext.Embed
        : SiteInsightsDisplayContext.Site;
    const getResponseToRate = React.useCallback(() => responseToRateRef.current, []);

    // Built-in tools exposed to the assistant (e.g. navigating to a page, submitting page or
    // assistant feedback). Each tool has a stable identity, so it can be referenced directly from
    // the streaming callback.
    const navigateToPageTool = useNavigateToPageTool();
    const submitPageFeedbackTool = useSubmitPageFeedbackTool({ displayContext });
    const submitAssistantFeedbackTool = useSubmitAssistantFeedbackTool({
        displayContext,
        getResponseToRate,
    });
    const leaveAgentFeedbackTool = useLeaveAgentFeedbackTool({
        asEmbeddable: renderMessageOptions?.asEmbeddable,
        displayContext,
        reportedRef: reportedAgentFeedbackRef,
    });
    const leaveUserFeedbackTool = useLeaveUserFeedbackTool({
        asEmbeddable: renderMessageOptions?.asEmbeddable,
        displayContext,
    });

    // The assistant-feedback tool is always available (it mirrors the chat's own thumbs up/down
    // rating), while the tools carrying the reader's own feedback are gated on the site's
    // "Was this helpful?" setting.
    const builtInTools = React.useMemo(() => {
        const tools = [navigateToPageTool, submitAssistantFeedbackTool, leaveAgentFeedbackTool];
        if (withPageFeedback) {
            tools.push(submitPageFeedbackTool, leaveUserFeedbackTool);
        }
        return tools;
    }, [
        navigateToPageTool,
        submitAssistantFeedbackTool,
        leaveAgentFeedbackTool,
        leaveUserFeedbackTool,
        submitPageFeedbackTool,
        withPageFeedback,
    ]);

    // Stream a message with the AI backend
    const streamResponse = React.useCallback(
        async (input: StreamAIChatInput) => {
            globalState.setState((state) => {
                return {
                    ...state,
                    followUpSuggestions: [],
                    control: null,
                    responding: true,
                    loading: true,
                    error: false,
                    messages: [
                        ...state.messages,
                        {
                            role: AIMessageRole.Assistant,
                            content: null, // Placeholder for streaming response
                            activity: getDefaultAIChatMessageActivity(),
                        },
                    ],
                };
            });

            // A stream becomes stale once a newer turn (or a clear) has replaced its
            // query. Because `responding` clears on `response_finish` — before follow-up
            // suggestions finish streaming — the user can start a new turn while this one
            // is still wrapping up. A stale stream must not mutate the shared
            // loading/responding state, which now belongs to the active turn; otherwise
            // it would make the UI look idle mid-response. (`userQuery` is only set for
            // user-initiated turns, not tool-call continuations.)
            const isSuperseded = () =>
                !!input.userQuery && globalState.getState().query !== input.userQuery;

            // Execute a tool call
            const executeToolCall = async (event: AIStreamResponseToolCallPending) => {
                const tools = getTools(builtInTools);
                const toolDef = tools.find((tool) => tool.name === event.toolCall.tool);

                if (!toolDef || !('execute' in toolDef)) {
                    throw new Error(`Tool ${event.toolCall.tool} not found`);
                }

                try {
                    const result = await toolDef.execute(event.toolCall.input);
                    await streamResponse({
                        toolCall: {
                            tool: event.toolCall.tool,
                            toolCallId: event.toolCallId,
                            output: result.output,
                            summary: result.summary,
                        },
                    });
                } catch (error) {
                    await streamResponse({
                        toolCall: {
                            tool: event.toolCall.tool,
                            toolCallId: event.toolCallId,
                            output: {
                                error: error instanceof Error ? error.message : 'Unknown error',
                            },
                            summary: {
                                icon: 'bomb',
                                text: 'An error occurred while executing the tool',
                            },
                        },
                    });
                }
            };

            let toolToExecute: AIStreamResponseToolCallPending | null = null;
            try {
                const tools = getTools(builtInTools);
                const stream = await streamAIChatResponse({
                    message: input.message,
                    toolCall: input.toolCall,
                    messageContext: messageContextRef.current,
                    previousResponseId: globalState.getState().responseId ?? undefined,
                    session: await getInsightsSession(),
                    tools: tools.map((tool) => ({
                        name: tool.name,
                        description: tool.description,
                        // Issue with the schema generated by Zod and Next.js serialization.
                        inputSchema: tool.inputSchema,
                    })),
                    options: {
                        withLinkPreviews: renderMessageOptions?.withLinkPreviews ?? true,
                        withToolCalls: renderMessageOptions?.withToolCalls ?? true,
                        asEmbeddable: renderMessageOptions?.asEmbeddable ?? false,
                    },
                });

                // Process streaming response
                for await (const data of stream) {
                    if (!data) continue;

                    if (isSuperseded()) {
                        // Chat was cleared or a newer turn started; stop processing.
                        break;
                    }

                    const event = data.event;

                    switch (event.type) {
                        case 'response_finish': {
                            globalState.setState((state) => ({
                                ...state,
                                responseId: event.response.id ?? null,
                                // Mark as not responding when the response is finished
                                // Even if the stream might continue as we receive 'response_followup_suggestion'
                                responding: false,
                                error: false,
                            }));
                            break;
                        }
                        case 'response_followup_suggestion': {
                            globalState.setState((state) => ({
                                ...state,
                                followUpSuggestions: [
                                    ...state.followUpSuggestions,
                                    ...event.suggestions,
                                ],
                            }));
                            break;
                        }
                        case 'response_tool_call_pending': {
                            const toolDef = tools.find((tool) => tool.name === event.toolCall.tool);
                            if (!toolDef) {
                                throw new Error(`Tool ${event.toolCall.tool} not found`);
                            }

                            if ('createControl' in toolDef) {
                                globalState.setState((state) => ({
                                    ...state,
                                    control: toolDef.createControl({
                                        context: {
                                            toolCall: event.toolCall,
                                            toolCallId: event.toolCallId,
                                        },
                                        input: event.toolCall.input as any,
                                        language,
                                        send: async (result) => {
                                            await streamResponse({
                                                toolCall: {
                                                    tool: event.toolCall.tool,
                                                    toolCallId: event.toolCallId,
                                                    output: result.output,
                                                    summary: result.summary,
                                                },
                                            });
                                        },
                                    }),
                                }));
                                break;
                            }

                            const confirmation = 'confirmation' in toolDef && toolDef.confirmation;
                            if (confirmation) {
                                // The confirmation can be a static object or a function that
                                // derives it from the AI-provided input (e.g. dynamic context).
                                // The function call is awaited because, for embed-registered
                                // tools, it arrives as an async proxy over the postMessage channel.
                                const resolvedConfirmation =
                                    typeof confirmation === 'function'
                                        ? await confirmation(event.toolCall.input)
                                        : confirmation;
                                const supportingContext =
                                    typeof resolvedConfirmation.context === 'string'
                                        ? resolvedConfirmation.context.slice(0, 512)
                                        : undefined;
                                globalState.setState((state) => ({
                                    ...state,
                                    control: ConfirmControlDef.createControl({
                                        context: {
                                            toolCall: event.toolCall,
                                            toolCallId: event.toolCallId,
                                        },
                                        input: {
                                            label: resolvedConfirmation.label,
                                            icon: resolvedConfirmation.icon,
                                            context: supportingContext,
                                        },
                                        language,
                                        send: async (result) => {
                                            const output = ConfirmControlOutputSchema.parse(
                                                result.output
                                            );
                                            switch (output.result) {
                                                case 'cancelled': {
                                                    await streamResponse({
                                                        toolCall: {
                                                            tool: event.toolCall.tool,
                                                            toolCallId: event.toolCallId,
                                                            output: { cancelled: true },
                                                            summary: {
                                                                icon: 'forward',
                                                                text: tString(
                                                                    language,
                                                                    'tool_call_skipped',
                                                                    resolvedConfirmation.label
                                                                ),
                                                            },
                                                        },
                                                    });
                                                    break;
                                                }
                                                case 'confirmed':
                                                    await executeToolCall(event);
                                                    break;
                                                default:
                                                    assertNever(output.result);
                                            }
                                        },
                                    }),
                                }));
                                break;
                            }

                            toolToExecute = event;
                            break;
                        }
                    }

                    // Update the assistant message with streamed content
                    globalState.setState((state) => ({
                        ...state,
                        messages: [
                            ...state.messages.slice(0, -1),
                            {
                                role: AIMessageRole.Assistant,
                                content: data.content,
                                activity: updateAIChatMessageActivity(
                                    state.messages[state.messages.length - 1]?.activity ??
                                        getDefaultAIChatMessageActivity(),
                                    event
                                ),
                            },
                        ],
                    }));
                }

                // If a newer turn replaced this one while we were finishing (e.g.
                // streaming follow-up suggestions after `response_finish`), abandon this
                // stale stream without executing leftover tools or clearing the shared
                // loading/responding state, which now belongs to the active turn.
                if (isSuperseded()) {
                    return;
                }

                // Execute the tool call if it doesn't require confirmation.
                // When a tool call (or control) keeps the turn going, `loading`
                // stays true: either the recursive `streamResponse` will clear it
                // when its stream settles, or it is cleared below once the loop ends
                // (e.g. while waiting on a user confirmation control).
                if (toolToExecute) {
                    await executeToolCall(toolToExecute);
                } else {
                    globalState.setState((state) => ({
                        ...state,
                        responding: false,
                        loading: false,
                        error: false,
                    }));

                    // Turn settled: send the next queued follow-up (oldest first). Held back while a
                    // control is pending, since posting would throw; it flushes after that resolves.
                    const { queuedMessages, control: activeControl } = globalState.getState();
                    const [next, ...rest] = queuedMessages;
                    if (next !== undefined && !activeControl) {
                        globalState.setState((state) => ({ ...state, queuedMessages: rest }));
                        postMessageRef.current?.({ message: next });
                    }
                }
            } catch (error) {
                console.error('Error streaming AI response', error);
                // Don't surface a stale stream's error onto the active turn.
                if (!isSuperseded()) {
                    globalState.setState((state) => ({
                        ...state,
                        responding: false,
                        loading: false,
                        error: true,
                    }));
                }
            }
        },
        [
            messageContextRef.current,
            renderMessageOptions?.withLinkPreviews,
            renderMessageOptions?.withToolCalls,
            renderMessageOptions?.asEmbeddable,
            language,
            builtInTools,
        ]
    );

    engineRef.current = streamResponse;

    // Send what was posted while this module was loading.
    React.useEffect(() => {
        for (const input of pendingStreams.splice(0)) {
            void streamResponse(input);
        }
    }, [streamResponse, pendingStreams]);

    return null;
}

function updateAIChatMessageActivity(
    activity: AIChatMessageActivity,
    event: AIStreamResponse
): AIChatMessageActivity {
    switch (event.type) {
        case 'response_step_start': {
            return {
                ...activity,
                currentPhase: event.phase,
                hasFinalAnswer:
                    activity.hasFinalAnswer || event.phase === AIMessageStepPhase.FinalAnswer,
            };
        }
        case 'response_document': {
            // A commentary phase can start without ever producing anything visible. Only a
            // commentary step that emits document content is a real preamble worth collapsing
            // behind the activity heading, so flag it here rather than on phase start.
            return {
                ...activity,
                hasCommentary:
                    activity.hasCommentary ||
                    (activity.currentPhase === AIMessageStepPhase.Commentary &&
                        event.blocks.length > 0),
            };
        }
        case 'response_tool_call': {
            return {
                ...activity,
                toolCount: activity.toolCount + 1,
            };
        }
        default:
            return activity;
    }
}

function getDefaultAIChatMessageActivity(): AIChatMessageActivity {
    return {
        currentPhase: undefined,
        toolCount: 0,
        hasCommentary: false,
        hasFinalAnswer: false,
    };
}
