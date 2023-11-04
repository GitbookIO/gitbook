import { ClassValue } from '@/lib/tailwind';
import { Paragraph } from './Paragraph';
import { Heading } from './Heading';
import { ListOrdered } from './ListOrdered';
import { ListUnordered } from './ListUnordered';
import { ListItem } from './ListItem';
import { CodeBlock } from './CodeBlock';
import { Hint } from './Hint';
import { DocumentContextProps } from './DocumentView';
import { Images } from './Images';
import { Tabs } from './Tabs';
import { Expandable } from './Expandable';
import { Table } from './Table';
import { Swagger } from './Swagger';
import { Embed } from './Embed';
import { Quote } from './Quote';
import {
    DocumentBlockCode,
    DocumentBlockContentRef,
    DocumentBlockDivider,
    DocumentBlockDrawing,
    DocumentBlockEmbed,
    DocumentBlockExpandable,
    DocumentBlockFile,
    DocumentBlockHeading,
    DocumentBlockHint,
    DocumentBlockImages,
    DocumentBlockListItem,
    DocumentBlockListOrdered,
    DocumentBlockListTasks,
    DocumentBlockListUnordered,
    DocumentBlockMath,
    DocumentBlockParagraph,
    DocumentBlockQuote,
    DocumentBlockSwagger,
    DocumentBlockTable,
    DocumentBlockTabs,
    DocumentBlockTabsItem,
    DocumentBlockTaskListItem,
} from '@gitbook/api';
import { BlockMath } from './Math';
import { File } from './File';
import { ListTasks } from './ListTasks';
import { Divider } from './Divider';
import assertNever from 'assert-never';
import { Drawing } from './Drawing';
import { BlockContentRef } from './BlockContentRef';

export type SupportedBlock =
    | DocumentBlockParagraph
    | DocumentBlockHeading
    | DocumentBlockListOrdered
    | DocumentBlockListUnordered
    | DocumentBlockListTasks
    | DocumentBlockListItem
    | DocumentBlockTaskListItem
    | DocumentBlockHint
    | DocumentBlockCode
    | DocumentBlockImages
    | DocumentBlockTabs
    | DocumentBlockExpandable
    | DocumentBlockSwagger
    | DocumentBlockTable
    | DocumentBlockEmbed
    | DocumentBlockQuote
    | DocumentBlockMath
    | DocumentBlockFile
    | DocumentBlockDivider
    | DocumentBlockDrawing
    | DocumentBlockContentRef;

export type AncestorBlock = SupportedBlock | DocumentBlockTabsItem;

export interface BlockProps<Block extends SupportedBlock> extends DocumentContextProps {
    block: Block;
    ancestorBlocks: AncestorBlock[];
    style?: ClassValue;
}

export function Block<T extends SupportedBlock>(props: BlockProps<T>) {
    const { block, style, ...contextProps } = props;

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
            return <Swagger {...props} {...contextProps} block={block} />;
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
        default:
            assertNever(block);
    }
}
