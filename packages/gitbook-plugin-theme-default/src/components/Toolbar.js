const GitBook = require('gitbook-core');
const { React } = GitBook;

const sidebar = require('../actions/sidebar');

const Toolbar = React.createClass({
    propTypes: {
        title:    React.PropTypes.string.isRequired,
        dispatch: React.PropTypes.func,
        readme:   GitBook.Shapes.Readme
    },

    onToggle() {
        const { dispatch } = this.props;
        dispatch(sidebar.toggle());
    },

    render() {
        const { title, readme } = this.props;

        return (
            <GitBook.FlexLayout className="Toolbar">
                <GitBook.FlexBox className="Toolbar-left">
                    <GitBook.Button onClick={this.onToggle}>
                        <GitBook.Icon id="align-justify" />
                    </GitBook.Button>
                    <GitBook.InjectedComponentSet align="flex-start" matching={{ role: 'toolbar:buttons:left' }} />
                </GitBook.FlexBox>
                <GitBook.FlexBox auto>
                    <h1 className="Toolbar-Title">
                        <GitBook.Link to={readme.file}>{title}</GitBook.Link>
                    </h1>
                </GitBook.FlexBox>
                <GitBook.FlexBox className="Toolbar-right">
                    <GitBook.InjectedComponentSet align="flex-end" matching={{ role: 'toolbar:buttons:right' }} />
                </GitBook.FlexBox>
            </GitBook.FlexLayout>
        );
    }
});

module.exports = GitBook.connect(Toolbar);
