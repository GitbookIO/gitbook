const GitBook = require('gitbook-core');
const { React } = GitBook;

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        // Dispatch initialization actions
        dispatch(Components.registerComponent(SharingButton, { role: 'toolbar:buttons:right' }))
    },
    deactivate: (dispatch, getState) => {
        // Dispatch cleanup actions
    },
    reduce: (state, action) => state
});

let SharingButton = React.createClass({
    propTypes: {
        page: GitBook.Shapes.Page
    },

    onClick() {
        alert(this.props.page.title)
    },

    render() {
        return (
            <GitBook.Button onClick={this.onClick}>
                <GitBook.Icon id="facebook"/>
            </GitBook.Button>
        )
    }
})
SharingButton = GitBook.connect(SharingButton, function mapStateToProps(state) {
    return { page: state.page }
})
