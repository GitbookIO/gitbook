define([
    "lodash"
], function(_) {
    var isAvailable = function() {
        return (
            typeof mixpanel !== "undefined" &&
            typeof mixpanel.track === "function"
        );
    };

    var track = function(e, data, t) {
        if (!isAvailable()) {
            console.warn("tracking not available!");
            t = t || 500;
            setTimeout(function() {
                console.log(" -> retest tracking");
                track(e, data, t*2);
            }, t);
            return;
        }
        console.log("track", e);
        mixpanel.track(e, _.extend(data || {}, {
            'domain': window.location.host
        }));
    };

    setTimeout(function() {
        mixpanel.init("01eb2b950ae09a5fdb15a98dcc5ff20e");
        track("page.start");
    }, 0);   

    return {
        isAvailable: isAvailable,
        track: track
    };
});