define([], function() {
    var isAvailable = function() {
        return (typeof mixpanel === "undefined");
    };

    var track = function(event, data) {
        if (!isAvailable()) return;
        mixpanel.track(event, data);
    };

    return {
        isAvailable: isAvailable,
        track: track
    };
});