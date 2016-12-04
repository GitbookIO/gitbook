const debounce = require('debounce');
const GitBook = require('gitbook-core');
const { React } = GitBook;

const Page = require('./Page');
const Toolbar = require('./Toolbar');

const HEADINGS_SELECTOR = 'h1[id],h2[id],h3[id],h4[id]';

/**
 * Get offset of an element relative to a parent container.
 * @param  {DOMElement} container
 * @param  {DOMElement} element
 * @return {Number} offset
 */
function getOffset(container, element, type = 'Top') {
    const parent = element.parentElement;
    let base = 0;

    if (parent != container) {
        base = getOffset(container, parent, type);
    }

    return base + element[`offset${type}`];
}

/**
 * Find the current heading anchor for a scroll position.
 * @param  {DOMElement} container
 * @param  {Number} top
 * @return {String}
 */
function getHeadingID(container, top) {
    let id;
    const headings = container.querySelectorAll(HEADINGS_SELECTOR);

    headings.forEach(heading => {
        if (id) {
            return;
        }

        const offset = getOffset(container, heading);

        if (offset > top) {
            id = heading.getAttribute('id');
        }
    });

    return id;
}

const Body = React.createClass({
    propTypes: {
        page:      GitBook.PropTypes.Page,
        readme:    GitBook.PropTypes.Readme,
        history:   GitBook.PropTypes.History,
        updateURI: React.PropTypes.func
    },

    getInitialState() {
        this.debouncedOnScroll = debounce(this.onScroll, 300);
        return {};
    },

    /**
     * User is scrolling the page, update the location with current section's ID.
     */
    onScroll() {
        const { scrollContainer } = this;
        const { history, updateURI } = this.props;
        const { location } = history;

        // Find the id matching the current scroll position
        const hash = getHeadingID(scrollContainer, scrollContainer.scrollTop);

        // Update url if changed
        if (hash !== location.hash) {
            updateURI(location.merge({ hash }));
        }
    },

    /**
     * Component has been updated with a new location,
     * scroll to the right anchor.
     */
    componentDidUpdate() {

    },

    render() {
        const { page, readme } = this.props;

        return (
            <GitBook.InjectedComponent matching={{ role: 'body:wrapper' }}>
                <div
                    className="Body page-wrapper"
                    onScroll={this.debouncedOnScroll}
                    ref={div => this.scrollContainer = div}
                >
                    <GitBook.InjectedComponent matching={{ role: 'toolbar:wrapper' }}>
                        <Toolbar title={page.title} readme={readme} />
                    </GitBook.InjectedComponent>
                    <GitBook.InjectedComponent matching={{ role: 'page:wrapper' }}>
                        <Page page={page} />
                    </GitBook.InjectedComponent>
                </div>
            </GitBook.InjectedComponent>
        );
    }
});

module.exports = GitBook.connect(Body,
    () => {
        return {};
    },
    ({ History }, dispatch) => {
        return {
            updateURI: (location) => dispatch(History.replace(location))
        };
    }
);
