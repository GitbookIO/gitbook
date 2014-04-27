define([], function() {
    var isAvailable = (typeof applicationCache !== "undefined");

    var init = function() {
        if (!isAvailable) return;

        window.applicationCache.addEventListener('updateready', function() {
            window.location.reload();
        }, false);
    };

    return {
        init: init
    };
});