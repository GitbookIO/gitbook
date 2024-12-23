!(function () {
    'use strict';
    var a,
        t,
        e,
        p = {
            667: function (a, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            927: function (a, t, e) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.UpgreekConfiguration = void 0);
                var p = e(251),
                    n = e(871),
                    o = e(108);
                new n.CharacterMap(
                    'upgreek',
                    function (a, t) {
                        var e = t.attributes || {};
                        e.mathvariant = o.TexConstant.Variant.NORMAL;
                        var p = a.create('token', 'mi', e, t.char);
                        a.Push(p);
                    },
                    {
                        upalpha: '\u03b1',
                        upbeta: '\u03b2',
                        upgamma: '\u03b3',
                        updelta: '\u03b4',
                        upepsilon: '\u03f5',
                        upzeta: '\u03b6',
                        upeta: '\u03b7',
                        uptheta: '\u03b8',
                        upiota: '\u03b9',
                        upkappa: '\u03ba',
                        uplambda: '\u03bb',
                        upmu: '\u03bc',
                        upnu: '\u03bd',
                        upxi: '\u03be',
                        upomicron: '\u03bf',
                        uppi: '\u03c0',
                        uprho: '\u03c1',
                        upsigma: '\u03c3',
                        uptau: '\u03c4',
                        upupsilon: '\u03c5',
                        upphi: '\u03d5',
                        upchi: '\u03c7',
                        uppsi: '\u03c8',
                        upomega: '\u03c9',
                        upvarepsilon: '\u03b5',
                        upvartheta: '\u03d1',
                        upvarpi: '\u03d6',
                        upvarrho: '\u03f1',
                        upvarsigma: '\u03c2',
                        upvarphi: '\u03c6',
                        Upgamma: '\u0393',
                        Updelta: '\u0394',
                        Uptheta: '\u0398',
                        Uplambda: '\u039b',
                        Upxi: '\u039e',
                        Uppi: '\u03a0',
                        Upsigma: '\u03a3',
                        Upupsilon: '\u03a5',
                        Upphi: '\u03a6',
                        Uppsi: '\u03a8',
                        Upomega: '\u03a9',
                    },
                ),
                    (t.UpgreekConfiguration = p.Configuration.create('upgreek', {
                        handler: { macro: ['upgreek'] },
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
        n = {};
    function o(a) {
        var t = n[a];
        if (void 0 !== t) return t.exports;
        var e = (n[a] = { exports: {} });
        return p[a](e, e.exports, o), e.exports;
    }
    (a = o(955)),
        (t = o(667)),
        (e = o(927)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/upgreek', t.q, 'tex-extension'),
        (0, a.r8)({ _: { input: { tex: { upgreek: { UpgreekConfiguration: e } } } } });
})();
