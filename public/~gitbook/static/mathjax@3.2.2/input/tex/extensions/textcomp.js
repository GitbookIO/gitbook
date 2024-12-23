!(function () {
    'use strict';
    var t,
        e,
        n,
        r = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            845: function (t, e, n) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextcompConfiguration = void 0);
                var r = n(251);
                n(832),
                    (e.TextcompConfiguration = r.Configuration.create('textcomp', {
                        handler: { macro: ['textcomp-macros'] },
                    }));
            },
            832: function (t, e, n) {
                var r =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = n(871),
                    s = n(108),
                    o = n(245),
                    x = r(n(398)),
                    i = n(988);
                new a.CommandMap(
                    'textcomp-macros',
                    {
                        textasciicircum: ['Insert', '^'],
                        textasciitilde: ['Insert', '~'],
                        textasteriskcentered: ['Insert', '*'],
                        textbackslash: ['Insert', '\\'],
                        textbar: ['Insert', '|'],
                        textbraceleft: ['Insert', '{'],
                        textbraceright: ['Insert', '}'],
                        textbullet: ['Insert', '\u2022'],
                        textdagger: ['Insert', '\u2020'],
                        textdaggerdbl: ['Insert', '\u2021'],
                        textellipsis: ['Insert', '\u2026'],
                        textemdash: ['Insert', '\u2014'],
                        textendash: ['Insert', '\u2013'],
                        textexclamdown: ['Insert', '\xa1'],
                        textgreater: ['Insert', '>'],
                        textless: ['Insert', '<'],
                        textordfeminine: ['Insert', '\xaa'],
                        textordmasculine: ['Insert', '\xba'],
                        textparagraph: ['Insert', '\xb6'],
                        textperiodcentered: ['Insert', '\xb7'],
                        textquestiondown: ['Insert', '\xbf'],
                        textquotedblleft: ['Insert', '\u201c'],
                        textquotedblright: ['Insert', '\u201d'],
                        textquoteleft: ['Insert', '\u2018'],
                        textquoteright: ['Insert', '\u2019'],
                        textsection: ['Insert', '\xa7'],
                        textunderscore: ['Insert', '_'],
                        textvisiblespace: ['Insert', '\u2423'],
                        textacutedbl: ['Insert', '\u02dd'],
                        textasciiacute: ['Insert', '\xb4'],
                        textasciibreve: ['Insert', '\u02d8'],
                        textasciicaron: ['Insert', '\u02c7'],
                        textasciidieresis: ['Insert', '\xa8'],
                        textasciimacron: ['Insert', '\xaf'],
                        textgravedbl: ['Insert', '\u02f5'],
                        texttildelow: ['Insert', '\u02f7'],
                        textbaht: ['Insert', '\u0e3f'],
                        textcent: ['Insert', '\xa2'],
                        textcolonmonetary: ['Insert', '\u20a1'],
                        textcurrency: ['Insert', '\xa4'],
                        textdollar: ['Insert', '$'],
                        textdong: ['Insert', '\u20ab'],
                        texteuro: ['Insert', '\u20ac'],
                        textflorin: ['Insert', '\u0192'],
                        textguarani: ['Insert', '\u20b2'],
                        textlira: ['Insert', '\u20a4'],
                        textnaira: ['Insert', '\u20a6'],
                        textpeso: ['Insert', '\u20b1'],
                        textsterling: ['Insert', '\xa3'],
                        textwon: ['Insert', '\u20a9'],
                        textyen: ['Insert', '\xa5'],
                        textcircledP: ['Insert', '\u2117'],
                        textcompwordmark: ['Insert', '\u200c'],
                        textcopyleft: ['Insert', '\ud83c\udd2f'],
                        textcopyright: ['Insert', '\xa9'],
                        textregistered: ['Insert', '\xae'],
                        textservicemark: ['Insert', '\u2120'],
                        texttrademark: ['Insert', '\u2122'],
                        textbardbl: ['Insert', '\u2016'],
                        textbigcircle: ['Insert', '\u25ef'],
                        textblank: ['Insert', '\u2422'],
                        textbrokenbar: ['Insert', '\xa6'],
                        textdiscount: ['Insert', '\u2052'],
                        textestimated: ['Insert', '\u212e'],
                        textinterrobang: ['Insert', '\u203d'],
                        textinterrobangdown: ['Insert', '\u2e18'],
                        textmusicalnote: ['Insert', '\u266a'],
                        textnumero: ['Insert', '\u2116'],
                        textopenbullet: ['Insert', '\u25e6'],
                        textpertenthousand: ['Insert', '\u2031'],
                        textperthousand: ['Insert', '\u2030'],
                        textrecipe: ['Insert', '\u211e'],
                        textreferencemark: ['Insert', '\u203b'],
                        textlangle: ['Insert', '\u2329'],
                        textrangle: ['Insert', '\u232a'],
                        textlbrackdbl: ['Insert', '\u27e6'],
                        textrbrackdbl: ['Insert', '\u27e7'],
                        textlquill: ['Insert', '\u2045'],
                        textrquill: ['Insert', '\u2046'],
                        textcelsius: ['Insert', '\u2103'],
                        textdegree: ['Insert', '\xb0'],
                        textdiv: ['Insert', '\xf7'],
                        textdownarrow: ['Insert', '\u2193'],
                        textfractionsolidus: ['Insert', '\u2044'],
                        textleftarrow: ['Insert', '\u2190'],
                        textlnot: ['Insert', '\xac'],
                        textmho: ['Insert', '\u2127'],
                        textminus: ['Insert', '\u2212'],
                        textmu: ['Insert', '\xb5'],
                        textohm: ['Insert', '\u2126'],
                        textonehalf: ['Insert', '\xbd'],
                        textonequarter: ['Insert', '\xbc'],
                        textonesuperior: ['Insert', '\xb9'],
                        textpm: ['Insert', '\xb1'],
                        textrightarrow: ['Insert', '\u2192'],
                        textsurd: ['Insert', '\u221a'],
                        textthreequarters: ['Insert', '\xbe'],
                        textthreesuperior: ['Insert', '\xb3'],
                        texttimes: ['Insert', '\xd7'],
                        texttwosuperior: ['Insert', '\xb2'],
                        textuparrow: ['Insert', '\u2191'],
                        textborn: ['Insert', '*'],
                        textdied: ['Insert', '\u2020'],
                        textdivorced: ['Insert', '\u26ae'],
                        textmarried: ['Insert', '\u26ad'],
                        textcentoldstyle: ['Insert', '\xa2', s.TexConstant.Variant.OLDSTYLE],
                        textdollaroldstyle: ['Insert', '$', s.TexConstant.Variant.OLDSTYLE],
                        textzerooldstyle: ['Insert', '0', s.TexConstant.Variant.OLDSTYLE],
                        textoneoldstyle: ['Insert', '1', s.TexConstant.Variant.OLDSTYLE],
                        texttwooldstyle: ['Insert', '2', s.TexConstant.Variant.OLDSTYLE],
                        textthreeoldstyle: ['Insert', '3', s.TexConstant.Variant.OLDSTYLE],
                        textfouroldstyle: ['Insert', '4', s.TexConstant.Variant.OLDSTYLE],
                        textfiveoldstyle: ['Insert', '5', s.TexConstant.Variant.OLDSTYLE],
                        textsixoldstyle: ['Insert', '6', s.TexConstant.Variant.OLDSTYLE],
                        textsevenoldstyle: ['Insert', '7', s.TexConstant.Variant.OLDSTYLE],
                        texteightoldstyle: ['Insert', '8', s.TexConstant.Variant.OLDSTYLE],
                        textnineoldstyle: ['Insert', '9', s.TexConstant.Variant.OLDSTYLE],
                    },
                    {
                        Insert: function (t, e, n, r) {
                            if (t instanceof i.TextParser) {
                                if (!r) return void o.TextMacrosMethods.Insert(t, e, n);
                                t.saveText();
                            }
                            t.Push(x.default.internalText(t, n, r ? { mathvariant: r } : {}));
                        },
                    },
                );
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
            398: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseUtil.default);
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
            245: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextMacrosMethods =
                        MathJax._.input.tex.textmacros.TextMacrosMethods.TextMacrosMethods);
            },
            988: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextParser = MathJax._.input.tex.textmacros.TextParser.TextParser);
            },
        },
        a = {};
    function s(t) {
        var e = a[t];
        if (void 0 !== e) return e.exports;
        var n = (a[t] = { exports: {} });
        return r[t].call(n.exports, n, n.exports, s), n.exports;
    }
    (t = s(955)),
        (e = s(667)),
        (n = s(845)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/textcomp', e.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { textcomp: { TextcompConfiguration: n } } } } });
})();
