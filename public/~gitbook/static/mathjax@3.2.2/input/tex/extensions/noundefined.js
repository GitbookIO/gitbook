!(function () {
    'use strict';
    var n,
        o,
        e,
        t = {
            667: function (n, o) {
                (o.q = void 0), (o.q = '3.2.2');
            },
            999: function (n, o, e) {
                var t =
                    (this && this.__values) ||
                    function (n) {
                        var o = 'function' == typeof Symbol && Symbol.iterator,
                            e = o && n[o],
                            t = 0;
                        if (e) return e.call(n);
                        if (n && 'number' == typeof n.length)
                            return {
                                next: function () {
                                    return (
                                        n && t >= n.length && (n = void 0),
                                        { value: n && n[t++], done: !n }
                                    );
                                },
                            };
                        throw new TypeError(
                            o ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                        );
                    };
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.NoUndefinedConfiguration = void 0);
                var r = e(251);
                o.NoUndefinedConfiguration = r.Configuration.create('noundefined', {
                    fallback: {
                        macro: function (n, o) {
                            var e,
                                r,
                                i = n.create('text', '\\' + o),
                                a = n.options.noundefined || {},
                                u = {};
                            try {
                                for (
                                    var f = t(['color', 'background', 'size']), l = f.next();
                                    !l.done;
                                    l = f.next()
                                ) {
                                    var c = l.value;
                                    a[c] && (u['math' + c] = a[c]);
                                }
                            } catch (n) {
                                e = { error: n };
                            } finally {
                                try {
                                    l && !l.done && (r = f.return) && r.call(f);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            n.Push(n.create('node', 'mtext', [], u, i));
                        },
                    },
                    options: { noundefined: { color: 'red', background: '', size: '' } },
                    priority: 3,
                });
            },
            955: function (n, o) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (o.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (n, o) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (o.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (o.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
        },
        r = {};
    function i(n) {
        var o = r[n];
        if (void 0 !== o) return o.exports;
        var e = (r[n] = { exports: {} });
        return t[n].call(e.exports, e, e.exports, i), e.exports;
    }
    (n = i(955)),
        (o = i(667)),
        (e = i(999)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/noundefined', o.q, 'tex-extension'),
        (0, n.r8)({ _: { input: { tex: { noundefined: { NoUndefinedConfiguration: e } } } } });
})();
