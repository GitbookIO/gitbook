const React = require('react');
const classNames = require('classnames');

const ButtonGroup = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        children:  React.PropTypes.node,
        onClick:   React.PropTypes.func
    },

    render() {
        let { className, children } = this.props;

        className = classNames(
            'GitBook-ButtonGroup',
            className
        );

        return <div className={className}>{children}</div>;
    }
});

module.exports = ButtonGroup;
