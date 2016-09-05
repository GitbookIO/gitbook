const React = require('react');
const GitBook = require('gitbook-core');

const ThemeBody = React.createClass({
    render() {
        return (
            <div>
                <GitBook.Head
                    title={'Homepage'}
                    titleTemplate="%s - GitBook"
                />

                My Base theme for gitbook
            </div>
        );
    }
});

module.exports = GitBook.createPlugin((dispatch, state) => {
    dispatch(GitBook.registerComponent(ThemeBody, { role: 'Body' }));
});
