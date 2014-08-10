define([
    "jQuery"
], function($) {
    var url = location.href;
    var title = $("title").text();

    var types = {
        "twitter": function($el) {
            window.open("http://twitter.com/home?status="+encodeURIComponent(title+" "+url))
        },
        "facebook": function($el) {
            window.open("http://www.facebook.com/sharer/sharer.php?s=100&p[url]="+encodeURIComponent(url))
        },
        "google-plus": function($el) {
            window.open("https://plus.google.com/share?url="+encodeURIComponent(url))
        },
        "weibo": function($el) {
            window.open("http://service.weibo.com/share/share.php?content=utf-8&url="+encodeURIComponent(url)+"&title="+encodeURIComponent(title))
        }
    };


    // Bind all sharing button
    var init = function() {
        $(document).on("click", "a[data-sharing],button[data-sharing]", function(e) {
            if (e) e.preventDefault();
            var type = $(this).data("sharing");

            types[type]($(this));
        })
    };

    return {
        init: init
    };
});
