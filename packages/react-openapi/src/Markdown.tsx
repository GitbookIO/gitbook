import classNames from 'classnames';

export function Markdown(props: { source: string; className?: string }) {
    const { source, className } = props;

    return (
        <div
            className={classNames('openapi-markdown', className)}
            dangerouslySetInnerHTML={{ __html: source }}
        />
    );
}
