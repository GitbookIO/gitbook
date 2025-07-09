import type { DocumentBlock, JSONDocument } from '@gitbook/api';

import {
    SkeletonCard,
    SkeletonHeading,
    SkeletonImage,
    SkeletonParagraph,
    SkeletonSmall,
} from '@/components/primitives';
import type { ClassValue } from '@/lib/tailwind';

import { nullIfNever } from '@/lib/typescript';
import { BlockContentRef } from './BlockContentRef';
import { CodeBlock } from './CodeBlock';
import { Columns } from './Columns';
import { Divider } from './Divider';
import type { DocumentContextProps } from './DocumentView';
import { Drawing } from './Drawing';
import { Embed } from './Embed';
import { Expandable } from './Expandable';
import { File } from './File';
import { Heading } from './Heading';
import { Hint } from './Hint';
import { Images } from './Images';
import { IntegrationBlock } from './Integration';
import { List } from './List';
import { ListItem } from './ListItem';
import { BlockMath } from './Math';
import { OpenAPIOperation, OpenAPISchemas, OpenAPIWebhook } from './OpenAPI';
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

export function Block<T extends DocumentBlock>(props: BlockProps<T>) {
    const { block } = props;

    const content = (() => {
        switch (block.type) {
            case 'paragraph':
                return <Paragraph {...props} block={block} />;
            case 'heading-1':
            case 'heading-2':
            case 'heading-3':
                return <Heading {...props} block={block} />;
            case 'list-ordered':
            case 'list-unordered':
            case 'list-tasks':
                return <List {...props} block={block} />;
            case 'list-item':
                return <ListItem {...props} block={block} />;
            case 'columns':
                return <Columns {...props} block={block} />;
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
            case 'openapi-operation':
                return <OpenAPIOperation {...props} block={block} />;
            case 'openapi-schemas':
                return <OpenAPISchemas {...props} block={block} />;
            case 'openapi-webhook':
                return <OpenAPIWebhook {...props} block={block} />;
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
            case 'integration':
                return <IntegrationBlock {...props} block={block} />;
            case 'reusable-content':
                return <ReusableContent {...props} block={block} />;
            case 'stepper':
                return <Stepper {...props} block={block} />;
            case 'stepper-step':
                return <StepperStep {...props} block={block} />;
            case 'if':
                // If block should be processed by the API.
                return null;
            case 'image':
            case 'code-line':
            case 'tabs-item':
            case 'column':
                throw new Error(`Blocks (${block.type}) should be directly rendered by parent`);
            default:
                return nullIfNever(block);
        }
    })();

    return content;
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
        case 'stepper-step':
        case 'if':
            return <SkeletonParagraph id={id} style={style} />;
        case 'expandable':
        case 'table':
        case 'swagger':
        case 'openapi-operation':
        case 'openapi-schemas':
        case 'openapi-webhook':
        case 'math':
        case 'divider':
        case 'content-ref':
        case 'integration':
        case 'stepper':
        case 'reusable-content':
        case 'columns':
            return <SkeletonCard id={id} style={style} />;
        case 'embed':
        case 'images':
        case 'drawing':
            return <SkeletonImage id={id} style={style} />;
        case 'image':
        case 'code-line':
        case 'tabs-item':
        case 'column':
            throw new Error(`Blocks (${block.type}) should be directly rendered by parent`);
        default:
            return nullIfNever(block);
    }
}
