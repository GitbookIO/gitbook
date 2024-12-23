!(function () {
    'use strict';
    var a,
        t,
        n,
        e = {
            667: function (a, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            82: function (a, t, n) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.GensymbConfiguration = void 0);
                var e = n(251),
                    o = n(108);
                new (n(871).CharacterMap)(
                    'gensymb-symbols',
                    function (a, t) {
                        var n = t.attributes || {};
                        (n.mathvariant = o.TexConstant.Variant.NORMAL), (n.class = 'MathML-Unit');
                        var e = a.create('token', 'mi', n, t.char);
                        a.Push(e);
                    },
                    {
                        ohm: '\u2126',
                        degree: '\xb0',
                        celsius: '\u2103',
                        perthousand: '\u2030',
                        micro: '\xb5',
                    },
                ),
                    (t.GensymbConfiguration = e.Configuration.create('gensymb', {
                        handler: { macro: ['gensymb-symbols'] },
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
            108: function (a, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.TexConstant = MathJax._.input.tex.TexConstants.TexConstant);
            },
        },
        o = {};
    function i(a) {
        var t = o[a];
        if (void 0 !== t) return t.exports;
        var n = (o[a] = { exports: {} });
        return e[a](n, n.exports, i), n.exports;
    }
    (a = i(955)),
        (t = i(667)),
        (n = i(82)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/gensymb', t.q, 'tex-extension'),
        (0, a.r8)({ _: { input: { tex: { gensymb: { GensymbConfiguration: n } } } } });
})();
