# Content references

Content references are a concept in the GitBook API for linking between spaces, pages, anchors, files, and other entities. A definition of a content reference can be found in the OpenAPI spec under `api.ContentRef`.

Every link in GitBook - even to external URLs - is defined as a content reference.

Content references can be, by design, relative. We call "resolving a content ref" the process of taking a potentially relative ref along with the current context of the user and producing an absolute link:

```typescript
async function resolveContentRef(contentRef: api.ContentRef, context: GitBookSpaceContext): Promise<ResolvedContentRef>;
```

Relative content references are resolved against the context:

```typescript
const ref = { kind: 'page', page: 'my-page-id' }; // a relative ref to a page in the current space
const resolved = await resolveContentRef(ref, { space: 'my-space-id' });
// resolved.url = ../../my-page-id

const resolved = await resolveContentRef(ref, { space: 'another-space-id' });
// resolved == null, because the page does not exist here
```

## Reusable Content

Reusable content presents an interesting challenge for content references:

- Reusable content belongs to a parent space.
- All content refs defined in the reusable content will be relative to the parent space. For example, for a content ref inside `my-space`, `{ kind: page, page: 'my-page-id' }` refers to the page `my-page-id` inside `my-space`.
- When reusable content is used in pages within the parent space, all links remain relative to the space.
- When reusable content is used across other spaces, we must resolve the refs relative to the containing space (not the parent).

See the [ReusableContent](../components/DocumentView/ReusableContent.tsx) component for how we construct the `GitBookSpaceContext`, and [resolveContentRef](./references.tsx) for the `resolveContentRef` implementation.



