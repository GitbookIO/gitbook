const React = require('react');
const classNames = require('classnames');

const Panel = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        children:  React.PropTypes.node
    },

    render() {
        let { className, children } = this.props;
        className = classNames('GitBook-Panel', className);

        return (
            <div className={className}>
                {children}
            </div>
        );
    }
});

module.exports = Panel;
