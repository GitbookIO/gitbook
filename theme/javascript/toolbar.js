var $ = require('jquery');
var _ = require('lodash');

var events = require('./events');

// List of created buttons
var buttons = [];

// Insert a jquery element at a specific position
function insertAt(parent, selector, index, element) {
    var lastIndex = parent.children(selector).size();
    if (index < 0) {
        index = Math.max(0, lastIndex + 1 + index);
    }
    parent.append(element);

    if (index < lastIndex) {
        parent.children(selector).eq(index).before(parent.children(selector).last());
    }
}

// Default click handler
function defaultOnClick(e) {
    e.preventDefault();
}

// Create a dropdown menu
function createDropdownMenu(dropdown) {
    var $menu = $('<div>', {
        'class': 'dropdown-menu',
        'html': '<div class="dropdown-caret"><span class="caret-outer"></span><span class="caret-inner"></span></div>'
    });

    if (_.isString(dropdown)) {
        $menu.append(dropdown);
    } else {
        var groups = _.map(dropdown, function(group) {
            if (_.isArray(group)) return group;
            else return [group];
        });

        // Create buttons groups
        _.each(groups, function(group) {
            var $group = $('<div>', {
                'class': 'buttons'
            });
            var sizeClass = 'size-'+group.length;

            // Append buttons
            _.each(group, function(btn) {
                btn = _.defaults(btn || {}, {
                    text: '',
                    className: '',
                    onClick: defaultOnClick
                });

                var $btn = $('<button>', {
                    'class': 'button '+sizeClass+' '+btn.className,
                    'text': btn.text
                });
                $btn.click(btn.onClick);

                $group.append($btn);
            });


            $menu.append($group);
        });

    }


    return $menu;
}

// Create a new button in the toolbar
function createButton(opts) {
    opts = _.defaults(opts || {}, {
        // Aria label for the button
        label: '',

        // Icon to show
        icon: '',

        // Inner text
        text: '',

        // Right or left position
        position: 'left',

        // Other class name to add to the button
        className: '',

        // Triggered when user click on the button
        onClick: defaultOnClick,

        // Button is a dropdown
        dropdown: null,

        // Position in the toolbar
        index: null
    });

    buttons.push(opts);
    updateButton(opts);
}

// Update a button
function updateButton(opts) {
    var $result;
    var $toolbar = $('.book-header');
    var $title = $toolbar.find('h1');

    // Build class name
    var positionClass = 'pull-'+opts.position;

    // Create button
    var $btn = $('<a>', {
        'class': 'btn',
        'text': opts.text? ' ' + opts.text : '',
        'aria-label': opts.label,
        'href': '#'
    });

    // Bind click
    $btn.click(opts.onClick);

    // Prepend icon
    if (opts.icon) {
        $('<i>', {
            'class': opts.icon
        }).prependTo($btn);
    }

    // Prepare dropdown
    if (opts.dropdown) {
        var $container = $('<div>', {
            'class': 'dropdown '+positionClass+' '+opts.className
        });

        // Add button to container
        $btn.addClass('toggle-dropdown');
        $container.append($btn);

        // Create inner menu
        var $menu = createDropdownMenu(opts.dropdown);

        // Menu position
        $menu.addClass('dropdown-'+(opts.position == 'right'? 'left' : 'right'));

        $container.append($menu);
        $result = $container;
    } else {
        $btn.addClass(positionClass);
        $btn.addClass(opts.className);
        $result = $btn;
    }

    $result.addClass('js-toolbar-action');

    if (_.isNumber(opts.index) && opts.index >= 0) {
        insertAt($toolbar, '.btn, .dropdown, h1', opts.index, $result);
    } else {
        $result.insertBefore($title);
    }
}

// Update all buttons
function updateAllButtons() {
    $('.js-toolbar-action').remove();
    _.each(buttons, updateButton);
}

// When page changed, reset buttons
events.bind('page.change', function() {
    updateAllButtons();
});

module.exports = {
    createButton: createButton
};
