import { Icon } from '@gitbook/icons';

import { SimplifiedFileType } from '@/lib/files';

/**
 * Render an appropriate icon for a file.
 */
export function FileIcon(props: { contentType: SimplifiedFileType | null; className: string }) {
    const { contentType, className } = props;

    switch (contentType) {
        case 'pdf':
            return <Icon icon="file-pdf" className={className} />;
        case 'image':
            return <Icon icon="file-image" className={className} />;
        case 'archive':
            return <Icon icon="file-archive" className={className} />;
        default:
            return <Icon icon="file-download" className={className} />;
    }
}
