const React = require('react');
const ReactRedux = require('react-redux');

const File = require('../models/File');
const FileShape = require('../propTypes/File');

/**
 * Local image. Using this component instead of <img>
 * avoid broken links when location changes.
 *
 * @type {ReactClass}
 */
const Image = React.createClass({
    propTypes: {
        currentFile: FileShape,
        src: React.PropTypes.oneOfType([
            React.PropTypes.string,
            FileShape
        ])
    },

    render() {
        let { src, currentFile, ...props } = this.props;
        delete props.dispatch;

        if (File.is(src)) {
            src = src.url;
        }

        src = currentFile.relative(src);
        return <img src={src} {...props} />;
    }
});

module.exports = ReactRedux.connect((state) => {
    return { currentFile: state.file };
})(Image);
