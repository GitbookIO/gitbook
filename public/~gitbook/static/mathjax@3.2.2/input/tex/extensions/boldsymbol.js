!(function () {
    'use strict';
    var t,
        a,
        o,
        e = {
            667: function (t, a) {
                (a.q = void 0), (a.q = '3.2.2');
            },
            986: function (t, a, o) {
                var e =
                        (this && this.__values) ||
                        function (t) {
                            var a = 'function' == typeof Symbol && Symbol.iterator,
                                o = a && t[a],
                                e = 0;
                            if (o) return o.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && e >= t.length && (t = void 0),
                                            { value: t && t[e++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                a ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    n =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.BoldsymbolConfiguration =
                        a.rewriteBoldTokens =
                        a.createBoldToken =
                        a.BoldsymbolMethods =
                            void 0);
                var r = o(251),
                    i = n(o(748)),
                    l = o(108),
                    s = o(871),
                    u = o(348),
                    d = {};
                function x(t, a, o, e) {
                    var n = u.NodeFactory.createToken(t, a, o, e);
                    return (
                        'mtext' !== a &&
                            t.configuration.parser.stack.env.boldsymbol &&
                            (i.default.setProperty(n, 'fixBold', !0),
                            t.configuration.addNode('fixBold', n)),
                        n
                    );
                }
                function p(t) {
                    var a, o;
                    try {
                        for (
                            var n = e(t.data.getList('fixBold')), r = n.next();
                            !r.done;
                            r = n.next()
                        ) {
                            var s = r.value;
                            if (i.default.getProperty(s, 'fixBold')) {
                                var u = i.default.getAttribute(s, 'mathvariant');
                                null == u
                                    ? i.default.setAttribute(
                                          s,
                                          'mathvariant',
                                          l.TexConstant.Variant.BOLD,
                                      )
                                    : i.default.setAttribute(s, 'mathvariant', d[u] || u),
                                    i.default.removeProperties(s, 'fixBold');
                            }
                        }
                    } catch (t) {
                        a = { error: t };
                    } finally {
                        try {
                            r && !r.done && (o = n.return) && o.call(n);
                        } finally {
                            if (a) throw a.error;
                        }
                    }
                }
                (d[l.TexConstant.Variant.NORMAL] = l.TexConstant.Variant.BOLD),
                    (d[l.TexConstant.Variant.ITALIC] = l.TexConstant.Variant.BOLDITALIC),
                    (d[l.TexConstant.Variant.FRAKTUR] = l.TexConstant.Variant.BOLDFRAKTUR),
                    (d[l.TexConstant.Variant.SCRIPT] = l.TexConstant.Variant.BOLDSCRIPT),
                    (d[l.TexConstant.Variant.SANSSERIF] = l.TexConstant.Variant.BOLDSANSSERIF),
                    (d['-tex-calligraphic'] = '-tex-bold-calligraphic'),
                    (d['-tex-oldstyle'] = '-tex-bold-oldstyle'),
                    (d['-tex-mathit'] = l.TexConstant.Variant.BOLDITALIC),
                    (a.BoldsymbolMethods = {}),
                    (a.BoldsymbolMethods.Boldsymbol = function (t, a) {
                        var o = t.stack.env.boldsymbol;
                        t.stack.env.boldsymbol = !0;
                        var e = t.ParseArg(a);
                        (t.stack.env.boldsymbol = o), t.Push(e);
                    }),
                    new s.CommandMap(
                        'boldsymbol',
                        { boldsymbol: 'Boldsymbol' },
                        a.BoldsymbolMethods,
                    ),
                    (a.createBoldToken = x),
                    (a.rewriteBoldTokens = p),
                    (a.BoldsymbolConfiguration = r.Configuration.create('boldsymbol', {
                        handler: { macro: ['boldsymbol'] },
                        nodes: { token: x },
                        postprocessors: [p],
                    }));
            },
            955: function (t, a) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (a.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (a.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (a.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            348: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.NodeFactory = MathJax._.input.tex.NodeFactory.NodeFactory);
            },
            748: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.default = MathJax._.input.tex.NodeUtil.default);
            },
            871: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.parseResult = MathJax._.input.tex.SymbolMap.parseResult),
                    (a.AbstractSymbolMap = MathJax._.input.tex.SymbolMap.AbstractSymbolMap),
                    (a.RegExpMap = MathJax._.input.tex.SymbolMap.RegExpMap),
                    (a.AbstractParseMap = MathJax._.input.tex.SymbolMap.AbstractParseMap),
                    (a.CharacterMap = MathJax._.input.tex.SymbolMap.CharacterMap),
                    (a.DelimiterMap = MathJax._.input.tex.SymbolMap.DelimiterMap),
                    (a.MacroMap = MathJax._.input.tex.SymbolMap.MacroMap),
                    (a.CommandMap = MathJax._.input.tex.SymbolMap.CommandMap),
                    (a.EnvironmentMap = MathJax._.input.tex.SymbolMap.EnvironmentMap);
            },
            108: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.TexConstant = MathJax._.input.tex.TexConstants.TexConstant);
            },
        },
        n = {};
    function r(t) {
        var a = n[t];
        if (void 0 !== a) return a.exports;
        var o = (n[t] = { exports: {} });
        return e[t].call(o.exports, o, o.exports, r), o.exports;
    }
    (t = r(955)),
        (a = r(667)),
        (o = r(986)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/boldsymbol', a.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { boldsymbol: { BoldsymbolConfiguration: o } } } } });
})();
