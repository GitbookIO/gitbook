const React      = require('react');
const classNames = require('classnames');

const Backdrop = require('./Backdrop');

/**
 * Dropdown to display a menu
 *
 * <Dropdown.Container>
 *
 *     <Button />
 *
 *     <Dropdown.Menu open={this.state.open}>
 *         <Dropdown.Item href={...}> ... </Dropdown.Item>
 *         <Dropdown.Item onClick={...}> ... </Dropdown.Item>
 *
 *         <Dropdown.Item> A submenu
 *              <Dropdown.Menu>
 *                  <Dropdown.Item href={...}> Subitem </Dropdown.Item>
 *              </Dropdown.Menu>
 *         </Dropdown.Item>
 *
 *     </Dropdown.Menu>
 * </Dropdown.Container>
 */

const DropdownContainer = React.createClass({
    propTypes: {
        className:  React.PropTypes.string,
        span: React.PropTypes.bool,
        children: React.PropTypes.node
    },

    render() {
        let { className, span, children } = this.props;

        className = classNames(
            'GitBook-Dropdown',
            className
        );

        return span ?
               <span className={className}>{children}</span>
             : <div className={className}>{children}</div>;
    }
});

/**
 * A dropdown item, which is always a link, and can contain a nested
 * DropdownMenu.
 */
const DropdownItem = React.createClass({
    propTypes: {
        children:  React.PropTypes.node,
        onClick:   React.PropTypes.func,
        href:      React.PropTypes.string
    },

    onClick(e) {
        if (!this.props.href) {
            e.preventDefault();
            e.stopPropagation();

            if (this.props.onClick) this.props.onClick();
        }
    },

    render() {
        const {
            children, href,
            onClick, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        let inner = [], submenu = [];
        submenu = filterChildren(children, isDropdownMenu);
        inner = filterChildren(children, (child) => !isDropdownMenu(child));

        return (
            <li className="GitBook-DropdownItem">
                <a href={href || '#'}
                   onClick={this.onClick}
                   {...otherProps} >
                    {inner}
                </a>
                {submenu}
            </li>
        );
    }
});

/**
 * @param {Node} children
 * @param {Function} predicate
 * @return {Node} children that pass the predicate
 */
function filterChildren(children, predicate) {
    return React.Children.map(
        children,
        (child) => predicate(child) ? child : null
    );
}

/**
 * A DropdownMenu to display DropdownItems. Must be inside a
 * DropdownContainer.
 */
const DropdownMenu = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        children:  React.PropTypes.node,
        open:      React.PropTypes.bool
    },

    render() {
        const { open } = this.props;
        const className = classNames(
            'GitBook-DropdownMenu',
            { 'GitBook-DropdownMenu-open': open }
        );

        return (
            <ul className={className}>
                {this.props.children}
            </ul>
        );
    }
});

function isDropdownMenu(child) {
    return (child && child.type && child.type.displayName === 'DropdownMenu');
}

const Dropdown = {
    Item: DropdownItem,
    Menu: DropdownMenu,
    Container: DropdownContainer,
    Backdrop
};

module.exports = Dropdown;
