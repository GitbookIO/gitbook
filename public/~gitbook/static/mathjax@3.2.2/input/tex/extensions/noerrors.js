!(function () {
    'use strict';
    var o,
        n,
        r,
        t = {
            667: function (o, n) {
                (n.q = void 0), (n.q = '3.2.2');
            },
            634: function (o, n, r) {
                Object.defineProperty(n, '__esModule', { value: !0 }),
                    (n.NoErrorsConfiguration = void 0);
                var t = r(251);
                n.NoErrorsConfiguration = t.Configuration.create('noerrors', {
                    nodes: {
                        error: function (o, n, r, t) {
                            var e = o.create('token', 'mtext', {}, t.replace(/\n/g, ' '));
                            return o.create('node', 'merror', [e], {
                                'data-mjx-error': n,
                                title: n,
                            });
                        },
                    },
                });
            },
            955: function (o, n) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (n.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (o, n) {
                Object.defineProperty(n, '__esModule', { value: !0 }),
                    (n.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (n.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (n.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
        },
        e = {};
    function a(o) {
        var n = e[o];
        if (void 0 !== n) return n.exports;
        var r = (e[o] = { exports: {} });
        return t[o](r, r.exports, a), r.exports;
    }
    (o = a(955)),
        (n = a(667)),
        (r = a(634)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/noerrors', n.q, 'tex-extension'),
        (0, o.r8)({ _: { input: { tex: { noerrors: { NoErrorsConfiguration: r } } } } });
})();
