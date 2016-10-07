const React      = require('react');
const classNames = require('classnames');

/**
 * Dropdown (or dropup) to display a menu
 *
 * <Dropdown renderMenu={renderMenu} renderChildren={renderChildren} />
 *
 * function renderChildren({ onToggle }) {
 *     return <Button onClick={onToggle}>Open dropdown</Button>
 * }
 *
 * function renderMenu() {
 *     return (
 *         <Dropdown.Menu>
 *             <Dropdown.Item heading>Heading</Dropdown.Item>
 *             <Dropdown.Item href={...}>...</Dropdown.Item>
 *             <Dropdown.Item onClick={...}>...</Dropdown.Item>
 *
 *             <Dropdown.Item divider />
 *
 *             <Dropdown.Item> A submenu
 *                 <Dropdown.Menu> // Displayed on hover
 *                     <Dropdown.Item href={...}>...</Dropdown.Item>
 *                 </Dropdown.Menu>
 *             </Dropdown.Item>
 *         </Dropdown.Menu>
 *     )
 * }
 */

const Dropdown = React.createClass({
    propTypes: {
        className:  React.PropTypes.string,
        renderChildren: React.PropTypes.func.isRequired,
        renderMenu: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return { open: false };
    },

    /**
     * Toggle the dropdown
     * @param  {Event} e?
     */
    toggle(e) {
        if (e) e.stopPropagation();

        this.setState({ open: !this.state.open });
    },

    /**
     * Close the dropdown
     */
    close() {
        this.setState({ open: false });
    },

    render() {
        let { className, renderMenu, renderChildren } = this.props;
        const { open } = this.state;
        const onToggle = this.toggle;
        const children = renderChildren({ onToggle });

        if (!open) {
            return children;
        } else {
            className = classNames('GitBook-Dropdown', className);

            const wrapper = <div className={className}>{children}</div>;

            return (
                <Backdrop wrapper={wrapper} onClose={this.close}>
                    {renderMenu({ onToggle })}
                </Backdrop>
            );
        }
    }
});

const DropdownItem = React.createClass({
    propTypes: {
        children:  React.PropTypes.node,
        onClick:   React.PropTypes.func,
        href:      React.PropTypes.string,
        disabled:  React.PropTypes.bool,
        divider:   React.PropTypes.bool,
        header:    React.PropTypes.bool
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
            divider, header, disabled, children, href,
            onClick, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        if (divider) {
            return <li className="GitBook-DropdownItem-divider"></li>;
        }
        if (header) {
            return <li className="GitBook-DropdownItem-header">{children}</li>;
        }

        let inner = [], submenu = [];
        submenu = filterChildren(children, isDropdownMenu);
        inner = filterChildren(children, (child) => !isDropdownMenu(child));

        const className = `GitBook-DropdownItem${disabled ? '-disabled' : ''}`;

        return (
            <li className={className}>
                <a href={href || '#'}
                   onClick={disabled ? null : this.onClick}
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

const DropdownMenu = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        children:  React.PropTypes.node,
        open:      React.PropTypes.bool,
        width:     React.PropTypes.string
    },

    getDefaultProps() {
        return {
            open:  true,
            width: null
        };
    },

    render() {
        const { width } = this.props;
        const className = classNames(
            'GitBook-DropdownMenu',
            width ? `GitBook-DropdownMenu-width-${width}` : '',
            {
                open: this.props.open
            }
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

/**
 * Backdrop for modals, dropdown, popover.
 *
 * <Backdrop onClose={onClosePopover}>
 *      <Popover>...</Popover>
 * </Backdrop>
 */
const Backdrop = React.createClass({
    propTypes: {
        children: React.PropTypes.node.isRequired,
        // Callback when backdrop is closed
        onClose:  React.PropTypes.func.isRequired,
        wrapper:  React.PropTypes.node,
        // Close on escape
        escape:   React.PropTypes.bool,
        // Z-index for the backdrop
        zIndex:   React.PropTypes.number
    },

    getDefaultProps() {
        return {
            escape: true,
            zIndex: 200,
            wrapper: <div />
        };
    },

    onClose() {
        const { onClose } = this.props;
        onClose();
    },

    onKeyDown(event) {
        const { escape } = this.props;

        if (event.keyCode === 27 && escape) {
            this.onClose();
        }
    },

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
    },

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    },

    render() {
        const { zIndex, wrapper } = this.props;
        const style = {
            zIndex,
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%'
        };

        return React.cloneElement(wrapper, {},
            <div style={style} onClick={this.onClose}></div>,
            wrapper.props.children,
            this.props.children
        );
    }
});


module.exports             = Dropdown;
module.exports.Item        = DropdownItem;
module.exports.Menu        = DropdownMenu;

