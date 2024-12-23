!(function () {
    'use strict';
    var e,
        o,
        t,
        r,
        a,
        n,
        l = {
            667: function (e, o) {
                (o.q = void 0), (o.q = '3.2.2');
            },
            224: function (e, o, t) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.ColorConfiguration = void 0);
                var r = t(871),
                    a = t(251),
                    n = t(162),
                    l = t(358);
                new r.CommandMap(
                    'color',
                    {
                        color: 'Color',
                        textcolor: 'TextColor',
                        definecolor: 'DefineColor',
                        colorbox: 'ColorBox',
                        fcolorbox: 'FColorBox',
                    },
                    n.ColorMethods,
                );
                o.ColorConfiguration = a.Configuration.create('color', {
                    handler: { macro: ['color'] },
                    options: { color: { padding: '5px', borderWidth: '2px' } },
                    config: function (e, o) {
                        o.parseOptions.packageData.set('color', { model: new l.ColorModel() });
                    },
                });
            },
            59: function (e, o) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.COLORS = void 0),
                    (o.COLORS = new Map([
                        ['Apricot', '#FBB982'],
                        ['Aquamarine', '#00B5BE'],
                        ['Bittersweet', '#C04F17'],
                        ['Black', '#221E1F'],
                        ['Blue', '#2D2F92'],
                        ['BlueGreen', '#00B3B8'],
                        ['BlueViolet', '#473992'],
                        ['BrickRed', '#B6321C'],
                        ['Brown', '#792500'],
                        ['BurntOrange', '#F7921D'],
                        ['CadetBlue', '#74729A'],
                        ['CarnationPink', '#F282B4'],
                        ['Cerulean', '#00A2E3'],
                        ['CornflowerBlue', '#41B0E4'],
                        ['Cyan', '#00AEEF'],
                        ['Dandelion', '#FDBC42'],
                        ['DarkOrchid', '#A4538A'],
                        ['Emerald', '#00A99D'],
                        ['ForestGreen', '#009B55'],
                        ['Fuchsia', '#8C368C'],
                        ['Goldenrod', '#FFDF42'],
                        ['Gray', '#949698'],
                        ['Green', '#00A64F'],
                        ['GreenYellow', '#DFE674'],
                        ['JungleGreen', '#00A99A'],
                        ['Lavender', '#F49EC4'],
                        ['LimeGreen', '#8DC73E'],
                        ['Magenta', '#EC008C'],
                        ['Mahogany', '#A9341F'],
                        ['Maroon', '#AF3235'],
                        ['Melon', '#F89E7B'],
                        ['MidnightBlue', '#006795'],
                        ['Mulberry', '#A93C93'],
                        ['NavyBlue', '#006EB8'],
                        ['OliveGreen', '#3C8031'],
                        ['Orange', '#F58137'],
                        ['OrangeRed', '#ED135A'],
                        ['Orchid', '#AF72B0'],
                        ['Peach', '#F7965A'],
                        ['Periwinkle', '#7977B8'],
                        ['PineGreen', '#008B72'],
                        ['Plum', '#92268F'],
                        ['ProcessBlue', '#00B0F0'],
                        ['Purple', '#99479B'],
                        ['RawSienna', '#974006'],
                        ['Red', '#ED1B23'],
                        ['RedOrange', '#F26035'],
                        ['RedViolet', '#A1246B'],
                        ['Rhodamine', '#EF559F'],
                        ['RoyalBlue', '#0071BC'],
                        ['RoyalPurple', '#613F99'],
                        ['RubineRed', '#ED017D'],
                        ['Salmon', '#F69289'],
                        ['SeaGreen', '#3FBC9D'],
                        ['Sepia', '#671800'],
                        ['SkyBlue', '#46C5DD'],
                        ['SpringGreen', '#C6DC67'],
                        ['Tan', '#DA9D76'],
                        ['TealBlue', '#00AEB3'],
                        ['Thistle', '#D883B7'],
                        ['Turquoise', '#00B4CE'],
                        ['Violet', '#58429B'],
                        ['VioletRed', '#EF58A0'],
                        ['White', '#FFFFFF'],
                        ['WildStrawberry', '#EE2967'],
                        ['Yellow', '#FFF200'],
                        ['YellowGreen', '#98CC70'],
                        ['YellowOrange', '#FAA21A'],
                    ]));
            },
            162: function (e, o, t) {
                var r =
                    (this && this.__importDefault) ||
                    function (e) {
                        return e && e.__esModule ? e : { default: e };
                    };
                Object.defineProperty(o, '__esModule', { value: !0 }), (o.ColorMethods = void 0);
                var a = r(t(748)),
                    n = r(t(398));
                function l(e) {
                    var o = '+'.concat(e),
                        t = e.replace(/^.*?([a-z]*)$/, '$1'),
                        r = 2 * parseFloat(o);
                    return { width: '+'.concat(r).concat(t), height: o, depth: o, lspace: e };
                }
                (o.ColorMethods = {}),
                    (o.ColorMethods.Color = function (e, o) {
                        var t = e.GetBrackets(o, ''),
                            r = e.GetArgument(o),
                            a = e.configuration.packageData.get('color').model.getColor(t, r),
                            n = e.itemFactory
                                .create('style')
                                .setProperties({ styles: { mathcolor: a } });
                        (e.stack.env.color = a), e.Push(n);
                    }),
                    (o.ColorMethods.TextColor = function (e, o) {
                        var t = e.GetBrackets(o, ''),
                            r = e.GetArgument(o),
                            a = e.configuration.packageData.get('color').model.getColor(t, r),
                            n = e.stack.env.color;
                        e.stack.env.color = a;
                        var l = e.ParseArg(o);
                        n ? (e.stack.env.color = n) : delete e.stack.env.color;
                        var i = e.create('node', 'mstyle', [l], { mathcolor: a });
                        e.Push(i);
                    }),
                    (o.ColorMethods.DefineColor = function (e, o) {
                        var t = e.GetArgument(o),
                            r = e.GetArgument(o),
                            a = e.GetArgument(o);
                        e.configuration.packageData.get('color').model.defineColor(r, t, a);
                    }),
                    (o.ColorMethods.ColorBox = function (e, o) {
                        var t = e.GetArgument(o),
                            r = n.default.internalMath(e, e.GetArgument(o)),
                            i = e.configuration.packageData.get('color').model,
                            u = e.create('node', 'mpadded', r, {
                                mathbackground: i.getColor('named', t),
                            });
                        a.default.setProperties(u, l(e.options.color.padding)), e.Push(u);
                    }),
                    (o.ColorMethods.FColorBox = function (e, o) {
                        var t = e.GetArgument(o),
                            r = e.GetArgument(o),
                            i = n.default.internalMath(e, e.GetArgument(o)),
                            u = e.options.color,
                            d = e.configuration.packageData.get('color').model,
                            c = e.create('node', 'mpadded', i, {
                                mathbackground: d.getColor('named', r),
                                style: 'border: '
                                    .concat(u.borderWidth, ' solid ')
                                    .concat(d.getColor('named', t)),
                            });
                        a.default.setProperties(c, l(u.padding)), e.Push(c);
                    });
            },
            358: function (e, o, t) {
                var r =
                        (this && this.__values) ||
                        function (e) {
                            var o = 'function' == typeof Symbol && Symbol.iterator,
                                t = o && e[o],
                                r = 0;
                            if (t) return t.call(e);
                            if (e && 'number' == typeof e.length)
                                return {
                                    next: function () {
                                        return (
                                            e && r >= e.length && (e = void 0),
                                            { value: e && e[r++], done: !e }
                                        );
                                    },
                                };
                            throw new TypeError(
                                o ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(o, '__esModule', { value: !0 }), (o.ColorModel = void 0);
                var n = a(t(402)),
                    l = t(59),
                    i = new Map(),
                    u = (function () {
                        function e() {
                            this.userColors = new Map();
                        }
                        return (
                            (e.prototype.normalizeColor = function (e, o) {
                                if (!e || 'named' === e) return o;
                                if (i.has(e)) return i.get(e)(o);
                                throw new n.default(
                                    'UndefinedColorModel',
                                    "Color model '%1' not defined",
                                    e,
                                );
                            }),
                            (e.prototype.getColor = function (e, o) {
                                return e && 'named' !== e
                                    ? this.normalizeColor(e, o)
                                    : this.getColorByName(o);
                            }),
                            (e.prototype.getColorByName = function (e) {
                                return this.userColors.has(e)
                                    ? this.userColors.get(e)
                                    : l.COLORS.has(e)
                                      ? l.COLORS.get(e)
                                      : e;
                            }),
                            (e.prototype.defineColor = function (e, o, t) {
                                var r = this.normalizeColor(e, t);
                                this.userColors.set(o, r);
                            }),
                            e
                        );
                    })();
                (o.ColorModel = u),
                    i.set('rgb', function (e) {
                        var o,
                            t,
                            a = e.trim().split(/\s*,\s*/),
                            l = '#';
                        if (3 !== a.length)
                            throw new n.default(
                                'ModelArg1',
                                'Color values for the %1 model require 3 numbers',
                                'rgb',
                            );
                        try {
                            for (var i = r(a), u = i.next(); !u.done; u = i.next()) {
                                var d = u.value;
                                if (!d.match(/^(\d+(\.\d*)?|\.\d+)$/))
                                    throw new n.default(
                                        'InvalidDecimalNumber',
                                        'Invalid decimal number',
                                    );
                                var c = parseFloat(d);
                                if (c < 0 || c > 1)
                                    throw new n.default(
                                        'ModelArg2',
                                        'Color values for the %1 model must be between %2 and %3',
                                        'rgb',
                                        '0',
                                        '1',
                                    );
                                var s = Math.floor(255 * c).toString(16);
                                s.length < 2 && (s = '0' + s), (l += s);
                            }
                        } catch (e) {
                            o = { error: e };
                        } finally {
                            try {
                                u && !u.done && (t = i.return) && t.call(i);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        return l;
                    }),
                    i.set('RGB', function (e) {
                        var o,
                            t,
                            a = e.trim().split(/\s*,\s*/),
                            l = '#';
                        if (3 !== a.length)
                            throw new n.default(
                                'ModelArg1',
                                'Color values for the %1 model require 3 numbers',
                                'RGB',
                            );
                        try {
                            for (var i = r(a), u = i.next(); !u.done; u = i.next()) {
                                var d = u.value;
                                if (!d.match(/^\d+$/))
                                    throw new n.default('InvalidNumber', 'Invalid number');
                                var c = parseInt(d);
                                if (c > 255)
                                    throw new n.default(
                                        'ModelArg2',
                                        'Color values for the %1 model must be between %2 and %3',
                                        'RGB',
                                        '0',
                                        '255',
                                    );
                                var s = c.toString(16);
                                s.length < 2 && (s = '0' + s), (l += s);
                            }
                        } catch (e) {
                            o = { error: e };
                        } finally {
                            try {
                                u && !u.done && (t = i.return) && t.call(i);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        return l;
                    }),
                    i.set('gray', function (e) {
                        if (!e.match(/^\s*(\d+(\.\d*)?|\.\d+)\s*$/))
                            throw new n.default('InvalidDecimalNumber', 'Invalid decimal number');
                        var o = parseFloat(e);
                        if (o < 0 || o > 1)
                            throw new n.default(
                                'ModelArg2',
                                'Color values for the %1 model must be between %2 and %3',
                                'gray',
                                '0',
                                '1',
                            );
                        var t = Math.floor(255 * o).toString(16);
                        return t.length < 2 && (t = '0' + t), '#'.concat(t).concat(t).concat(t);
                    });
            },
            955: function (e, o) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (o.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (e, o) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (o.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (o.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            748: function (e, o) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.default = MathJax._.input.tex.NodeUtil.default);
            },
            398: function (e, o) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.default = MathJax._.input.tex.ParseUtil.default);
            },
            871: function (e, o) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.parseResult = MathJax._.input.tex.SymbolMap.parseResult),
                    (o.AbstractSymbolMap = MathJax._.input.tex.SymbolMap.AbstractSymbolMap),
                    (o.RegExpMap = MathJax._.input.tex.SymbolMap.RegExpMap),
                    (o.AbstractParseMap = MathJax._.input.tex.SymbolMap.AbstractParseMap),
                    (o.CharacterMap = MathJax._.input.tex.SymbolMap.CharacterMap),
                    (o.DelimiterMap = MathJax._.input.tex.SymbolMap.DelimiterMap),
                    (o.MacroMap = MathJax._.input.tex.SymbolMap.MacroMap),
                    (o.CommandMap = MathJax._.input.tex.SymbolMap.CommandMap),
                    (o.EnvironmentMap = MathJax._.input.tex.SymbolMap.EnvironmentMap);
            },
            402: function (e, o) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.default = MathJax._.input.tex.TexError.default);
            },
        },
        i = {};
    function u(e) {
        var o = i[e];
        if (void 0 !== o) return o.exports;
        var t = (i[e] = { exports: {} });
        return l[e].call(t.exports, t, t.exports, u), t.exports;
    }
    (e = u(955)),
        (o = u(667)),
        (t = u(224)),
        (r = u(59)),
        (a = u(162)),
        (n = u(358)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/color', o.q, 'tex-extension'),
        (0, e.r8)({
            _: {
                input: {
                    tex: {
                        color: {
                            ColorConfiguration: t,
                            ColorConstants: r,
                            ColorMethods: a,
                            ColorUtil: n,
                        },
                    },
                },
            },
        });
})();
