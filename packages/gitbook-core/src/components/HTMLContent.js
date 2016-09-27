const React = require('react');
const ReactSafeHtml = require('react-safe-html');
const htmlTags = require('html-tags');

const { InjectedComponent } = require('./InjectedComponent');

/*
    HTMLContent is a container for the page HTML that parse the content and
    render the right block.
    All html elements can be extended using the injected component.
 */

function inject(injectedProps, Component) {
    return (props) => {
        const cleanProps = {
            ...props,
            className: props.className
        };
        delete cleanProps['class'];

        return (
            <InjectedComponent {...injectedProps(cleanProps)}>
                <Component {...cleanProps} />
            </InjectedComponent>
        );
    };
}

const COMPONENTS = {
    // Templating blocks are exported as <template-block block="youtube" props="{}" />
    'template-block': inject(
        ({block, props}) => {
            return {
                matching: { role: `block:${block}` },
                props: JSON.parse(props)
            };
        },
        props => <div {...props} />
    )
};

htmlTags.forEach(tag => {
    COMPONENTS[tag] = inject(
        props => {
            return {
                matching: { role: `html:${tag}` },
                props
            };
        },
        props => React.createElement(tag, props)
    );
});

const HTMLContent = React.createClass({
    propTypes: {
        html: React.PropTypes.string.isRequired
    },

    render() {
        const { html } = this.props;
        return <ReactSafeHtml html={html} components={COMPONENTS} />;
    }
});

module.exports = HTMLContent;
