!(function () {
    'use strict';
    var a,
        t,
        e,
        o = {
            667: function (a, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            272: function (a, t, e) {
                var o =
                    (this && this.__importDefault) ||
                    function (a) {
                        return a && a.__esModule ? a : { default: a };
                    };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.EncloseConfiguration = t.EncloseMethods = t.ENCLOSE_OPTIONS = void 0);
                var n = e(251),
                    r = e(871),
                    i = o(e(398));
                (t.ENCLOSE_OPTIONS = {
                    'data-arrowhead': 1,
                    color: 1,
                    mathcolor: 1,
                    background: 1,
                    mathbackground: 1,
                    'data-padding': 1,
                    'data-thickness': 1,
                }),
                    (t.EncloseMethods = {}),
                    (t.EncloseMethods.Enclose = function (a, e) {
                        var o = a.GetArgument(e).replace(/,/g, ' '),
                            n = a.GetBrackets(e, ''),
                            r = a.ParseArg(e),
                            l = i.default.keyvalOptions(n, t.ENCLOSE_OPTIONS);
                        (l.notation = o), a.Push(a.create('node', 'menclose', [r], l));
                    }),
                    new r.CommandMap('enclose', { enclose: 'Enclose' }, t.EncloseMethods),
                    (t.EncloseConfiguration = n.Configuration.create('enclose', {
                        handler: { macro: ['enclose'] },
                    }));
            },
            955: function (a, t) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (t.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (a, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (t.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (t.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            398: function (a, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.ParseUtil.default);
            },
            871: function (a, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.parseResult = MathJax._.input.tex.SymbolMap.parseResult),
                    (t.AbstractSymbolMap = MathJax._.input.tex.SymbolMap.AbstractSymbolMap),
                    (t.RegExpMap = MathJax._.input.tex.SymbolMap.RegExpMap),
                    (t.AbstractParseMap = MathJax._.input.tex.SymbolMap.AbstractParseMap),
                    (t.CharacterMap = MathJax._.input.tex.SymbolMap.CharacterMap),
                    (t.DelimiterMap = MathJax._.input.tex.SymbolMap.DelimiterMap),
                    (t.MacroMap = MathJax._.input.tex.SymbolMap.MacroMap),
                    (t.CommandMap = MathJax._.input.tex.SymbolMap.CommandMap),
                    (t.EnvironmentMap = MathJax._.input.tex.SymbolMap.EnvironmentMap);
            },
        },
        n = {};
    function r(a) {
        var t = n[a];
        if (void 0 !== t) return t.exports;
        var e = (n[a] = { exports: {} });
        return o[a].call(e.exports, e, e.exports, r), e.exports;
    }
    (a = r(955)),
        (t = r(667)),
        (e = r(272)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/enclose', t.q, 'tex-extension'),
        (0, a.r8)({ _: { input: { tex: { enclose: { EncloseConfiguration: e } } } } });
})();
