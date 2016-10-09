const GitBook    = require('gitbook-core');
const { React }  = GitBook;
const classNames = require('classnames');

function mapStateToProps({ config }) {
    return {
        position: config.get('pluginsConfig').get('headings').get('position') || 'left'
    };
}

let Heading = React.createClass({
    propTypes: {
        id:       React.PropTypes.string.isRequired,
        children: React.PropTypes.node.isRequired,
        position: React.PropTypes.string.isRequired
    },

    render() {
        const { position, children, id } = this.props;
        const className = classNames('Headings-Container', {
            'Headings-Right': (position !== 'left')
        });

        return (
            <div className={className}>
                <GitBook.ImportCSS href="gitbook/headings/headings.css" />

                {position == 'left' ?
                <a className="Headings-Anchor-Left" href={`#${id}`}>
                    <i className="fa fa-link" />
                </a>
                : null}

                {children}

                {position != 'left' ?
                <a className="Headings-Anchor-Right" href={`#${id}`}>
                    <i className="fa fa-link" />
                </a>
                : null}
            </div>
        );
    }
});

Heading = GitBook.connect(Heading, mapStateToProps);

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        // Attach component to titles
        dispatch(Components.registerComponent(Heading, { role: 'html:h1' }));
        dispatch(Components.registerComponent(Heading, { role: 'html:h2' }));
        dispatch(Components.registerComponent(Heading, { role: 'html:h3' }));
        dispatch(Components.registerComponent(Heading, { role: 'html:h4' }));
        dispatch(Components.registerComponent(Heading, { role: 'html:h5' }));
        dispatch(Components.registerComponent(Heading, { role: 'html:h6' }));
    },
    deactivate: (dispatch, getState) => {},
    reduce: (state, action) => state
});
