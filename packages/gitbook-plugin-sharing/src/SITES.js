// All the sharing platforms
const SITES = {

    // One sharing platform
    'facebook': {
        // Displayed name
        label: 'Facebook',

        // Font-awesome icon id
        icon: 'facebook',

        /**
         * Share a page on this platform
         * @param {String} url The url to share
         * @param {String} title The title of the url page
         */
        onShare(url, title) {
            url = encodeURIComponent(url);
            window.open(`http://www.facebook.com/sharer/sharer.php?s=100&p[url]=${url}`);
        }
    },

    'twitter': {
        label: 'Twitter',
        icon: 'twitter',
        onShare(url, title) {
            const status = encodeURIComponent(title + ' ' + url);
            window.open(`http://twitter.com/home?status=${status}`);
        }
    },

    'google': {
        label: 'Google+',
        icon: 'google-plus',
        onShare(url, title) {
            url = encodeURIComponent(url);
            window.open(`https://plus.google.com/share?url=${url}`);
        }
    },

    'weibo': {
        label: 'Weibo',
        icon: 'weibo',
        onShare(url, title) {
            url = encodeURIComponent(url);
            title = encodeURIComponent(title);
            window.open(`http://service.weibo.com/share/share.php?content=utf-8&url=${url}&title=${title}`);
        }
    },

    'instapaper': {
        label: 'Instapaper',
        icon: 'instapaper',
        onShare(url, title) {
            url = encodeURIComponent(url);
            window.open(`http://www.instapaper.com/text?u=${url}`);
        }
    },

    'vk': {
        label: 'VK',
        icon: 'vk',
        onShare(url, title) {
            url = encodeURIComponent(url);
            window.open(`http://vkontakte.ru/share.php?url=${url}`);
        }
    }
};

SITES.ALL = Object.keys(SITES);

module.exports = SITES;
