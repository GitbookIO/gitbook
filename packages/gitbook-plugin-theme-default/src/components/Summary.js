const classNames = require('classnames');
const GitBook = require('gitbook-core');
const { React } = GitBook;

let SummaryArticle = React.createClass({
    propTypes: {
        active: React.PropTypes.bool,
        article: GitBook.Shapes.SummaryArticle
    },

    render() {
        const { article, active } = this.props;
        const className = classNames('SummaryArticle', {
            active
        });

        return (
            <GitBook.InjectedComponent matching={{ role: 'summary:article' }} props={this.props}>
                <li className={className}>
                    {article.ref ?
                        <GitBook.Link to={article}>{article.title}</GitBook.Link>
                        : <span>{article.title}</span>}
                </li>
            </GitBook.InjectedComponent>
        );
    }
});
SummaryArticle = GitBook.connect(SummaryArticle, ({page}, {article}) => {
    return {
        active: page.level === article.level
    };
});

const SummaryArticles = React.createClass({
    propTypes: {
        articles: GitBook.Shapes.listOf(GitBook.Shapes.SummaryArticle)
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

        const titleEL = title ? <h2>{title}</h2> : null;

        return (
            <GitBook.InjectedComponent matching={{ role: 'summary:part' }} props={this.props}>
                <div className="SummaryPart">
                    {titleEL}
                    <SummaryArticles articles={articles} />
                </div>
            </GitBook.InjectedComponent>
        );
    }
});

const SummaryParts = React.createClass({
    propTypes: {
        parts: GitBook.Shapes.listOf(GitBook.Shapes.SummaryPart)
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
