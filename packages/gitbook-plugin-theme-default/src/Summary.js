const React = require('react');
const GitBook = require('gitbook-core');

const SummaryArticle = React.createClass({
    propTypes: {
        article: GitBook.Shapes.SummaryArticle
    },

    render() {
        const { article } = this.props;

        return (
            <GitBook.InjectedComponent matching={{ role: 'summary:article' }} props={this.props}>
                <li className="SummaryArticle">
                    <span>{article.title}</span>
                </li>
            </GitBook.InjectedComponent>
        );
    }
});

const SummaryArticles = React.createClass({
    propTypes: {
        articles: React.PropTypes.arrayOf(GitBook.Shapes.SummaryArticle)
    },

    render() {
        const { articles } = this.props;

        return (
            <GitBook.InjectedComponent matching={{ role: 'summary:articles' }} props={this.props}>
                <ul className="SummaryArticles">
                    {articles.map(article => <SummaryArticle key={article.level} article={article} />)}
                </ul>
            </GitBook.InjectedComponent>
        );
    }
});

const SummaryPart = React.createClass({
    propTypes: {
        part: GitBook.Shapes.SummaryPart
    },

    render() {
        const { part } = this.props;
        const { title, articles } = part;

        return (
            <GitBook.InjectedComponent matching={{ role: 'summary:part' }} props={this.props}>
                <div className="SummaryPart">
                    {title}
                    <SummaryArticles articles={articles} />
                </div>
            </GitBook.InjectedComponent>
        );
    }
});

const SummaryParts = React.createClass({
    propTypes: {
        parts: React.PropTypes.arrayOf(GitBook.Shapes.SummaryPart)
    },

    render() {
        const { parts } = this.props;

        return (
            <GitBook.InjectedComponent matching={{ role: 'summary:parts' }} props={this.props}>
                <div className="SummaryParts">
                    {parts.map((part, i) => <SummaryPart key={i} part={part} />)}
                </div>
            </GitBook.InjectedComponent>
        );
    }
});

const Summary = React.createClass({
    propTypes: {
        summary: GitBook.Shapes.Summary
    },

    render() {
        const { summary } = this.props;
        const { parts } = summary;

        return (
            <GitBook.InjectedComponent matching={{ role: 'summary:container' }} props={this.props}>
                <div className="Summary book-summary">
                    <SummaryParts parts={parts} />
                </div>
            </GitBook.InjectedComponent>
        );
    }
});

module.exports = Summary;
