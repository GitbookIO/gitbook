import assertNever from 'assert-never';

import { DocumentAnyBlock } from '@/lib/document';
import { ClassValue } from '@/lib/tailwind';

import { BlockContentRef } from './BlockContentRef';
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
import { ListItem } from './ListItem';
import { ListOrdered } from './ListOrdered';
import { ListTasks } from './ListTasks';
import { ListUnordered } from './ListUnordered';
import { BlockMath } from './Math';
import { Paragraph } from './Paragraph';
import { Quote } from './Quote';
import { Swagger } from './Swagger';
import { Table } from './Table';
import { Tabs } from './Tabs';

export interface BlockProps<Block extends DocumentAnyBlock> extends DocumentContextProps {
    block: Block;
    ancestorBlocks: DocumentAnyBlock[];
    style?: ClassValue;
}

export function Block<T extends DocumentAnyBlock>(props: BlockProps<T>) {
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
        case 'image':
        case 'code-line':
        case 'tabs-item':
            throw new Error('Blocks should be directly rendered by parent');
        case 'integration':
            return <div>TODO Not supported yet</div>;
        default:
            assertNever(block);
    }
}
