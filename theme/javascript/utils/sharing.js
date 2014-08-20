define([
    "jQuery",
    "utils/qrcode"
], function($, qrcode) {
    var url = location.href;
    var title = $("title").text();
    var qrcodeInfo = {
        width        : 128,
        height       : 128,
        colorDark    : "#000000",
        colorLight   : "#ffffff",
        correctLevel : 2
    };

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
        },
        "qrcode": function($el) {
            popQRCode();
        },
        "instapaper": function($el) {
            window.open("http://www.instapaper.com/text?u="+encodeURIComponent(url));
        }
    };

    // Bind all sharing button
    var init = function() {
        $(document).on("click", "a[data-sharing],button[data-sharing]", function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            var type = $(this).data("sharing");

            types[type]($(this));
        })
    };

    var popQRCode = function() {
        var qrcodeDropdown = $("#dropdown-qrcode");
        if (qrcodeDropdown.hasClass("open")) {
            qrcodeDropdown.removeClass("open");
        } else {
            var current_url = location.href;
            var lastUrl = $("#last_url");
            if (lastUrl[0] && lastUrl.val() !== current_url) {
                qrcodeInfo.text = current_url;
                new qrcode.qrcode($("#qrcode")[0], qrcodeInfo);
            }
            qrcodeDropdown.addClass("open");
            lastUrl.val(current_url);
        }
    }

    return {
        init: init
    };
});
