const React      = require('react');
const classNames = require('classnames');

/**
 * Dropdown to display a menu
 *
 * <Dropdown.Container>
 *
 *     <Button />
 *
 *     <Dropdown.Menu>
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
        children: React.PropTypes.node
    },

    render() {
        let { className, children } = this.props;

        className = classNames(
            'GitBook-Dropdown',
            className
        );

        return (
            <div className={className}>
                {children}
            </div>
        );
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

    onClick(event) {
        const { onClick, href } = this.props;

        if (href) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (onClick) {
            onClick();
        }
    },

    render() {
        const {
            children, href,
            ...otherProps
        } = this.props;
        delete otherProps.onCLick;

        const submenu = filterChildren(children, isDropdownMenu);
        const inner = filterChildren(children, (child) => !isDropdownMenu(child));

        return (
            <li className="GitBook-DropdownItem">
                <a href={href || '#'} onClick={this.onClick} {...otherProps} >
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
        children:  React.PropTypes.node
    },

    render() {
        let { className, children } = this.props;
        className = classNames('GitBook-DropdownMenu', className);

        return (
            <ul className={className}>
                {children}
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
    Container: DropdownContainer
};

module.exports = Dropdown;
