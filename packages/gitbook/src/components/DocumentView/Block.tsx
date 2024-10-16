import { DocumentBlock, JSONDocument } from '@gitbook/api';
import assertNever from 'assert-never';
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
import { Stepper } from './Stepper';
import { StepperStep } from './StepperStep';
import { Table } from './Table';
import { Tabs } from './Tabs';

export interface BlockProps<Block extends DocumentBlock> extends DocumentContextProps {
    block: Block;
    document: JSONDocument;
    ancestorBlocks: DocumentBlock[];
    style?: ClassValue;
}

export function Block<T extends DocumentBlock>(props: BlockProps<T>) {
    const { block, style, ...contextProps } = props;

    const content = (() => {
        switch (block.type) {
            case 'paragraph':
                return <Paragraph {...props} {...contextProps} block={block} />;
            case 'heading-1':
            case 'heading-2':
            case 'heading-3':
                return <Heading {...props} {...contextProps} block={block} />;
            case 'list-ordered':
                return <ListOrdered {...props} {...contextProps} block={block} />;
            case 'list-unordered':
                return <ListUnordered {...props} {...contextProps} block={block} />;
            case 'list-tasks':
                return <ListTasks {...props} {...contextProps} block={block} />;
            case 'list-item':
                return <ListItem {...props} {...contextProps} block={block} />;
            case 'code':
                return <CodeBlock {...props} {...contextProps} block={block} />;
            case 'hint':
                return <Hint {...props} {...contextProps} block={block} />;
            case 'images':
                return <Images {...props} {...contextProps} block={block} />;
            case 'tabs':
                return <Tabs {...props} {...contextProps} block={block} />;
            case 'expandable':
                return <Expandable {...props} {...contextProps} block={block} />;
            case 'table':
                return <Table {...props} {...contextProps} block={block} />;
            case 'swagger':
                return <OpenAPI {...props} {...contextProps} block={block} />;
            case 'embed':
                return <Embed {...props} {...contextProps} block={block} />;
            case 'blockquote':
                return <Quote {...props} {...contextProps} block={block} />;
            case 'math':
                return <BlockMath {...props} {...contextProps} block={block} />;
            case 'file':
                return <File {...props} {...contextProps} block={block} />;
            case 'divider':
                return <Divider {...props} {...contextProps} block={block} />;
            case 'drawing':
                return <Drawing {...props} {...contextProps} block={block} />;
            case 'content-ref':
                return <BlockContentRef {...props} {...contextProps} block={block} />;
            case 'image':
            case 'code-line':
            case 'tabs-item':
                throw new Error('Blocks should be directly rendered by parent');
            case 'integration':
                return <IntegrationBlock {...props} {...contextProps} block={block} />;
            case 'synced-block':
                return <BlockSyncedBlock {...props} {...contextProps} block={block} />;
            case 'reusable-content':
                return null;
            case 'stepper':
                return <Stepper {...props} {...contextProps} block={block} />;
            case 'stepper-step':
                return <StepperStep {...props} {...contextProps} block={block} />;
            default:
                assertNever(block);
        }
    })();

    return (
        <React.Suspense fallback={<BlockPlaceholder block={block} style={style} />}>
            {content}
        </React.Suspense>
    );
}

function BlockPlaceholder(props: { block: DocumentBlock; style: ClassValue }) {
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
            assertNever(block);
    }
}
