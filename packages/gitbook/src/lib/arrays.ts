/**
 * Partition an array into equal (+ rest items) parts.
 * Adapted from https://stackoverflow.com/a/68917937
 */
export function partition(
    /**
     * Array to split up
     */
    array: any[],
    /**
     * Amount of parts you want to split into
     */
    parts: number
) {
    const rest = array.length % parts;
    const size = Math.floor(array.length / parts);
    let j = 0;

    return Array.from({ length: Math.min(array.length, parts) }, (_, i) =>
        array.slice(j, (j += size + (i < rest ? 1 : 0)))
    );
}
