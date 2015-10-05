define([
    'jQuery',
    'lodash',
    'core/events'
], function($, _, events) {
    // List of created buttons
    var buttons = [];


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
            dropdown: null
        });

        buttons.push(opts);
        updateButton(opts);
    }

    // Update a button
    function updateButton(opts) {
        var $toolbar = $('.book-header');
        var $title = $toolbar.find('h1');

        // Build class name
        var positionClass = 'pull-'+opts.position;

        // Create button
        var $btn = $('<a>', {
            'class': 'btn',
            'text': opts.text,
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

            $container.insertBefore($title);
        } else {
            $btn.addClass(positionClass);
            $btn.addClass(opts.className);
            $btn.insertBefore($title);
        }
    }

    // Update all buttons
    function updateAllButtons() {
        _.each(buttons, updateButton);
    }

    // When page changed, reset buttons
    events.bind('page.change', function() {
        updateAllButtons();
    });

    return {
        createButton: createButton
    };
});
