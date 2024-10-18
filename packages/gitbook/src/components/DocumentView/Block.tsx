import { DocumentBlock, JSONDocument } from '@gitbook/api';
import React from 'react';

import {
    SkeletonParagraph,
    SkeletonHeading,
    SkeletonCard,
    SkeletonImage,
    SkeletonSmall,
} from '@/components/primitives';
import { ClassValue } from '@/lib/tailwind';

import { BlockContentRef } from './BlockContentRef';
import { BlockSyncedBlock } from './BlockSyncedBlock';
import { CodeBlock } from './CodeBlock';
import { Divider } from './Divider';
import { DocumentContextProps } from './DocumentView';
import { Drawing } from './Drawing';
import { Embed } from './Embed';
import { Expandable } from './Expandable';
import { File } from './File';
import { Heading } from './Heading';
import { Hint } from './Hint';
import { Images } from './Images';
import { IntegrationBlock } from './Integration';
import { ListItem } from './ListItem';
import { ListOrdered } from './ListOrdered';
import { ListTasks } from './ListTasks';
import { ListUnordered } from './ListUnordered';
import { BlockMath } from './Math';
import { OpenAPI } from './OpenAPI';
import { Paragraph } from './Paragraph';
import { Quote } from './Quote';
import { ReusableContent } from './ReusableContent';
import { Stepper } from './Stepper';
import { StepperStep } from './StepperStep';
import { Table } from './Table';
import { Tabs } from './Tabs';

export interface BlockProps<Block extends DocumentBlock> extends DocumentContextProps {
    block: Block;
    document: JSONDocument;
    ancestorBlocks: DocumentBlock[];
    /** If true, we estimate that the block will be outside the initial viewport */
    isEstimatedOffscreen: boolean;
    /** Class names to be passed to the underlying DOM element */
    style?: ClassValue;
}

/**
 * Alternative to `assertNever` that returns `null` instead of throwing an error.
 */
function nullIfNever(value: never): null {
    return null;
}

export function Block<T extends DocumentBlock>(props: BlockProps<T>) {
    const { block, style, isEstimatedOffscreen, context } = props;

    const content = (() => {
        switch (block.type) {
            case 'paragraph':
                return <Paragraph {...props} block={block} />;
            case 'heading-1':
            case 'heading-2':
            case 'heading-3':
                return <Heading {...props} block={block} />;
            case 'list-ordered':
                return <ListOrdered {...props} block={block} />;
            case 'list-unordered':
                return <ListUnordered {...props} block={block} />;
            case 'list-tasks':
                return <ListTasks {...props} block={block} />;
            case 'list-item':
                return <ListItem {...props} block={block} />;
            case 'code':
                return <CodeBlock {...props} block={block} />;
            case 'hint':
                return <Hint {...props} block={block} />;
            case 'images':
                return <Images {...props} block={block} />;
            case 'tabs':
                return <Tabs {...props} block={block} />;
            case 'expandable':
                return <Expandable {...props} block={block} />;
            case 'table':
                return <Table {...props} block={block} />;
            case 'swagger':
                return <OpenAPI {...props} block={block} />;
            case 'embed':
                return <Embed {...props} block={block} />;
            case 'blockquote':
                return <Quote {...props} block={block} />;
            case 'math':
                return <BlockMath {...props} block={block} />;
            case 'file':
                return <File {...props} block={block} />;
            case 'divider':
                return <Divider {...props} block={block} />;
            case 'drawing':
                return <Drawing {...props} block={block} />;
            case 'content-ref':
                return <BlockContentRef {...props} block={block} />;
            case 'image':
            case 'code-line':
            case 'tabs-item':
                throw new Error('Blocks should be directly rendered by parent');
            case 'integration':
                return <IntegrationBlock {...props} block={block} />;
            case 'synced-block':
                return <BlockSyncedBlock {...props} block={block} />;
            case 'reusable-content':
                return <ReusableContent {...props} block={block} />;
            case 'stepper':
                return <Stepper {...props} block={block} />;
            case 'stepper-step':
                return <StepperStep {...props} block={block} />;
            default:
                return nullIfNever(block);
        }
    })();

    if (!isEstimatedOffscreen || context.wrapBlocksInSuspense === false) {
        // When blocks are estimated to be on the initial viewport, we render them immediately
        // to avoid a flash of a loading skeleton.
        return content;
    }

    return (
        <React.Suspense fallback={<BlockSkeleton block={block} style={style} />}>
            {content}
        </React.Suspense>
    );
}

/**
 * Skeleton for a block while it is being loaded.
 */
export function BlockSkeleton(props: { block: DocumentBlock; style: ClassValue }) {
    const { block, style } = props;
    const id = 'meta' in block && block.meta && 'id' in block.meta ? block.meta.id : undefined;

    switch (block.type) {
        case 'heading-1':
        case 'heading-2':
        case 'heading-3':
        case 'file':
            return <SkeletonHeading id={id} style={style} />;
        case 'paragraph':
            return <SkeletonSmall id={id} style={style} />;
        case 'list-ordered':
        case 'list-unordered':
        case 'list-tasks':
        case 'list-item':
        case 'blockquote':
        case 'code':
        case 'hint':
        case 'tabs':
            return <SkeletonParagraph id={id} style={style} />;
        case 'expandable':
        case 'table':
        case 'swagger':
        case 'math':
        case 'divider':
        case 'content-ref':
        case 'integration':
        case 'stepper':
        case 'synced-block':
        case 'reusable-content':
            return <SkeletonCard id={id} style={style} />;
        case 'embed':
        case 'images':
        case 'drawing':
            return <SkeletonImage id={id} style={style} />;
        case 'image':
        case 'code-line':
        case 'tabs-item':
        case 'stepper-step':
            throw new Error('Blocks should be directly rendered by parent');
        default:
            return nullIfNever(block);
    }
}
