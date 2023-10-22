import { ClassValue } from 'clsx';
import { Paragraph } from './Paragraph';
import { Heading } from './Heading';
import { ListOrdered } from './ListOrdered';
import { ListUnordered } from './ListUnordered';
import { ListItem } from './ListItem';

export interface BlockProps<T> {
    block: T;
    style?: ClassValue;
}

export function Block<T>(props: BlockProps<T>) {
    const { block } = props;

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
        default:
            return <div>Unsupported block {block.type}</div>;
    }
}
