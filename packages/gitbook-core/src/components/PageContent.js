const React = require('react');
const ImmutablePropTypes = require('react-immutable-proptypes');

const NODES = {
    // Blocks
    heading_one:   props => <h1>{props.children}</h1>,
    heading_two:   props => <h2>{props.children}</h2>,
    heading_three: props => <h3>{props.children}</h3>,
    heading_four:  props => <h4>{props.children}</h4>,
    heading_five:  props => <h5>{props.children}</h5>,
    heading_six:   props => <h6>{props.children}</h6>,
    paragraph:     props => <p>{props.children}</p>
};

const MARKS = {
    BOLD:          props => <b>{props.children}</b>,
    ITALIC:        props => <em>{props.children}</em>,
    STRIKETHROUGH: props => <del>{props.children}</del>,
    CODE:          props => <code>{props.children}</code>
};


/**
 * Render a text node.
 * @type {ReactClass}
 */
const Text = React.createClass({
    propTypes: {
        node: React.PropTypes.object.isRequired
    },

    render() {
        const { node } = this.props;
        const ranges = node.get('ranges');

        return (
            <div>

            </div>
        );
    }
});

/**
 * Inner content of a page.
 * @type {ReactClass}
 */
const Node = React.createClass({
    propTypes: {
        node: React.PropTypes.object.isRequired
    },

    render() {
        const { node } = this.props;

        const children = node
            .get('children')
            .map((child) => {
                if (child.kind == 'text') {
                    return <Text node={child} />;
                } else {
                    return <Node node={child} />;
                }
            })
            .toArray();

        return React.createElement(
            NODES[node.type],
            {
                node
            },
            children
        );
    }
});

/**
 * Inner content of a page.
 * @type {ReactClass}
 */
const PageContent = React.createClass({
    propTypes: {
        document: React.PropTypes.object.isRequired
    },

    render() {
        const { document } = this.props;
        return (
            <Node node={document} />
        );
    }
});

module.exports = PageContent;
