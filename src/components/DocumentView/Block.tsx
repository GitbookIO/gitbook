import { ClassValue } from 'clsx';
import { Paragraph } from './Paragraph';
import { Heading } from './Heading';
import { ListOrdered } from './ListOrdered';
import { ListUnordered } from './ListUnordered';
import { ListItem } from './ListItem';
import { CodeBlock } from './CodeBlock';
import clsx from 'clsx';

export interface BlockProps<T> {
    block: T;
    style?: ClassValue;
}

export function Block<T>(props: BlockProps<T>) {
    const { block, style } = props;

    switch (block.type) {
        case 'paragraph':
            return <Paragraph {...props} />;
        case 'heading-1':
        case 'heading-2':
        case 'heading-3':
            return <Heading {...props} />;
        case 'list-ordered':
            return <ListOrdered {...props} />;
        case 'list-unordered':
            return <ListUnordered {...props} />;
        case 'list-item':
            return <ListItem {...props} />;
        case 'code':
            return <CodeBlock {...props} />;
        default:
            return <div className={clsx(style)}>Unsupported block {block.type}</div>;
    }
}
