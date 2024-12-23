!(function () {
    'use strict';
    var t,
        e,
        o,
        n = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            78: function (t, e, o) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MhchemConfiguration = void 0);
                var a = o(251),
                    r = o(871),
                    i = n(o(402)),
                    p = n(o(360)),
                    c = o(939),
                    u = o(652),
                    s = {};
                (s.Macro = p.default.Macro),
                    (s.xArrow = c.AmsMethods.xArrow),
                    (s.Machine = function (t, e, o) {
                        var n,
                            a = t.GetArgument(e);
                        try {
                            n = u.mhchemParser.toTex(a, o);
                        } catch (t) {
                            throw new i.default(t[0], t[1]);
                        }
                        (t.string = n + t.string.substr(t.i)), (t.i = 0);
                    }),
                    new r.CommandMap(
                        'mhchem',
                        {
                            ce: ['Machine', 'ce'],
                            pu: ['Machine', 'pu'],
                            longrightleftharpoons: [
                                'Macro',
                                '\\stackrel{\\textstyle{-}\\!\\!{\\rightharpoonup}}{\\smash{{\\leftharpoondown}\\!\\!{-}}}',
                            ],
                            longRightleftharpoons: [
                                'Macro',
                                '\\stackrel{\\textstyle{-}\\!\\!{\\rightharpoonup}}{\\smash{\\leftharpoondown}}',
                            ],
                            longLeftrightharpoons: [
                                'Macro',
                                '\\stackrel{\\textstyle\\vphantom{{-}}{\\rightharpoonup}}{\\smash{{\\leftharpoondown}\\!\\!{-}}}',
                            ],
                            longleftrightarrows: [
                                'Macro',
                                '\\stackrel{\\longrightarrow}{\\smash{\\longleftarrow}\\Rule{0px}{.25em}{0px}}',
                            ],
                            tripledash: [
                                'Macro',
                                '\\vphantom{-}\\raise2mu{\\kern2mu\\tiny\\text{-}\\kern1mu\\text{-}\\kern1mu\\text{-}\\kern2mu}',
                            ],
                            xleftrightarrow: ['xArrow', 8596, 6, 6],
                            xrightleftharpoons: ['xArrow', 8652, 5, 7],
                            xRightleftharpoons: ['xArrow', 8652, 5, 7],
                            xLeftrightharpoons: ['xArrow', 8652, 5, 7],
                        },
                        s,
                    ),
                    (e.MhchemConfiguration = a.Configuration.create('mhchem', {
                        handler: { macro: ['mhchem'] },
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
            402: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexError.default);
            },
            360: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.base.BaseMethods.default);
            },
            939: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AmsMethods = MathJax._.input.tex.ams.AmsMethods.AmsMethods),
                    (e.NEW_OPS = MathJax._.input.tex.ams.AmsMethods.NEW_OPS);
            },
            652: function (t, e) {
                /*!
                 *************************************************************************
                 *
                 *  mhchemParser.ts
                 *  4.1.1
                 *
                 *  Parser for the \ce command and \pu command for MathJax and Co.
                 *
                 *  mhchem's \ce is a tool for writing beautiful chemical equations easily.
                 *  mhchem's \pu is a tool for writing physical units easily.
                 *
                 *  ----------------------------------------------------------------------
                 *
                 *  Copyright (c) 2015-2021 Martin Hensel
                 *
                 *  Licensed under the Apache License, Version 2.0 (the "License");
                 *  you may not use this file except in compliance with the License.
                 *  You may obtain a copy of the License at
                 *
                 *      http://www.apache.org/licenses/LICENSE-2.0
                 *
                 *  Unless required by applicable law or agreed to in writing, software
                 *  distributed under the License is distributed on an "AS IS" BASIS,
                 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                 *  See the License for the specific language governing permissions and
                 *  limitations under the License.
                 *
                 *  ----------------------------------------------------------------------
                 *
                 *  https://github.com/mhchem/mhchemParser
                 *
                 */
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.mhchemParser = void 0);
                var o = (function () {
                    function t() {}
                    return (
                        (t.toTex = function (t, e) {
                            return r.go(a.go(t, e), 'tex' !== e);
                        }),
                        t
                    );
                })();
                function n(t) {
                    var e,
                        o,
                        n = {};
                    for (e in t)
                        for (o in t[e]) {
                            var a = o.split('|');
                            t[e][o].stateArray = a;
                            for (var r = 0; r < a.length; r++) n[a[r]] = [];
                        }
                    for (e in t)
                        for (o in t[e])
                            for (a = t[e][o].stateArray || [], r = 0; r < a.length; r++) {
                                var i = t[e][o];
                                i.action_ = [].concat(i.action_);
                                for (var p = 0; p < i.action_.length; p++)
                                    'string' == typeof i.action_[p] &&
                                        (i.action_[p] = { type_: i.action_[p] });
                                for (var c = e.split('|'), u = 0; u < c.length; u++)
                                    if ('*' === a[r]) {
                                        var s = void 0;
                                        for (s in n) n[s].push({ pattern: c[u], task: i });
                                    } else n[a[r]].push({ pattern: c[u], task: i });
                            }
                    return n;
                }
                e.mhchemParser = o;
                var a = {
                        go: function (t, e) {
                            if (!t) return [];
                            void 0 === e && (e = 'ce');
                            var o,
                                n = '0',
                                r = {};
                            (r.parenthesisLevel = 0),
                                (t = (t = (t = t.replace(/\n/g, ' ')).replace(
                                    /[\u2212\u2013\u2014\u2010]/g,
                                    '-',
                                )).replace(/[\u2026]/g, '...'));
                            for (var i = 10, p = []; ; ) {
                                o !== t ? ((i = 10), (o = t)) : i--;
                                var c = a.stateMachines[e],
                                    u = c.transitions[n] || c.transitions['*'];
                                t: for (var s = 0; s < u.length; s++) {
                                    var _ = a.patterns.match_(u[s].pattern, t);
                                    if (_) {
                                        for (var d = u[s].task, m = 0; m < d.action_.length; m++) {
                                            var h = void 0;
                                            if (c.actions[d.action_[m].type_])
                                                h = c.actions[d.action_[m].type_](
                                                    r,
                                                    _.match_,
                                                    d.action_[m].option,
                                                );
                                            else {
                                                if (!a.actions[d.action_[m].type_])
                                                    throw [
                                                        'MhchemBugA',
                                                        'mhchem bug A. Please report. (' +
                                                            d.action_[m].type_ +
                                                            ')',
                                                    ];
                                                h = a.actions[d.action_[m].type_](
                                                    r,
                                                    _.match_,
                                                    d.action_[m].option,
                                                );
                                            }
                                            a.concatArray(p, h);
                                        }
                                        if (((n = d.nextState || n), !(t.length > 0))) return p;
                                        if ((d.revisit || (t = _.remainder), !d.toContinue))
                                            break t;
                                    }
                                }
                                if (i <= 0) throw ['MhchemBugU', 'mhchem bug U. Please report.'];
                            }
                        },
                        concatArray: function (t, e) {
                            if (e)
                                if (Array.isArray(e))
                                    for (var o = 0; o < e.length; o++) t.push(e[o]);
                                else t.push(e);
                        },
                        patterns: {
                            patterns: {
                                empty: /^$/,
                                else: /^./,
                                else2: /^./,
                                space: /^\s/,
                                'space A': /^\s(?=[A-Z\\$])/,
                                space$: /^\s$/,
                                'a-z': /^[a-z]/,
                                x: /^x/,
                                x$: /^x$/,
                                i$: /^i$/,
                                letters:
                                    /^(?:[a-zA-Z\u03B1-\u03C9\u0391-\u03A9?@]|(?:\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega)(?:\s+|\{\}|(?![a-zA-Z]))))+/,
                                '\\greek':
                                    /^\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega)(?:\s+|\{\}|(?![a-zA-Z]))/,
                                'one lowercase latin letter $': /^(?:([a-z])(?:$|[^a-zA-Z]))$/,
                                '$one lowercase latin letter$ $':
                                    /^\$(?:([a-z])(?:$|[^a-zA-Z]))\$$/,
                                'one lowercase greek letter $':
                                    /^(?:\$?[\u03B1-\u03C9]\$?|\$?\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega)\s*\$?)(?:\s+|\{\}|(?![a-zA-Z]))$/,
                                digits: /^[0-9]+/,
                                '-9.,9': /^[+\-]?(?:[0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+))/,
                                '-9.,9 no missing 0': /^[+\-]?[0-9]+(?:[.,][0-9]+)?/,
                                '(-)(9.,9)(e)(99)': function (t) {
                                    var e = t.match(
                                        /^(\+\-|\+\/\-|\+|\-|\\pm\s?)?([0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+))?(\((?:[0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+))\))?(?:(?:([eE])|\s*(\*|x|\\times|\u00D7)\s*10\^)([+\-]?[0-9]+|\{[+\-]?[0-9]+\}))?/,
                                    );
                                    return e && e[0]
                                        ? { match_: e.slice(1), remainder: t.substr(e[0].length) }
                                        : null;
                                },
                                '(-)(9)^(-9)':
                                    /^(\+\-|\+\/\-|\+|\-|\\pm\s?)?([0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+)?)\^([+\-]?[0-9]+|\{[+\-]?[0-9]+\})/,
                                'state of aggregation $': function (t) {
                                    var e = a.patterns.findObserveGroups(
                                        t,
                                        '',
                                        /^\([a-z]{1,3}(?=[\),])/,
                                        ')',
                                        '',
                                    );
                                    if (e && e.remainder.match(/^($|[\s,;\)\]\}])/)) return e;
                                    var o = t.match(/^(?:\((?:\\ca\s?)?\$[amothc]\$\))/);
                                    return o
                                        ? { match_: o[0], remainder: t.substr(o[0].length) }
                                        : null;
                                },
                                '_{(state of aggregation)}$': /^_\{(\([a-z]{1,3}\))\}/,
                                '{[(': /^(?:\\\{|\[|\()/,
                                ')]}': /^(?:\)|\]|\\\})/,
                                ', ': /^[,;]\s*/,
                                ',': /^[,;]/,
                                '.': /^[.]/,
                                '. __* ': /^([.\u22C5\u00B7\u2022]|[*])\s*/,
                                '...': /^\.\.\.(?=$|[^.])/,
                                '^{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '^{', '', '', '}');
                                },
                                '^($...$)': function (t) {
                                    return a.patterns.findObserveGroups(t, '^', '$', '$', '');
                                },
                                '^a': /^\^([0-9]+|[^\\_])/,
                                '^\\x{}{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '^',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                        '',
                                        '{',
                                        '}',
                                        '',
                                        !0,
                                    );
                                },
                                '^\\x{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '^',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                    );
                                },
                                '^\\x': /^\^(\\[a-zA-Z]+)\s*/,
                                '^(-1)': /^\^(-?\d+)/,
                                "'": /^'/,
                                '_{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '_{', '', '', '}');
                                },
                                '_($...$)': function (t) {
                                    return a.patterns.findObserveGroups(t, '_', '$', '$', '');
                                },
                                _9: /^_([+\-]?[0-9]+|[^\\])/,
                                '_\\x{}{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '_',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                        '',
                                        '{',
                                        '}',
                                        '',
                                        !0,
                                    );
                                },
                                '_\\x{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '_',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                    );
                                },
                                '_\\x': /^_(\\[a-zA-Z]+)\s*/,
                                '^_': /^(?:\^(?=_)|\_(?=\^)|[\^_]$)/,
                                '{}^': /^\{\}(?=\^)/,
                                '{}': /^\{\}/,
                                '{...}': function (t) {
                                    return a.patterns.findObserveGroups(t, '', '{', '}', '');
                                },
                                '{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '{', '', '', '}');
                                },
                                '$...$': function (t) {
                                    return a.patterns.findObserveGroups(t, '', '$', '$', '');
                                },
                                '${(...)}$__$(...)$': function (t) {
                                    return (
                                        a.patterns.findObserveGroups(t, '${', '', '', '}$') ||
                                        a.patterns.findObserveGroups(t, '$', '', '', '$')
                                    );
                                },
                                '=<>': /^[=<>]/,
                                '#': /^[#\u2261]/,
                                '+': /^\+/,
                                '-$': /^-(?=[\s_},;\]/]|$|\([a-z]+\))/,
                                '-9': /^-(?=[0-9])/,
                                '- orbital overlap': /^-(?=(?:[spd]|sp)(?:$|[\s,;\)\]\}]))/,
                                '-': /^-/,
                                'pm-operator': /^(?:\\pm|\$\\pm\$|\+-|\+\/-)/,
                                operator:
                                    /^(?:\+|(?:[\-=<>]|<<|>>|\\approx|\$\\approx\$)(?=\s|$|-?[0-9]))/,
                                arrowUpDown: /^(?:v|\(v\)|\^|\(\^\))(?=$|[\s,;\)\]\}])/,
                                '\\bond{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '\\bond{', '', '', '}');
                                },
                                '->': /^(?:<->|<-->|->|<-|<=>>|<<=>|<=>|[\u2192\u27F6\u21CC])/,
                                CMT: /^[CMT](?=\[)/,
                                '[(...)]': function (t) {
                                    return a.patterns.findObserveGroups(t, '[', '', '', ']');
                                },
                                '1st-level escape': /^(&|\\\\|\\hline)\s*/,
                                '\\,': /^(?:\\[,\ ;:])/,
                                '\\x{}{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                        '',
                                        '{',
                                        '}',
                                        '',
                                        !0,
                                    );
                                },
                                '\\x{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                    );
                                },
                                '\\ca': /^\\ca(?:\s+|(?![a-zA-Z]))/,
                                '\\x': /^(?:\\[a-zA-Z]+\s*|\\[_&{}%])/,
                                orbital: /^(?:[0-9]{1,2}[spdfgh]|[0-9]{0,2}sp)(?=$|[^a-zA-Z])/,
                                others: /^[\/~|]/,
                                '\\frac{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '\\frac{',
                                        '',
                                        '',
                                        '}',
                                        '{',
                                        '',
                                        '',
                                        '}',
                                    );
                                },
                                '\\overset{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '\\overset{',
                                        '',
                                        '',
                                        '}',
                                        '{',
                                        '',
                                        '',
                                        '}',
                                    );
                                },
                                '\\underset{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '\\underset{',
                                        '',
                                        '',
                                        '}',
                                        '{',
                                        '',
                                        '',
                                        '}',
                                    );
                                },
                                '\\underbrace{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '\\underbrace{',
                                        '',
                                        '',
                                        '}_',
                                        '{',
                                        '',
                                        '',
                                        '}',
                                    );
                                },
                                '\\color{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '\\color{', '', '', '}');
                                },
                                '\\color{(...)}{(...)}': function (t) {
                                    return (
                                        a.patterns.findObserveGroups(
                                            t,
                                            '\\color{',
                                            '',
                                            '',
                                            '}',
                                            '{',
                                            '',
                                            '',
                                            '}',
                                        ) ||
                                        a.patterns.findObserveGroups(
                                            t,
                                            '\\color',
                                            '\\',
                                            '',
                                            /^(?=\{)/,
                                            '{',
                                            '',
                                            '',
                                            '}',
                                        )
                                    );
                                },
                                '\\ce{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '\\ce{', '', '', '}');
                                },
                                '\\pu{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '\\pu{', '', '', '}');
                                },
                                oxidation$: /^(?:[+-][IVX]+|\\pm\s*0|\$\\pm\$\s*0)$/,
                                'd-oxidation$': /^(?:[+-]?\s?[IVX]+|\\pm\s*0|\$\\pm\$\s*0)$/,
                                'roman numeral': /^[IVX]+/,
                                '1/2$': /^[+\-]?(?:[0-9]+|\$[a-z]\$|[a-z])\/[0-9]+(?:\$[a-z]\$|[a-z])?$/,
                                amount: function (t) {
                                    var e;
                                    if (
                                        (e = t.match(
                                            /^(?:(?:(?:\([+\-]?[0-9]+\/[0-9]+\)|[+\-]?(?:[0-9]+|\$[a-z]\$|[a-z])\/[0-9]+|[+\-]?[0-9]+[.,][0-9]+|[+\-]?\.[0-9]+|[+\-]?[0-9]+)(?:[a-z](?=\s*[A-Z]))?)|[+\-]?[a-z](?=\s*[A-Z])|\+(?!\s))/,
                                        ))
                                    )
                                        return { match_: e[0], remainder: t.substr(e[0].length) };
                                    var o = a.patterns.findObserveGroups(t, '', '$', '$', '');
                                    return o &&
                                        (e = o.match_.match(
                                            /^\$(?:\(?[+\-]?(?:[0-9]*[a-z]?[+\-])?[0-9]*[a-z](?:[+\-][0-9]*[a-z]?)?\)?|\+|-)\$$/,
                                        ))
                                        ? { match_: e[0], remainder: t.substr(e[0].length) }
                                        : null;
                                },
                                amount2: function (t) {
                                    return this.amount(t);
                                },
                                '(KV letters),': /^(?:[A-Z][a-z]{0,2}|i)(?=,)/,
                                formula$: function (t) {
                                    if (t.match(/^\([a-z]+\)$/)) return null;
                                    var e = t.match(
                                        /^(?:[a-z]|(?:[0-9\ \+\-\,\.\(\)]+[a-z])+[0-9\ \+\-\,\.\(\)]*|(?:[a-z][0-9\ \+\-\,\.\(\)]+)+[a-z]?)$/,
                                    );
                                    return e
                                        ? { match_: e[0], remainder: t.substr(e[0].length) }
                                        : null;
                                },
                                uprightEntities: /^(?:pH|pOH|pC|pK|iPr|iBu)(?=$|[^a-zA-Z])/,
                                '/': /^\s*(\/)\s*/,
                                '//': /^\s*(\/\/)\s*/,
                                '*': /^\s*[*.]\s*/,
                            },
                            findObserveGroups: function (t, e, o, n, a, r, i, p, c, u) {
                                var s = function (t, e) {
                                        if ('string' == typeof e)
                                            return 0 !== t.indexOf(e) ? null : e;
                                        var o = t.match(e);
                                        return o ? o[0] : null;
                                    },
                                    _ = s(t, e);
                                if (null === _) return null;
                                if (((t = t.substr(_.length)), null === (_ = s(t, o)))) return null;
                                var d = (function (t, e, o) {
                                    for (var n = 0; e < t.length; ) {
                                        var a = t.charAt(e),
                                            r = s(t.substr(e), o);
                                        if (null !== r && 0 === n)
                                            return { endMatchBegin: e, endMatchEnd: e + r.length };
                                        if ('{' === a) n++;
                                        else if ('}' === a) {
                                            if (0 === n)
                                                throw [
                                                    'ExtraCloseMissingOpen',
                                                    'Extra close brace or missing open brace',
                                                ];
                                            n--;
                                        }
                                        e++;
                                    }
                                    return null;
                                })(t, _.length, n || a);
                                if (null === d) return null;
                                var m = t.substring(0, n ? d.endMatchEnd : d.endMatchBegin);
                                if (r || i) {
                                    var h = this.findObserveGroups(
                                        t.substr(d.endMatchEnd),
                                        r,
                                        i,
                                        p,
                                        c,
                                    );
                                    if (null === h) return null;
                                    var l = [m, h.match_];
                                    return { match_: u ? l.join('') : l, remainder: h.remainder };
                                }
                                return { match_: m, remainder: t.substr(d.endMatchEnd) };
                            },
                            match_: function (t, e) {
                                var o = a.patterns.patterns[t];
                                if (void 0 === o)
                                    throw [
                                        'MhchemBugP',
                                        'mhchem bug P. Please report. (' + t + ')',
                                    ];
                                if ('function' == typeof o) return a.patterns.patterns[t](e);
                                var n = e.match(o);
                                return n
                                    ? n.length > 2
                                        ? { match_: n.slice(1), remainder: e.substr(n[0].length) }
                                        : { match_: n[1] || n[0], remainder: e.substr(n[0].length) }
                                    : null;
                            },
                        },
                        actions: {
                            'a=': function (t, e) {
                                t.a = (t.a || '') + e;
                            },
                            'b=': function (t, e) {
                                t.b = (t.b || '') + e;
                            },
                            'p=': function (t, e) {
                                t.p = (t.p || '') + e;
                            },
                            'o=': function (t, e) {
                                t.o = (t.o || '') + e;
                            },
                            'q=': function (t, e) {
                                t.q = (t.q || '') + e;
                            },
                            'd=': function (t, e) {
                                t.d = (t.d || '') + e;
                            },
                            'rm=': function (t, e) {
                                t.rm = (t.rm || '') + e;
                            },
                            'text=': function (t, e) {
                                t.text_ = (t.text_ || '') + e;
                            },
                            insert: function (t, e, o) {
                                return { type_: o };
                            },
                            'insert+p1': function (t, e, o) {
                                return { type_: o, p1: e };
                            },
                            'insert+p1+p2': function (t, e, o) {
                                return { type_: o, p1: e[0], p2: e[1] };
                            },
                            copy: function (t, e) {
                                return e;
                            },
                            write: function (t, e, o) {
                                return o;
                            },
                            rm: function (t, e) {
                                return { type_: 'rm', p1: e };
                            },
                            text: function (t, e) {
                                return a.go(e, 'text');
                            },
                            'tex-math': function (t, e) {
                                return a.go(e, 'tex-math');
                            },
                            'tex-math tight': function (t, e) {
                                return a.go(e, 'tex-math tight');
                            },
                            bond: function (t, e, o) {
                                return { type_: 'bond', kind_: o || e };
                            },
                            'color0-output': function (t, e) {
                                return { type_: 'color0', color: e };
                            },
                            ce: function (t, e) {
                                return a.go(e, 'ce');
                            },
                            pu: function (t, e) {
                                return a.go(e, 'pu');
                            },
                            '1/2': function (t, e) {
                                var o = [];
                                e.match(/^[+\-]/) && (o.push(e.substr(0, 1)), (e = e.substr(1)));
                                var n = e.match(
                                    /^([0-9]+|\$[a-z]\$|[a-z])\/([0-9]+)(\$[a-z]\$|[a-z])?$/,
                                );
                                return (
                                    (n[1] = n[1].replace(/\$/g, '')),
                                    o.push({ type_: 'frac', p1: n[1], p2: n[2] }),
                                    n[3] &&
                                        ((n[3] = n[3].replace(/\$/g, '')),
                                        o.push({ type_: 'tex-math', p1: n[3] })),
                                    o
                                );
                            },
                            '9,9': function (t, e) {
                                return a.go(e, '9,9');
                            },
                        },
                        stateMachines: {
                            tex: {
                                transitions: n({
                                    empty: { 0: { action_: 'copy' } },
                                    '\\ce{(...)}': {
                                        0: {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'ce',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\pu{(...)}': {
                                        0: {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    else: { 0: { action_: 'copy' } },
                                }),
                                actions: {},
                            },
                            ce: {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    else: {
                                        '0|1|2': {
                                            action_: 'beginsWithBond=false',
                                            revisit: !0,
                                            toContinue: !0,
                                        },
                                    },
                                    oxidation$: { 0: { action_: 'oxidation-output' } },
                                    CMT: {
                                        r: { action_: 'rdt=', nextState: 'rt' },
                                        rd: { action_: 'rqt=', nextState: 'rdt' },
                                    },
                                    arrowUpDown: {
                                        '0|1|2|as': {
                                            action_: ['sb=false', 'output', 'operator'],
                                            nextState: '1',
                                        },
                                    },
                                    uprightEntities: {
                                        '0|1|2': { action_: ['o=', 'output'], nextState: '1' },
                                    },
                                    orbital: { '0|1|2|3': { action_: 'o=', nextState: 'o' } },
                                    '->': {
                                        '0|1|2|3': { action_: 'r=', nextState: 'r' },
                                        'a|as': { action_: ['output', 'r='], nextState: 'r' },
                                        '*': { action_: ['output', 'r='], nextState: 'r' },
                                    },
                                    '+': {
                                        o: { action_: 'd= kv', nextState: 'd' },
                                        'd|D': { action_: 'd=', nextState: 'd' },
                                        q: { action_: 'd=', nextState: 'qd' },
                                        'qd|qD': { action_: 'd=', nextState: 'qd' },
                                        dq: { action_: ['output', 'd='], nextState: 'd' },
                                        3: {
                                            action_: ['sb=false', 'output', 'operator'],
                                            nextState: '0',
                                        },
                                    },
                                    amount: { '0|2': { action_: 'a=', nextState: 'a' } },
                                    'pm-operator': {
                                        '0|1|2|a|as': {
                                            action_: [
                                                'sb=false',
                                                'output',
                                                { type_: 'operator', option: '\\pm' },
                                            ],
                                            nextState: '0',
                                        },
                                    },
                                    operator: {
                                        '0|1|2|a|as': {
                                            action_: ['sb=false', 'output', 'operator'],
                                            nextState: '0',
                                        },
                                    },
                                    '-$': {
                                        'o|q': {
                                            action_: ['charge or bond', 'output'],
                                            nextState: 'qd',
                                        },
                                        d: { action_: 'd=', nextState: 'd' },
                                        D: {
                                            action_: ['output', { type_: 'bond', option: '-' }],
                                            nextState: '3',
                                        },
                                        q: { action_: 'd=', nextState: 'qd' },
                                        qd: { action_: 'd=', nextState: 'qd' },
                                        'qD|dq': {
                                            action_: ['output', { type_: 'bond', option: '-' }],
                                            nextState: '3',
                                        },
                                    },
                                    '-9': {
                                        '3|o': {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'hyphen' },
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '- orbital overlap': {
                                        o: {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'hyphen' },
                                            ],
                                            nextState: '2',
                                        },
                                        d: {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'hyphen' },
                                            ],
                                            nextState: '2',
                                        },
                                    },
                                    '-': {
                                        '0|1|2': {
                                            action_: [
                                                { type_: 'output', option: 1 },
                                                'beginsWithBond=true',
                                                { type_: 'bond', option: '-' },
                                            ],
                                            nextState: '3',
                                        },
                                        3: { action_: { type_: 'bond', option: '-' } },
                                        a: {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'hyphen' },
                                            ],
                                            nextState: '2',
                                        },
                                        as: {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                { type_: 'bond', option: '-' },
                                            ],
                                            nextState: '3',
                                        },
                                        b: { action_: 'b=' },
                                        o: {
                                            action_: { type_: '- after o/d', option: !1 },
                                            nextState: '2',
                                        },
                                        q: {
                                            action_: { type_: '- after o/d', option: !1 },
                                            nextState: '2',
                                        },
                                        'd|qd|dq': {
                                            action_: { type_: '- after o/d', option: !0 },
                                            nextState: '2',
                                        },
                                        'D|qD|p': {
                                            action_: ['output', { type_: 'bond', option: '-' }],
                                            nextState: '3',
                                        },
                                    },
                                    amount2: { '1|3': { action_: 'a=', nextState: 'a' } },
                                    letters: {
                                        '0|1|2|3|a|as|b|p|bp|o': { action_: 'o=', nextState: 'o' },
                                        'q|dq': { action_: ['output', 'o='], nextState: 'o' },
                                        'd|D|qd|qD': { action_: 'o after d', nextState: 'o' },
                                    },
                                    digits: {
                                        o: { action_: 'q=', nextState: 'q' },
                                        'd|D': { action_: 'q=', nextState: 'dq' },
                                        q: { action_: ['output', 'o='], nextState: 'o' },
                                        a: { action_: 'o=', nextState: 'o' },
                                    },
                                    'space A': { 'b|p|bp': { action_: [] } },
                                    space: {
                                        a: { action_: [], nextState: 'as' },
                                        0: { action_: 'sb=false' },
                                        '1|2': { action_: 'sb=true' },
                                        'r|rt|rd|rdt|rdq': { action_: 'output', nextState: '0' },
                                        '*': { action_: ['output', 'sb=true'], nextState: '1' },
                                    },
                                    '1st-level escape': {
                                        '1|2': {
                                            action_: [
                                                'output',
                                                { type_: 'insert+p1', option: '1st-level escape' },
                                            ],
                                        },
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'insert+p1', option: '1st-level escape' },
                                            ],
                                            nextState: '0',
                                        },
                                    },
                                    '[(...)]': {
                                        'r|rt': { action_: 'rd=', nextState: 'rd' },
                                        'rd|rdt': { action_: 'rq=', nextState: 'rdq' },
                                    },
                                    '...': {
                                        'o|d|D|dq|qd|qD': {
                                            action_: ['output', { type_: 'bond', option: '...' }],
                                            nextState: '3',
                                        },
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 1 },
                                                { type_: 'insert', option: 'ellipsis' },
                                            ],
                                            nextState: '1',
                                        },
                                    },
                                    '. __* ': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'addition compound' },
                                            ],
                                            nextState: '1',
                                        },
                                    },
                                    'state of aggregation $': {
                                        '*': {
                                            action_: ['output', 'state of aggregation'],
                                            nextState: '1',
                                        },
                                    },
                                    '{[(': {
                                        'a|as|o': {
                                            action_: ['o=', 'output', 'parenthesisLevel++'],
                                            nextState: '2',
                                        },
                                        '0|1|2|3': {
                                            action_: ['o=', 'output', 'parenthesisLevel++'],
                                            nextState: '2',
                                        },
                                        '*': {
                                            action_: [
                                                'output',
                                                'o=',
                                                'output',
                                                'parenthesisLevel++',
                                            ],
                                            nextState: '2',
                                        },
                                    },
                                    ')]}': {
                                        '0|1|2|3|b|p|bp|o': {
                                            action_: ['o=', 'parenthesisLevel--'],
                                            nextState: 'o',
                                        },
                                        'a|as|d|D|q|qd|qD|dq': {
                                            action_: ['output', 'o=', 'parenthesisLevel--'],
                                            nextState: 'o',
                                        },
                                    },
                                    ', ': { '*': { action_: ['output', 'comma'], nextState: '0' } },
                                    '^_': { '*': { action_: [] } },
                                    '^{(...)}|^($...$)': {
                                        '0|1|2|as': { action_: 'b=', nextState: 'b' },
                                        p: { action_: 'b=', nextState: 'bp' },
                                        '3|o': { action_: 'd= kv', nextState: 'D' },
                                        q: { action_: 'd=', nextState: 'qD' },
                                        'd|D|qd|qD|dq': {
                                            action_: ['output', 'd='],
                                            nextState: 'D',
                                        },
                                    },
                                    "^a|^\\x{}{}|^\\x{}|^\\x|'": {
                                        '0|1|2|as': { action_: 'b=', nextState: 'b' },
                                        p: { action_: 'b=', nextState: 'bp' },
                                        '3|o': { action_: 'd= kv', nextState: 'd' },
                                        q: { action_: 'd=', nextState: 'qd' },
                                        'd|qd|D|qD': { action_: 'd=' },
                                        dq: { action_: ['output', 'd='], nextState: 'd' },
                                    },
                                    '_{(state of aggregation)}$': {
                                        'd|D|q|qd|qD|dq': {
                                            action_: ['output', 'q='],
                                            nextState: 'q',
                                        },
                                    },
                                    '_{(...)}|_($...$)|_9|_\\x{}{}|_\\x{}|_\\x': {
                                        '0|1|2|as': { action_: 'p=', nextState: 'p' },
                                        b: { action_: 'p=', nextState: 'bp' },
                                        '3|o': { action_: 'q=', nextState: 'q' },
                                        'd|D': { action_: 'q=', nextState: 'dq' },
                                        'q|qd|qD|dq': { action_: ['output', 'q='], nextState: 'q' },
                                    },
                                    '=<>': {
                                        '0|1|2|3|a|as|o|q|d|D|qd|qD|dq': {
                                            action_: [{ type_: 'output', option: 2 }, 'bond'],
                                            nextState: '3',
                                        },
                                    },
                                    '#': {
                                        '0|1|2|3|a|as|o': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                { type_: 'bond', option: '#' },
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '{}^': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 1 },
                                                { type_: 'insert', option: 'tinySkip' },
                                            ],
                                            nextState: '1',
                                        },
                                    },
                                    '{}': {
                                        '*': {
                                            action_: { type_: 'output', option: 1 },
                                            nextState: '1',
                                        },
                                    },
                                    '{...}': {
                                        '0|1|2|3|a|as|b|p|bp': { action_: 'o=', nextState: 'o' },
                                        'o|d|D|q|qd|qD|dq': {
                                            action_: ['output', 'o='],
                                            nextState: 'o',
                                        },
                                    },
                                    '$...$': {
                                        a: { action_: 'a=' },
                                        '0|1|2|3|as|b|p|bp|o': { action_: 'o=', nextState: 'o' },
                                        'as|o': { action_: 'o=' },
                                        'q|d|D|qd|qD|dq': {
                                            action_: ['output', 'o='],
                                            nextState: 'o',
                                        },
                                    },
                                    '\\bond{(...)}': {
                                        '*': {
                                            action_: [{ type_: 'output', option: 2 }, 'bond'],
                                            nextState: '3',
                                        },
                                    },
                                    '\\frac{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 1 },
                                                'frac-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\overset{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'overset-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\underset{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'underset-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\underbrace{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'underbrace-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\color{(...)}{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'color-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\color{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'color0-output',
                                            ],
                                        },
                                    },
                                    '\\ce{(...)}': {
                                        '*': {
                                            action_: [{ type_: 'output', option: 2 }, 'ce'],
                                            nextState: '3',
                                        },
                                    },
                                    '\\,': {
                                        '*': {
                                            action_: [{ type_: 'output', option: 1 }, 'copy'],
                                            nextState: '1',
                                        },
                                    },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\x{}{}|\\x{}|\\x': {
                                        '0|1|2|3|a|as|b|p|bp|o|c0': {
                                            action_: ['o=', 'output'],
                                            nextState: '3',
                                        },
                                        '*': {
                                            action_: ['output', 'o=', 'output'],
                                            nextState: '3',
                                        },
                                    },
                                    others: {
                                        '*': {
                                            action_: [{ type_: 'output', option: 1 }, 'copy'],
                                            nextState: '3',
                                        },
                                    },
                                    else2: {
                                        a: { action_: 'a to o', nextState: 'o', revisit: !0 },
                                        as: {
                                            action_: ['output', 'sb=true'],
                                            nextState: '1',
                                            revisit: !0,
                                        },
                                        'r|rt|rd|rdt|rdq': {
                                            action_: ['output'],
                                            nextState: '0',
                                            revisit: !0,
                                        },
                                        '*': { action_: ['output', 'copy'], nextState: '3' },
                                    },
                                }),
                                actions: {
                                    'o after d': function (t, e) {
                                        var o;
                                        if ((t.d || '').match(/^[1-9][0-9]*$/)) {
                                            var n = t.d;
                                            (t.d = void 0),
                                                (o = this.output(t)).push({ type_: 'tinySkip' }),
                                                (t.b = n);
                                        } else o = this.output(t);
                                        return a.actions['o='](t, e), o;
                                    },
                                    'd= kv': function (t, e) {
                                        (t.d = e), (t.dType = 'kv');
                                    },
                                    'charge or bond': function (t, e) {
                                        if (t.beginsWithBond) {
                                            var o = [];
                                            return (
                                                a.concatArray(o, this.output(t)),
                                                a.concatArray(o, a.actions.bond(t, e, '-')),
                                                o
                                            );
                                        }
                                        t.d = e;
                                    },
                                    '- after o/d': function (t, e, o) {
                                        var n = a.patterns.match_('orbital', t.o || ''),
                                            r = a.patterns.match_(
                                                'one lowercase greek letter $',
                                                t.o || '',
                                            ),
                                            i = a.patterns.match_(
                                                'one lowercase latin letter $',
                                                t.o || '',
                                            ),
                                            p = a.patterns.match_(
                                                '$one lowercase latin letter$ $',
                                                t.o || '',
                                            ),
                                            c =
                                                '-' === e &&
                                                ((n && '' === n.remainder) || r || i || p);
                                        !c ||
                                            t.a ||
                                            t.b ||
                                            t.p ||
                                            t.d ||
                                            t.q ||
                                            n ||
                                            !i ||
                                            (t.o = '$' + t.o + '$');
                                        var u = [];
                                        return (
                                            c
                                                ? (a.concatArray(u, this.output(t)),
                                                  u.push({ type_: 'hyphen' }))
                                                : ((n = a.patterns.match_('digits', t.d || '')),
                                                  o && n && '' === n.remainder
                                                      ? (a.concatArray(u, a.actions['d='](t, e)),
                                                        a.concatArray(u, this.output(t)))
                                                      : (a.concatArray(u, this.output(t)),
                                                        a.concatArray(
                                                            u,
                                                            a.actions.bond(t, e, '-'),
                                                        ))),
                                            u
                                        );
                                    },
                                    'a to o': function (t) {
                                        (t.o = t.a), (t.a = void 0);
                                    },
                                    'sb=true': function (t) {
                                        t.sb = !0;
                                    },
                                    'sb=false': function (t) {
                                        t.sb = !1;
                                    },
                                    'beginsWithBond=true': function (t) {
                                        t.beginsWithBond = !0;
                                    },
                                    'beginsWithBond=false': function (t) {
                                        t.beginsWithBond = !1;
                                    },
                                    'parenthesisLevel++': function (t) {
                                        t.parenthesisLevel++;
                                    },
                                    'parenthesisLevel--': function (t) {
                                        t.parenthesisLevel--;
                                    },
                                    'state of aggregation': function (t, e) {
                                        return { type_: 'state of aggregation', p1: a.go(e, 'o') };
                                    },
                                    comma: function (t, e) {
                                        var o = e.replace(/\s*$/, '');
                                        return o !== e && 0 === t.parenthesisLevel
                                            ? { type_: 'comma enumeration L', p1: o }
                                            : { type_: 'comma enumeration M', p1: o };
                                    },
                                    output: function (t, e, o) {
                                        var n;
                                        if (t.r) {
                                            var r = void 0;
                                            r =
                                                'M' === t.rdt
                                                    ? a.go(t.rd, 'tex-math')
                                                    : 'T' === t.rdt
                                                      ? [{ type_: 'text', p1: t.rd || '' }]
                                                      : a.go(t.rd, 'ce');
                                            var i = void 0;
                                            (i =
                                                'M' === t.rqt
                                                    ? a.go(t.rq, 'tex-math')
                                                    : 'T' === t.rqt
                                                      ? [{ type_: 'text', p1: t.rq || '' }]
                                                      : a.go(t.rq, 'ce')),
                                                (n = { type_: 'arrow', r: t.r, rd: r, rq: i });
                                        } else
                                            (n = []),
                                                (t.a || t.b || t.p || t.o || t.q || t.d || o) &&
                                                    (t.sb && n.push({ type_: 'entitySkip' }),
                                                    t.o || t.q || t.d || t.b || t.p || 2 === o
                                                        ? t.o || t.q || t.d || (!t.b && !t.p)
                                                            ? t.o &&
                                                              'kv' === t.dType &&
                                                              a.patterns.match_(
                                                                  'd-oxidation$',
                                                                  t.d || '',
                                                              )
                                                                ? (t.dType = 'oxidation')
                                                                : t.o &&
                                                                  'kv' === t.dType &&
                                                                  !t.q &&
                                                                  (t.dType = void 0)
                                                            : ((t.o = t.a),
                                                              (t.d = t.b),
                                                              (t.q = t.p),
                                                              (t.a = t.b = t.p = void 0))
                                                        : ((t.o = t.a), (t.a = void 0)),
                                                    n.push({
                                                        type_: 'chemfive',
                                                        a: a.go(t.a, 'a'),
                                                        b: a.go(t.b, 'bd'),
                                                        p: a.go(t.p, 'pq'),
                                                        o: a.go(t.o, 'o'),
                                                        q: a.go(t.q, 'pq'),
                                                        d: a.go(
                                                            t.d,
                                                            'oxidation' === t.dType
                                                                ? 'oxidation'
                                                                : 'bd',
                                                        ),
                                                        dType: t.dType,
                                                    }));
                                        for (var p in t)
                                            'parenthesisLevel' !== p &&
                                                'beginsWithBond' !== p &&
                                                delete t[p];
                                        return n;
                                    },
                                    'oxidation-output': function (t, e) {
                                        var o = ['{'];
                                        return (
                                            a.concatArray(o, a.go(e, 'oxidation')), o.push('}'), o
                                        );
                                    },
                                    'frac-output': function (t, e) {
                                        return {
                                            type_: 'frac-ce',
                                            p1: a.go(e[0], 'ce'),
                                            p2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'overset-output': function (t, e) {
                                        return {
                                            type_: 'overset',
                                            p1: a.go(e[0], 'ce'),
                                            p2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'underset-output': function (t, e) {
                                        return {
                                            type_: 'underset',
                                            p1: a.go(e[0], 'ce'),
                                            p2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'underbrace-output': function (t, e) {
                                        return {
                                            type_: 'underbrace',
                                            p1: a.go(e[0], 'ce'),
                                            p2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'color-output': function (t, e) {
                                        return {
                                            type_: 'color',
                                            color1: e[0],
                                            color2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'r=': function (t, e) {
                                        t.r = e;
                                    },
                                    'rdt=': function (t, e) {
                                        t.rdt = e;
                                    },
                                    'rd=': function (t, e) {
                                        t.rd = e;
                                    },
                                    'rqt=': function (t, e) {
                                        t.rqt = e;
                                    },
                                    'rq=': function (t, e) {
                                        t.rq = e;
                                    },
                                    operator: function (t, e, o) {
                                        return { type_: 'operator', kind_: o || e };
                                    },
                                },
                            },
                            a: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    '1/2$': { 0: { action_: '1/2' } },
                                    else: { 0: { action_: [], nextState: '1', revisit: !0 } },
                                    '${(...)}$__$(...)$': {
                                        '*': { action_: 'tex-math tight', nextState: '1' },
                                    },
                                    ',': {
                                        '*': {
                                            action_: { type_: 'insert', option: 'commaDecimal' },
                                        },
                                    },
                                    else2: { '*': { action_: 'copy' } },
                                }),
                                actions: {},
                            },
                            o: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    '1/2$': { 0: { action_: '1/2' } },
                                    else: { 0: { action_: [], nextState: '1', revisit: !0 } },
                                    letters: { '*': { action_: 'rm' } },
                                    '\\ca': {
                                        '*': { action_: { type_: 'insert', option: 'circa' } },
                                    },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\x{}{}|\\x{}|\\x': { '*': { action_: 'copy' } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    '{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'text',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    else2: { '*': { action_: 'copy' } },
                                }),
                                actions: {},
                            },
                            text: {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    '{...}': { '*': { action_: 'text=' } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    '\\greek': { '*': { action_: ['output', 'rm'] } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\,|\\x{}{}|\\x{}|\\x': {
                                        '*': { action_: ['output', 'copy'] },
                                    },
                                    else: { '*': { action_: 'text=' } },
                                }),
                                actions: {
                                    output: function (t) {
                                        if (t.text_) {
                                            var e = { type_: 'text', p1: t.text_ };
                                            for (var o in t) delete t[o];
                                            return e;
                                        }
                                    },
                                },
                            },
                            pq: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    'state of aggregation $': {
                                        '*': { action_: 'state of aggregation' },
                                    },
                                    i$: { 0: { action_: [], nextState: '!f', revisit: !0 } },
                                    '(KV letters),': { 0: { action_: 'rm', nextState: '0' } },
                                    formula$: { 0: { action_: [], nextState: 'f', revisit: !0 } },
                                    '1/2$': { 0: { action_: '1/2' } },
                                    else: { 0: { action_: [], nextState: '!f', revisit: !0 } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    '{(...)}': { '*': { action_: 'text' } },
                                    'a-z': { f: { action_: 'tex-math' } },
                                    letters: { '*': { action_: 'rm' } },
                                    '-9.,9': { '*': { action_: '9,9' } },
                                    ',': {
                                        '*': {
                                            action_: {
                                                type_: 'insert+p1',
                                                option: 'comma enumeration S',
                                            },
                                        },
                                    },
                                    '\\color{(...)}{(...)}': { '*': { action_: 'color-output' } },
                                    '\\color{(...)}': { '*': { action_: 'color0-output' } },
                                    '\\ce{(...)}': { '*': { action_: 'ce' } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\,|\\x{}{}|\\x{}|\\x': { '*': { action_: 'copy' } },
                                    else2: { '*': { action_: 'copy' } },
                                }),
                                actions: {
                                    'state of aggregation': function (t, e) {
                                        return {
                                            type_: 'state of aggregation subscript',
                                            p1: a.go(e, 'o'),
                                        };
                                    },
                                    'color-output': function (t, e) {
                                        return {
                                            type_: 'color',
                                            color1: e[0],
                                            color2: a.go(e[1], 'pq'),
                                        };
                                    },
                                },
                            },
                            bd: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    x$: { 0: { action_: [], nextState: '!f', revisit: !0 } },
                                    formula$: { 0: { action_: [], nextState: 'f', revisit: !0 } },
                                    else: { 0: { action_: [], nextState: '!f', revisit: !0 } },
                                    '-9.,9 no missing 0': { '*': { action_: '9,9' } },
                                    '.': {
                                        '*': {
                                            action_: { type_: 'insert', option: 'electron dot' },
                                        },
                                    },
                                    'a-z': { f: { action_: 'tex-math' } },
                                    x: { '*': { action_: { type_: 'insert', option: 'KV x' } } },
                                    letters: { '*': { action_: 'rm' } },
                                    "'": { '*': { action_: { type_: 'insert', option: 'prime' } } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    '{(...)}': { '*': { action_: 'text' } },
                                    '\\color{(...)}{(...)}': { '*': { action_: 'color-output' } },
                                    '\\color{(...)}': { '*': { action_: 'color0-output' } },
                                    '\\ce{(...)}': { '*': { action_: 'ce' } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\,|\\x{}{}|\\x{}|\\x': { '*': { action_: 'copy' } },
                                    else2: { '*': { action_: 'copy' } },
                                }),
                                actions: {
                                    'color-output': function (t, e) {
                                        return {
                                            type_: 'color',
                                            color1: e[0],
                                            color2: a.go(e[1], 'bd'),
                                        };
                                    },
                                },
                            },
                            oxidation: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    'roman numeral': { '*': { action_: 'roman-numeral' } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    else: { '*': { action_: 'copy' } },
                                }),
                                actions: {
                                    'roman-numeral': function (t, e) {
                                        return { type_: 'roman numeral', p1: e };
                                    },
                                },
                            },
                            'tex-math': {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    '\\ce{(...)}': { '*': { action_: ['output', 'ce'] } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '{...}|\\,|\\x{}{}|\\x{}|\\x': { '*': { action_: 'o=' } },
                                    else: { '*': { action_: 'o=' } },
                                }),
                                actions: {
                                    output: function (t) {
                                        if (t.o) {
                                            var e = { type_: 'tex-math', p1: t.o };
                                            for (var o in t) delete t[o];
                                            return e;
                                        }
                                    },
                                },
                            },
                            'tex-math tight': {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    '\\ce{(...)}': { '*': { action_: ['output', 'ce'] } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '{...}|\\,|\\x{}{}|\\x{}|\\x': { '*': { action_: 'o=' } },
                                    '-|+': { '*': { action_: 'tight operator' } },
                                    else: { '*': { action_: 'o=' } },
                                }),
                                actions: {
                                    'tight operator': function (t, e) {
                                        t.o = (t.o || '') + '{' + e + '}';
                                    },
                                    output: function (t) {
                                        if (t.o) {
                                            var e = { type_: 'tex-math', p1: t.o };
                                            for (var o in t) delete t[o];
                                            return e;
                                        }
                                    },
                                },
                            },
                            '9,9': {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    ',': { '*': { action_: 'comma' } },
                                    else: { '*': { action_: 'copy' } },
                                }),
                                actions: {
                                    comma: function () {
                                        return { type_: 'commaDecimal' };
                                    },
                                },
                            },
                            pu: {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    space$: { '*': { action_: ['output', 'space'] } },
                                    '{[(|)]}': { '0|a': { action_: 'copy' } },
                                    '(-)(9)^(-9)': { 0: { action_: 'number^', nextState: 'a' } },
                                    '(-)(9.,9)(e)(99)': {
                                        0: { action_: 'enumber', nextState: 'a' },
                                    },
                                    space: { '0|a': { action_: [] } },
                                    'pm-operator': {
                                        '0|a': {
                                            action_: { type_: 'operator', option: '\\pm' },
                                            nextState: '0',
                                        },
                                    },
                                    operator: { '0|a': { action_: 'copy', nextState: '0' } },
                                    '//': { d: { action_: 'o=', nextState: '/' } },
                                    '/': { d: { action_: 'o=', nextState: '/' } },
                                    '{...}|else': {
                                        '0|d': { action_: 'd=', nextState: 'd' },
                                        a: { action_: ['space', 'd='], nextState: 'd' },
                                        '/|q': { action_: 'q=', nextState: 'q' },
                                    },
                                }),
                                actions: {
                                    enumber: function (t, e) {
                                        var o = [];
                                        return (
                                            '+-' === e[0] || '+/-' === e[0]
                                                ? o.push('\\pm ')
                                                : e[0] && o.push(e[0]),
                                            e[1] &&
                                                (a.concatArray(o, a.go(e[1], 'pu-9,9')),
                                                e[2] &&
                                                    (e[2].match(/[,.]/)
                                                        ? a.concatArray(o, a.go(e[2], 'pu-9,9'))
                                                        : o.push(e[2])),
                                                (e[3] || e[4]) &&
                                                    ('e' === e[3] || '*' === e[4]
                                                        ? o.push({ type_: 'cdot' })
                                                        : o.push({ type_: 'times' }))),
                                            e[5] && o.push('10^{' + e[5] + '}'),
                                            o
                                        );
                                    },
                                    'number^': function (t, e) {
                                        var o = [];
                                        return (
                                            '+-' === e[0] || '+/-' === e[0]
                                                ? o.push('\\pm ')
                                                : e[0] && o.push(e[0]),
                                            a.concatArray(o, a.go(e[1], 'pu-9,9')),
                                            o.push('^{' + e[2] + '}'),
                                            o
                                        );
                                    },
                                    operator: function (t, e, o) {
                                        return { type_: 'operator', kind_: o || e };
                                    },
                                    space: function () {
                                        return { type_: 'pu-space-1' };
                                    },
                                    output: function (t) {
                                        var e,
                                            o = a.patterns.match_('{(...)}', t.d || '');
                                        o && '' === o.remainder && (t.d = o.match_);
                                        var n = a.patterns.match_('{(...)}', t.q || '');
                                        if (
                                            (n && '' === n.remainder && (t.q = n.match_),
                                            t.d &&
                                                ((t.d = t.d.replace(
                                                    /\u00B0C|\^oC|\^{o}C/g,
                                                    '{}^{\\circ}C',
                                                )),
                                                (t.d = t.d.replace(
                                                    /\u00B0F|\^oF|\^{o}F/g,
                                                    '{}^{\\circ}F',
                                                ))),
                                            t.q)
                                        ) {
                                            (t.q = t.q.replace(
                                                /\u00B0C|\^oC|\^{o}C/g,
                                                '{}^{\\circ}C',
                                            )),
                                                (t.q = t.q.replace(
                                                    /\u00B0F|\^oF|\^{o}F/g,
                                                    '{}^{\\circ}F',
                                                ));
                                            var r = { d: a.go(t.d, 'pu'), q: a.go(t.q, 'pu') };
                                            '//' === t.o
                                                ? (e = { type_: 'pu-frac', p1: r.d, p2: r.q })
                                                : ((e = r.d),
                                                  r.d.length > 1 || r.q.length > 1
                                                      ? e.push({ type_: ' / ' })
                                                      : e.push({ type_: '/' }),
                                                  a.concatArray(e, r.q));
                                        } else e = a.go(t.d, 'pu-2');
                                        for (var i in t) delete t[i];
                                        return e;
                                    },
                                },
                            },
                            'pu-2': {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    '*': { '*': { action_: ['output', 'cdot'], nextState: '0' } },
                                    '\\x': { '*': { action_: 'rm=' } },
                                    space: {
                                        '*': { action_: ['output', 'space'], nextState: '0' },
                                    },
                                    '^{(...)}|^(-1)': { 1: { action_: '^(-1)' } },
                                    '-9.,9': {
                                        0: { action_: 'rm=', nextState: '0' },
                                        1: { action_: '^(-1)', nextState: '0' },
                                    },
                                    '{...}|else': { '*': { action_: 'rm=', nextState: '1' } },
                                }),
                                actions: {
                                    cdot: function () {
                                        return { type_: 'tight cdot' };
                                    },
                                    '^(-1)': function (t, e) {
                                        t.rm += '^{' + e + '}';
                                    },
                                    space: function () {
                                        return { type_: 'pu-space-2' };
                                    },
                                    output: function (t) {
                                        var e = [];
                                        if (t.rm) {
                                            var o = a.patterns.match_('{(...)}', t.rm || '');
                                            e =
                                                o && '' === o.remainder
                                                    ? a.go(o.match_, 'pu')
                                                    : { type_: 'rm', p1: t.rm };
                                        }
                                        for (var n in t) delete t[n];
                                        return e;
                                    },
                                },
                            },
                            'pu-9,9': {
                                transitions: n({
                                    empty: {
                                        0: { action_: 'output-0' },
                                        o: { action_: 'output-o' },
                                    },
                                    ',': { 0: { action_: ['output-0', 'comma'], nextState: 'o' } },
                                    '.': { 0: { action_: ['output-0', 'copy'], nextState: 'o' } },
                                    else: { '*': { action_: 'text=' } },
                                }),
                                actions: {
                                    comma: function () {
                                        return { type_: 'commaDecimal' };
                                    },
                                    'output-0': function (t) {
                                        var e = [];
                                        if (((t.text_ = t.text_ || ''), t.text_.length > 4)) {
                                            var o = t.text_.length % 3;
                                            0 === o && (o = 3);
                                            for (var n = t.text_.length - 3; n > 0; n -= 3)
                                                e.push(t.text_.substr(n, 3)),
                                                    e.push({ type_: '1000 separator' });
                                            e.push(t.text_.substr(0, o)), e.reverse();
                                        } else e.push(t.text_);
                                        for (var a in t) delete t[a];
                                        return e;
                                    },
                                    'output-o': function (t) {
                                        var e = [];
                                        if (((t.text_ = t.text_ || ''), t.text_.length > 4)) {
                                            var o = t.text_.length - 3,
                                                n = void 0;
                                            for (n = 0; n < o; n += 3)
                                                e.push(t.text_.substr(n, 3)),
                                                    e.push({ type_: '1000 separator' });
                                            e.push(t.text_.substr(n));
                                        } else e.push(t.text_);
                                        for (var a in t) delete t[a];
                                        return e;
                                    },
                                },
                            },
                        },
                    },
                    r = {
                        go: function (t, e) {
                            if (!t) return '';
                            for (var o = '', n = !1, a = 0; a < t.length; a++) {
                                var i = t[a];
                                'string' == typeof i
                                    ? (o += i)
                                    : ((o += r._go2(i)),
                                      '1st-level escape' === i.type_ && (n = !0));
                            }
                            return e && !n && o && (o = '{' + o + '}'), o;
                        },
                        _goInner: function (t) {
                            return r.go(t, !1);
                        },
                        _go2: function (t) {
                            var e;
                            switch (t.type_) {
                                case 'chemfive':
                                    e = '';
                                    var o = {
                                        a: r._goInner(t.a),
                                        b: r._goInner(t.b),
                                        p: r._goInner(t.p),
                                        o: r._goInner(t.o),
                                        q: r._goInner(t.q),
                                        d: r._goInner(t.d),
                                    };
                                    o.a &&
                                        (o.a.match(/^[+\-]/) && (o.a = '{' + o.a + '}'),
                                        (e += o.a + '\\,')),
                                        (o.b || o.p) &&
                                            ((e += '{\\vphantom{A}}'),
                                            (e +=
                                                '^{\\hphantom{' +
                                                (o.b || '') +
                                                '}}_{\\hphantom{' +
                                                (o.p || '') +
                                                '}}'),
                                            (e += '\\mkern-1.5mu'),
                                            (e += '{\\vphantom{A}}'),
                                            (e +=
                                                '^{\\smash[t]{\\vphantom{2}}\\llap{' +
                                                (o.b || '') +
                                                '}}'),
                                            (e +=
                                                '_{\\vphantom{2}\\llap{\\smash[t]{' +
                                                (o.p || '') +
                                                '}}}')),
                                        o.o &&
                                            (o.o.match(/^[+\-]/) && (o.o = '{' + o.o + '}'),
                                            (e += o.o)),
                                        'kv' === t.dType
                                            ? ((o.d || o.q) && (e += '{\\vphantom{A}}'),
                                              o.d && (e += '^{' + o.d + '}'),
                                              o.q && (e += '_{\\smash[t]{' + o.q + '}}'))
                                            : 'oxidation' === t.dType
                                              ? (o.d &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '^{' + o.d + '}')),
                                                o.q &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '_{\\smash[t]{' + o.q + '}}')))
                                              : (o.q &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '_{\\smash[t]{' + o.q + '}}')),
                                                o.d &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '^{' + o.d + '}')));
                                    break;
                                case 'rm':
                                case 'roman numeral':
                                    e = '\\mathrm{' + t.p1 + '}';
                                    break;
                                case 'text':
                                    t.p1.match(/[\^_]/)
                                        ? ((t.p1 = t.p1
                                              .replace(' ', '~')
                                              .replace('-', '\\text{-}')),
                                          (e = '\\mathrm{' + t.p1 + '}'))
                                        : (e = '\\text{' + t.p1 + '}');
                                    break;
                                case 'state of aggregation':
                                    e = '\\mskip2mu ' + r._goInner(t.p1);
                                    break;
                                case 'state of aggregation subscript':
                                    e = '\\mskip1mu ' + r._goInner(t.p1);
                                    break;
                                case 'bond':
                                    if (!(e = r._getBond(t.kind_)))
                                        throw [
                                            'MhchemErrorBond',
                                            'mhchem Error. Unknown bond type (' + t.kind_ + ')',
                                        ];
                                    break;
                                case 'frac':
                                    var n = '\\frac{' + t.p1 + '}{' + t.p2 + '}';
                                    e =
                                        '\\mathchoice{\\textstyle' +
                                        n +
                                        '}{' +
                                        n +
                                        '}{' +
                                        n +
                                        '}{' +
                                        n +
                                        '}';
                                    break;
                                case 'pu-frac':
                                    var a =
                                        '\\frac{' +
                                        r._goInner(t.p1) +
                                        '}{' +
                                        r._goInner(t.p2) +
                                        '}';
                                    e =
                                        '\\mathchoice{\\textstyle' +
                                        a +
                                        '}{' +
                                        a +
                                        '}{' +
                                        a +
                                        '}{' +
                                        a +
                                        '}';
                                    break;
                                case 'tex-math':
                                case '1st-level escape':
                                    e = t.p1 + ' ';
                                    break;
                                case 'frac-ce':
                                    e =
                                        '\\frac{' +
                                        r._goInner(t.p1) +
                                        '}{' +
                                        r._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'overset':
                                    e =
                                        '\\overset{' +
                                        r._goInner(t.p1) +
                                        '}{' +
                                        r._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'underset':
                                    e =
                                        '\\underset{' +
                                        r._goInner(t.p1) +
                                        '}{' +
                                        r._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'underbrace':
                                    e =
                                        '\\underbrace{' +
                                        r._goInner(t.p1) +
                                        '}_{' +
                                        r._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'color':
                                    e = '{\\color{' + t.color1 + '}{' + r._goInner(t.color2) + '}}';
                                    break;
                                case 'color0':
                                    e = '\\color{' + t.color + '}';
                                    break;
                                case 'arrow':
                                    var i = { rd: r._goInner(t.rd), rq: r._goInner(t.rq) },
                                        p = r._getArrow(t.r);
                                    i.rd || i.rq
                                        ? '<=>' === t.r ||
                                          '<=>>' === t.r ||
                                          '<<=>' === t.r ||
                                          '<--\x3e' === t.r
                                            ? ((p = '\\long' + p),
                                              i.rd && (p = '\\overset{' + i.rd + '}{' + p + '}'),
                                              i.rq &&
                                                  (p =
                                                      '<--\x3e' === t.r
                                                          ? '\\underset{\\lower2mu{' +
                                                            i.rq +
                                                            '}}{' +
                                                            p +
                                                            '}'
                                                          : '\\underset{\\lower6mu{' +
                                                            i.rq +
                                                            '}}{' +
                                                            p +
                                                            '}'),
                                              (p = ' {}\\mathrel{' + p + '}{} '))
                                            : (i.rq && (p += '[{' + i.rq + '}]'),
                                              (p =
                                                  ' {}\\mathrel{\\x' +
                                                  (p += '{' + i.rd + '}') +
                                                  '}{} '))
                                        : (p = ' {}\\mathrel{\\long' + p + '}{} '),
                                        (e = p);
                                    break;
                                case 'operator':
                                    e = r._getOperator(t.kind_);
                                    break;
                                case 'space':
                                    e = ' ';
                                    break;
                                case 'tinySkip':
                                    e = '\\mkern2mu';
                                    break;
                                case 'entitySkip':
                                case 'pu-space-1':
                                    e = '~';
                                    break;
                                case 'pu-space-2':
                                    e = '\\mkern3mu ';
                                    break;
                                case '1000 separator':
                                    e = '\\mkern2mu ';
                                    break;
                                case 'commaDecimal':
                                    e = '{,}';
                                    break;
                                case 'comma enumeration L':
                                    e = '{' + t.p1 + '}\\mkern6mu ';
                                    break;
                                case 'comma enumeration M':
                                    e = '{' + t.p1 + '}\\mkern3mu ';
                                    break;
                                case 'comma enumeration S':
                                    e = '{' + t.p1 + '}\\mkern1mu ';
                                    break;
                                case 'hyphen':
                                    e = '\\text{-}';
                                    break;
                                case 'addition compound':
                                    e = '\\,{\\cdot}\\,';
                                    break;
                                case 'electron dot':
                                    e = '\\mkern1mu \\bullet\\mkern1mu ';
                                    break;
                                case 'KV x':
                                    e = '{\\times}';
                                    break;
                                case 'prime':
                                    e = '\\prime ';
                                    break;
                                case 'cdot':
                                    e = '\\cdot ';
                                    break;
                                case 'tight cdot':
                                    e = '\\mkern1mu{\\cdot}\\mkern1mu ';
                                    break;
                                case 'times':
                                    e = '\\times ';
                                    break;
                                case 'circa':
                                    e = '{\\sim}';
                                    break;
                                case '^':
                                    e = 'uparrow';
                                    break;
                                case 'v':
                                    e = 'downarrow';
                                    break;
                                case 'ellipsis':
                                    e = '\\ldots ';
                                    break;
                                case '/':
                                    e = '/';
                                    break;
                                case ' / ':
                                    e = '\\,/\\,';
                                    break;
                                default:
                                    throw ['MhchemBugT', 'mhchem bug T. Please report.'];
                            }
                            return e;
                        },
                        _getArrow: function (t) {
                            switch (t) {
                                case '->':
                                case '\u2192':
                                case '\u27f6':
                                    return 'rightarrow';
                                case '<-':
                                    return 'leftarrow';
                                case '<->':
                                    return 'leftrightarrow';
                                case '<--\x3e':
                                    return 'leftrightarrows';
                                case '<=>':
                                case '\u21cc':
                                    return 'rightleftharpoons';
                                case '<=>>':
                                    return 'Rightleftharpoons';
                                case '<<=>':
                                    return 'Leftrightharpoons';
                                default:
                                    throw ['MhchemBugT', 'mhchem bug T. Please report.'];
                            }
                        },
                        _getBond: function (t) {
                            switch (t) {
                                case '-':
                                case '1':
                                    return '{-}';
                                case '=':
                                case '2':
                                    return '{=}';
                                case '#':
                                case '3':
                                    return '{\\equiv}';
                                case '~':
                                    return '{\\tripledash}';
                                case '~-':
                                    return '{\\rlap{\\lower.1em{-}}\\raise.1em{\\tripledash}}';
                                case '~=':
                                case '~--':
                                    return '{\\rlap{\\lower.2em{-}}\\rlap{\\raise.2em{\\tripledash}}-}';
                                case '-~-':
                                    return '{\\rlap{\\lower.2em{-}}\\rlap{\\raise.2em{-}}\\tripledash}';
                                case '...':
                                    return '{{\\cdot}{\\cdot}{\\cdot}}';
                                case '....':
                                    return '{{\\cdot}{\\cdot}{\\cdot}{\\cdot}}';
                                case '->':
                                    return '{\\rightarrow}';
                                case '<-':
                                    return '{\\leftarrow}';
                                case '<':
                                    return '{<}';
                                case '>':
                                    return '{>}';
                                default:
                                    throw ['MhchemBugT', 'mhchem bug T. Please report.'];
                            }
                        },
                        _getOperator: function (t) {
                            switch (t) {
                                case '+':
                                    return ' {}+{} ';
                                case '-':
                                    return ' {}-{} ';
                                case '=':
                                    return ' {}={} ';
                                case '<':
                                    return ' {}<{} ';
                                case '>':
                                    return ' {}>{} ';
                                case '<<':
                                    return ' {}\\ll{} ';
                                case '>>':
                                    return ' {}\\gg{} ';
                                case '\\pm':
                                    return ' {}\\pm{} ';
                                case '\\approx':
                                case '$\\approx$':
                                    return ' {}\\approx{} ';
                                case 'v':
                                case '(v)':
                                    return ' \\downarrow{} ';
                                case '^':
                                case '(^)':
                                    return ' \\uparrow{} ';
                                default:
                                    throw ['MhchemBugT', 'mhchem bug T. Please report.'];
                            }
                        },
                    };
            },
        },
        a = {};
    function r(t) {
        var e = a[t];
        if (void 0 !== e) return e.exports;
        var o = (a[t] = { exports: {} });
        return n[t].call(o.exports, o, o.exports, r), o.exports;
    }
    (t = r(955)),
        (e = r(667)),
        (o = r(78)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/mhchem', e.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { mhchem: { MhchemConfiguration: o } } } } });
})();
