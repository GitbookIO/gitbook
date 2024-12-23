!(function () {
    'use strict';
    var t,
        e,
        a,
        n = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            768: function (t, e, a) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.VerbConfiguration = e.VerbMethods = void 0);
                var o = a(251),
                    r = a(108),
                    i = a(871),
                    u = n(a(402));
                (e.VerbMethods = {}),
                    (e.VerbMethods.Verb = function (t, e) {
                        var a = t.GetNext(),
                            n = ++t.i;
                        if ('' === a)
                            throw new u.default('MissingArgFor', 'Missing argument for %1', e);
                        for (; t.i < t.string.length && t.string.charAt(t.i) !== a; ) t.i++;
                        if (t.i === t.string.length)
                            throw new u.default(
                                'NoClosingDelim',
                                "Can't find closing delimiter for %1",
                                t.currentCS,
                            );
                        var o = t.string.slice(n, t.i).replace(/ /g, '\xa0');
                        t.i++,
                            t.Push(
                                t.create(
                                    'token',
                                    'mtext',
                                    { mathvariant: r.TexConstant.Variant.MONOSPACE },
                                    o,
                                ),
                            );
                    }),
                    new i.CommandMap('verb', { verb: 'Verb' }, e.VerbMethods),
                    (e.VerbConfiguration = o.Configuration.create('verb', {
                        handler: { macro: ['verb'] },
                    }));
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
            108: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TexConstant = MathJax._.input.tex.TexConstants.TexConstant);
            },
            402: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexError.default);
            },
        },
        o = {};
    function r(t) {
        var e = o[t];
        if (void 0 !== e) return e.exports;
        var a = (o[t] = { exports: {} });
        return n[t].call(a.exports, a, a.exports, r), a.exports;
    }
    (t = r(955)),
        (e = r(667)),
        (a = r(768)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/verb', e.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { verb: { VerbConfiguration: a } } } } });
})();
