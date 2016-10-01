const classNames = require('classnames');
const GitBook = require('gitbook-core');
const { React } = GitBook;

const STYLE_TO_ICON = {
    info:    'info',
    tip:     'question',
    danger:  'exclamation-circle',
    warning: 'exclamation-triangle'
};

const HintAlert = React.createClass({
    propTypes: {
        icon:     React.PropTypes.string,
        style:    React.PropTypes.string,
        children: React.PropTypes.node
    },

    render() {
        const { children, style, icon } = this.props;
        const className = classNames('HintAlert', 'alert', `alert-${style}`);

        return (
            <div className={className}>
                <div className="HintAlert/Icon">
                    <GitBook.Icon id={icon || STYLE_TO_ICON[style]} />
                </div>
                <div className="HintAlert/Content">
                    {children}
                </div>
            </div>
        );
    }
});

module.exports = GitBook.createPlugin({
    init: (dispatch, getState, { Components }) => {
        dispatch(Components.registerComponent(HintAlert, { role: 'block:hint' }));
    }
});
