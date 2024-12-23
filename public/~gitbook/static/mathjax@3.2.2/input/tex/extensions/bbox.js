!(function () {
    'use strict';
    var t,
        a,
        e,
        o = {
            667: function (t, a) {
                (a.q = void 0), (a.q = '3.2.2');
            },
            133: function (t, a, e) {
                var o =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.BboxConfiguration = a.BboxMethods = void 0);
                var n = e(251),
                    i = e(871),
                    r = o(e(402));
                (a.BboxMethods = {}),
                    (a.BboxMethods.BBox = function (t, a) {
                        for (
                            var e,
                                o,
                                n,
                                i = t.GetBrackets(a, ''),
                                l = t.ParseArg(a),
                                x = i.split(/,/),
                                M = 0,
                                s = x.length;
                            M < s;
                            M++
                        ) {
                            var c = x[M].trim(),
                                d = c.match(/^(\.\d+|\d+(\.\d*)?)(pt|em|ex|mu|px|in|cm|mm)$/);
                            if (d) {
                                if (e)
                                    throw new r.default(
                                        'MultipleBBoxProperty',
                                        '%1 specified twice in %2',
                                        'Padding',
                                        a,
                                    );
                                var f = u(d[1] + d[3]);
                                f &&
                                    (e = {
                                        height: '+' + f,
                                        depth: '+' + f,
                                        lspace: f,
                                        width: '+' + 2 * parseInt(d[1], 10) + d[3],
                                    });
                            } else if (c.match(/^([a-z0-9]+|\#[0-9a-f]{6}|\#[0-9a-f]{3})$/i)) {
                                if (o)
                                    throw new r.default(
                                        'MultipleBBoxProperty',
                                        '%1 specified twice in %2',
                                        'Background',
                                        a,
                                    );
                                o = c;
                            } else if (c.match(/^[-a-z]+:/i)) {
                                if (n)
                                    throw new r.default(
                                        'MultipleBBoxProperty',
                                        '%1 specified twice in %2',
                                        'Style',
                                        a,
                                    );
                                n = p(c);
                            } else if ('' !== c)
                                throw new r.default(
                                    'InvalidBBoxProperty',
                                    '"%1" doesn\'t look like a color, a padding dimension, or a style',
                                    c,
                                );
                        }
                        e && (l = t.create('node', 'mpadded', [l], e)),
                            (o || n) &&
                                ((e = {}),
                                o && Object.assign(e, { mathbackground: o }),
                                n && Object.assign(e, { style: n }),
                                (l = t.create('node', 'mstyle', [l], e))),
                            t.Push(l);
                    });
                var p = function (t) {
                        return t;
                    },
                    u = function (t) {
                        return t;
                    };
                new i.CommandMap('bbox', { bbox: 'BBox' }, a.BboxMethods),
                    (a.BboxConfiguration = n.Configuration.create('bbox', {
                        handler: { macro: ['bbox'] },
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
            402: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.default = MathJax._.input.tex.TexError.default);
            },
        },
        n = {};
    function i(t) {
        var a = n[t];
        if (void 0 !== a) return a.exports;
        var e = (n[t] = { exports: {} });
        return o[t].call(e.exports, e, e.exports, i), e.exports;
    }
    (t = i(955)),
        (a = i(667)),
        (e = i(133)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/bbox', a.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { bbox: { BboxConfiguration: e } } } } });
})();
