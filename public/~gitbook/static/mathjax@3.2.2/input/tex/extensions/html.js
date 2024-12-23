!(function () {
    'use strict';
    var t,
        e,
        a,
        n,
        r = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            738: function (t, e, a) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.HtmlConfiguration = void 0);
                var r = a(251),
                    o = a(871),
                    i = n(a(248));
                new o.CommandMap(
                    'html_macros',
                    { href: 'Href', class: 'Class', style: 'Style', cssId: 'Id' },
                    i.default,
                ),
                    (e.HtmlConfiguration = r.Configuration.create('html', {
                        handler: { macro: ['html_macros'] },
                    }));
            },
            248: function (t, e, a) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var r = n(a(748)),
                    o = {
                        Href: function (t, e) {
                            var a = t.GetArgument(e),
                                n = i(t, e);
                            r.default.setAttribute(n, 'href', a), t.Push(n);
                        },
                        Class: function (t, e) {
                            var a = t.GetArgument(e),
                                n = i(t, e),
                                o = r.default.getAttribute(n, 'class');
                            o && (a = o + ' ' + a),
                                r.default.setAttribute(n, 'class', a),
                                t.Push(n);
                        },
                        Style: function (t, e) {
                            var a = t.GetArgument(e),
                                n = i(t, e),
                                o = r.default.getAttribute(n, 'style');
                            o && (';' !== a.charAt(a.length - 1) && (a += ';'), (a = o + ' ' + a)),
                                r.default.setAttribute(n, 'style', a),
                                t.Push(n);
                        },
                        Id: function (t, e) {
                            var a = t.GetArgument(e),
                                n = i(t, e);
                            r.default.setAttribute(n, 'id', a), t.Push(n);
                        },
                    },
                    i = function (t, e) {
                        var a = t.ParseArg(e);
                        if (!r.default.isInferred(a)) return a;
                        var n = r.default.getChildren(a);
                        if (1 === n.length) return n[0];
                        var o = t.create('node', 'mrow');
                        return r.default.copyChildren(a, o), r.default.copyAttributes(a, o), o;
                    };
                e.default = o;
            },
            955: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (e.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (e.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            748: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.NodeUtil.default);
            },
            871: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.parseResult = MathJax._.input.tex.SymbolMap.parseResult),
                    (e.AbstractSymbolMap = MathJax._.input.tex.SymbolMap.AbstractSymbolMap),
                    (e.RegExpMap = MathJax._.input.tex.SymbolMap.RegExpMap),
                    (e.AbstractParseMap = MathJax._.input.tex.SymbolMap.AbstractParseMap),
                    (e.CharacterMap = MathJax._.input.tex.SymbolMap.CharacterMap),
                    (e.DelimiterMap = MathJax._.input.tex.SymbolMap.DelimiterMap),
                    (e.MacroMap = MathJax._.input.tex.SymbolMap.MacroMap),
                    (e.CommandMap = MathJax._.input.tex.SymbolMap.CommandMap),
                    (e.EnvironmentMap = MathJax._.input.tex.SymbolMap.EnvironmentMap);
            },
        },
        o = {};
    function i(t) {
        var e = o[t];
        if (void 0 !== e) return e.exports;
        var a = (o[t] = { exports: {} });
        return r[t].call(a.exports, a, a.exports, i), a.exports;
    }
    (t = i(955)),
        (e = i(667)),
        (a = i(738)),
        (n = i(248)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/html', e.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { html: { HtmlConfiguration: a, HtmlMethods: n } } } } });
})();
