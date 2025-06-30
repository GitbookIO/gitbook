import { parseMarkdown } from '@/lib/markdown';
import { Icon } from '@gitbook/icons';
import type { ContentKitServerContext } from '@gitbook/react-contentkit';
import { PlainCodeBlock } from '../CodeBlock';

export const contentKitServerContext: ContentKitServerContext = {
    icons: {
        maximize: (props) => <Icon icon="maximize" {...props} />,
        edit: (props) => <Icon icon="edit" {...props} />,
        github: (props) => <Icon icon="github" {...props} />,
        gitlab: (props) => <Icon icon="gitlab" {...props} />,
        close: (props) => <Icon icon="x" {...props} />,
        email: (props) => <Icon icon="envelope" {...props} />,
        settings: (props) => <Icon icon="gear" {...props} />,
        search: (props) => <Icon icon="magnifying-glass" {...props} />,
        delete: (props) => <Icon icon="trash" {...props} />,
        star: (props) => <Icon icon="star" {...props} />,
        warning: (props) => <Icon icon="triangle-exclamation" {...props} />,
        link: (props) => <Icon icon="link" {...props} />,
        'link-external': (props) => <Icon icon="arrow-up-right-from-square" {...props} />,
        eye: (props) => <Icon icon="eye" {...props} />,
        lock: (props) => <Icon icon="lock" {...props} />,
        check: (props) => <Icon icon="check" {...props} />,
        'check-circle': (props) => <Icon icon="check-circle" {...props} />,
        'eye-off': (props) => <Icon icon="eye-slash" {...props} />,
    },
    codeBlock: (props) => {
        return <PlainCodeBlock code={props.code} syntax={props.syntax} />;
    },
    markdown: async ({ className, markdown }) => {
        const parsed = await parseMarkdown(markdown);
        return <div className={className} dangerouslySetInnerHTML={{ __html: parsed }} />;
    },
};
