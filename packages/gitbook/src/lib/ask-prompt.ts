/**
 * Describe the `ask` and `goal` query parameters of the ask endpoint, for agent-facing prompts.
 */
export function renderAskParametersDescription(): string {
    return `\`ask\` is the immediate question: it should be specific, self-contained, and written in natural language.
\`goal\` is what the user is ultimately trying to achieve, the reason they need the answer. Sharing it helps GitBook give you a better, more relevant answer. A goal is most helpful when it describes the outcome the user wants rather than restating the question. For example, with \`ask=how do I create an API token\`, a goal like \`build a script that syncs our docs to a CMS\` lets GitBook tailor the answer to that use case.`;
}
