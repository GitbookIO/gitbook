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
 * A dropdown item which can contains informations.
 */
const DropdownItem = React.createClass({
    propTypes: {
        children:  React.PropTypes.node
    },

    render() {
        const { children } = this.props;

        return (
            <div className="GitBook-DropdownItem">
                {children}
            </div>
        );
    }
});


/**
 * A dropdown item, which is always a link.
 */
const DropdownItemLink = React.createClass({
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
        const { children, href, ...otherProps } = this.props;

        return (
            <a {...otherProps} className="GitBook-DropdownItemLink" href={href || '#'} onClick={this.onClick} >
                {children}
            </a>
        );
    }
});


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
            <div className={className}>
                {children}
            </div>
        );
    }
});

const Dropdown = {
    Item: DropdownItem,
    ItemLink: DropdownItemLink,
    Menu: DropdownMenu,
    Container: DropdownContainer
};

module.exports = Dropdown;
