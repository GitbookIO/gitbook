import { type DocumentBlockFile, SiteInsightsLinkPosition } from '@gitbook/api';

import { Button, Link } from '../primitives';
import { DownloadButton } from '../primitives/DownloadButton';
import { Image } from '../utils';
import type { BlockProps } from './Block';
import { Caption } from './Caption';
import { FileIcon } from './FileIcon';
import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { getSimplifiedContentType } from '@/lib/files';
import { resolveContentRefInDocument } from '@/lib/references';

export async function File(props: BlockProps<DocumentBlockFile>) {
    const { document, block, context } = props;

    if (!context.contentContext) {
        return null;
    }

    const contentRef = await resolveContentRefInDocument(
        document,
        block.data.ref,
        context.contentContext
    );
    const file = contentRef?.file;

    if (!file) {
        return null;
    }

    const language = await getSpaceLanguage(context.contentContext);
    const contentType = getSimplifiedContentType(file.contentType);
    const insights = {
        type: 'link_click' as const,
        link: {
            target: block.data.ref,
            position: SiteInsightsLinkPosition.Content,
        },
    };

    return (
        <Caption {...props} withBorder withBlockKey>
            <div className="file-block">
                <div className="file-block-preview">
                    {contentType === 'image' ? (
                        <Image
                            alt={file.name}
                            className="file-block-image"
                            sizes={[{ width: 40 }]}
                            resize={context.contentContext?.imageResizer}
                            sources={{
                                light: {
                                    src: file.downloadURL,
                                    size: file.dimensions,
                                },
                            }}
                            loading="lazy"
                        />
                    ) : (
                        <FileIcon contentType={contentType} className="file-block-icon" />
                    )}
                </div>
                <div className="file-block-info">
                    <div className="file-block-name">
                        <Link
                            href={file.downloadURL}
                            target="_blank"
                            insights={insights}
                            className="hover:underline"
                        >
                            {file.name}
                        </Link>
                    </div>
                    <div className="file-block-meta">
                        {contentType
                            ? `${contentType} · ${getHumanFileSize(file.size)}`
                            : getHumanFileSize(file.size)}
                    </div>
                </div>
                <div className="file-block-actions">
                    <DownloadButton
                        icon="download"
                        size="xsmall"
                        variant="secondary"
                        downloadUrl={file.downloadURL}
                        filename={file.name}
                        insights={insights}
                    >
                        {t(language, 'download')}
                    </DownloadButton>
                    <Button
                        icon="arrow-up-right-from-square"
                        size="xsmall"
                        variant="secondary"
                        href={file.downloadURL}
                        target="_blank"
                        insights={insights}
                    >
                        {t(language, 'open')}
                    </Button>
                </div>
            </div>
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
