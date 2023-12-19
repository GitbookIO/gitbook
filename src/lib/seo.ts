import { Collection, ContentVisibility, Space } from '@gitbook/api';

/**
 * Return true if a space should be indexed by search engines.
 */
export function shouldIndexSpace({
    space,
    collection,
}: {
    space: Space;
    collection: Collection | null;
}) {
    if (process.env.GITBOOK_BLOCK_SEARCH_INDEXATION) {
        return false;
    }

    if (space.visibility === ContentVisibility.InCollection) {
        return collection ? shouldIndexVisibility(collection.visibility) : false;
    }

    return shouldIndexVisibility(space.visibility);
}

function shouldIndexVisibility(visibility: ContentVisibility) {
    return visibility === ContentVisibility.Public;
}
