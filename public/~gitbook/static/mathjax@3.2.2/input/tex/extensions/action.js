!(function () {
    'use strict';
    var t,
        a,
        e,
        o = {
            667: function (t, a) {
                (a.q = void 0), (a.q = '3.2.2');
            },
            669: function (t, a, e) {
                var o =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.ActionConfiguration = a.ActionMethods = void 0);
                var n = e(251),
                    i = o(e(193)),
                    r = e(871),
                    u = o(e(360));
                (a.ActionMethods = {}),
                    (a.ActionMethods.Macro = u.default.Macro),
                    (a.ActionMethods.Toggle = function (t, a) {
                        for (var e, o = []; '\\endtoggle' !== (e = t.GetArgument(a)); )
                            o.push(new i.default(e, t.stack.env, t.configuration).mml());
                        t.Push(t.create('node', 'maction', o, { actiontype: 'toggle' }));
                    }),
                    (a.ActionMethods.Mathtip = function (t, a) {
                        var e = t.ParseArg(a),
                            o = t.ParseArg(a);
                        t.Push(t.create('node', 'maction', [e, o], { actiontype: 'tooltip' }));
                    }),
                    new r.CommandMap(
                        'action-macros',
                        {
                            toggle: 'Toggle',
                            mathtip: 'Mathtip',
                            texttip: ['Macro', '\\mathtip{#1}{\\text{#2}}', 2],
                        },
                        a.ActionMethods,
                    ),
                    (a.ActionConfiguration = n.Configuration.create('action', {
                        handler: { macro: ['action-macros'] },
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
            193: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.default = MathJax._.input.tex.TexParser.default);
            },
            360: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.default = MathJax._.input.tex.base.BaseMethods.default);
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
        (e = i(669)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/action', a.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { action: { ActionConfiguration: e } } } } });
})();
