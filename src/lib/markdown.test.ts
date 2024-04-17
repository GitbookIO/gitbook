import { describe, it, expect } from 'bun:test';

import { parseMarkdown } from './markdown';

describe('parseMarkdown', () => {
    it('should parse a simple table', async () => {
        const result = await parseMarkdown(`## Table

| a | b  |  c |  d  |
| - | :- | -: | :-: |`);

        expect(result).toContain('<table>');
    });

    it('should parse a complex table', async () => {
        const result =
            await parseMarkdown(`Returns information for all non-fungible tokens for an account.

## Ordering
When considering NFTs, their order is governed by a combination of their numerical **token.Id** and **serialnumber** values, with **token.id** being the parent column.
A serialnumbers value governs its order within the given token.id

In that regard, if a user acquired a set of NFTs in the order (2-2, 2-4 1-5, 1-1, 1-3, 3-3, 3-4), the following layouts illustrate the ordering expectations for ownership listing
1. **All NFTs in ASC order**: 1-1, 1-3, 1-5, 2-2, 2-4, 3-3, 3-4
2. **All NFTs in DESC order**: 3-4, 3-3, 2-4, 2-2, 1-5, 1-3, 1-1
3. **NFTs above 1-1 in ASC order**: 1-3, 1-5, 2-2, 2-4, 3-3, 3-4
4. **NFTs below 3-3 in ASC order**: 1-1, 1-3, 1-5, 2-2, 2-4
5. **NFTs between 1-3 and 3-3 inclusive in DESC order**: 3-4, 3-3, 2-4, 2-2, 1-5, 1-3

Note: The default order for this API is currently DESC

## Filtering
When filtering there are some restrictions enforced to ensure correctness and scalability.

**The table below defines the restrictions and support for the NFT ownership endpoint**

| Query Param   | Comparison Operator | Support | Description           | Example |
| ------------- | ------------------- | ------- | --------------------- | ------- |
| token.id      | eq                  | Y       | Single occurrence only. | ?token.id=X |
|               | ne                  | N       | | |
|               | lt(e)               | Y       | Single occurrence only. | ?token.id=lte:X |
|               | gt(e)               | Y       | Single occurrence only. | ?token.id=gte:X |
| serialnumber  | eq                  | Y       | Single occurrence only. Requires the presence of a **token.id** query | ?serialnumber=Y |
|               | ne                  | N       | | |
|               | lt(e)               | Y       | Single occurrence only. Requires the presence of an **lte** or **eq** **token.id** query | ?token.id=lte:X&serialnumber=lt:Y |
|               | gt(e)               | Y       | Single occurrence only. Requires the presence of an **gte** or **eq** **token.id** query | ?token.id=gte:X&serialnumber=gt:Y |
| spender.id    | eq                  | Y       | | ?spender.id=Z |
|               | ne                  | N       | | |
|               | lt(e)               | Y       | | ?spender.id=lt:Z |
|               | gt(e)               | Y       | | ?spender.id=gt:Z |

Note: When searching across a range for individual NFTs a **serialnumber** with an additional **token.id** query filter must be provided.
Both filters must be a single occurrence of **gt(e)** or **lt(e)** which provide a lower and or upper boundary for search.`);

        expect(result).toContain('<table>');
    });
});
