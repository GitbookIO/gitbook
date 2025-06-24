/*
 * Set of common prompts used to generate AI responses.
 * We'll move this to GBX once we have finished experimenting.
 */

/**
 * Prompt to explain the markdown syntax supported by GitBook.
 */
export const MARKDOWN_SYNTAX_PROMPT = `
## Markdown syntax

You can use all the markdown syntax supported by GitHub Flavored Markdown (headings, paragraphs, code blocks, lists, tables, etc).

And you also can use advanced blocks using Liquid syntax, the supported advanced blocks are:

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
