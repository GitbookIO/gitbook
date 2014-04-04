define([
    "mixpanel"
], function(mixpanel) {
    mixpanel.init("01eb2b950ae09a5fdb15a98dcc5ff20e");

    var isAvailable = function() {
        return (typeof mixpanel !== "undefined");
    };

    var track = function(event, data) {
        if (!isAvailable()) {
            console.log("tracking not available!");
            return;
        }
        mixpanel.track(event, data);
    };

    return {
        isAvailable: isAvailable,
        track: track
    };
});