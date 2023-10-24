/**
 * Check if the document contains one block that should be rendered in full-width mode.
 */
export function hasFullWidthBlock(document: any): boolean {
    return document.nodes.some((node) => {
        return node.data.fullWidth || node.type === 'images';
    });
}
