const GitBook = require('gitbook-core');
const { React } = GitBook;

const Heading = React.createClass({
    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <div className="Headings-Container">
                {this.props.children}
            </div>
        );
    }
});

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        // Dispatch initialization actions
        dispatch(Components.registerComponent(Heading, { role: 'html:h1' }));
    },
    deactivate: (dispatch, getState) => {
        // Dispatch cleanup actions
    },
    reduce: (state, action) => state
});
