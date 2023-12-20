import { ContentRef, DocumentTableRecord } from '@gitbook/api';

/**
 * Get the value for a column in a record.
 */
export function getRecordValue<T extends number | string | boolean | string[] | ContentRef>(
    record: DocumentTableRecord,
    definitionId: string,
): T {
    // @ts-ignore
    return record.values[definitionId];
}
