import { describe, expect, it } from 'bun:test';

import { parseMarkdown } from './markdown';

describe('parseMarkdown', () => {
    it('should parse a simple table', async () => {
        const result = await parseMarkdown(`## Table

| a | b  |  c |  d  |
| - | :- | -: | :-: |`);

        expect(result).toMatchSnapshot();
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

        expect(result).toMatchSnapshot();
    });

    it('should parse html', async () => {
        const result = await parseMarkdown(
            '<div style="\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 1rem;\n">\n  <div style="\n  display: flex;\n  align-items: center;\n  font-family: monospace;\n  font-weight: 800;\n">\n  <div style="color: #EC7063; margin-right: 0.3rem; font-size: 16px;">\n    ID:\n  </div>\n  <div style="color: #515A5A; font-size: 14px;">\n    get_trending_events\n  </div>\n</div>\n\n  <div>\n  <div>\n<span style="\n  border-radius: 10px;\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem;\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n  margin-right: 1rem;\n  background-color: rgb(16, 185, 129);\n  display: flex;\n  align-items: center;\n">\n  <span style="fill: #fff; height: 1em; width: 1em; display: inline-flex; margin-right: 0.4rem;">\n    <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">\n      <path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z"/>\n</svg>\n  </span>\n  <span style="font-weight: 500; font-family: monospace; color: #fff;">\n    sports_events_trending\n  </span>\n</span>\n</div>\n\n</div>\n\n</div>\n<div style="display: flex; margin-bottom: 0.5rem; font-size: small;">\n  <span style="\n  border-radius: 20px;\n  border-style: solid;\n  padding-top: 0.15rem;\n  padding-bottom: 0.15rem;\n  padding-left: 0.45rem;\n  padding-right: 0.45rem;\n  margin-right: 0.5rem;\n  border-color: #1D8348;\n  color: #1D8348;\n  align-items: center;\n  font-weight: 500;\n">\n    Sports\n</span>\n<span style="\n  border-radius: 20px;\n  border-style: solid;\n  padding-top: 0.15rem;\n  padding-bottom: 0.15rem;\n  padding-left: 0.45rem;\n  padding-right: 0.45rem;\n  margin-right: 0.5rem;\n  border-color: #515A5A;\n  color: #515A5A;\n  align-items: center;\n  font-weight: 500;\n">\n    Personalization\n</span>\n\n</div>\n\nReturns trending events for the given time frame.\n\nThe events are sorted by `trending score`.\n\n<div style="\n  border-left: 5px solid rgb(0,184,212);\n  border-radius: .1rem;\n  box-shadow: 0 0.2rem 0.5rem rgb(0 0 0 / 5%), 0 0.025rem 0.05rem rgb(0 0 0 / 5%);\n  margin: 1.5625em 0;\n  color: rgba(0,0,0,0.87);\n  font-size: .85rem;\n">\n  <div style="\n    background-color:rgba(0,184,212,.1);\n    display: flex;\n    align-items: center;\n    padding: .4rem .6rem 0.4rem;\n  ">\n    <span style="fill: rgb(0,184,212); height: 1em; width: 1em; display: inline-flex; margin-right: 0.4rem;">\n      <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">\n        <path d="M1152 1376v-160q0-14-9-23t-23-9h-96v-512q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v160q0 14 9 23t23 9h96v320h-96q-14 0-23 9t-9 23v160q0 14 9 23t23 9h448q14 0 23-9t9-23zm-128-896v-160q0-14-9-23t-23-9h-192q-14 0-23 9t-9 23v160q0 14 9 23t23 9h192q14 0 23-9t9-23zm640 416q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z"/>\n</svg>\n    </span>\n    <span style="font-weight: 700;">\n      Trending score\n    </span>\n  </div>\n  <div style="padding: 1.6rem 0.6rem;">\n    \nTo calculate trending score for an event, each bet placed on this event\ncontributes a value determined by how recently the bet was placed.\n\nRecent bets add more value than older ones.\n\nThe normalized value of its score is also assigned to each event as its confidence.\n\n  </div>\n</div>\n\n\n<div style="\n  border-left: 5px solid rgb(124,77,255);\n  border-radius: .1rem;\n  box-shadow: 0 0.2rem 0.5rem rgb(0 0 0 / 5%), 0 0.025rem 0.05rem rgb(0 0 0 / 5%);\n  margin: 1.5625em 0;\n  color: rgba(0,0,0,0.87);\n  font-size: .85rem;\n">\n  <div style="\n    background-color:rgba(124,77,255,.1);\n    display: flex;\n    align-items: center;\n    padding: .4rem .6rem 0.4rem;\n  ">\n    <span style="fill: rgb(124,77,255); height: 1em; width: 1em; display: inline-flex; margin-right: 0.4rem;">\n      <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">\n        <path d="M381 1620q0 80-54.5 126t-135.5 46q-106 0-172-66l57-88q49 45 106 45 29 0 50.5-14.5t21.5-42.5q0-64-105-56l-26-56q8-10 32.5-43.5t42.5-54 37-38.5v-1q-16 0-48.5 1t-48.5 1v53h-106v-152h333v88l-95 115q51 12 81 49t30 88zm2-627v159h-362q-6-36-6-54 0-51 23.5-93t56.5-68 66-47.5 56.5-43.5 23.5-45q0-25-14.5-38.5t-39.5-13.5q-46 0-81 58l-85-59q24-51 71.5-79.5t105.5-28.5q73 0 123 41.5t50 112.5q0 50-34 91.5t-75 64.5-75.5 50.5-35.5 52.5h127v-60h105zm1409 319v192q0 13-9.5 22.5t-22.5 9.5h-1216q-13 0-22.5-9.5t-9.5-22.5v-192q0-14 9-23t23-9h1216q13 0 22.5 9.5t9.5 22.5zm-1408-899v99h-335v-99h107q0-41 .5-121.5t.5-121.5v-12h-2q-8 17-50 54l-71-76 136-127h106v404h108zm1408 387v192q0 13-9.5 22.5t-22.5 9.5h-1216q-13 0-22.5-9.5t-9.5-22.5v-192q0-14 9-23t23-9h1216q13 0 22.5 9.5t9.5 22.5zm0-512v192q0 13-9.5 22.5t-22.5 9.5h-1216q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1216q13 0 22.5 9.5t9.5 22.5z"/>\n</svg>\n    </span>\n    <span style="font-weight: 700;">\n      Filtering example\n    </span>\n  </div>\n  <div style="padding: 1.6rem 0.6rem;">\n    \nIn this example we get all trending events where `league` is `UEFA Champions League`.\n\n```bash\n$ curl --request GET \\\n  --url \'https://api.vaix.ai/api/sports/events/trending?filters=league%3Aeq%3AUEFA%20Champions%20League\'\n```\n\n  </div>\n</div>\n\n'
        );

        expect(result).toMatchSnapshot();
    });
});
