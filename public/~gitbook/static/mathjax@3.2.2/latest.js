!(function () {
    'use strict';
    var t = {
            907: function (t, e) {
                var r =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                a = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && a >= t.length && (t = void 0),
                                            { value: t && t[a++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var a,
                                n,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(a = o.next()).done; )
                                    i.push(a.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return i;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.loadLatest = void 0);
                var n = new Map([
                        [
                            'cdnjs.cloudflare.com',
                            {
                                api: 'https://api.cdnjs.com/libraries/mathjax?fields=version',
                                key: 'version',
                                base: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/',
                            },
                        ],
                        [
                            'rawcdn.githack.com',
                            {
                                api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
                                key: 'tag_name',
                                base: 'https://rawcdn.githack.com/mathjax/MathJax/',
                            },
                        ],
                        [
                            'gitcdn.xyz',
                            {
                                api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
                                key: 'tag_name',
                                base: 'https://gitcdn.xyz/mathjax/MathJax/',
                            },
                        ],
                        [
                            'cdn.statically.io',
                            {
                                api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
                                key: 'tag_name',
                                base: 'https://cdn.statically.io/gh/mathjax/MathJax/',
                            },
                        ],
                        [
                            'unpkg.com',
                            {
                                api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
                                key: 'tag_name',
                                base: 'https://unpkg.com/mathjax@',
                            },
                        ],
                        [
                            'cdn.jsdelivr.net',
                            {
                                api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
                                key: 'tag_name',
                                base: 'https://cdn.jsdelivr.net/npm/mathjax@',
                            },
                        ],
                    ]),
                    o = {
                        api: 'https://api.github.com/repos/mathjax/mathjax/releases',
                        key: 'tag_name',
                    },
                    i = 'mjx-latest-version',
                    c = null;
                function s(t) {
                    console && console.error && console.error('MathJax(latest.js): ' + t);
                }
                function l(t, e) {
                    void 0 === e && (e = null), t.parentNode.removeChild(t);
                    var r = t.src,
                        a = r.replace(/.*?\/latest\.js(\?|$)/, '');
                    '' === a && ((a = 'startup.js'), (r = r.replace(/\?$/, '') + '?' + a));
                    var n = (r.match(/(\d+\.\d+\.\d+)(\/es\d+)?\/latest.js\?/) || ['', ''])[1],
                        o = (r.match(/(\/es\d+)\/latest.js\?/) || ['', ''])[1] || '';
                    return { tag: t, src: r, id: t.id, version: n, dir: o, file: a, cdn: e };
                }
                function u(t) {
                    var e, a;
                    try {
                        for (var o = r(n.keys()), i = o.next(); !i.done; i = o.next()) {
                            var c = i.value,
                                s = n.get(c),
                                u = s.base,
                                d = t.src;
                            if (d && d.substr(0, u.length) === u && d.match(/\/latest\.js(\?|$)/))
                                return l(t, s);
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            i && !i.done && (a = o.return) && a.call(o);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                    return null;
                }
                function d(t, e) {
                    var r = document.createElement('script');
                    (r.type = 'text/javascript'), (r.async = !0), (r.src = t), e && (r.id = e);
                    var a =
                        document.head || document.getElementsByTagName('head')[0] || document.body;
                    a ? a.appendChild(r) : s("Can't find the document <head> element");
                }
                function h() {
                    c
                        ? d(c.src.replace(/\/latest\.js\?/, '/'), c.id)
                        : s("Can't determine the URL for loading MathJax");
                }
                function f(t) {
                    c.version && c.version !== t && (c.file = 'latest.js?' + c.file),
                        d(c.cdn.base + t + c.dir + '/' + c.file, c.id);
                }
                function p(t) {
                    return (
                        3 === parseInt(t.split(/\./)[0]) &&
                        !t.match(/-(beta|rc)/) &&
                        ((function (t) {
                            try {
                                var e = t + ' ' + Date.now();
                                localStorage.setItem(i, e);
                            } catch (t) {}
                        })(t),
                        f(t),
                        !0)
                    );
                }
                function m(t, e, r) {
                    var a = (function () {
                        if (window.XMLHttpRequest) return new XMLHttpRequest();
                        if (window.ActiveXObject) {
                            try {
                                return new window.ActiveXObject('Msxml2.XMLHTTP');
                            } catch (t) {}
                            try {
                                return new window.ActiveXObject('Microsoft.XMLHTTP');
                            } catch (t) {}
                        }
                        return null;
                    })();
                    a
                        ? ((a.onreadystatechange = function () {
                              4 === a.readyState &&
                                  (200 === a.status
                                      ? !e(JSON.parse(a.responseText)) && r()
                                      : (s(
                                            'Problem acquiring MathJax version: status = ' +
                                                a.status,
                                        ),
                                        r()));
                          }),
                          a.open('GET', t.api, !0),
                          a.send(null))
                        : (s("Can't create XMLHttpRequest object"), r());
                }
                function y() {
                    m(
                        c.cdn,
                        function (t) {
                            return (
                                t instanceof Array && (t = t[0]),
                                p(t[c.cdn.key]) ||
                                    m(
                                        o,
                                        function (t) {
                                            var e, a;
                                            if (!(t instanceof Array)) return !1;
                                            try {
                                                for (
                                                    var n = r(t), i = n.next();
                                                    !i.done;
                                                    i = n.next()
                                                )
                                                    if (p(i.value[o.key])) return !0;
                                            } catch (t) {
                                                e = { error: t };
                                            } finally {
                                                try {
                                                    i && !i.done && (a = n.return) && a.call(n);
                                                } finally {
                                                    if (e) throw e.error;
                                                }
                                            }
                                            return !1;
                                        },
                                        h,
                                    ),
                                !0
                            );
                        },
                        h,
                    );
                }
                e.loadLatest = function () {
                    if (
                        (c = (function () {
                            var t, e;
                            if (document.currentScript) return l(document.currentScript);
                            var a = document.getElementById('MathJax-script');
                            if (a && 'script' === a.nodeName.toLowerCase()) return u(a);
                            var n = document.getElementsByTagName('script');
                            try {
                                for (
                                    var o = r(Array.from(n)), i = o.next();
                                    !i.done;
                                    i = o.next()
                                ) {
                                    var c = u(i.value);
                                    if (c) return c;
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    i && !i.done && (e = o.return) && e.call(o);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return null;
                        })()) &&
                        c.cdn
                    ) {
                        var t = (function () {
                            try {
                                var t = a(localStorage.getItem(i).split(/ /), 2),
                                    e = t[0],
                                    r = t[1];
                                if (r && Date.now() - parseInt(r) < 6048e5) return e;
                            } catch (t) {}
                            return null;
                        })();
                        t ? f(t) : y();
                    } else h();
                };
            },
        },
        e = {};
    function r(a) {
        var n = e[a];
        if (void 0 !== n) return n.exports;
        var o = (e[a] = { exports: {} });
        return t[a].call(o.exports, o, o.exports, r), o.exports;
    }
    (r.n = function (t) {
        var e =
            t && t.__esModule
                ? function () {
                      return t.default;
                  }
                : function () {
                      return t;
                  };
        return r.d(e, { a: e }), e;
    }),
        (r.d = function (t, e) {
            for (var a in e)
                r.o(e, a) &&
                    !r.o(t, a) &&
                    Object.defineProperty(t, a, { enumerable: !0, get: e[a] });
        }),
        (r.o = function (t, e) {
            return Object.prototype.hasOwnProperty.call(t, e);
        }),
        (0, r(907).loadLatest)();
})();
