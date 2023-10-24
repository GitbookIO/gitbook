import { ClassValue } from '@/lib/tailwind';
import { Paragraph } from './Paragraph';
import { Heading } from './Heading';
import { ListOrdered } from './ListOrdered';
import { ListUnordered } from './ListUnordered';
import { ListItem } from './ListItem';
import { CodeBlock } from './CodeBlock';
import { tcls } from '@/lib/tailwind';
import { Hint } from './Hint';
import { DocumentContextProps } from './DocumentView';
import { Images } from './Images';
import { Tabs } from './Tabs';

export interface BlockProps<T> extends DocumentContextProps {
    block: T;
    style?: ClassValue;
}

export function Block<T>(props: BlockProps<T>) {
    const { block, style, ...contextProps } = props;

    switch (block.type) {
        case 'paragraph':
            return <Paragraph {...props} {...contextProps} />;
        case 'heading-1':
        case 'heading-2':
        case 'heading-3':
            return <Heading {...props} {...contextProps} />;
        case 'list-ordered':
            return <ListOrdered {...props} {...contextProps} />;
        case 'list-unordered':
            return <ListUnordered {...props} {...contextProps} />;
        case 'list-item':
            return <ListItem {...props} {...contextProps} />;
        case 'code':
            return <CodeBlock {...props} {...contextProps} />;
        case 'hint':
            return <Hint {...props} {...contextProps} />;
        case 'images':
            return <Images {...props} {...contextProps} />;
        case 'tabs':
            return <Tabs {...props} {...contextProps} />;
        default:
            return <div className={tcls(style)}>Unsupported block {block.type}</div>;
    }
}
