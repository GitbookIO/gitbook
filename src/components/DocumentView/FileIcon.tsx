import IconDownload from '@geist-ui/icons/download';
import IconFileText from '@geist-ui/icons/fileText';
import IconImage from '@geist-ui/icons/image';
import IconPaperClip from '@geist-ui/icons/paperclip';

import { SimplifiedFileType } from '@/lib/files';

/**
 * Render an appropriate icon for a file.
 */
export function FileIcon(props: { contentType: SimplifiedFileType | null }) {
    const { contentType } = props;

    switch (contentType) {
        case 'pdf':
            return <IconFileText />;
        case 'image':
            return <IconImage />;
        case 'archive':
            return <IconPaperClip />;
        default:
            return <IconDownload />;
    }
}
