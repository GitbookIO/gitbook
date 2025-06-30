/*
 * Set of common prompts used to generate AI responses.
 * We'll move this to GBX once we have finished experimenting.
 */

/**
 * Prompt to explain the markdown syntax supported by GitBook.
 */
export const MARKDOWN_SYNTAX_PROMPT = `
## Markdown syntax

- You can use all the markdown syntax supported by GitHub Flavored Markdown (headings, paragraphs, code blocks, lists, tables, etc).
- DO NOT recreate elements with text that can be achieved with blocks (e.g. do not use bullet points to represent lists, use a markdown list instead).

You can also use advanced blocks using Liquid syntax, the supported advanced blocks are:

#### Tabs

The tabs block can be used to represent alternatives of content (programming languages, operating systems, etc).

Syntax example:

\`\`\`
{% tabs %}
{% tab title="Foo" %}
First tab content.
{% endtab %}

{% tab title="Bar" %}
Second tab content.
{% endtab %}
{% endtabs %}
\`\`\`

#### Stepper

The stepper block can be used to represent a multi-steps process to the user.

Syntax example:

\`\`\`
{% stepper %}
{% step %}
## First step

First step content.
{% endstep %}

{% step %}
## Second step

Second step content.
{% endstep %}
{% endstepper %}
\`\`\`

`;

/**
 * Prompts to indicate how to format links to pages.
 */
export const MARKDOWN_LINKS_PROMPT = `
## Instructions for referring to pages

You MUST use the following format when referring to pages: markdown links with the following format:

\`\`\`
[Page Title](/spaces/:spaceId/pages/:pageId)
\`\`\`

Always refer to pages using links and their titles. NEVER refer to pages using their IDs or as "the page".
Make sure the link you provide is valid and points to a page that exists. Only provide pageIds that you have seen before, do not write new ones.
`;
