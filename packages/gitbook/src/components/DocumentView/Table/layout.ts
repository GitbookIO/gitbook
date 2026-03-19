import type { DocumentBlockTable, DocumentTableViewGrid } from '@gitbook/api';

export function hasVisibleHeader(block: DocumentBlockTable, view: DocumentTableViewGrid): boolean {
    return (
        !view.hideHeader &&
        view.columns.some(
            (columnId) => (block.data.definition[columnId]?.title.trim().length ?? 0) > 0
        )
    );
}
