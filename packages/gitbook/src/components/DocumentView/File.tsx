import { type DocumentBlockFile, SiteInsightsLinkPosition } from '@gitbook/api';

import { getSimplifiedContentType } from '@/lib/files';
import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
import type { BlockProps } from './Block';
import { Caption } from './Caption';
import { FileIcon } from './FileIcon';

export async function File(props: BlockProps<DocumentBlockFile>) {
    const { block, context } = props;

    const contentRef = context.contentContext
        ? await resolveContentRef(block.data.ref, context.contentContext)
        : null;
    const file = contentRef?.file;

    if (!file) {
        return null;
    }

    const contentType = getSimplifiedContentType(file.contentType);

    return (
        <Caption {...props} withBorder>
            <Link
                href={file.downloadURL}
                download={file.name}
                insights={{
                    type: 'link_click',
                    link: {
                        target: block.data.ref,
                        position: SiteInsightsLinkPosition.Content,
                    },
                }}
                className={tcls('group/file', 'flex', 'flex-row', 'items-center', 'px-5', 'py-3')}
            >
                <div
                    className={tcls(
                        'min-w-14',
                        'mr-5',
                        'pr-5',
                        'flex',
                        'flex-col',
                        'items-center',
                        'gap-1',
                        'border-r',
                        'border-tint-subtle'
                    )}
                >
                    <div>
                        <FileIcon
                            contentType={contentType}
                            className={tcls('size-5', 'text-primary')}
                        />
                    </div>
                    <div
                        className={tcls(
                            'text-xs',
                            'text-tint',
                            'group-hover/file:text-tint-strong'
                        )}
                    >
                        {getHumanFileSize(file.size)}
                    </div>
                </div>
                <div>
                    <div className={tcls('text-base')}>{file.name}</div>
                    <div className={tcls('text-sm', 'opacity-9', 'dark:opacity-8')}>
                        {contentType}
                    </div>
                </div>
            </Link>
        </Caption>
    );
}

const ONE_KB = 1024;
const ONE_MB = ONE_KB * 1024;

/**
 * Return a file size as human readable formatted string.
 */
function getHumanFileSize(size: number): string {
    if (size > ONE_MB) {
        const mbSize = size / ONE_MB;
        return `${mbSize.toFixed(0)}MB`;
    }
    if (size > ONE_KB) {
        const kbSize = size / ONE_KB;
        return `${kbSize.toFixed(0)}KB`;
    }

    return `${size}B`;
}
