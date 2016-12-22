const React = require('react');
const classNames = require('classnames');

const POSITIONS = {
    BOTTOM_RIGHT: 'e',
    BOTTOM_LEFT:  'w',
    TOP_LEFT:     'nw',
    TOP_RIGHT:    'ne',
    BOTTOM:       '',
    TOP:          'n'
};

const Tooltipped = React.createClass({
    propTypes: {
        title:    React.PropTypes.string.isRequired,
        position: React.PropTypes.string,
        open:     React.PropTypes.bool,
        children: React.PropTypes.node
    },

    statics: {
        POSITIONS
    },

    render() {
        const { title, position, open, children } = this.props;

        const className = classNames(
            'GitBook-Tooltipped',
            position ? 'Tooltipped-' + position : '',
            {
                'Tooltipped-o': open
            }
        );

        return (
            <div className={className} aria-label={title}>
                {children}
            </div>
        );
    }
});

module.exports = Tooltipped;
