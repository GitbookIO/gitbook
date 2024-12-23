!(function () {
    'use strict';
    var t,
        e,
        r,
        o,
        n,
        i,
        a,
        s,
        l,
        c,
        h,
        u,
        p,
        d,
        f,
        y,
        m,
        v,
        g,
        b,
        x,
        _,
        M,
        w,
        S,
        O,
        C,
        B,
        j,
        P,
        A,
        V,
        T,
        k,
        G,
        N,
        L,
        D,
        W,
        E,
        R,
        I,
        F,
        H,
        J,
        X,
        z,
        q,
        K,
        U,
        Q,
        Y,
        Z,
        $,
        tt,
        et,
        rt,
        ot,
        nt,
        it,
        at,
        st,
        lt,
        ct,
        ht,
        ut,
        pt,
        dt,
        ft = {
            7306: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            9250: function (t, e, r) {
                var o =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (o =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, o = arguments.length; r < o; r++)
                                            for (var n in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, n) &&
                                                    (t[n] = e[n]);
                                        return t;
                                    }),
                                o.apply(this, arguments)
                            );
                        },
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        },
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.FontData = e.NOSTRETCH = e.H = e.V = void 0);
                var s = r(9077);
                (e.V = 1), (e.H = 2), (e.NOSTRETCH = { dir: 0 });
                var l = (function () {
                    function t(t) {
                        var e, r, l, c;
                        void 0 === t && (t = null),
                            (this.variant = {}),
                            (this.delimiters = {}),
                            (this.cssFontMap = {}),
                            (this.remapChars = {}),
                            (this.skewIcFactor = 0.75);
                        var h = this.constructor;
                        (this.options = (0, s.userOptions)(
                            (0, s.defaultOptions)({}, h.OPTIONS),
                            t,
                        )),
                            (this.params = o({}, h.defaultParams)),
                            (this.sizeVariants = i([], n(h.defaultSizeVariants), !1)),
                            (this.stretchVariants = i([], n(h.defaultStretchVariants), !1)),
                            (this.cssFontMap = o({}, h.defaultCssFonts));
                        try {
                            for (
                                var u = a(Object.keys(this.cssFontMap)), p = u.next();
                                !p.done;
                                p = u.next()
                            ) {
                                var d = p.value;
                                'unknown' === this.cssFontMap[d][0] &&
                                    (this.cssFontMap[d][0] = this.options.unknownFamily);
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                p && !p.done && (r = u.return) && r.call(u);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                        (this.cssFamilyPrefix = h.defaultCssFamilyPrefix),
                            this.createVariants(h.defaultVariants),
                            this.defineDelimiters(h.defaultDelimiters);
                        try {
                            for (
                                var f = a(Object.keys(h.defaultChars)), y = f.next();
                                !y.done;
                                y = f.next()
                            ) {
                                var m = y.value;
                                this.defineChars(m, h.defaultChars[m]);
                            }
                        } catch (t) {
                            l = { error: t };
                        } finally {
                            try {
                                y && !y.done && (c = f.return) && c.call(f);
                            } finally {
                                if (l) throw l.error;
                            }
                        }
                        this.defineRemap('accent', h.defaultAccentMap),
                            this.defineRemap('mo', h.defaultMoMap),
                            this.defineRemap('mn', h.defaultMnMap);
                    }
                    return (
                        (t.charOptions = function (t, e) {
                            var r = t[e];
                            return 3 === r.length && (r[3] = {}), r[3];
                        }),
                        Object.defineProperty(t.prototype, 'styles', {
                            get: function () {
                                return this._styles;
                            },
                            set: function (t) {
                                this._styles = t;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (t.prototype.createVariant = function (t, e, r) {
                            void 0 === e && (e = null), void 0 === r && (r = null);
                            var o = {
                                linked: [],
                                chars: e ? Object.create(this.variant[e].chars) : {},
                            };
                            r &&
                                this.variant[r] &&
                                (Object.assign(o.chars, this.variant[r].chars),
                                this.variant[r].linked.push(o.chars),
                                (o.chars = Object.create(o.chars))),
                                this.remapSmpChars(o.chars, t),
                                (this.variant[t] = o);
                        }),
                        (t.prototype.remapSmpChars = function (t, e) {
                            var r,
                                o,
                                i,
                                s,
                                l = this.constructor;
                            if (l.VariantSmp[e]) {
                                var c = l.SmpRemap,
                                    h = [null, null, l.SmpRemapGreekU, l.SmpRemapGreekL];
                                try {
                                    for (
                                        var u = a(l.SmpRanges), p = u.next();
                                        !p.done;
                                        p = u.next()
                                    ) {
                                        var d = n(p.value, 3),
                                            f = d[0],
                                            y = d[1],
                                            m = d[2],
                                            v = l.VariantSmp[e][f];
                                        if (v) {
                                            for (var g = y; g <= m; g++)
                                                if (930 !== g) {
                                                    var b = v + g - y;
                                                    t[g] = this.smpChar(c[b] || b);
                                                }
                                            if (h[f])
                                                try {
                                                    for (
                                                        var x =
                                                                ((i = void 0),
                                                                a(
                                                                    Object.keys(h[f]).map(
                                                                        function (t) {
                                                                            return parseInt(t);
                                                                        },
                                                                    ),
                                                                )),
                                                            _ = x.next();
                                                        !_.done;
                                                        _ = x.next()
                                                    ) {
                                                        t[(g = _.value)] = this.smpChar(
                                                            v + h[f][g],
                                                        );
                                                    }
                                                } catch (t) {
                                                    i = { error: t };
                                                } finally {
                                                    try {
                                                        _ && !_.done && (s = x.return) && s.call(x);
                                                    } finally {
                                                        if (i) throw i.error;
                                                    }
                                                }
                                        }
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        p && !p.done && (o = u.return) && o.call(u);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }
                            'bold' === e &&
                                ((t[988] = this.smpChar(120778)), (t[989] = this.smpChar(120779)));
                        }),
                        (t.prototype.smpChar = function (t) {
                            return [, , , { smp: t }];
                        }),
                        (t.prototype.createVariants = function (t) {
                            var e, r;
                            try {
                                for (var o = a(t), n = o.next(); !n.done; n = o.next()) {
                                    var i = n.value;
                                    this.createVariant(i[0], i[1], i[2]);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                        }),
                        (t.prototype.defineChars = function (t, e) {
                            var r,
                                o,
                                n = this.variant[t];
                            Object.assign(n.chars, e);
                            try {
                                for (var i = a(n.linked), s = i.next(); !s.done; s = i.next()) {
                                    var l = s.value;
                                    Object.assign(l, e);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (o = i.return) && o.call(i);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                        }),
                        (t.prototype.defineDelimiters = function (t) {
                            Object.assign(this.delimiters, t);
                        }),
                        (t.prototype.defineRemap = function (t, e) {
                            this.remapChars.hasOwnProperty(t) || (this.remapChars[t] = {}),
                                Object.assign(this.remapChars[t], e);
                        }),
                        (t.prototype.getDelimiter = function (t) {
                            return this.delimiters[t];
                        }),
                        (t.prototype.getSizeVariant = function (t, e) {
                            return (
                                this.delimiters[t].variants && (e = this.delimiters[t].variants[e]),
                                this.sizeVariants[e]
                            );
                        }),
                        (t.prototype.getStretchVariant = function (t, e) {
                            return this.stretchVariants[
                                this.delimiters[t].stretchv ? this.delimiters[t].stretchv[e] : 0
                            ];
                        }),
                        (t.prototype.getChar = function (t, e) {
                            return this.variant[t].chars[e];
                        }),
                        (t.prototype.getVariant = function (t) {
                            return this.variant[t];
                        }),
                        (t.prototype.getCssFont = function (t) {
                            return this.cssFontMap[t] || ['serif', !1, !1];
                        }),
                        (t.prototype.getFamily = function (t) {
                            return this.cssFamilyPrefix ? this.cssFamilyPrefix + ', ' + t : t;
                        }),
                        (t.prototype.getRemappedChar = function (t, e) {
                            return (this.remapChars[t] || {})[e];
                        }),
                        (t.OPTIONS = { unknownFamily: 'serif' }),
                        (t.JAX = 'common'),
                        (t.NAME = ''),
                        (t.defaultVariants = [
                            ['normal'],
                            ['bold', 'normal'],
                            ['italic', 'normal'],
                            ['bold-italic', 'italic', 'bold'],
                            ['double-struck', 'bold'],
                            ['fraktur', 'normal'],
                            ['bold-fraktur', 'bold', 'fraktur'],
                            ['script', 'italic'],
                            ['bold-script', 'bold-italic', 'script'],
                            ['sans-serif', 'normal'],
                            ['bold-sans-serif', 'bold', 'sans-serif'],
                            ['sans-serif-italic', 'italic', 'sans-serif'],
                            ['sans-serif-bold-italic', 'bold-italic', 'bold-sans-serif'],
                            ['monospace', 'normal'],
                        ]),
                        (t.defaultCssFonts = {
                            normal: ['unknown', !1, !1],
                            bold: ['unknown', !1, !0],
                            italic: ['unknown', !0, !1],
                            'bold-italic': ['unknown', !0, !0],
                            'double-struck': ['unknown', !1, !0],
                            fraktur: ['unknown', !1, !1],
                            'bold-fraktur': ['unknown', !1, !0],
                            script: ['cursive', !1, !1],
                            'bold-script': ['cursive', !1, !0],
                            'sans-serif': ['sans-serif', !1, !1],
                            'bold-sans-serif': ['sans-serif', !1, !0],
                            'sans-serif-italic': ['sans-serif', !0, !1],
                            'sans-serif-bold-italic': ['sans-serif', !0, !0],
                            monospace: ['monospace', !1, !1],
                        }),
                        (t.defaultCssFamilyPrefix = ''),
                        (t.VariantSmp = {
                            bold: [119808, 119834, 120488, 120514, 120782],
                            italic: [119860, 119886, 120546, 120572],
                            'bold-italic': [119912, 119938, 120604, 120630],
                            script: [119964, 119990],
                            'bold-script': [120016, 120042],
                            fraktur: [120068, 120094],
                            'double-struck': [120120, 120146, , , 120792],
                            'bold-fraktur': [120172, 120198],
                            'sans-serif': [120224, 120250, , , 120802],
                            'bold-sans-serif': [120276, 120302, 120662, 120688, 120812],
                            'sans-serif-italic': [120328, 120354],
                            'sans-serif-bold-italic': [120380, 120406, 120720, 120746],
                            monospace: [120432, 120458, , , 120822],
                        }),
                        (t.SmpRanges = [
                            [0, 65, 90],
                            [1, 97, 122],
                            [2, 913, 937],
                            [3, 945, 969],
                            [4, 48, 57],
                        ]),
                        (t.SmpRemap = {
                            119893: 8462,
                            119965: 8492,
                            119968: 8496,
                            119969: 8497,
                            119971: 8459,
                            119972: 8464,
                            119975: 8466,
                            119976: 8499,
                            119981: 8475,
                            119994: 8495,
                            119996: 8458,
                            120004: 8500,
                            120070: 8493,
                            120075: 8460,
                            120076: 8465,
                            120085: 8476,
                            120093: 8488,
                            120122: 8450,
                            120127: 8461,
                            120133: 8469,
                            120135: 8473,
                            120136: 8474,
                            120137: 8477,
                            120145: 8484,
                        }),
                        (t.SmpRemapGreekU = { 8711: 25, 1012: 17 }),
                        (t.SmpRemapGreekL = {
                            977: 27,
                            981: 29,
                            982: 31,
                            1008: 28,
                            1009: 30,
                            1013: 26,
                            8706: 25,
                        }),
                        (t.defaultAccentMap = {
                            768: '\u02cb',
                            769: '\u02ca',
                            770: '\u02c6',
                            771: '\u02dc',
                            772: '\u02c9',
                            774: '\u02d8',
                            775: '\u02d9',
                            776: '\xa8',
                            778: '\u02da',
                            780: '\u02c7',
                            8594: '\u20d7',
                            8242: "'",
                            8243: "''",
                            8244: "'''",
                            8245: '`',
                            8246: '``',
                            8247: '```',
                            8279: "''''",
                            8400: '\u21bc',
                            8401: '\u21c0',
                            8406: '\u2190',
                            8417: '\u2194',
                            8432: '*',
                            8411: '...',
                            8412: '....',
                            8428: '\u21c1',
                            8429: '\u21bd',
                            8430: '\u2190',
                            8431: '\u2192',
                        }),
                        (t.defaultMoMap = { 45: '\u2212' }),
                        (t.defaultMnMap = { 45: '\u2212' }),
                        (t.defaultParams = {
                            x_height: 0.442,
                            quad: 1,
                            num1: 0.676,
                            num2: 0.394,
                            num3: 0.444,
                            denom1: 0.686,
                            denom2: 0.345,
                            sup1: 0.413,
                            sup2: 0.363,
                            sup3: 0.289,
                            sub1: 0.15,
                            sub2: 0.247,
                            sup_drop: 0.386,
                            sub_drop: 0.05,
                            delim1: 2.39,
                            delim2: 1,
                            axis_height: 0.25,
                            rule_thickness: 0.06,
                            big_op_spacing1: 0.111,
                            big_op_spacing2: 0.167,
                            big_op_spacing3: 0.2,
                            big_op_spacing4: 0.6,
                            big_op_spacing5: 0.1,
                            surd_height: 0.075,
                            scriptspace: 0.05,
                            nulldelimiterspace: 0.12,
                            delimiterfactor: 901,
                            delimitershortfall: 0.3,
                            min_rule_thickness: 1.25,
                            separation_factor: 1.75,
                            extra_ic: 0.033,
                        }),
                        (t.defaultDelimiters = {}),
                        (t.defaultChars = {}),
                        (t.defaultSizeVariants = []),
                        (t.defaultStretchVariants = []),
                        t
                    );
                })();
                e.FontData = l;
            },
            5373: function (t, e) {
                var r =
                    (this && this.__read) ||
                    function (t, e) {
                        var r = 'function' == typeof Symbol && t[Symbol.iterator];
                        if (!r) return t;
                        var o,
                            n,
                            i = r.call(t),
                            a = [];
                        try {
                            for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                a.push(o.value);
                        } catch (t) {
                            n = { error: t };
                        } finally {
                            try {
                                o && !o.done && (r = i.return) && r.call(i);
                            } finally {
                                if (n) throw n.error;
                            }
                        }
                        return a;
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonArrow =
                        e.CommonDiagonalArrow =
                        e.CommonDiagonalStrike =
                        e.CommonBorder2 =
                        e.CommonBorder =
                        e.arrowBBox =
                        e.diagonalArrowDef =
                        e.arrowDef =
                        e.arrowBBoxW =
                        e.arrowBBoxHD =
                        e.arrowHead =
                        e.fullBorder =
                        e.fullPadding =
                        e.fullBBox =
                        e.sideNames =
                        e.sideIndex =
                        e.SOLID =
                        e.PADDING =
                        e.THICKNESS =
                        e.ARROWY =
                        e.ARROWDX =
                        e.ARROWX =
                            void 0),
                    (e.ARROWX = 4),
                    (e.ARROWDX = 1),
                    (e.ARROWY = 2),
                    (e.THICKNESS = 0.067),
                    (e.PADDING = 0.2),
                    (e.SOLID = e.THICKNESS + 'em solid'),
                    (e.sideIndex = { top: 0, right: 1, bottom: 2, left: 3 }),
                    (e.sideNames = Object.keys(e.sideIndex)),
                    (e.fullBBox = function (t) {
                        return new Array(4).fill(t.thickness + t.padding);
                    }),
                    (e.fullPadding = function (t) {
                        return new Array(4).fill(t.padding);
                    }),
                    (e.fullBorder = function (t) {
                        return new Array(4).fill(t.thickness);
                    });
                e.arrowHead = function (t) {
                    return Math.max(t.padding, t.thickness * (t.arrowhead.x + t.arrowhead.dx + 1));
                };
                e.arrowBBoxHD = function (t, e) {
                    if (t.childNodes[0]) {
                        var r = t.childNodes[0].getBBox(),
                            o = r.h,
                            n = r.d;
                        e[0] = e[2] = Math.max(0, t.thickness * t.arrowhead.y - (o + n) / 2);
                    }
                    return e;
                };
                (e.arrowBBoxW = function (t, e) {
                    if (t.childNodes[0]) {
                        var r = t.childNodes[0].getBBox().w;
                        e[1] = e[3] = Math.max(0, t.thickness * t.arrowhead.y - r / 2);
                    }
                    return e;
                }),
                    (e.arrowDef = {
                        up: [-Math.PI / 2, !1, !0, 'verticalstrike'],
                        down: [Math.PI / 2, !1, !0, 'verticakstrike'],
                        right: [0, !1, !1, 'horizontalstrike'],
                        left: [Math.PI, !1, !1, 'horizontalstrike'],
                        updown: [Math.PI / 2, !0, !0, 'verticalstrike uparrow downarrow'],
                        leftright: [0, !0, !1, 'horizontalstrike leftarrow rightarrow'],
                    }),
                    (e.diagonalArrowDef = {
                        updiagonal: [-1, 0, !1, 'updiagonalstrike northeastarrow'],
                        northeast: [-1, 0, !1, 'updiagonalstrike updiagonalarrow'],
                        southeast: [1, 0, !1, 'downdiagonalstrike'],
                        northwest: [1, Math.PI, !1, 'downdiagonalstrike'],
                        southwest: [-1, Math.PI, !1, 'updiagonalstrike'],
                        northeastsouthwest: [
                            -1,
                            0,
                            !0,
                            'updiagonalstrike northeastarrow updiagonalarrow southwestarrow',
                        ],
                        northwestsoutheast: [
                            1,
                            0,
                            !0,
                            'downdiagonalstrike northwestarrow southeastarrow',
                        ],
                    }),
                    (e.arrowBBox = {
                        up: function (t) {
                            return (0, e.arrowBBoxW)(t, [(0, e.arrowHead)(t), 0, t.padding, 0]);
                        },
                        down: function (t) {
                            return (0, e.arrowBBoxW)(t, [t.padding, 0, (0, e.arrowHead)(t), 0]);
                        },
                        right: function (t) {
                            return (0, e.arrowBBoxHD)(t, [0, (0, e.arrowHead)(t), 0, t.padding]);
                        },
                        left: function (t) {
                            return (0, e.arrowBBoxHD)(t, [0, t.padding, 0, (0, e.arrowHead)(t)]);
                        },
                        updown: function (t) {
                            return (0, e.arrowBBoxW)(t, [
                                (0, e.arrowHead)(t),
                                0,
                                (0, e.arrowHead)(t),
                                0,
                            ]);
                        },
                        leftright: function (t) {
                            return (0, e.arrowBBoxHD)(t, [
                                0,
                                (0, e.arrowHead)(t),
                                0,
                                (0, e.arrowHead)(t),
                            ]);
                        },
                    });
                e.CommonBorder = function (t) {
                    return function (r) {
                        var o = e.sideIndex[r];
                        return [
                            r,
                            {
                                renderer: t,
                                bbox: function (t) {
                                    var e = [0, 0, 0, 0];
                                    return (e[o] = t.thickness + t.padding), e;
                                },
                                border: function (t) {
                                    var e = [0, 0, 0, 0];
                                    return (e[o] = t.thickness), e;
                                },
                            },
                        ];
                    };
                };
                e.CommonBorder2 = function (t) {
                    return function (r, o, n) {
                        var i = e.sideIndex[o],
                            a = e.sideIndex[n];
                        return [
                            r,
                            {
                                renderer: t,
                                bbox: function (t) {
                                    var e = t.thickness + t.padding,
                                        r = [0, 0, 0, 0];
                                    return (r[i] = r[a] = e), r;
                                },
                                border: function (t) {
                                    var e = [0, 0, 0, 0];
                                    return (e[i] = e[a] = t.thickness), e;
                                },
                                remove: o + ' ' + n,
                            },
                        ];
                    };
                };
                e.CommonDiagonalStrike = function (t) {
                    return function (r) {
                        var o = 'mjx-' + r.charAt(0) + 'strike';
                        return [r + 'diagonalstrike', { renderer: t(o), bbox: e.fullBBox }];
                    };
                };
                e.CommonDiagonalArrow = function (t) {
                    return function (o) {
                        var n = r(e.diagonalArrowDef[o], 4),
                            i = n[0],
                            a = n[1],
                            s = n[2];
                        return [
                            o + 'arrow',
                            {
                                renderer: function (e, o) {
                                    var n = r(e.arrowAW(), 2),
                                        l = n[0],
                                        c = n[1],
                                        h = e.arrow(c, i * (l - a), s);
                                    t(e, h);
                                },
                                bbox: function (t) {
                                    var e = t.arrowData(),
                                        o = e.a,
                                        n = e.x,
                                        i = e.y,
                                        a = r([t.arrowhead.x, t.arrowhead.y, t.arrowhead.dx], 3),
                                        s = a[0],
                                        l = a[1],
                                        c = a[2],
                                        h = r(t.getArgMod(s + c, l), 2),
                                        u = h[0],
                                        p = h[1],
                                        d = i + (u > o ? t.thickness * p * Math.sin(u - o) : 0),
                                        f =
                                            n +
                                            (u > Math.PI / 2 - o
                                                ? t.thickness * p * Math.sin(u + o - Math.PI / 2)
                                                : 0);
                                    return [d, f, d, f];
                                },
                                remove: n[3],
                            },
                        ];
                    };
                };
                e.CommonArrow = function (t) {
                    return function (o) {
                        var n = r(e.arrowDef[o], 4),
                            i = n[0],
                            a = n[1],
                            s = n[2],
                            l = n[3];
                        return [
                            o + 'arrow',
                            {
                                renderer: function (e, o) {
                                    var n = e.getBBox(),
                                        l = n.w,
                                        c = n.h,
                                        h = n.d,
                                        u = r(s ? [c + h, 'X'] : [l, 'Y'], 2),
                                        p = u[0],
                                        d = u[1],
                                        f = e.getOffset(d),
                                        y = e.arrow(p, i, a, d, f);
                                    t(e, y);
                                },
                                bbox: e.arrowBBox[o],
                                remove: l,
                            },
                        ];
                    };
                };
            },
            716: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (i =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, o = arguments.length; r < o; r++)
                                            for (var n in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, n) &&
                                                    (t[n] = e[n]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    s =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.CommonOutputJax = void 0);
                var l = r(3985),
                    c = r(4769),
                    h = r(9077),
                    u = r(6914),
                    p = r(5878),
                    d = r(5888),
                    f = (function (t) {
                        function e(e, r, o) {
                            void 0 === e && (e = null),
                                void 0 === r && (r = null),
                                void 0 === o && (o = null);
                            var n = this,
                                i = a((0, h.separateOptions)(e, o.OPTIONS), 2),
                                s = i[0],
                                l = i[1];
                            return (
                                ((n = t.call(this, s) || this).factory =
                                    n.options.wrapperFactory || new r()),
                                (n.factory.jax = n),
                                (n.cssStyles = n.options.cssStyles || new d.CssStyles()),
                                (n.font = n.options.font || new o(l)),
                                (n.unknownCache = new Map()),
                                n
                            );
                        }
                        return (
                            n(e, t),
                            (e.prototype.typeset = function (t, e) {
                                this.setDocument(e);
                                var r = this.createNode();
                                return this.toDOM(t, r, e), r;
                            }),
                            (e.prototype.createNode = function () {
                                var t = this.constructor.NAME;
                                return this.html('mjx-container', { class: 'MathJax', jax: t });
                            }),
                            (e.prototype.setScale = function (t) {
                                var e = this.math.metrics.scale * this.options.scale;
                                1 !== e && this.adaptor.setStyle(t, 'fontSize', (0, u.percent)(e));
                            }),
                            (e.prototype.toDOM = function (t, e, r) {
                                void 0 === r && (r = null),
                                    this.setDocument(r),
                                    (this.math = t),
                                    (this.pxPerEm = t.metrics.ex / this.font.params.x_height),
                                    t.root.setTeXclass(null),
                                    this.setScale(e),
                                    (this.nodeMap = new Map()),
                                    (this.container = e),
                                    this.processMath(t.root, e),
                                    (this.nodeMap = null),
                                    this.executeFilters(this.postFilters, t, r, e);
                            }),
                            (e.prototype.getBBox = function (t, e) {
                                this.setDocument(e),
                                    (this.math = t),
                                    t.root.setTeXclass(null),
                                    (this.nodeMap = new Map());
                                var r = this.factory.wrap(t.root).getOuterBBox();
                                return (this.nodeMap = null), r;
                            }),
                            (e.prototype.getMetrics = function (t) {
                                var e, r;
                                this.setDocument(t);
                                var o = this.adaptor,
                                    n = this.getMetricMaps(t);
                                try {
                                    for (var i = s(t.math), a = i.next(); !a.done; a = i.next()) {
                                        var l = a.value,
                                            h = o.parent(l.start.node);
                                        if (l.state() < c.STATE.METRICS && h) {
                                            var u = n[l.display ? 1 : 0].get(h),
                                                p = u.em,
                                                d = u.ex,
                                                f = u.containerWidth,
                                                y = u.lineWidth,
                                                m = u.scale,
                                                v = u.family;
                                            l.setMetrics(p, d, f, y, m),
                                                this.options.mtextInheritFont &&
                                                    (l.outputData.mtextFamily = v),
                                                this.options.merrorInheritFont &&
                                                    (l.outputData.merrorFamily = v),
                                                l.state(c.STATE.METRICS);
                                        }
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        a && !a.done && (r = i.return) && r.call(i);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            }),
                            (e.prototype.getMetricsFor = function (t, e) {
                                var r =
                                        this.options.mtextInheritFont ||
                                        this.options.merrorInheritFont,
                                    o = this.getTestElement(t, e),
                                    n = this.measureMetrics(o, r);
                                return this.adaptor.remove(o), n;
                            }),
                            (e.prototype.getMetricMaps = function (t) {
                                var e,
                                    r,
                                    o,
                                    n,
                                    i,
                                    a,
                                    l,
                                    h,
                                    u,
                                    p,
                                    d = this.adaptor,
                                    f = [new Map(), new Map()];
                                try {
                                    for (var y = s(t.math), m = y.next(); !m.done; m = y.next()) {
                                        var v = m.value;
                                        if (
                                            (C = d.parent(v.start.node)) &&
                                            v.state() < c.STATE.METRICS
                                        ) {
                                            var g = f[v.display ? 1 : 0];
                                            g.has(C) || g.set(C, this.getTestElement(C, v.display));
                                        }
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        m && !m.done && (r = y.return) && r.call(y);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                var b =
                                        this.options.mtextInheritFont ||
                                        this.options.merrorInheritFont,
                                    x = [new Map(), new Map()];
                                try {
                                    for (var _ = s(x.keys()), M = _.next(); !M.done; M = _.next()) {
                                        var w = M.value;
                                        try {
                                            for (
                                                var S = ((i = void 0), s(f[w].keys())),
                                                    O = S.next();
                                                !O.done;
                                                O = S.next()
                                            ) {
                                                var C = O.value;
                                                x[w].set(C, this.measureMetrics(f[w].get(C), b));
                                            }
                                        } catch (t) {
                                            i = { error: t };
                                        } finally {
                                            try {
                                                O && !O.done && (a = S.return) && a.call(S);
                                            } finally {
                                                if (i) throw i.error;
                                            }
                                        }
                                    }
                                } catch (t) {
                                    o = { error: t };
                                } finally {
                                    try {
                                        M && !M.done && (n = _.return) && n.call(_);
                                    } finally {
                                        if (o) throw o.error;
                                    }
                                }
                                try {
                                    for (var B = s(x.keys()), j = B.next(); !j.done; j = B.next()) {
                                        w = j.value;
                                        try {
                                            for (
                                                var P = ((u = void 0), s(f[w].values())),
                                                    A = P.next();
                                                !A.done;
                                                A = P.next()
                                            ) {
                                                C = A.value;
                                                d.remove(C);
                                            }
                                        } catch (t) {
                                            u = { error: t };
                                        } finally {
                                            try {
                                                A && !A.done && (p = P.return) && p.call(P);
                                            } finally {
                                                if (u) throw u.error;
                                            }
                                        }
                                    }
                                } catch (t) {
                                    l = { error: t };
                                } finally {
                                    try {
                                        j && !j.done && (h = B.return) && h.call(B);
                                    } finally {
                                        if (l) throw l.error;
                                    }
                                }
                                return x;
                            }),
                            (e.prototype.getTestElement = function (t, e) {
                                var r = this.adaptor;
                                if (!this.testInline) {
                                    (this.testInline = this.html(
                                        'mjx-test',
                                        {
                                            style: {
                                                display: 'inline-block',
                                                width: '100%',
                                                'font-style': 'normal',
                                                'font-weight': 'normal',
                                                'font-size': '100%',
                                                'font-size-adjust': 'none',
                                                'text-indent': 0,
                                                'text-transform': 'none',
                                                'letter-spacing': 'normal',
                                                'word-spacing': 'normal',
                                                overflow: 'hidden',
                                                height: '1px',
                                                'margin-right': '-1px',
                                            },
                                        },
                                        [
                                            this.html('mjx-left-box', {
                                                style: {
                                                    display: 'inline-block',
                                                    width: 0,
                                                    float: 'left',
                                                },
                                            }),
                                            this.html('mjx-ex-box', {
                                                style: {
                                                    position: 'absolute',
                                                    overflow: 'hidden',
                                                    width: '1px',
                                                    height: '60ex',
                                                },
                                            }),
                                            this.html('mjx-right-box', {
                                                style: {
                                                    display: 'inline-block',
                                                    width: 0,
                                                    float: 'right',
                                                },
                                            }),
                                        ],
                                    )),
                                        (this.testDisplay = r.clone(this.testInline)),
                                        r.setStyle(this.testDisplay, 'display', 'table'),
                                        r.setStyle(this.testDisplay, 'margin-right', ''),
                                        r.setStyle(
                                            r.firstChild(this.testDisplay),
                                            'display',
                                            'none',
                                        );
                                    var o = r.lastChild(this.testDisplay);
                                    r.setStyle(o, 'display', 'table-cell'),
                                        r.setStyle(o, 'width', '10000em'),
                                        r.setStyle(o, 'float', '');
                                }
                                return r.append(t, r.clone(e ? this.testDisplay : this.testInline));
                            }),
                            (e.prototype.measureMetrics = function (t, e) {
                                var r = this.adaptor,
                                    o = e ? r.fontFamily(t) : '',
                                    n = r.fontSize(t),
                                    i = a(r.nodeSize(r.childNode(t, 1)), 2),
                                    s = i[0],
                                    l = i[1],
                                    c = s ? l / 60 : n * this.options.exFactor;
                                return {
                                    em: n,
                                    ex: c,
                                    containerWidth: s
                                        ? 'table' === r.getStyle(t, 'display')
                                            ? r.nodeSize(r.lastChild(t))[0] - 1
                                            : r.nodeBBox(r.lastChild(t)).left -
                                              r.nodeBBox(r.firstChild(t)).left -
                                              2
                                        : 1e6,
                                    lineWidth: 1e6,
                                    scale: Math.max(
                                        this.options.minScale,
                                        this.options.matchFontHeight
                                            ? c / this.font.params.x_height / n
                                            : 1,
                                    ),
                                    family: o,
                                };
                            }),
                            (e.prototype.styleSheet = function (t) {
                                var e, r;
                                if (
                                    (this.setDocument(t),
                                    this.cssStyles.clear(),
                                    this.cssStyles.addStyles(this.constructor.commonStyles),
                                    'getStyles' in t)
                                )
                                    try {
                                        for (
                                            var o = s(t.getStyles()), n = o.next();
                                            !n.done;
                                            n = o.next()
                                        ) {
                                            var i = n.value;
                                            this.cssStyles.addStyles(i);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            n && !n.done && (r = o.return) && r.call(o);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                                return (
                                    this.addWrapperStyles(this.cssStyles),
                                    this.addFontStyles(this.cssStyles),
                                    this.html('style', { id: 'MJX-styles' }, [
                                        this.text('\n' + this.cssStyles.cssText + '\n'),
                                    ])
                                );
                            }),
                            (e.prototype.addFontStyles = function (t) {
                                t.addStyles(this.font.styles);
                            }),
                            (e.prototype.addWrapperStyles = function (t) {
                                var e, r;
                                try {
                                    for (
                                        var o = s(this.factory.getKinds()), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var i = n.value;
                                        this.addClassStyles(this.factory.getNodeClass(i), t);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        n && !n.done && (r = o.return) && r.call(o);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            }),
                            (e.prototype.addClassStyles = function (t, e) {
                                e.addStyles(t.styles);
                            }),
                            (e.prototype.setDocument = function (t) {
                                t && ((this.document = t), (this.adaptor.document = t.document));
                            }),
                            (e.prototype.html = function (t, e, r, o) {
                                return (
                                    void 0 === e && (e = {}),
                                    void 0 === r && (r = []),
                                    this.adaptor.node(t, e, r, o)
                                );
                            }),
                            (e.prototype.text = function (t) {
                                return this.adaptor.text(t);
                            }),
                            (e.prototype.fixed = function (t, e) {
                                return (
                                    void 0 === e && (e = 3),
                                    Math.abs(t) < 6e-4 ? '0' : t.toFixed(e).replace(/\.?0+$/, '')
                                );
                            }),
                            (e.prototype.measureText = function (t, e, r) {
                                void 0 === r && (r = ['', !1, !1]);
                                var o = this.unknownText(t, e);
                                if ('-explicitFont' === e) {
                                    var n = this.cssFontStyles(r);
                                    this.adaptor.setAttributes(o, { style: n });
                                }
                                return this.measureTextNodeWithCache(o, t, e, r);
                            }),
                            (e.prototype.measureTextNodeWithCache = function (t, e, r, o) {
                                void 0 === o && (o = ['', !1, !1]),
                                    '-explicitFont' === r &&
                                        (r = [o[0], o[1] ? 'T' : 'F', o[2] ? 'T' : 'F', ''].join(
                                            '-',
                                        )),
                                    this.unknownCache.has(r) || this.unknownCache.set(r, new Map());
                                var n = this.unknownCache.get(r),
                                    i = n.get(e);
                                if (i) return i;
                                var a = this.measureTextNode(t);
                                return n.set(e, a), a;
                            }),
                            (e.prototype.measureXMLnode = function (t) {
                                var e = this.adaptor,
                                    r = this.html(
                                        'mjx-xml-block',
                                        { style: { display: 'inline-block' } },
                                        [e.clone(t)],
                                    ),
                                    o = this.html('mjx-baseline', {
                                        style: { display: 'inline-block', width: 0, height: 0 },
                                    }),
                                    n = this.html(
                                        'mjx-measure-xml',
                                        {
                                            style: {
                                                position: 'absolute',
                                                display: 'inline-block',
                                                'font-family': 'initial',
                                                'line-height': 'normal',
                                            },
                                        },
                                        [o, r],
                                    );
                                e.append(e.parent(this.math.start.node), this.container),
                                    e.append(this.container, n);
                                var i = this.math.metrics.em * this.math.metrics.scale,
                                    a = e.nodeBBox(r),
                                    s = a.left,
                                    l = a.right,
                                    c = a.bottom,
                                    h = a.top,
                                    u = (l - s) / i,
                                    p = (e.nodeBBox(o).top - h) / i,
                                    d = (c - h) / i - p;
                                return e.remove(this.container), e.remove(n), { w: u, h: p, d: d };
                            }),
                            (e.prototype.cssFontStyles = function (t, e) {
                                void 0 === e && (e = {});
                                var r = a(t, 3),
                                    o = r[0],
                                    n = r[1],
                                    i = r[2];
                                return (
                                    (e['font-family'] = this.font.getFamily(o)),
                                    n && (e['font-style'] = 'italic'),
                                    i && (e['font-weight'] = 'bold'),
                                    e
                                );
                            }),
                            (e.prototype.getFontData = function (t) {
                                return (
                                    t || (t = new p.Styles()),
                                    [
                                        this.font.getFamily(t.get('font-family')),
                                        'italic' === t.get('font-style'),
                                        'bold' === t.get('font-weight'),
                                    ]
                                );
                            }),
                            (e.NAME = 'Common'),
                            (e.OPTIONS = i(i({}, l.AbstractOutputJax.OPTIONS), {
                                scale: 1,
                                minScale: 0.5,
                                mtextInheritFont: !1,
                                merrorInheritFont: !1,
                                mtextFont: '',
                                merrorFont: 'serif',
                                mathmlSpacing: !1,
                                skipAttributes: {},
                                exFactor: 0.5,
                                displayAlign: 'center',
                                displayIndent: '0',
                                wrapperFactory: null,
                                font: null,
                                cssStyles: null,
                            })),
                            (e.commonStyles = {}),
                            e
                        );
                    })(l.AbstractOutputJax);
                e.CommonOutputJax = f;
            },
            1541: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, o) {
                                  void 0 === o && (o = r);
                                  var n = Object.getOwnPropertyDescriptor(e, r);
                                  (n &&
                                      !('get' in n
                                          ? !e.__esModule
                                          : n.writable || n.configurable)) ||
                                      (n = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, o, n);
                              }
                            : function (t, e, r, o) {
                                  void 0 === o && (o = r), (t[o] = e[r]);
                              }),
                    a =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    s =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        i(e, t, r);
                            return a(e, t), e;
                        },
                    l =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    c =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    h =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.CommonWrapper = void 0);
                var u = r(9879),
                    p = r(8921),
                    d = r(6720),
                    f = s(r(6914)),
                    y = r(5878),
                    m = r(3717),
                    v = r(9250),
                    g = 2 / 18;
                function b(t, e) {
                    return t ? (e < g ? 0 : g) : e;
                }
                var x = (function (t) {
                    function e(e, r, o) {
                        void 0 === o && (o = null);
                        var n = t.call(this, e, r) || this;
                        return (
                            (n.parent = null),
                            (n.removedStyles = null),
                            (n.styles = null),
                            (n.variant = ''),
                            (n.bboxComputed = !1),
                            (n.stretch = v.NOSTRETCH),
                            (n.font = null),
                            (n.parent = o),
                            (n.font = e.jax.font),
                            (n.bbox = m.BBox.zero()),
                            n.getStyles(),
                            n.getVariant(),
                            n.getScale(),
                            n.getSpace(),
                            (n.childNodes = r.childNodes.map(function (t) {
                                var e = n.wrap(t);
                                return (
                                    e.bbox.pwidth &&
                                        (r.notParent || r.isKind('math')) &&
                                        (n.bbox.pwidth = m.BBox.fullWidth),
                                    e
                                );
                            })),
                            n
                        );
                    }
                    return (
                        n(e, t),
                        Object.defineProperty(e.prototype, 'jax', {
                            get: function () {
                                return this.factory.jax;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'adaptor', {
                            get: function () {
                                return this.factory.jax.adaptor;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'metrics', {
                            get: function () {
                                return this.factory.jax.math.metrics;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'fixesPWidth', {
                            get: function () {
                                return !this.node.notParent && !this.node.isToken;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.wrap = function (t, e) {
                            void 0 === e && (e = null);
                            var r = this.factory.wrap(t, e || this);
                            return e && e.childNodes.push(r), this.jax.nodeMap.set(t, r), r;
                        }),
                        (e.prototype.getBBox = function (t) {
                            if ((void 0 === t && (t = !0), this.bboxComputed)) return this.bbox;
                            var e = t ? this.bbox : m.BBox.zero();
                            return this.computeBBox(e), (this.bboxComputed = t), e;
                        }),
                        (e.prototype.getOuterBBox = function (t) {
                            var e, r;
                            void 0 === t && (t = !0);
                            var o = this.getBBox(t);
                            if (!this.styles) return o;
                            var n = new m.BBox();
                            Object.assign(n, o);
                            try {
                                for (
                                    var i = l(m.BBox.StyleAdjust), a = i.next();
                                    !a.done;
                                    a = i.next()
                                ) {
                                    var s = c(a.value, 2),
                                        h = s[0],
                                        u = s[1],
                                        p = this.styles.get(h);
                                    p && (n[u] += this.length2em(p, 1, n.rscale));
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return n;
                        }),
                        (e.prototype.computeBBox = function (t, e) {
                            var r, o;
                            void 0 === e && (e = !1), t.empty();
                            try {
                                for (
                                    var n = l(this.childNodes), i = n.next();
                                    !i.done;
                                    i = n.next()
                                ) {
                                    var a = i.value;
                                    t.append(a.getOuterBBox());
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    i && !i.done && (o = n.return) && o.call(n);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            t.clean(),
                                this.fixesPWidth &&
                                    this.setChildPWidths(e) &&
                                    this.computeBBox(t, !0);
                        }),
                        (e.prototype.setChildPWidths = function (t, e, r) {
                            var o, n;
                            if ((void 0 === e && (e = null), void 0 === r && (r = !0), t))
                                return !1;
                            r && (this.bbox.pwidth = '');
                            var i = !1;
                            try {
                                for (
                                    var a = l(this.childNodes), s = a.next();
                                    !s.done;
                                    s = a.next()
                                ) {
                                    var c = s.value,
                                        h = c.getOuterBBox();
                                    h.pwidth &&
                                        c.setChildPWidths(t, null === e ? h.w : e, r) &&
                                        (i = !0);
                                }
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (n = a.return) && n.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        }),
                        (e.prototype.invalidateBBox = function () {
                            this.bboxComputed &&
                                ((this.bboxComputed = !1),
                                this.parent && this.parent.invalidateBBox());
                        }),
                        (e.prototype.copySkewIC = function (t) {
                            var e = this.childNodes[0];
                            (null == e ? void 0 : e.bbox.sk) && (t.sk = e.bbox.sk),
                                (null == e ? void 0 : e.bbox.dx) && (t.dx = e.bbox.dx);
                            var r = this.childNodes[this.childNodes.length - 1];
                            (null == r ? void 0 : r.bbox.ic) && ((t.ic = r.bbox.ic), (t.w += t.ic));
                        }),
                        (e.prototype.getStyles = function () {
                            var t = this.node.attributes.getExplicit('style');
                            if (t)
                                for (
                                    var r = (this.styles = new y.Styles(t)),
                                        o = 0,
                                        n = e.removeStyles.length;
                                    o < n;
                                    o++
                                ) {
                                    var i = e.removeStyles[o];
                                    r.get(i) &&
                                        (this.removedStyles || (this.removedStyles = {}),
                                        (this.removedStyles[i] = r.get(i)),
                                        r.set(i, ''));
                                }
                        }),
                        (e.prototype.getVariant = function () {
                            if (this.node.isToken) {
                                var t = this.node.attributes,
                                    r = t.get('mathvariant');
                                if (!t.getExplicit('mathvariant')) {
                                    var o = t.getList('fontfamily', 'fontweight', 'fontstyle');
                                    if (this.removedStyles) {
                                        var n = this.removedStyles;
                                        n.fontFamily && (o.family = n.fontFamily),
                                            n.fontWeight && (o.weight = n.fontWeight),
                                            n.fontStyle && (o.style = n.fontStyle);
                                    }
                                    o.fontfamily && (o.family = o.fontfamily),
                                        o.fontweight && (o.weight = o.fontweight),
                                        o.fontstyle && (o.style = o.fontstyle),
                                        o.weight &&
                                            o.weight.match(/^\d+$/) &&
                                            (o.weight =
                                                parseInt(o.weight) > 600 ? 'bold' : 'normal'),
                                        o.family
                                            ? (r = this.explicitVariant(
                                                  o.family,
                                                  o.weight,
                                                  o.style,
                                              ))
                                            : (this.node.getProperty('variantForm') &&
                                                  (r = '-tex-variant'),
                                              (r = (e.BOLDVARIANTS[o.weight] || {})[r] || r),
                                              (r = (e.ITALICVARIANTS[o.style] || {})[r] || r));
                                }
                                this.variant = r;
                            }
                        }),
                        (e.prototype.explicitVariant = function (t, e, r) {
                            var o = this.styles;
                            return (
                                o || (o = this.styles = new y.Styles()),
                                o.set('fontFamily', t),
                                e && o.set('fontWeight', e),
                                r && o.set('fontStyle', r),
                                '-explicitFont'
                            );
                        }),
                        (e.prototype.getScale = function () {
                            var t = 1,
                                e = this.parent,
                                r = e ? e.bbox.scale : 1,
                                o = this.node.attributes,
                                n = Math.min(o.get('scriptlevel'), 2),
                                i = o.get('fontsize'),
                                a =
                                    this.node.isToken || this.node.isKind('mstyle')
                                        ? o.get('mathsize')
                                        : o.getInherited('mathsize');
                            if (0 !== n) {
                                t = Math.pow(o.get('scriptsizemultiplier'), n);
                                var s = this.length2em(o.get('scriptminsize'), 0.8, 1);
                                t < s && (t = s);
                            }
                            this.removedStyles &&
                                this.removedStyles.fontSize &&
                                !i &&
                                (i = this.removedStyles.fontSize),
                                i && !o.getExplicit('mathsize') && (a = i),
                                '1' !== a && (t *= this.length2em(a, 1, 1)),
                                (this.bbox.scale = t),
                                (this.bbox.rscale = t / r);
                        }),
                        (e.prototype.getSpace = function () {
                            var t = this.isTopEmbellished(),
                                e = this.node.hasSpacingAttributes();
                            this.jax.options.mathmlSpacing || e
                                ? t && this.getMathMLSpacing()
                                : this.getTeXSpacing(t, e);
                        }),
                        (e.prototype.getMathMLSpacing = function () {
                            var t = this.node.coreMO(),
                                e = t.coreParent(),
                                r = e.parent;
                            if (r && r.isKind('mrow') && 1 !== r.childNodes.length) {
                                var o = t.attributes,
                                    n = o.get('scriptlevel') > 0;
                                (this.bbox.L = o.isSet('lspace')
                                    ? Math.max(0, this.length2em(o.get('lspace')))
                                    : b(n, t.lspace)),
                                    (this.bbox.R = o.isSet('rspace')
                                        ? Math.max(0, this.length2em(o.get('rspace')))
                                        : b(n, t.rspace));
                                var i = r.childIndex(e);
                                if (0 !== i) {
                                    var a = r.childNodes[i - 1];
                                    if (a.isEmbellished) {
                                        var s = this.jax.nodeMap.get(a).getBBox();
                                        s.R && (this.bbox.L = Math.max(0, this.bbox.L - s.R));
                                    }
                                }
                            }
                        }),
                        (e.prototype.getTeXSpacing = function (t, e) {
                            if (!e) {
                                var r = this.node.texSpacing();
                                r && (this.bbox.L = this.length2em(r));
                            }
                            if (t || e) {
                                var o = this.node.coreMO().attributes;
                                o.isSet('lspace') &&
                                    (this.bbox.L = Math.max(0, this.length2em(o.get('lspace')))),
                                    o.isSet('rspace') &&
                                        (this.bbox.R = Math.max(
                                            0,
                                            this.length2em(o.get('rspace')),
                                        ));
                            }
                        }),
                        (e.prototype.isTopEmbellished = function () {
                            return (
                                this.node.isEmbellished &&
                                !(this.node.parent && this.node.parent.isEmbellished)
                            );
                        }),
                        (e.prototype.core = function () {
                            return this.jax.nodeMap.get(this.node.core());
                        }),
                        (e.prototype.coreMO = function () {
                            return this.jax.nodeMap.get(this.node.coreMO());
                        }),
                        (e.prototype.getText = function () {
                            var t,
                                e,
                                r = '';
                            if (this.node.isToken)
                                try {
                                    for (
                                        var o = l(this.node.childNodes), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var i = n.value;
                                        i instanceof p.TextNode && (r += i.getText());
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        n && !n.done && (e = o.return) && e.call(o);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                            return r;
                        }),
                        (e.prototype.canStretch = function (t) {
                            if (((this.stretch = v.NOSTRETCH), this.node.isEmbellished)) {
                                var e = this.core();
                                e &&
                                    e.node !== this.node &&
                                    e.canStretch(t) &&
                                    (this.stretch = e.stretch);
                            }
                            return 0 !== this.stretch.dir;
                        }),
                        (e.prototype.getAlignShift = function () {
                            var t,
                                e = (t = this.node.attributes).getList.apply(
                                    t,
                                    h([], c(p.indentAttributes), !1),
                                ),
                                r = e.indentalign,
                                o = e.indentshift,
                                n = e.indentalignfirst,
                                i = e.indentshiftfirst;
                            return (
                                'indentalign' !== n && (r = n),
                                'auto' === r && (r = this.jax.options.displayAlign),
                                'indentshift' !== i && (o = i),
                                'auto' === o &&
                                    ((o = this.jax.options.displayIndent),
                                    'right' !== r ||
                                        o.match(/^\s*0[a-z]*\s*$/) ||
                                        (o = ('-' + o.trim()).replace(/^--/, ''))),
                                [r, this.length2em(o, this.metrics.containerWidth)]
                            );
                        }),
                        (e.prototype.getAlignX = function (t, e, r) {
                            return 'right' === r
                                ? t - (e.w + e.R) * e.rscale
                                : 'left' === r
                                  ? e.L * e.rscale
                                  : (t - e.w * e.rscale) / 2;
                        }),
                        (e.prototype.getAlignY = function (t, e, r, o, n) {
                            return 'top' === n
                                ? t - r
                                : 'bottom' === n
                                  ? o - e
                                  : 'center' === n
                                    ? (t - r - (e - o)) / 2
                                    : 0;
                        }),
                        (e.prototype.getWrapWidth = function (t) {
                            return this.childNodes[t].getBBox().w;
                        }),
                        (e.prototype.getChildAlign = function (t) {
                            return 'left';
                        }),
                        (e.prototype.percent = function (t) {
                            return f.percent(t);
                        }),
                        (e.prototype.em = function (t) {
                            return f.em(t);
                        }),
                        (e.prototype.px = function (t, e) {
                            return void 0 === e && (e = -f.BIGDIMEN), f.px(t, e, this.metrics.em);
                        }),
                        (e.prototype.length2em = function (t, e, r) {
                            return (
                                void 0 === e && (e = 1),
                                void 0 === r && (r = null),
                                null === r && (r = this.bbox.scale),
                                f.length2em(t, e, r, this.jax.pxPerEm)
                            );
                        }),
                        (e.prototype.unicodeChars = function (t, e) {
                            void 0 === e && (e = this.variant);
                            var r = (0, d.unicodeChars)(t),
                                o = this.font.getVariant(e);
                            if (o && o.chars) {
                                var n = o.chars;
                                r = r.map(function (t) {
                                    return ((n[t] || [])[3] || {}).smp || t;
                                });
                            }
                            return r;
                        }),
                        (e.prototype.remapChars = function (t) {
                            return t;
                        }),
                        (e.prototype.mmlText = function (t) {
                            return this.node.factory.create('text').setText(t);
                        }),
                        (e.prototype.mmlNode = function (t, e, r) {
                            return (
                                void 0 === e && (e = {}),
                                void 0 === r && (r = []),
                                this.node.factory.create(t, e, r)
                            );
                        }),
                        (e.prototype.createMo = function (t) {
                            var e = this.node.factory,
                                r = e.create('text').setText(t),
                                o = e.create('mo', { stretchy: !0 }, [r]);
                            o.inheritAttributesFrom(this.node);
                            var n = this.wrap(o);
                            return (n.parent = this), n;
                        }),
                        (e.prototype.getVariantChar = function (t, e) {
                            var r = this.font.getChar(t, e) || [0, 0, 0, { unknown: !0 }];
                            return 3 === r.length && (r[3] = {}), r;
                        }),
                        (e.kind = 'unknown'),
                        (e.styles = {}),
                        (e.removeStyles = [
                            'fontSize',
                            'fontFamily',
                            'fontWeight',
                            'fontStyle',
                            'fontVariant',
                            'font',
                        ]),
                        (e.skipAttributes = {
                            fontfamily: !0,
                            fontsize: !0,
                            fontweight: !0,
                            fontstyle: !0,
                            color: !0,
                            background: !0,
                            class: !0,
                            href: !0,
                            style: !0,
                            xmlns: !0,
                        }),
                        (e.BOLDVARIANTS = {
                            bold: {
                                normal: 'bold',
                                italic: 'bold-italic',
                                fraktur: 'bold-fraktur',
                                script: 'bold-script',
                                'sans-serif': 'bold-sans-serif',
                                'sans-serif-italic': 'sans-serif-bold-italic',
                            },
                            normal: {
                                bold: 'normal',
                                'bold-italic': 'italic',
                                'bold-fraktur': 'fraktur',
                                'bold-script': 'script',
                                'bold-sans-serif': 'sans-serif',
                                'sans-serif-bold-italic': 'sans-serif-italic',
                            },
                        }),
                        (e.ITALICVARIANTS = {
                            italic: {
                                normal: 'italic',
                                bold: 'bold-italic',
                                'sans-serif': 'sans-serif-italic',
                                'bold-sans-serif': 'sans-serif-bold-italic',
                            },
                            normal: {
                                italic: 'normal',
                                'bold-italic': 'bold',
                                'sans-serif-italic': 'sans-serif',
                                'sans-serif-bold-italic': 'bold-sans-serif',
                            },
                        }),
                        e
                    );
                })(u.AbstractWrapper);
                e.CommonWrapper = x;
            },
            1475: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonWrapperFactory = void 0);
                var i = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.jax = null), e;
                    }
                    return (
                        n(e, t),
                        Object.defineProperty(e.prototype, 'Wrappers', {
                            get: function () {
                                return this.node;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.defaultNodes = {}),
                        e
                    );
                })(r(2506).AbstractWrapperFactory);
                e.CommonWrapperFactory = i;
            },
            3438: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonTeXAtomMixin = void 0);
                var i = r(8921);
                e.CommonTeXAtomMixin = function (t) {
                    return (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.computeBBox = function (e, r) {
                                if (
                                    (void 0 === r && (r = !1),
                                    t.prototype.computeBBox.call(this, e, r),
                                    this.childNodes[0] &&
                                        this.childNodes[0].bbox.ic &&
                                        (e.ic = this.childNodes[0].bbox.ic),
                                    this.node.texClass === i.TEXCLASS.VCENTER)
                                ) {
                                    var o = e.h,
                                        n = (o + e.d) / 2 + this.font.params.axis_height - o;
                                    (e.h += n), (e.d -= n);
                                }
                            }),
                            e
                        );
                    })(t);
                };
            },
            555: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonTextNodeMixin = void 0),
                    (e.CommonTextNodeMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                (e.prototype.computeBBox = function (t, e) {
                                    var r, o;
                                    void 0 === e && (e = !1);
                                    var a = this.parent.variant,
                                        s = this.node.getText();
                                    if ('-explicitFont' === a) {
                                        var l = this.jax.getFontData(this.parent.styles),
                                            c = this.jax.measureText(s, a, l),
                                            h = c.w,
                                            u = c.h,
                                            p = c.d;
                                        (t.h = u), (t.d = p), (t.w = h);
                                    } else {
                                        var d = this.remappedText(s, a);
                                        t.empty();
                                        try {
                                            for (
                                                var f = n(d), y = f.next();
                                                !y.done;
                                                y = f.next()
                                            ) {
                                                var m = y.value,
                                                    v = i(this.getVariantChar(a, m), 4),
                                                    g = ((u = v[0]), (p = v[1]), (h = v[2]), v[3]);
                                                if (g.unknown) {
                                                    var b = this.jax.measureText(
                                                        String.fromCodePoint(m),
                                                        a,
                                                    );
                                                    (h = b.w), (u = b.h), (p = b.d);
                                                }
                                                (t.w += h),
                                                    u > t.h && (t.h = u),
                                                    p > t.d && (t.d = p),
                                                    (t.ic = g.ic || 0),
                                                    (t.sk = g.sk || 0),
                                                    (t.dx = g.dx || 0);
                                            }
                                        } catch (t) {
                                            r = { error: t };
                                        } finally {
                                            try {
                                                y && !y.done && (o = f.return) && o.call(f);
                                            } finally {
                                                if (r) throw r.error;
                                            }
                                        }
                                        d.length > 1 && (t.sk = 0), t.clean();
                                    }
                                }),
                                (e.prototype.remappedText = function (t, e) {
                                    var r = this.parent.stretch.c;
                                    return r
                                        ? [r]
                                        : this.parent.remapChars(this.unicodeChars(t, e));
                                }),
                                (e.prototype.getStyles = function () {}),
                                (e.prototype.getVariant = function () {}),
                                (e.prototype.getScale = function () {}),
                                (e.prototype.getSpace = function () {}),
                                e
                            );
                        })(t);
                    });
            },
            3345: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMactionMixin = e.TooltipData = void 0);
                var s = r(6720);
                (e.TooltipData = {
                    dx: '.2em',
                    dy: '.1em',
                    postDelay: 600,
                    clearDelay: 100,
                    hoverTimer: new Map(),
                    clearTimer: new Map(),
                    stopTimers: function (t, e) {
                        e.clearTimer.has(t) &&
                            (clearTimeout(e.clearTimer.get(t)), e.clearTimer.delete(t)),
                            e.hoverTimer.has(t) &&
                                (clearTimeout(e.hoverTimer.get(t)), e.hoverTimer.delete(t));
                    },
                }),
                    (e.CommonMactionMixin = function (t) {
                        return (function (t) {
                            function r() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, a([], i(e), !1)) || this,
                                    n = o.constructor.actions,
                                    s = o.node.attributes.get('actiontype'),
                                    l = i(n.get(s) || [function (t, e) {}, {}], 2),
                                    c = l[0],
                                    h = l[1];
                                return (o.action = c), (o.data = h), o.getParameters(), o;
                            }
                            return (
                                n(r, t),
                                Object.defineProperty(r.prototype, 'selected', {
                                    get: function () {
                                        var t = this.node.attributes.get('selection'),
                                            e =
                                                Math.max(1, Math.min(this.childNodes.length, t)) -
                                                1;
                                        return this.childNodes[e] || this.wrap(this.node.selected);
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (r.prototype.getParameters = function () {
                                    var t = this.node.attributes.get('data-offsets'),
                                        r = i((0, s.split)(t || ''), 2),
                                        o = r[0],
                                        n = r[1];
                                    (this.dx = this.length2em(o || e.TooltipData.dx)),
                                        (this.dy = this.length2em(n || e.TooltipData.dy));
                                }),
                                (r.prototype.computeBBox = function (t, e) {
                                    void 0 === e && (e = !1),
                                        t.updateFrom(this.selected.getOuterBBox()),
                                        this.selected.setChildPWidths(e);
                                }),
                                r
                            );
                        })(t);
                    });
            },
            2057: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMathMixin = void 0),
                    (e.CommonMathMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                (e.prototype.getWrapWidth = function (t) {
                                    return this.parent
                                        ? this.getBBox().w
                                        : this.metrics.containerWidth / this.jax.pxPerEm;
                                }),
                                e
                            );
                        })(t);
                    });
            },
            6200: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, o) {
                                  void 0 === o && (o = r);
                                  var n = Object.getOwnPropertyDescriptor(e, r);
                                  (n &&
                                      !('get' in n
                                          ? !e.__esModule
                                          : n.writable || n.configurable)) ||
                                      (n = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, o, n);
                              }
                            : function (t, e, r, o) {
                                  void 0 === o && (o = r), (t[o] = e[r]);
                              }),
                    a =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    s =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        i(e, t, r);
                            return a(e, t), e;
                        },
                    l =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    c =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        },
                    h =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMencloseMixin = void 0);
                var u = s(r(5373)),
                    p = r(6720);
                e.CommonMencloseMixin = function (t) {
                    return (function (t) {
                        function e() {
                            for (var e = [], r = 0; r < arguments.length; r++) e[r] = arguments[r];
                            var o = t.apply(this, c([], l(e), !1)) || this;
                            return (
                                (o.notations = {}),
                                (o.renderChild = null),
                                (o.msqrt = null),
                                (o.padding = u.PADDING),
                                (o.thickness = u.THICKNESS),
                                (o.arrowhead = { x: u.ARROWX, y: u.ARROWY, dx: u.ARROWDX }),
                                (o.TRBL = [0, 0, 0, 0]),
                                o.getParameters(),
                                o.getNotations(),
                                o.removeRedundantNotations(),
                                o.initializeNotations(),
                                (o.TRBL = o.getBBoxExtenders()),
                                o
                            );
                        }
                        return (
                            n(e, t),
                            (e.prototype.getParameters = function () {
                                var t = this.node.attributes,
                                    e = t.get('data-padding');
                                void 0 !== e && (this.padding = this.length2em(e, u.PADDING));
                                var r = t.get('data-thickness');
                                void 0 !== r && (this.thickness = this.length2em(r, u.THICKNESS));
                                var o = t.get('data-arrowhead');
                                if (void 0 !== o) {
                                    var n = l((0, p.split)(o), 3),
                                        i = n[0],
                                        a = n[1],
                                        s = n[2];
                                    this.arrowhead = {
                                        x: i ? parseFloat(i) : u.ARROWX,
                                        y: a ? parseFloat(a) : u.ARROWY,
                                        dx: s ? parseFloat(s) : u.ARROWDX,
                                    };
                                }
                            }),
                            (e.prototype.getNotations = function () {
                                var t,
                                    e,
                                    r = this.constructor.notations;
                                try {
                                    for (
                                        var o = h(
                                                (0, p.split)(this.node.attributes.get('notation')),
                                            ),
                                            n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var i = n.value,
                                            a = r.get(i);
                                        a &&
                                            ((this.notations[i] = a),
                                            a.renderChild && (this.renderChild = a.renderer));
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        n && !n.done && (e = o.return) && e.call(o);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                            }),
                            (e.prototype.removeRedundantNotations = function () {
                                var t, e, r, o;
                                try {
                                    for (
                                        var n = h(Object.keys(this.notations)), i = n.next();
                                        !i.done;
                                        i = n.next()
                                    ) {
                                        var a = i.value;
                                        if (this.notations[a]) {
                                            var s = this.notations[a].remove || '';
                                            try {
                                                for (
                                                    var l = ((r = void 0), h(s.split(/ /))),
                                                        c = l.next();
                                                    !c.done;
                                                    c = l.next()
                                                ) {
                                                    var u = c.value;
                                                    delete this.notations[u];
                                                }
                                            } catch (t) {
                                                r = { error: t };
                                            } finally {
                                                try {
                                                    c && !c.done && (o = l.return) && o.call(l);
                                                } finally {
                                                    if (r) throw r.error;
                                                }
                                            }
                                        }
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        i && !i.done && (e = n.return) && e.call(n);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                            }),
                            (e.prototype.initializeNotations = function () {
                                var t, e;
                                try {
                                    for (
                                        var r = h(Object.keys(this.notations)), o = r.next();
                                        !o.done;
                                        o = r.next()
                                    ) {
                                        var n = o.value,
                                            i = this.notations[n].init;
                                        i && i(this);
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        o && !o.done && (e = r.return) && e.call(r);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                            }),
                            (e.prototype.computeBBox = function (t, e) {
                                void 0 === e && (e = !1);
                                var r = l(this.TRBL, 4),
                                    o = r[0],
                                    n = r[1],
                                    i = r[2],
                                    a = r[3],
                                    s = this.childNodes[0].getBBox();
                                t.combine(s, a, 0),
                                    (t.h += o),
                                    (t.d += i),
                                    (t.w += n),
                                    this.setChildPWidths(e);
                            }),
                            (e.prototype.getBBoxExtenders = function () {
                                var t,
                                    e,
                                    r = [0, 0, 0, 0];
                                try {
                                    for (
                                        var o = h(Object.keys(this.notations)), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var i = n.value;
                                        this.maximizeEntries(r, this.notations[i].bbox(this));
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        n && !n.done && (e = o.return) && e.call(o);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                                return r;
                            }),
                            (e.prototype.getPadding = function () {
                                var t,
                                    e,
                                    r = this,
                                    o = [0, 0, 0, 0];
                                try {
                                    for (
                                        var n = h(Object.keys(this.notations)), i = n.next();
                                        !i.done;
                                        i = n.next()
                                    ) {
                                        var a = i.value,
                                            s = this.notations[a].border;
                                        s && this.maximizeEntries(o, s(this));
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        i && !i.done && (e = n.return) && e.call(n);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                                return [0, 1, 2, 3].map(function (t) {
                                    return r.TRBL[t] - o[t];
                                });
                            }),
                            (e.prototype.maximizeEntries = function (t, e) {
                                for (var r = 0; r < t.length; r++) t[r] < e[r] && (t[r] = e[r]);
                            }),
                            (e.prototype.getOffset = function (t) {
                                var e = l(this.TRBL, 4),
                                    r = e[0],
                                    o = e[1],
                                    n = e[2],
                                    i = e[3],
                                    a = ('X' === t ? o - i : n - r) / 2;
                                return Math.abs(a) > 0.001 ? a : 0;
                            }),
                            (e.prototype.getArgMod = function (t, e) {
                                return [Math.atan2(e, t), Math.sqrt(t * t + e * e)];
                            }),
                            (e.prototype.arrow = function (t, e, r, o, n) {
                                return void 0 === o && (o = ''), void 0 === n && (n = 0), null;
                            }),
                            (e.prototype.arrowData = function () {
                                var t = l([this.padding, this.thickness], 2),
                                    e = t[0],
                                    r = t[1] * (this.arrowhead.x + Math.max(1, this.arrowhead.dx)),
                                    o = this.childNodes[0].getBBox(),
                                    n = o.h,
                                    i = o.d,
                                    a = o.w,
                                    s = n + i,
                                    c = Math.sqrt(s * s + a * a),
                                    h = Math.max(e, (r * a) / c),
                                    u = Math.max(e, (r * s) / c),
                                    p = l(this.getArgMod(a + 2 * h, s + 2 * u), 2);
                                return { a: p[0], W: p[1], x: h, y: u };
                            }),
                            (e.prototype.arrowAW = function () {
                                var t = this.childNodes[0].getBBox(),
                                    e = t.h,
                                    r = t.d,
                                    o = t.w,
                                    n = l(this.TRBL, 4),
                                    i = n[0],
                                    a = n[1],
                                    s = n[2],
                                    c = n[3];
                                return this.getArgMod(c + o + a, i + e + r + s);
                            }),
                            (e.prototype.createMsqrt = function (t) {
                                var e = this.node.factory.create('msqrt');
                                e.inheritAttributesFrom(this.node), (e.childNodes[0] = t.node);
                                var r = this.wrap(e);
                                return (r.parent = this), r;
                            }),
                            (e.prototype.sqrtTRBL = function () {
                                var t = this.msqrt.getBBox(),
                                    e = this.msqrt.childNodes[0].getBBox();
                                return [t.h - e.h, 0, t.d - e.d, t.w - e.w];
                            }),
                            e
                        );
                    })(t);
                };
            },
            1346: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        },
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMfencedMixin = void 0),
                    (e.CommonMfencedMixin = function (t) {
                        return (function (t) {
                            function e() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, i([], n(e), !1)) || this;
                                return (o.mrow = null), o.createMrow(), o.addMrowChildren(), o;
                            }
                            return (
                                o(e, t),
                                (e.prototype.createMrow = function () {
                                    var t = this.node.factory.create('inferredMrow');
                                    t.inheritAttributesFrom(this.node),
                                        (this.mrow = this.wrap(t)),
                                        (this.mrow.parent = this);
                                }),
                                (e.prototype.addMrowChildren = function () {
                                    var t,
                                        e,
                                        r = this.node,
                                        o = this.mrow;
                                    this.addMo(r.open),
                                        this.childNodes.length &&
                                            o.childNodes.push(this.childNodes[0]);
                                    var n = 0;
                                    try {
                                        for (
                                            var i = a(this.childNodes.slice(1)), s = i.next();
                                            !s.done;
                                            s = i.next()
                                        ) {
                                            var l = s.value;
                                            this.addMo(r.separators[n++]), o.childNodes.push(l);
                                        }
                                    } catch (e) {
                                        t = { error: e };
                                    } finally {
                                        try {
                                            s && !s.done && (e = i.return) && e.call(i);
                                        } finally {
                                            if (t) throw t.error;
                                        }
                                    }
                                    this.addMo(r.close), o.stretchChildren();
                                }),
                                (e.prototype.addMo = function (t) {
                                    if (t) {
                                        var e = this.wrap(t);
                                        this.mrow.childNodes.push(e), (e.parent = this.mrow);
                                    }
                                }),
                                (e.prototype.computeBBox = function (t, e) {
                                    void 0 === e && (e = !1),
                                        t.updateFrom(this.mrow.getOuterBBox()),
                                        this.setChildPWidths(e);
                                }),
                                e
                            );
                        })(t);
                    });
            },
            5705: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMfracMixin = void 0),
                    (e.CommonMfracMixin = function (t) {
                        return (function (t) {
                            function e() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, i([], n(e), !1)) || this;
                                if (
                                    ((o.bevel = null),
                                    (o.pad = o.node.getProperty('withDelims')
                                        ? 0
                                        : o.font.params.nulldelimiterspace),
                                    o.node.attributes.get('bevelled'))
                                ) {
                                    var a = o.getBevelData(o.isDisplay()).H,
                                        s = (o.bevel = o.createMo('/'));
                                    s.node.attributes.set('symmetric', !0),
                                        s.canStretch(1),
                                        s.getStretchedVariant([a], !0);
                                }
                                return o;
                            }
                            return (
                                o(e, t),
                                (e.prototype.computeBBox = function (t, e) {
                                    void 0 === e && (e = !1), t.empty();
                                    var r = this.node.attributes.getList(
                                            'linethickness',
                                            'bevelled',
                                        ),
                                        o = r.linethickness,
                                        n = r.bevelled,
                                        i = this.isDisplay(),
                                        a = null;
                                    if (n) this.getBevelledBBox(t, i);
                                    else {
                                        var s = this.length2em(String(o), 0.06);
                                        (a = -2 * this.pad),
                                            0 === s
                                                ? this.getAtopBBox(t, i)
                                                : (this.getFractionBBox(t, i, s), (a -= 0.2)),
                                            (a += t.w);
                                    }
                                    t.clean(), this.setChildPWidths(e, a);
                                }),
                                (e.prototype.getFractionBBox = function (t, e, r) {
                                    var o = this.childNodes[0].getOuterBBox(),
                                        n = this.childNodes[1].getOuterBBox(),
                                        i = this.font.params.axis_height,
                                        a = this.getTUV(e, r),
                                        s = a.T,
                                        l = a.u,
                                        c = a.v;
                                    t.combine(o, 0, i + s + Math.max(o.d * o.rscale, l)),
                                        t.combine(n, 0, i - s - Math.max(n.h * n.rscale, c)),
                                        (t.w += 2 * this.pad + 0.2);
                                }),
                                (e.prototype.getTUV = function (t, e) {
                                    var r = this.font.params,
                                        o = r.axis_height,
                                        n = (t ? 3.5 : 1.5) * e;
                                    return {
                                        T: (t ? 3.5 : 1.5) * e,
                                        u: (t ? r.num1 : r.num2) - o - n,
                                        v: (t ? r.denom1 : r.denom2) + o - n,
                                    };
                                }),
                                (e.prototype.getAtopBBox = function (t, e) {
                                    var r = this.getUVQ(e),
                                        o = r.u,
                                        n = r.v,
                                        i = r.nbox,
                                        a = r.dbox;
                                    t.combine(i, 0, o), t.combine(a, 0, -n), (t.w += 2 * this.pad);
                                }),
                                (e.prototype.getUVQ = function (t) {
                                    var e = this.childNodes[0].getOuterBBox(),
                                        r = this.childNodes[1].getOuterBBox(),
                                        o = this.font.params,
                                        i = n(t ? [o.num1, o.denom1] : [o.num3, o.denom2], 2),
                                        a = i[0],
                                        s = i[1],
                                        l = (t ? 7 : 3) * o.rule_thickness,
                                        c = a - e.d * e.scale - (r.h * r.scale - s);
                                    return (
                                        c < l && ((a += (l - c) / 2), (s += (l - c) / 2), (c = l)),
                                        { u: a, v: s, q: c, nbox: e, dbox: r }
                                    );
                                }),
                                (e.prototype.getBevelledBBox = function (t, e) {
                                    var r = this.getBevelData(e),
                                        o = r.u,
                                        n = r.v,
                                        i = r.delta,
                                        a = r.nbox,
                                        s = r.dbox,
                                        l = this.bevel.getOuterBBox();
                                    t.combine(a, 0, o),
                                        t.combine(l, t.w - i / 2, 0),
                                        t.combine(s, t.w - i / 2, n);
                                }),
                                (e.prototype.getBevelData = function (t) {
                                    var e = this.childNodes[0].getOuterBBox(),
                                        r = this.childNodes[1].getOuterBBox(),
                                        o = t ? 0.4 : 0.15,
                                        n =
                                            Math.max(e.scale * (e.h + e.d), r.scale * (r.h + r.d)) +
                                            2 * o,
                                        i = this.font.params.axis_height;
                                    return {
                                        H: n,
                                        delta: o,
                                        u: (e.scale * (e.d - e.h)) / 2 + i + o,
                                        v: (r.scale * (r.d - r.h)) / 2 + i - o,
                                        nbox: e,
                                        dbox: r,
                                    };
                                }),
                                (e.prototype.canStretch = function (t) {
                                    return !1;
                                }),
                                (e.prototype.isDisplay = function () {
                                    var t = this.node.attributes.getList(
                                            'displaystyle',
                                            'scriptlevel',
                                        ),
                                        e = t.displaystyle,
                                        r = t.scriptlevel;
                                    return e && 0 === r;
                                }),
                                (e.prototype.getWrapWidth = function (t) {
                                    var e = this.node.attributes;
                                    return e.get('bevelled')
                                        ? this.childNodes[t].getOuterBBox().w
                                        : this.getBBox().w -
                                              (this.length2em(e.get('linethickness')) ? 0.2 : 0) -
                                              2 * this.pad;
                                }),
                                (e.prototype.getChildAlign = function (t) {
                                    var e = this.node.attributes;
                                    return e.get('bevelled')
                                        ? 'left'
                                        : e.get(['numalign', 'denomalign'][t]);
                                }),
                                e
                            );
                        })(t);
                    });
            },
            7969: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMglyphMixin = void 0),
                    (e.CommonMglyphMixin = function (t) {
                        return (function (t) {
                            function e() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, i([], n(e), !1)) || this;
                                return o.getParameters(), o;
                            }
                            return (
                                o(e, t),
                                (e.prototype.getParameters = function () {
                                    var t = this.node.attributes.getList(
                                            'width',
                                            'height',
                                            'valign',
                                            'src',
                                            'index',
                                        ),
                                        e = t.width,
                                        r = t.height,
                                        o = t.valign,
                                        n = t.src,
                                        i = t.index;
                                    if (n)
                                        (this.width = 'auto' === e ? 1 : this.length2em(e)),
                                            (this.height = 'auto' === r ? 1 : this.length2em(r)),
                                            (this.valign = this.length2em(o || '0'));
                                    else {
                                        var a = String.fromCodePoint(parseInt(i)),
                                            s = this.node.factory;
                                        (this.charWrapper = this.wrap(s.create('text').setText(a))),
                                            (this.charWrapper.parent = this);
                                    }
                                }),
                                (e.prototype.computeBBox = function (t, e) {
                                    void 0 === e && (e = !1),
                                        this.charWrapper
                                            ? t.updateFrom(this.charWrapper.getBBox())
                                            : ((t.w = this.width),
                                              (t.h = this.height + this.valign),
                                              (t.d = -this.valign));
                                }),
                                e
                            );
                        })(t);
                    });
            },
            1419: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMiMixin = void 0),
                    (e.CommonMiMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                (e.prototype.computeBBox = function (e, r) {
                                    void 0 === r && (r = !1),
                                        t.prototype.computeBBox.call(this, e),
                                        this.copySkewIC(e);
                                }),
                                e
                            );
                        })(t);
                    });
            },
            9906: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        },
                    s =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMmultiscriptsMixin = e.ScriptNames = e.NextScript = void 0);
                var l = r(3717);
                (e.NextScript = {
                    base: 'subList',
                    subList: 'supList',
                    supList: 'subList',
                    psubList: 'psupList',
                    psupList: 'psubList',
                }),
                    (e.ScriptNames = ['sup', 'sup', 'psup', 'psub']),
                    (e.CommonMmultiscriptsMixin = function (t) {
                        return (function (t) {
                            function r() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, a([], i(e), !1)) || this;
                                return (
                                    (o.scriptData = null),
                                    (o.firstPrescript = 0),
                                    o.getScriptData(),
                                    o
                                );
                            }
                            return (
                                n(r, t),
                                (r.prototype.combinePrePost = function (t, e) {
                                    var r = new l.BBox(t);
                                    return r.combine(e, 0, 0), r;
                                }),
                                (r.prototype.computeBBox = function (t, e) {
                                    void 0 === e && (e = !1);
                                    var r = this.font.params.scriptspace,
                                        o = this.scriptData,
                                        n = this.combinePrePost(o.sub, o.psub),
                                        a = this.combinePrePost(o.sup, o.psup),
                                        s = i(this.getUVQ(n, a), 2),
                                        l = s[0],
                                        c = s[1];
                                    if (
                                        (t.empty(),
                                        o.numPrescripts &&
                                            (t.combine(o.psup, r, l), t.combine(o.psub, r, c)),
                                        t.append(o.base),
                                        o.numScripts)
                                    ) {
                                        var h = t.w;
                                        t.combine(o.sup, h, l), t.combine(o.sub, h, c), (t.w += r);
                                    }
                                    t.clean(), this.setChildPWidths(e);
                                }),
                                (r.prototype.getScriptData = function () {
                                    var t = (this.scriptData = {
                                            base: null,
                                            sub: l.BBox.empty(),
                                            sup: l.BBox.empty(),
                                            psub: l.BBox.empty(),
                                            psup: l.BBox.empty(),
                                            numPrescripts: 0,
                                            numScripts: 0,
                                        }),
                                        e = this.getScriptBBoxLists();
                                    this.combineBBoxLists(t.sub, t.sup, e.subList, e.supList),
                                        this.combineBBoxLists(
                                            t.psub,
                                            t.psup,
                                            e.psubList,
                                            e.psupList,
                                        ),
                                        (t.base = e.base[0]),
                                        (t.numPrescripts = e.psubList.length),
                                        (t.numScripts = e.subList.length);
                                }),
                                (r.prototype.getScriptBBoxLists = function () {
                                    var t,
                                        r,
                                        o = {
                                            base: [],
                                            subList: [],
                                            supList: [],
                                            psubList: [],
                                            psupList: [],
                                        },
                                        n = 'base';
                                    try {
                                        for (
                                            var i = s(this.childNodes), a = i.next();
                                            !a.done;
                                            a = i.next()
                                        ) {
                                            var l = a.value;
                                            l.node.isKind('mprescripts')
                                                ? (n = 'psubList')
                                                : (o[n].push(l.getOuterBBox()),
                                                  (n = e.NextScript[n]));
                                        }
                                    } catch (e) {
                                        t = { error: e };
                                    } finally {
                                        try {
                                            a && !a.done && (r = i.return) && r.call(i);
                                        } finally {
                                            if (t) throw t.error;
                                        }
                                    }
                                    return (
                                        (this.firstPrescript =
                                            o.subList.length + o.supList.length + 2),
                                        this.padLists(o.subList, o.supList),
                                        this.padLists(o.psubList, o.psupList),
                                        o
                                    );
                                }),
                                (r.prototype.padLists = function (t, e) {
                                    t.length > e.length && e.push(l.BBox.empty());
                                }),
                                (r.prototype.combineBBoxLists = function (t, e, r, o) {
                                    for (var n = 0; n < r.length; n++) {
                                        var a = i(this.getScaledWHD(r[n]), 3),
                                            s = a[0],
                                            l = a[1],
                                            c = a[2],
                                            h = i(this.getScaledWHD(o[n]), 3),
                                            u = h[0],
                                            p = h[1],
                                            d = h[2],
                                            f = Math.max(s, u);
                                        (t.w += f),
                                            (e.w += f),
                                            l > t.h && (t.h = l),
                                            c > t.d && (t.d = c),
                                            p > e.h && (e.h = p),
                                            d > e.d && (e.d = d);
                                    }
                                }),
                                (r.prototype.getScaledWHD = function (t) {
                                    var e = t.w,
                                        r = t.h,
                                        o = t.d,
                                        n = t.rscale;
                                    return [e * n, r * n, o * n];
                                }),
                                (r.prototype.getUVQ = function (e, r) {
                                    var o;
                                    if (!this.UVQ) {
                                        var n = i([0, 0, 0], 3),
                                            a = n[0],
                                            s = n[1],
                                            l = n[2];
                                        0 === e.h && 0 === e.d
                                            ? (a = this.getU())
                                            : 0 === r.h && 0 === r.d
                                              ? (a = -this.getV())
                                              : ((a = (o = i(
                                                    t.prototype.getUVQ.call(this, e, r),
                                                    3,
                                                ))[0]),
                                                (s = o[1]),
                                                (l = o[2])),
                                            (this.UVQ = [a, s, l]);
                                    }
                                    return this.UVQ;
                                }),
                                r
                            );
                        })(t);
                    });
            },
            2304: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMnMixin = void 0),
                    (e.CommonMnMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                (e.prototype.remapChars = function (t) {
                                    if (t.length) {
                                        var e = this.font.getRemappedChar('mn', t[0]);
                                        if (e) {
                                            var r = this.unicodeChars(e, this.variant);
                                            1 === r.length
                                                ? (t[0] = r[0])
                                                : (t = r.concat(t.slice(1)));
                                        }
                                    }
                                    return t;
                                }),
                                e
                            );
                        })(t);
                    });
            },
            437: function (t, e, r) {
                var o,
                    n,
                    i =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (a =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, o = arguments.length; r < o; r++)
                                            for (var n in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, n) &&
                                                    (t[n] = e[n]);
                                        return t;
                                    }),
                                a.apply(this, arguments)
                            );
                        },
                    s =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    l =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        },
                    c =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMoMixin = e.DirectionVH = void 0);
                var h = r(3717),
                    u = r(6720),
                    p = r(9250);
                (e.DirectionVH = (((n = {})[1] = 'v'), (n[2] = 'h'), n)),
                    (e.CommonMoMixin = function (t) {
                        return (function (t) {
                            function e() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, l([], s(e), !1)) || this;
                                return (o.size = null), (o.isAccent = o.node.isAccent), o;
                            }
                            return (
                                i(e, t),
                                (e.prototype.computeBBox = function (t, e) {
                                    if (
                                        (void 0 === e && (e = !1),
                                        this.protoBBox(t),
                                        this.node.attributes.get('symmetric') &&
                                            2 !== this.stretch.dir)
                                    ) {
                                        var r = this.getCenterOffset(t);
                                        (t.h += r), (t.d -= r);
                                    }
                                    this.node.getProperty('mathaccent') &&
                                        (0 === this.stretch.dir || this.size >= 0) &&
                                        (t.w = 0);
                                }),
                                (e.prototype.protoBBox = function (e) {
                                    var r = 0 !== this.stretch.dir;
                                    r && null === this.size && this.getStretchedVariant([0]),
                                        (r && this.size < 0) ||
                                            (t.prototype.computeBBox.call(this, e),
                                            this.copySkewIC(e));
                                }),
                                (e.prototype.getAccentOffset = function () {
                                    var t = h.BBox.empty();
                                    return this.protoBBox(t), -t.w / 2;
                                }),
                                (e.prototype.getCenterOffset = function (e) {
                                    return (
                                        void 0 === e && (e = null),
                                        e ||
                                            ((e = h.BBox.empty()),
                                            t.prototype.computeBBox.call(this, e)),
                                        (e.h + e.d) / 2 + this.font.params.axis_height - e.h
                                    );
                                }),
                                (e.prototype.getVariant = function () {
                                    this.node.attributes.get('largeop')
                                        ? (this.variant = this.node.attributes.get('displaystyle')
                                              ? '-largeop'
                                              : '-smallop')
                                        : this.node.attributes.getExplicit('mathvariant') ||
                                            !1 !== this.node.getProperty('pseudoscript')
                                          ? t.prototype.getVariant.call(this)
                                          : (this.variant = '-tex-variant');
                                }),
                                (e.prototype.canStretch = function (t) {
                                    if (0 !== this.stretch.dir) return this.stretch.dir === t;
                                    if (!this.node.attributes.get('stretchy')) return !1;
                                    var e = this.getText();
                                    if (1 !== Array.from(e).length) return !1;
                                    var r = this.font.getDelimiter(e.codePointAt(0));
                                    return (
                                        (this.stretch = r && r.dir === t ? r : p.NOSTRETCH),
                                        0 !== this.stretch.dir
                                    );
                                }),
                                (e.prototype.getStretchedVariant = function (t, e) {
                                    var r, o;
                                    if ((void 0 === e && (e = !1), 0 !== this.stretch.dir)) {
                                        var n = this.getWH(t),
                                            i = this.getSize('minsize', 0),
                                            s = this.getSize('maxsize', 1 / 0),
                                            l = this.node.getProperty('mathaccent');
                                        n = Math.max(i, Math.min(s, n));
                                        var h = this.font.params.delimiterfactor / 1e3,
                                            u = this.font.params.delimitershortfall,
                                            p =
                                                i || e
                                                    ? n
                                                    : l
                                                      ? Math.min(n / h, n + u)
                                                      : Math.max(n * h, n - u),
                                            d = this.stretch,
                                            f = d.c || this.getText().codePointAt(0),
                                            y = 0;
                                        if (d.sizes)
                                            try {
                                                for (
                                                    var m = c(d.sizes), v = m.next();
                                                    !v.done;
                                                    v = m.next()
                                                ) {
                                                    if (v.value >= p)
                                                        return (
                                                            l && y && y--,
                                                            (this.variant =
                                                                this.font.getSizeVariant(f, y)),
                                                            (this.size = y),
                                                            void (
                                                                d.schar &&
                                                                d.schar[y] &&
                                                                (this.stretch = a(
                                                                    a({}, this.stretch),
                                                                    { c: d.schar[y] },
                                                                ))
                                                            )
                                                        );
                                                    y++;
                                                }
                                            } catch (t) {
                                                r = { error: t };
                                            } finally {
                                                try {
                                                    v && !v.done && (o = m.return) && o.call(m);
                                                } finally {
                                                    if (r) throw r.error;
                                                }
                                            }
                                        d.stretch
                                            ? ((this.size = -1),
                                              this.invalidateBBox(),
                                              this.getStretchBBox(
                                                  t,
                                                  this.checkExtendedHeight(n, d),
                                                  d,
                                              ))
                                            : ((this.variant = this.font.getSizeVariant(f, y - 1)),
                                              (this.size = y - 1));
                                    }
                                }),
                                (e.prototype.getSize = function (t, e) {
                                    var r = this.node.attributes;
                                    return r.isSet(t) && (e = this.length2em(r.get(t), 1, 1)), e;
                                }),
                                (e.prototype.getWH = function (t) {
                                    if (0 === t.length) return 0;
                                    if (1 === t.length) return t[0];
                                    var e = s(t, 2),
                                        r = e[0],
                                        o = e[1],
                                        n = this.font.params.axis_height;
                                    return this.node.attributes.get('symmetric')
                                        ? 2 * Math.max(r - n, o + n)
                                        : r + o;
                                }),
                                (e.prototype.getStretchBBox = function (t, e, r) {
                                    var o;
                                    r.hasOwnProperty('min') && r.min > e && (e = r.min);
                                    var n = s(r.HDW, 3),
                                        i = n[0],
                                        a = n[1],
                                        l = n[2];
                                    1 === this.stretch.dir
                                        ? ((i = (o = s(this.getBaseline(t, e, r), 2))[0]),
                                          (a = o[1]))
                                        : (l = e),
                                        (this.bbox.h = i),
                                        (this.bbox.d = a),
                                        (this.bbox.w = l);
                                }),
                                (e.prototype.getBaseline = function (t, e, r) {
                                    var o = 2 === t.length && t[0] + t[1] === e,
                                        n = this.node.attributes.get('symmetric'),
                                        i = s(o ? t : [e, 0], 2),
                                        a = i[0],
                                        l = i[1],
                                        c = s([a + l, 0], 2),
                                        h = c[0],
                                        u = c[1];
                                    if (n) {
                                        var p = this.font.params.axis_height;
                                        o && (h = 2 * Math.max(a - p, l + p)), (u = h / 2 - p);
                                    } else if (o) u = l;
                                    else {
                                        var d = s(r.HDW || [0.75, 0.25], 2),
                                            f = d[0],
                                            y = d[1];
                                        u = y * (h / (f + y));
                                    }
                                    return [h - u, u];
                                }),
                                (e.prototype.checkExtendedHeight = function (t, e) {
                                    if (e.fullExt) {
                                        var r = s(e.fullExt, 2),
                                            o = r[0],
                                            n = r[1];
                                        t = n + Math.ceil(Math.max(0, t - n) / o) * o;
                                    }
                                    return t;
                                }),
                                (e.prototype.remapChars = function (t) {
                                    var e = this.node.getProperty('primes');
                                    if (e) return (0, u.unicodeChars)(e);
                                    if (1 === t.length) {
                                        var r = this.node.coreParent().parent,
                                            o =
                                                this.isAccent && !r.isKind('mrow')
                                                    ? 'accent'
                                                    : 'mo',
                                            n = this.font.getRemappedChar(o, t[0]);
                                        n && (t = this.unicodeChars(n, this.variant));
                                    }
                                    return t;
                                }),
                                e
                            );
                        })(t);
                    });
            },
            7481: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMpaddedMixin = void 0),
                    (e.CommonMpaddedMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                (e.prototype.getDimens = function () {
                                    var t = this.node.attributes.getList(
                                            'width',
                                            'height',
                                            'depth',
                                            'lspace',
                                            'voffset',
                                        ),
                                        e = this.childNodes[0].getBBox(),
                                        r = e.w,
                                        o = e.h,
                                        n = e.d,
                                        i = r,
                                        a = o,
                                        s = n,
                                        l = 0,
                                        c = 0,
                                        h = 0;
                                    '' !== t.width && (r = this.dimen(t.width, e, 'w', 0)),
                                        '' !== t.height && (o = this.dimen(t.height, e, 'h', 0)),
                                        '' !== t.depth && (n = this.dimen(t.depth, e, 'd', 0)),
                                        '' !== t.voffset && (c = this.dimen(t.voffset, e)),
                                        '' !== t.lspace && (l = this.dimen(t.lspace, e));
                                    var u = this.node.attributes.get('data-align');
                                    return (
                                        u && (h = this.getAlignX(r, e, u)),
                                        [a, s, i, o - a, n - s, r - i, l, c, h]
                                    );
                                }),
                                (e.prototype.dimen = function (t, e, r, o) {
                                    void 0 === r && (r = ''), void 0 === o && (o = null);
                                    var n = (t = String(t)).match(/width|height|depth/),
                                        i = n ? e[n[0].charAt(0)] : r ? e[r] : 0,
                                        a = this.length2em(t, i) || 0;
                                    return (
                                        t.match(/^[-+]/) && r && (a += i),
                                        null != o && (a = Math.max(o, a)),
                                        a
                                    );
                                }),
                                (e.prototype.computeBBox = function (t, e) {
                                    void 0 === e && (e = !1);
                                    var r = n(this.getDimens(), 6),
                                        o = r[0],
                                        i = r[1],
                                        a = r[2],
                                        s = r[3],
                                        l = r[4],
                                        c = r[5];
                                    (t.w = a + c),
                                        (t.h = o + s),
                                        (t.d = i + l),
                                        this.setChildPWidths(e, t.w);
                                }),
                                (e.prototype.getWrapWidth = function (t) {
                                    return this.getBBox().w;
                                }),
                                (e.prototype.getChildAlign = function (t) {
                                    return this.node.attributes.get('data-align') || 'left';
                                }),
                                e
                            );
                        })(t);
                    });
            },
            5997: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMrootMixin = void 0),
                    (e.CommonMrootMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                Object.defineProperty(e.prototype, 'surd', {
                                    get: function () {
                                        return 2;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'root', {
                                    get: function () {
                                        return 1;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (e.prototype.combineRootBBox = function (t, e, r) {
                                    var o = this.childNodes[this.root].getOuterBBox(),
                                        n = this.getRootDimens(e, r)[1];
                                    t.combine(o, 0, n);
                                }),
                                (e.prototype.getRootDimens = function (t, e) {
                                    var r = this.childNodes[this.surd],
                                        o = this.childNodes[this.root].getOuterBBox(),
                                        n = (r.size < 0 ? 0.5 : 0.6) * t.w,
                                        i = o.w,
                                        a = o.rscale,
                                        s = Math.max(i, n / a),
                                        l = Math.max(0, s - i);
                                    return [s * a - n, this.rootHeight(o, t, r.size, e), l];
                                }),
                                (e.prototype.rootHeight = function (t, e, r, o) {
                                    var n = e.h + e.d;
                                    return (
                                        (r < 0 ? 1.9 : 0.55 * n) -
                                        (n - o) +
                                        Math.max(0, t.d * t.rscale)
                                    );
                                }),
                                e
                            );
                        })(t);
                    });
            },
            9323: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        },
                    s =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonInferredMrowMixin = e.CommonMrowMixin = void 0);
                var l = r(3717);
                (e.CommonMrowMixin = function (t) {
                    return (function (t) {
                        function e() {
                            for (var e, r, o = [], n = 0; n < arguments.length; n++)
                                o[n] = arguments[n];
                            var c = t.apply(this, a([], i(o), !1)) || this;
                            c.stretchChildren();
                            try {
                                for (var h = s(c.childNodes), u = h.next(); !u.done; u = h.next()) {
                                    var p = u.value;
                                    if (p.bbox.pwidth) {
                                        c.bbox.pwidth = l.BBox.fullWidth;
                                        break;
                                    }
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    u && !u.done && (r = h.return) && r.call(h);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return c;
                        }
                        return (
                            n(e, t),
                            Object.defineProperty(e.prototype, 'fixesPWidth', {
                                get: function () {
                                    return !1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.stretchChildren = function () {
                                var t,
                                    e,
                                    r,
                                    o,
                                    n,
                                    i,
                                    a = [];
                                try {
                                    for (
                                        var l = s(this.childNodes), c = l.next();
                                        !c.done;
                                        c = l.next()
                                    ) {
                                        (S = c.value).canStretch(1) && a.push(S);
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        c && !c.done && (e = l.return) && e.call(l);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                                var h = a.length,
                                    u = this.childNodes.length;
                                if (h && u > 1) {
                                    var p = 0,
                                        d = 0,
                                        f = h > 1 && h === u;
                                    try {
                                        for (
                                            var y = s(this.childNodes), m = y.next();
                                            !m.done;
                                            m = y.next()
                                        ) {
                                            var v = 0 === (S = m.value).stretch.dir;
                                            if (f || v) {
                                                var g = S.getOuterBBox(v),
                                                    b = g.h,
                                                    x = g.d,
                                                    _ = g.rscale;
                                                (b *= _) > p && (p = b), (x *= _) > d && (d = x);
                                            }
                                        }
                                    } catch (t) {
                                        r = { error: t };
                                    } finally {
                                        try {
                                            m && !m.done && (o = y.return) && o.call(y);
                                        } finally {
                                            if (r) throw r.error;
                                        }
                                    }
                                    try {
                                        for (var M = s(a), w = M.next(); !w.done; w = M.next()) {
                                            var S;
                                            (S = w.value).coreMO().getStretchedVariant([p, d]);
                                        }
                                    } catch (t) {
                                        n = { error: t };
                                    } finally {
                                        try {
                                            w && !w.done && (i = M.return) && i.call(M);
                                        } finally {
                                            if (n) throw n.error;
                                        }
                                    }
                                }
                            }),
                            e
                        );
                    })(t);
                }),
                    (e.CommonInferredMrowMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                n(e, t),
                                (e.prototype.getScale = function () {
                                    (this.bbox.scale = this.parent.bbox.scale),
                                        (this.bbox.rscale = 1);
                                }),
                                e
                            );
                        })(t);
                    });
            },
            6920: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMsMixin = void 0),
                    (e.CommonMsMixin = function (t) {
                        return (function (t) {
                            function e() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, i([], n(e), !1)) || this,
                                    a = o.node.attributes,
                                    s = a.getList('lquote', 'rquote');
                                return (
                                    'monospace' !== o.variant &&
                                        (a.isSet('lquote') ||
                                            '"' !== s.lquote ||
                                            (s.lquote = '\u201c'),
                                        a.isSet('rquote') ||
                                            '"' !== s.rquote ||
                                            (s.rquote = '\u201d')),
                                    o.childNodes.unshift(o.createText(s.lquote)),
                                    o.childNodes.push(o.createText(s.rquote)),
                                    o
                                );
                            }
                            return (
                                o(e, t),
                                (e.prototype.createText = function (t) {
                                    var e = this.wrap(this.mmlText(t));
                                    return (e.parent = this), e;
                                }),
                                e
                            );
                        })(t);
                    });
            },
            37: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMspaceMixin = void 0),
                    (e.CommonMspaceMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                (e.prototype.computeBBox = function (t, e) {
                                    void 0 === e && (e = !1);
                                    var r = this.node.attributes;
                                    (t.w = this.length2em(r.get('width'), 0)),
                                        (t.h = this.length2em(r.get('height'), 0)),
                                        (t.d = this.length2em(r.get('depth'), 0));
                                }),
                                (e.prototype.handleVariant = function () {}),
                                e
                            );
                        })(t);
                    });
            },
            222: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMsqrtMixin = void 0);
                var s = r(3717);
                e.CommonMsqrtMixin = function (t) {
                    return (function (t) {
                        function e() {
                            for (var e = [], r = 0; r < arguments.length; r++) e[r] = arguments[r];
                            var o = t.apply(this, a([], i(e), !1)) || this,
                                n = o.createMo('\u221a');
                            n.canStretch(1);
                            var s = o.childNodes[o.base].getOuterBBox(),
                                l = s.h,
                                c = s.d,
                                h = o.font.params.rule_thickness,
                                u = o.node.attributes.get('displaystyle')
                                    ? o.font.params.x_height
                                    : h;
                            return (
                                (o.surdH = l + c + 2 * h + u / 4),
                                n.getStretchedVariant([o.surdH - c, c], !0),
                                o
                            );
                        }
                        return (
                            n(e, t),
                            Object.defineProperty(e.prototype, 'base', {
                                get: function () {
                                    return 0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'surd', {
                                get: function () {
                                    return 1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'root', {
                                get: function () {
                                    return null;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.createMo = function (e) {
                                var r = t.prototype.createMo.call(this, e);
                                return this.childNodes.push(r), r;
                            }),
                            (e.prototype.computeBBox = function (t, e) {
                                void 0 === e && (e = !1);
                                var r = this.childNodes[this.surd].getBBox(),
                                    o = new s.BBox(this.childNodes[this.base].getOuterBBox()),
                                    n = this.getPQ(r)[1],
                                    a = this.font.params.rule_thickness,
                                    l = o.h + n + a,
                                    c = i(this.getRootDimens(r, l), 1)[0];
                                (t.h = l + a),
                                    this.combineRootBBox(t, r, l),
                                    t.combine(r, c, l - r.h),
                                    t.combine(o, c + r.w, 0),
                                    t.clean(),
                                    this.setChildPWidths(e);
                            }),
                            (e.prototype.combineRootBBox = function (t, e, r) {}),
                            (e.prototype.getPQ = function (t) {
                                var e = this.font.params.rule_thickness,
                                    r = this.node.attributes.get('displaystyle')
                                        ? this.font.params.x_height
                                        : e;
                                return [
                                    r,
                                    t.h + t.d > this.surdH
                                        ? (t.h + t.d - (this.surdH - 2 * e - r / 2)) / 2
                                        : e + r / 4,
                                ];
                            }),
                            (e.prototype.getRootDimens = function (t, e) {
                                return [0, 0, 0, 0];
                            }),
                            e
                        );
                    })(t);
                };
            },
            3069: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMsubsupMixin = e.CommonMsupMixin = e.CommonMsubMixin = void 0),
                    (e.CommonMsubMixin = function (t) {
                        var e;
                        return (
                            (e = (function (t) {
                                function e() {
                                    return (null !== t && t.apply(this, arguments)) || this;
                                }
                                return (
                                    o(e, t),
                                    Object.defineProperty(e.prototype, 'scriptChild', {
                                        get: function () {
                                            return this.childNodes[this.node.sub];
                                        },
                                        enumerable: !1,
                                        configurable: !0,
                                    }),
                                    (e.prototype.getOffset = function () {
                                        return [0, -this.getV()];
                                    }),
                                    e
                                );
                            })(t)),
                            (e.useIC = !1),
                            e
                        );
                    }),
                    (e.CommonMsupMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                Object.defineProperty(e.prototype, 'scriptChild', {
                                    get: function () {
                                        return this.childNodes[this.node.sup];
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (e.prototype.getOffset = function () {
                                    return [
                                        this.getAdjustedIc() -
                                            (this.baseRemoveIc ? 0 : this.baseIc),
                                        this.getU(),
                                    ];
                                }),
                                e
                            );
                        })(t);
                    }),
                    (e.CommonMsubsupMixin = function (t) {
                        var e;
                        return (
                            (e = (function (t) {
                                function e() {
                                    var e = (null !== t && t.apply(this, arguments)) || this;
                                    return (e.UVQ = null), e;
                                }
                                return (
                                    o(e, t),
                                    Object.defineProperty(e.prototype, 'subChild', {
                                        get: function () {
                                            return this.childNodes[this.node.sub];
                                        },
                                        enumerable: !1,
                                        configurable: !0,
                                    }),
                                    Object.defineProperty(e.prototype, 'supChild', {
                                        get: function () {
                                            return this.childNodes[this.node.sup];
                                        },
                                        enumerable: !1,
                                        configurable: !0,
                                    }),
                                    (e.prototype.computeBBox = function (t, e) {
                                        void 0 === e && (e = !1);
                                        var r = this.baseChild.getOuterBBox(),
                                            o = n(
                                                [
                                                    this.subChild.getOuterBBox(),
                                                    this.supChild.getOuterBBox(),
                                                ],
                                                2,
                                            ),
                                            i = o[0],
                                            a = o[1];
                                        t.empty(), t.append(r);
                                        var s = this.getBaseWidth(),
                                            l = this.getAdjustedIc(),
                                            c = n(this.getUVQ(), 2),
                                            h = c[0],
                                            u = c[1];
                                        t.combine(i, s, u),
                                            t.combine(a, s + l, h),
                                            (t.w += this.font.params.scriptspace),
                                            t.clean(),
                                            this.setChildPWidths(e);
                                    }),
                                    (e.prototype.getUVQ = function (t, e) {
                                        void 0 === t && (t = this.subChild.getOuterBBox()),
                                            void 0 === e && (e = this.supChild.getOuterBBox());
                                        var r = this.baseCore.getOuterBBox();
                                        if (this.UVQ) return this.UVQ;
                                        var o = this.font.params,
                                            i = 3 * o.rule_thickness,
                                            a = this.length2em(
                                                this.node.attributes.get('subscriptshift'),
                                                o.sub2,
                                            ),
                                            s = this.baseCharZero(
                                                r.d * this.baseScale + o.sub_drop * t.rscale,
                                            ),
                                            l = n([this.getU(), Math.max(s, a)], 2),
                                            c = l[0],
                                            h = l[1],
                                            u = c - e.d * e.rscale - (t.h * t.rscale - h);
                                        if (u < i) {
                                            h += i - u;
                                            var p = 0.8 * o.x_height - (c - e.d * e.rscale);
                                            p > 0 && ((c += p), (h -= p));
                                        }
                                        return (
                                            (c = Math.max(
                                                this.length2em(
                                                    this.node.attributes.get('superscriptshift'),
                                                    c,
                                                ),
                                                c,
                                            )),
                                            (h = Math.max(
                                                this.length2em(
                                                    this.node.attributes.get('subscriptshift'),
                                                    h,
                                                ),
                                                h,
                                            )),
                                            (u = c - e.d * e.rscale - (t.h * t.rscale - h)),
                                            (this.UVQ = [c, -h, u]),
                                            this.UVQ
                                        );
                                    }),
                                    e
                                );
                            })(t)),
                            (e.useIC = !1),
                            e
                        );
                    });
            },
            8589: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        },
                    s =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMtableMixin = void 0);
                var l = r(3717),
                    c = r(6720),
                    h = r(1490);
                e.CommonMtableMixin = function (t) {
                    return (function (t) {
                        function e() {
                            for (var e = [], r = 0; r < arguments.length; r++) e[r] = arguments[r];
                            var o = t.apply(this, a([], i(e), !1)) || this;
                            (o.numCols = 0),
                                (o.numRows = 0),
                                (o.data = null),
                                (o.pwidthCells = []),
                                (o.pWidth = 0),
                                (o.numCols = (0, h.max)(
                                    o.tableRows.map(function (t) {
                                        return t.numCells;
                                    }),
                                )),
                                (o.numRows = o.childNodes.length),
                                (o.hasLabels = o.childNodes.reduce(function (t, e) {
                                    return t || e.node.isKind('mlabeledtr');
                                }, !1)),
                                o.findContainer(),
                                (o.isTop =
                                    !o.container ||
                                    (o.container.node.isKind('math') && !o.container.parent)),
                                o.isTop && (o.jax.table = o),
                                o.getPercentageWidth();
                            var n = o.node.attributes;
                            return (
                                (o.frame = 'none' !== n.get('frame')),
                                (o.fLine = o.frame && n.get('frame') ? 0.07 : 0),
                                (o.fSpace = o.frame
                                    ? o.convertLengths(o.getAttributeArray('framespacing'))
                                    : [0, 0]),
                                (o.cSpace = o.convertLengths(
                                    o.getColumnAttributes('columnspacing'),
                                )),
                                (o.rSpace = o.convertLengths(o.getRowAttributes('rowspacing'))),
                                (o.cLines = o.getColumnAttributes('columnlines').map(function (t) {
                                    return 'none' === t ? 0 : 0.07;
                                })),
                                (o.rLines = o.getRowAttributes('rowlines').map(function (t) {
                                    return 'none' === t ? 0 : 0.07;
                                })),
                                (o.cWidths = o.getColumnWidths()),
                                o.stretchRows(),
                                o.stretchColumns(),
                                o
                            );
                        }
                        return (
                            n(e, t),
                            Object.defineProperty(e.prototype, 'tableRows', {
                                get: function () {
                                    return this.childNodes;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.findContainer = function () {
                                for (
                                    var t = this, e = t.parent;
                                    e && (e.node.notParent || e.node.isKind('mrow'));

                                )
                                    (t = e), (e = e.parent);
                                (this.container = e), (this.containerI = t.node.childPosition());
                            }),
                            (e.prototype.getPercentageWidth = function () {
                                if (this.hasLabels) this.bbox.pwidth = l.BBox.fullWidth;
                                else {
                                    var t = this.node.attributes.get('width');
                                    (0, c.isPercent)(t) && (this.bbox.pwidth = t);
                                }
                            }),
                            (e.prototype.stretchRows = function () {
                                for (
                                    var t = this.node.attributes.get('equalrows'),
                                        e = t ? this.getEqualRowHeight() : 0,
                                        r = t ? this.getTableData() : { H: [0], D: [0] },
                                        o = r.H,
                                        n = r.D,
                                        i = this.tableRows,
                                        a = 0;
                                    a < this.numRows;
                                    a++
                                ) {
                                    var s = t
                                        ? [(e + o[a] - n[a]) / 2, (e - o[a] + n[a]) / 2]
                                        : null;
                                    i[a].stretchChildren(s);
                                }
                            }),
                            (e.prototype.stretchColumns = function () {
                                for (var t = 0; t < this.numCols; t++) {
                                    var e =
                                        'number' == typeof this.cWidths[t] ? this.cWidths[t] : null;
                                    this.stretchColumn(t, e);
                                }
                            }),
                            (e.prototype.stretchColumn = function (t, e) {
                                var r,
                                    o,
                                    n,
                                    i,
                                    a,
                                    l,
                                    c = [];
                                try {
                                    for (
                                        var h = s(this.tableRows), u = h.next();
                                        !u.done;
                                        u = h.next()
                                    ) {
                                        if ((v = u.value.getChild(t)))
                                            0 === (M = v.childNodes[0]).stretch.dir &&
                                                M.canStretch(2) &&
                                                c.push(M);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        u && !u.done && (o = h.return) && o.call(h);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                                var p = c.length,
                                    d = this.childNodes.length;
                                if (p && d > 1) {
                                    if (null === e) {
                                        e = 0;
                                        var f = p > 1 && p === d;
                                        try {
                                            for (
                                                var y = s(this.tableRows), m = y.next();
                                                !m.done;
                                                m = y.next()
                                            ) {
                                                var v;
                                                if ((v = m.value.getChild(t))) {
                                                    var g = 0 === (M = v.childNodes[0]).stretch.dir;
                                                    if (f || g) {
                                                        var b = M.getBBox(g).w;
                                                        b > e && (e = b);
                                                    }
                                                }
                                            }
                                        } catch (t) {
                                            n = { error: t };
                                        } finally {
                                            try {
                                                m && !m.done && (i = y.return) && i.call(y);
                                            } finally {
                                                if (n) throw n.error;
                                            }
                                        }
                                    }
                                    try {
                                        for (var x = s(c), _ = x.next(); !_.done; _ = x.next()) {
                                            var M;
                                            (M = _.value).coreMO().getStretchedVariant([e]);
                                        }
                                    } catch (t) {
                                        a = { error: t };
                                    } finally {
                                        try {
                                            _ && !_.done && (l = x.return) && l.call(x);
                                        } finally {
                                            if (a) throw a.error;
                                        }
                                    }
                                }
                            }),
                            (e.prototype.getTableData = function () {
                                if (this.data) return this.data;
                                for (
                                    var t = new Array(this.numRows).fill(0),
                                        e = new Array(this.numRows).fill(0),
                                        r = new Array(this.numCols).fill(0),
                                        o = new Array(this.numRows),
                                        n = new Array(this.numRows),
                                        i = [0],
                                        a = this.tableRows,
                                        s = 0;
                                    s < a.length;
                                    s++
                                ) {
                                    for (
                                        var l = 0,
                                            c = a[s],
                                            h = c.node.attributes.get('rowalign'),
                                            u = 0;
                                        u < c.numCells;
                                        u++
                                    ) {
                                        var p = c.getChild(u);
                                        (l = this.updateHDW(p, u, s, h, t, e, r, l)),
                                            this.recordPWidthCell(p, u);
                                    }
                                    (o[s] = t[s]),
                                        (n[s] = e[s]),
                                        c.labeled &&
                                            (l = this.updateHDW(
                                                c.childNodes[0],
                                                0,
                                                s,
                                                h,
                                                t,
                                                e,
                                                i,
                                                l,
                                            )),
                                        this.extendHD(s, t, e, l),
                                        this.extendHD(s, o, n, l);
                                }
                                var d = i[0];
                                return (
                                    (this.data = { H: t, D: e, W: r, NH: o, ND: n, L: d }),
                                    this.data
                                );
                            }),
                            (e.prototype.updateHDW = function (t, e, r, o, n, i, a, s) {
                                var l = t.getBBox(),
                                    c = l.h,
                                    h = l.d,
                                    u = l.w,
                                    p = t.parent.bbox.rscale;
                                1 !== t.parent.bbox.rscale && ((c *= p), (h *= p), (u *= p)),
                                    this.node.getProperty('useHeight') &&
                                        (c < 0.75 && (c = 0.75), h < 0.25 && (h = 0.25));
                                var d = 0;
                                return (
                                    'baseline' !== (o = t.node.attributes.get('rowalign') || o) &&
                                        'axis' !== o &&
                                        ((d = c + h), (c = h = 0)),
                                    c > n[r] && (n[r] = c),
                                    h > i[r] && (i[r] = h),
                                    d > s && (s = d),
                                    a && u > a[e] && (a[e] = u),
                                    s
                                );
                            }),
                            (e.prototype.extendHD = function (t, e, r, o) {
                                var n = (o - (e[t] + r[t])) / 2;
                                n < 1e-5 || ((e[t] += n), (r[t] += n));
                            }),
                            (e.prototype.recordPWidthCell = function (t, e) {
                                t.childNodes[0] &&
                                    t.childNodes[0].getBBox().pwidth &&
                                    this.pwidthCells.push([t, e]);
                            }),
                            (e.prototype.computeBBox = function (t, e) {
                                void 0 === e && (e = !1);
                                var r,
                                    o,
                                    n = this.getTableData(),
                                    a = n.H,
                                    s = n.D;
                                if (this.node.attributes.get('equalrows')) {
                                    var l = this.getEqualRowHeight();
                                    r =
                                        (0, h.sum)([].concat(this.rLines, this.rSpace)) +
                                        l * this.numRows;
                                } else r = (0, h.sum)(a.concat(s, this.rLines, this.rSpace));
                                r += 2 * (this.fLine + this.fSpace[1]);
                                var u = this.getComputedWidths();
                                o =
                                    (0, h.sum)(u.concat(this.cLines, this.cSpace)) +
                                    2 * (this.fLine + this.fSpace[0]);
                                var p = this.node.attributes.get('width');
                                'auto' !== p &&
                                    (o = Math.max(this.length2em(p, 0) + 2 * this.fLine, o));
                                var d = i(this.getBBoxHD(r), 2),
                                    f = d[0],
                                    y = d[1];
                                (t.h = f), (t.d = y), (t.w = o);
                                var m = i(this.getBBoxLR(), 2),
                                    v = m[0],
                                    g = m[1];
                                (t.L = v),
                                    (t.R = g),
                                    (0, c.isPercent)(p) || this.setColumnPWidths();
                            }),
                            (e.prototype.setChildPWidths = function (t, e, r) {
                                var o = this.node.attributes.get('width');
                                if (!(0, c.isPercent)(o)) return !1;
                                this.hasLabels ||
                                    ((this.bbox.pwidth = ''), (this.container.bbox.pwidth = ''));
                                var n = this.bbox,
                                    i = n.w,
                                    a = n.L,
                                    s = n.R,
                                    l = this.node.attributes.get('data-width-includes-label'),
                                    u =
                                        Math.max(i, this.length2em(o, Math.max(e, a + i + s))) -
                                        (l ? a + s : 0),
                                    p = this.node.attributes.get('equalcolumns')
                                        ? Array(this.numCols).fill(
                                              this.percent(1 / Math.max(1, this.numCols)),
                                          )
                                        : this.getColumnAttributes('columnwidth', 0);
                                this.cWidths = this.getColumnWidthsFixed(p, u);
                                var d = this.getComputedWidths();
                                return (
                                    (this.pWidth =
                                        (0, h.sum)(d.concat(this.cLines, this.cSpace)) +
                                        2 * (this.fLine + this.fSpace[0])),
                                    this.isTop && (this.bbox.w = this.pWidth),
                                    this.setColumnPWidths(),
                                    this.pWidth !== i && this.parent.invalidateBBox(),
                                    this.pWidth !== i
                                );
                            }),
                            (e.prototype.setColumnPWidths = function () {
                                var t,
                                    e,
                                    r = this.cWidths;
                                try {
                                    for (
                                        var o = s(this.pwidthCells), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var a = i(n.value, 2),
                                            l = a[0],
                                            c = a[1];
                                        l.setChildPWidths(!1, r[c]) &&
                                            (l.invalidateBBox(), l.getBBox());
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        n && !n.done && (e = o.return) && e.call(o);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                            }),
                            (e.prototype.getBBoxHD = function (t) {
                                var e = i(this.getAlignmentRow(), 2),
                                    r = e[0],
                                    o = e[1];
                                if (null === o) {
                                    var n = this.font.params.axis_height,
                                        a = t / 2;
                                    return (
                                        {
                                            top: [0, t],
                                            center: [a, a],
                                            bottom: [t, 0],
                                            baseline: [a, a],
                                            axis: [a + n, a - n],
                                        }[r] || [a, a]
                                    );
                                }
                                var s = this.getVerticalPosition(o, r);
                                return [s, t - s];
                            }),
                            (e.prototype.getBBoxLR = function () {
                                if (this.hasLabels) {
                                    var t = this.node.attributes,
                                        e = t.get('side'),
                                        r = i(this.getPadAlignShift(e), 2),
                                        o = r[0],
                                        n = r[1],
                                        a = this.hasLabels && !!t.get('data-width-includes-label');
                                    return (
                                        a && this.frame && this.fSpace[0] && (o -= this.fSpace[0]),
                                        'center' !== n || a
                                            ? 'left' === e
                                                ? [o, 0]
                                                : [0, o]
                                            : [o, o]
                                    );
                                }
                                return [0, 0];
                            }),
                            (e.prototype.getPadAlignShift = function (t) {
                                var e =
                                        this.getTableData().L +
                                        this.length2em(this.node.attributes.get('minlabelspacing')),
                                    r = i(
                                        null == this.styles
                                            ? ['', '']
                                            : [
                                                  this.styles.get('padding-left'),
                                                  this.styles.get('padding-right'),
                                              ],
                                        2,
                                    ),
                                    o = r[0],
                                    n = r[1];
                                (o || n) &&
                                    (e = Math.max(
                                        e,
                                        this.length2em(o || '0'),
                                        this.length2em(n || '0'),
                                    ));
                                var a = i(this.getAlignShift(), 2),
                                    s = a[0],
                                    l = a[1];
                                return (
                                    s === t &&
                                        (l =
                                            'left' === t
                                                ? Math.max(e, l) - e
                                                : Math.min(-e, l) + e),
                                    [e, s, l]
                                );
                            }),
                            (e.prototype.getAlignShift = function () {
                                return this.isTop
                                    ? t.prototype.getAlignShift.call(this)
                                    : [this.container.getChildAlign(this.containerI), 0];
                            }),
                            (e.prototype.getWidth = function () {
                                return this.pWidth || this.getBBox().w;
                            }),
                            (e.prototype.getEqualRowHeight = function () {
                                var t = this.getTableData(),
                                    e = t.H,
                                    r = t.D,
                                    o = Array.from(e.keys()).map(function (t) {
                                        return e[t] + r[t];
                                    });
                                return Math.max.apply(Math, o);
                            }),
                            (e.prototype.getComputedWidths = function () {
                                var t = this,
                                    e = this.getTableData().W,
                                    r = Array.from(e.keys()).map(function (r) {
                                        return 'number' == typeof t.cWidths[r]
                                            ? t.cWidths[r]
                                            : e[r];
                                    });
                                return (
                                    this.node.attributes.get('equalcolumns') &&
                                        (r = Array(r.length).fill((0, h.max)(r))),
                                    r
                                );
                            }),
                            (e.prototype.getColumnWidths = function () {
                                var t = this.node.attributes.get('width');
                                if (this.node.attributes.get('equalcolumns'))
                                    return this.getEqualColumns(t);
                                var e = this.getColumnAttributes('columnwidth', 0);
                                return 'auto' === t
                                    ? this.getColumnWidthsAuto(e)
                                    : (0, c.isPercent)(t)
                                      ? this.getColumnWidthsPercent(e)
                                      : this.getColumnWidthsFixed(e, this.length2em(t));
                            }),
                            (e.prototype.getEqualColumns = function (t) {
                                var e,
                                    r = Math.max(1, this.numCols);
                                if ('auto' === t) {
                                    var o = this.getTableData().W;
                                    e = (0, h.max)(o);
                                } else if ((0, c.isPercent)(t)) e = this.percent(1 / r);
                                else {
                                    var n =
                                        (0, h.sum)([].concat(this.cLines, this.cSpace)) +
                                        2 * this.fSpace[0];
                                    e = Math.max(0, this.length2em(t) - n) / r;
                                }
                                return Array(this.numCols).fill(e);
                            }),
                            (e.prototype.getColumnWidthsAuto = function (t) {
                                var e = this;
                                return t.map(function (t) {
                                    return 'auto' === t || 'fit' === t
                                        ? null
                                        : (0, c.isPercent)(t)
                                          ? t
                                          : e.length2em(t);
                                });
                            }),
                            (e.prototype.getColumnWidthsPercent = function (t) {
                                var e = this,
                                    r = t.indexOf('fit') >= 0,
                                    o = (r ? this.getTableData() : { W: null }).W;
                                return Array.from(t.keys()).map(function (n) {
                                    var i = t[n];
                                    return 'fit' === i
                                        ? null
                                        : 'auto' === i
                                          ? r
                                              ? o[n]
                                              : null
                                          : (0, c.isPercent)(i)
                                            ? i
                                            : e.length2em(i);
                                });
                            }),
                            (e.prototype.getColumnWidthsFixed = function (t, e) {
                                var r = this,
                                    o = Array.from(t.keys()),
                                    n = o.filter(function (e) {
                                        return 'fit' === t[e];
                                    }),
                                    i = o.filter(function (e) {
                                        return 'auto' === t[e];
                                    }),
                                    a = n.length || i.length,
                                    s = (a ? this.getTableData() : { W: null }).W,
                                    l =
                                        e -
                                        (0, h.sum)([].concat(this.cLines, this.cSpace)) -
                                        2 * this.fSpace[0],
                                    c = l;
                                o.forEach(function (e) {
                                    var o = t[e];
                                    c -= 'fit' === o || 'auto' === o ? s[e] : r.length2em(o, l);
                                });
                                var u = a && c > 0 ? c / a : 0;
                                return o.map(function (e) {
                                    var o = t[e];
                                    return 'fit' === o
                                        ? s[e] + u
                                        : 'auto' === o
                                          ? s[e] + (0 === n.length ? u : 0)
                                          : r.length2em(o, l);
                                });
                            }),
                            (e.prototype.getVerticalPosition = function (t, e) {
                                for (
                                    var r = this.node.attributes.get('equalrows'),
                                        o = this.getTableData(),
                                        n = o.H,
                                        a = o.D,
                                        s = r ? this.getEqualRowHeight() : 0,
                                        l = this.getRowHalfSpacing(),
                                        c = this.fLine,
                                        h = 0;
                                    h < t;
                                    h++
                                )
                                    c += l[h] + (r ? s : n[h] + a[h]) + l[h + 1] + this.rLines[h];
                                var u = i(
                                        r
                                            ? [(s + n[t] - a[t]) / 2, (s - n[t] + a[t]) / 2]
                                            : [n[t], a[t]],
                                        2,
                                    ),
                                    p = u[0],
                                    d = u[1];
                                return (c +=
                                    {
                                        top: 0,
                                        center: l[t] + (p + d) / 2,
                                        bottom: l[t] + p + d + l[t + 1],
                                        baseline: l[t] + p,
                                        axis: l[t] + p - 0.25,
                                    }[e] || 0);
                            }),
                            (e.prototype.getEmHalfSpacing = function (t, e, r) {
                                void 0 === r && (r = 1);
                                var o = this.em(t * r),
                                    n = this.addEm(e, 2 / r);
                                return n.unshift(o), n.push(o), n;
                            }),
                            (e.prototype.getRowHalfSpacing = function () {
                                var t = this.rSpace.map(function (t) {
                                    return t / 2;
                                });
                                return t.unshift(this.fSpace[1]), t.push(this.fSpace[1]), t;
                            }),
                            (e.prototype.getColumnHalfSpacing = function () {
                                var t = this.cSpace.map(function (t) {
                                    return t / 2;
                                });
                                return t.unshift(this.fSpace[0]), t.push(this.fSpace[0]), t;
                            }),
                            (e.prototype.getAlignmentRow = function () {
                                var t = i((0, c.split)(this.node.attributes.get('align')), 2),
                                    e = t[0],
                                    r = t[1];
                                if (null == r) return [e, null];
                                var o = parseInt(r);
                                return (
                                    o < 0 && (o += this.numRows + 1),
                                    [e, o < 1 || o > this.numRows ? null : o - 1]
                                );
                            }),
                            (e.prototype.getColumnAttributes = function (t, e) {
                                void 0 === e && (e = 1);
                                var r = this.numCols - e,
                                    o = this.getAttributeArray(t);
                                if (0 === o.length) return null;
                                for (; o.length < r; ) o.push(o[o.length - 1]);
                                return o.length > r && o.splice(r), o;
                            }),
                            (e.prototype.getRowAttributes = function (t, e) {
                                void 0 === e && (e = 1);
                                var r = this.numRows - e,
                                    o = this.getAttributeArray(t);
                                if (0 === o.length) return null;
                                for (; o.length < r; ) o.push(o[o.length - 1]);
                                return o.length > r && o.splice(r), o;
                            }),
                            (e.prototype.getAttributeArray = function (t) {
                                var e = this.node.attributes.get(t);
                                return e ? (0, c.split)(e) : [this.node.attributes.getDefault(t)];
                            }),
                            (e.prototype.addEm = function (t, e) {
                                var r = this;
                                return (
                                    void 0 === e && (e = 1),
                                    t
                                        ? t.map(function (t) {
                                              return r.em(t / e);
                                          })
                                        : null
                                );
                            }),
                            (e.prototype.convertLengths = function (t) {
                                var e = this;
                                return t
                                    ? t.map(function (t) {
                                          return e.length2em(t);
                                      })
                                    : null;
                            }),
                            e
                        );
                    })(t);
                };
            },
            7805: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMtdMixin = void 0),
                    (e.CommonMtdMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                Object.defineProperty(e.prototype, 'fixesPWidth', {
                                    get: function () {
                                        return !1;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (e.prototype.invalidateBBox = function () {
                                    this.bboxComputed = !1;
                                }),
                                (e.prototype.getWrapWidth = function (t) {
                                    var e = this.parent.parent,
                                        r = this.parent,
                                        o = this.node.childPosition() - (r.labeled ? 1 : 0);
                                    return 'number' == typeof e.cWidths[o]
                                        ? e.cWidths[o]
                                        : e.getTableData().W[o];
                                }),
                                (e.prototype.getChildAlign = function (t) {
                                    return this.node.attributes.get('columnalign');
                                }),
                                e
                            );
                        })(t);
                    });
            },
            8325: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMtextMixin = void 0),
                    (e.CommonMtextMixin = function (t) {
                        var e;
                        return (
                            (e = (function (t) {
                                function e() {
                                    return (null !== t && t.apply(this, arguments)) || this;
                                }
                                return (
                                    o(e, t),
                                    (e.prototype.getVariant = function () {
                                        var e = this.jax.options,
                                            r = this.jax.math.outputData,
                                            o =
                                                (!!r.merrorFamily || !!e.merrorFont) &&
                                                this.node.Parent.isKind('merror');
                                        if (r.mtextFamily || e.mtextFont || o) {
                                            var n = this.node.attributes.get('mathvariant'),
                                                i =
                                                    this.constructor.INHERITFONTS[n] ||
                                                    this.jax.font.getCssFont(n),
                                                a =
                                                    i[0] ||
                                                    (o
                                                        ? r.merrorFamily || e.merrorFont
                                                        : r.mtextFamily || e.mtextFont);
                                            this.variant = this.explicitVariant(
                                                a,
                                                i[2] ? 'bold' : '',
                                                i[1] ? 'italic' : '',
                                            );
                                        } else t.prototype.getVariant.call(this);
                                    }),
                                    e
                                );
                            })(t)),
                            (e.INHERITFONTS = {
                                normal: ['', !1, !1],
                                bold: ['', !1, !0],
                                italic: ['', !0, !1],
                                'bold-italic': ['', !0, !0],
                            }),
                            e
                        );
                    });
            },
            4818: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMlabeledtrMixin = e.CommonMtrMixin = void 0),
                    (e.CommonMtrMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                Object.defineProperty(e.prototype, 'fixesPWidth', {
                                    get: function () {
                                        return !1;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'numCells', {
                                    get: function () {
                                        return this.childNodes.length;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'labeled', {
                                    get: function () {
                                        return !1;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'tableCells', {
                                    get: function () {
                                        return this.childNodes;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (e.prototype.getChild = function (t) {
                                    return this.childNodes[t];
                                }),
                                (e.prototype.getChildBBoxes = function () {
                                    return this.childNodes.map(function (t) {
                                        return t.getBBox();
                                    });
                                }),
                                (e.prototype.stretchChildren = function (t) {
                                    var e, r, o, i, a, s;
                                    void 0 === t && (t = null);
                                    var l = [],
                                        c = this.labeled
                                            ? this.childNodes.slice(1)
                                            : this.childNodes;
                                    try {
                                        for (var h = n(c), u = h.next(); !u.done; u = h.next()) {
                                            (O = u.value.childNodes[0]).canStretch(1) && l.push(O);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            u && !u.done && (r = h.return) && r.call(h);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                                    var p = l.length,
                                        d = this.childNodes.length;
                                    if (p && d > 1) {
                                        if (null === t) {
                                            var f = 0,
                                                y = 0,
                                                m = p > 1 && p === d;
                                            try {
                                                for (
                                                    var v = n(c), g = v.next();
                                                    !g.done;
                                                    g = v.next()
                                                ) {
                                                    var b =
                                                        0 ===
                                                        (O = g.value.childNodes[0]).stretch.dir;
                                                    if (m || b) {
                                                        var x = O.getBBox(b),
                                                            _ = x.h,
                                                            M = x.d;
                                                        _ > f && (f = _), M > y && (y = M);
                                                    }
                                                }
                                            } catch (t) {
                                                o = { error: t };
                                            } finally {
                                                try {
                                                    g && !g.done && (i = v.return) && i.call(v);
                                                } finally {
                                                    if (o) throw o.error;
                                                }
                                            }
                                            t = [f, y];
                                        }
                                        try {
                                            for (
                                                var w = n(l), S = w.next();
                                                !S.done;
                                                S = w.next()
                                            ) {
                                                var O;
                                                (O = S.value).coreMO().getStretchedVariant(t);
                                            }
                                        } catch (t) {
                                            a = { error: t };
                                        } finally {
                                            try {
                                                S && !S.done && (s = w.return) && s.call(w);
                                            } finally {
                                                if (a) throw a.error;
                                            }
                                        }
                                    }
                                }),
                                e
                            );
                        })(t);
                    }),
                    (e.CommonMlabeledtrMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                Object.defineProperty(e.prototype, 'numCells', {
                                    get: function () {
                                        return Math.max(0, this.childNodes.length - 1);
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'labeled', {
                                    get: function () {
                                        return !0;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'tableCells', {
                                    get: function () {
                                        return this.childNodes.slice(1);
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (e.prototype.getChild = function (t) {
                                    return this.childNodes[t + 1];
                                }),
                                (e.prototype.getChildBBoxes = function () {
                                    return this.childNodes.slice(1).map(function (t) {
                                        return t.getBBox();
                                    });
                                }),
                                e
                            );
                        })(t);
                    });
            },
            9690: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonMunderoverMixin = e.CommonMoverMixin = e.CommonMunderMixin = void 0),
                    (e.CommonMunderMixin = function (t) {
                        return (function (t) {
                            function e() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, i([], n(e), !1)) || this;
                                return o.stretchChildren(), o;
                            }
                            return (
                                o(e, t),
                                Object.defineProperty(e.prototype, 'scriptChild', {
                                    get: function () {
                                        return this.childNodes[this.node.under];
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (e.prototype.computeBBox = function (e, r) {
                                    if ((void 0 === r && (r = !1), this.hasMovableLimits()))
                                        t.prototype.computeBBox.call(this, e, r);
                                    else {
                                        e.empty();
                                        var o = this.baseChild.getOuterBBox(),
                                            i = this.scriptChild.getOuterBBox(),
                                            a = this.getUnderKV(o, i)[1],
                                            s = this.isLineBelow ? 0 : this.getDelta(!0),
                                            l = n(this.getDeltaW([o, i], [0, -s]), 2),
                                            c = l[0],
                                            h = l[1];
                                        e.combine(o, c, 0),
                                            e.combine(i, h, a),
                                            (e.d += this.font.params.big_op_spacing5),
                                            e.clean(),
                                            this.setChildPWidths(r);
                                    }
                                }),
                                e
                            );
                        })(t);
                    }),
                    (e.CommonMoverMixin = function (t) {
                        return (function (t) {
                            function e() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, i([], n(e), !1)) || this;
                                return o.stretchChildren(), o;
                            }
                            return (
                                o(e, t),
                                Object.defineProperty(e.prototype, 'scriptChild', {
                                    get: function () {
                                        return this.childNodes[this.node.over];
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (e.prototype.computeBBox = function (e) {
                                    if (this.hasMovableLimits())
                                        t.prototype.computeBBox.call(this, e);
                                    else {
                                        e.empty();
                                        var r = this.baseChild.getOuterBBox(),
                                            o = this.scriptChild.getOuterBBox();
                                        this.node.attributes.get('accent') &&
                                            (r.h = Math.max(
                                                r.h,
                                                this.font.params.x_height * r.scale,
                                            ));
                                        var i = this.getOverKU(r, o)[1],
                                            a = this.isLineAbove ? 0 : this.getDelta(),
                                            s = n(this.getDeltaW([r, o], [0, a]), 2),
                                            l = s[0],
                                            c = s[1];
                                        e.combine(r, l, 0),
                                            e.combine(o, c, i),
                                            (e.h += this.font.params.big_op_spacing5),
                                            e.clean();
                                    }
                                }),
                                e
                            );
                        })(t);
                    }),
                    (e.CommonMunderoverMixin = function (t) {
                        return (function (t) {
                            function e() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, i([], n(e), !1)) || this;
                                return o.stretchChildren(), o;
                            }
                            return (
                                o(e, t),
                                Object.defineProperty(e.prototype, 'underChild', {
                                    get: function () {
                                        return this.childNodes[this.node.under];
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'overChild', {
                                    get: function () {
                                        return this.childNodes[this.node.over];
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'subChild', {
                                    get: function () {
                                        return this.underChild;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'supChild', {
                                    get: function () {
                                        return this.overChild;
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (e.prototype.computeBBox = function (e) {
                                    if (this.hasMovableLimits())
                                        t.prototype.computeBBox.call(this, e);
                                    else {
                                        e.empty();
                                        var r = this.overChild.getOuterBBox(),
                                            o = this.baseChild.getOuterBBox(),
                                            i = this.underChild.getOuterBBox();
                                        this.node.attributes.get('accent') &&
                                            (o.h = Math.max(
                                                o.h,
                                                this.font.params.x_height * o.scale,
                                            ));
                                        var a = this.getOverKU(o, r)[1],
                                            s = this.getUnderKV(o, i)[1],
                                            l = this.getDelta(),
                                            c = n(
                                                this.getDeltaW(
                                                    [o, i, r],
                                                    [
                                                        0,
                                                        this.isLineBelow ? 0 : -l,
                                                        this.isLineAbove ? 0 : l,
                                                    ],
                                                ),
                                                3,
                                            ),
                                            h = c[0],
                                            u = c[1],
                                            p = c[2];
                                        e.combine(o, h, 0), e.combine(r, p, a), e.combine(i, u, s);
                                        var d = this.font.params.big_op_spacing5;
                                        (e.h += d), (e.d += d), e.clean();
                                    }
                                }),
                                e
                            );
                        })(t);
                    });
            },
            7091: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        },
                    s =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonScriptbaseMixin = void 0);
                var l = r(8921);
                e.CommonScriptbaseMixin = function (t) {
                    var e;
                    return (
                        (e = (function (t) {
                            function e() {
                                for (var e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                var o = t.apply(this, a([], i(e), !1)) || this;
                                (o.baseScale = 1),
                                    (o.baseIc = 0),
                                    (o.baseRemoveIc = !1),
                                    (o.baseIsChar = !1),
                                    (o.baseHasAccentOver = null),
                                    (o.baseHasAccentUnder = null),
                                    (o.isLineAbove = !1),
                                    (o.isLineBelow = !1),
                                    (o.isMathAccent = !1);
                                var n = (o.baseCore = o.getBaseCore());
                                return n
                                    ? (o.setBaseAccentsFor(n),
                                      (o.baseScale = o.getBaseScale()),
                                      (o.baseIc = o.getBaseIc()),
                                      (o.baseIsChar = o.isCharBase()),
                                      (o.isMathAccent =
                                          o.baseIsChar &&
                                          o.scriptChild &&
                                          !!o.scriptChild.coreMO().node.getProperty('mathaccent')),
                                      o.checkLineAccents(),
                                      (o.baseRemoveIc =
                                          !o.isLineAbove &&
                                          !o.isLineBelow &&
                                          (!o.constructor.useIC || o.isMathAccent)),
                                      o)
                                    : o;
                            }
                            return (
                                n(e, t),
                                Object.defineProperty(e.prototype, 'baseChild', {
                                    get: function () {
                                        return this.childNodes[this.node.base];
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                Object.defineProperty(e.prototype, 'scriptChild', {
                                    get: function () {
                                        return this.childNodes[1];
                                    },
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                                (e.prototype.getBaseCore = function () {
                                    for (
                                        var t = this.getSemanticBase() || this.childNodes[0];
                                        t &&
                                        ((1 === t.childNodes.length &&
                                            (t.node.isKind('mrow') ||
                                                (t.node.isKind('TeXAtom') &&
                                                    t.node.texClass !== l.TEXCLASS.VCENTER) ||
                                                t.node.isKind('mstyle') ||
                                                t.node.isKind('mpadded') ||
                                                t.node.isKind('mphantom') ||
                                                t.node.isKind('semantics'))) ||
                                            (t.node.isKind('munderover') && t.isMathAccent));

                                    )
                                        this.setBaseAccentsFor(t), (t = t.childNodes[0]);
                                    return (
                                        t ||
                                            (this.baseHasAccentOver = this.baseHasAccentUnder = !1),
                                        t || this.childNodes[0]
                                    );
                                }),
                                (e.prototype.setBaseAccentsFor = function (t) {
                                    t.node.isKind('munderover') &&
                                        (null === this.baseHasAccentOver &&
                                            (this.baseHasAccentOver =
                                                !!t.node.attributes.get('accent')),
                                        null === this.baseHasAccentUnder &&
                                            (this.baseHasAccentUnder =
                                                !!t.node.attributes.get('accentunder')));
                                }),
                                (e.prototype.getSemanticBase = function () {
                                    var t = this.node.attributes.getExplicit(
                                        'data-semantic-fencepointer',
                                    );
                                    return this.getBaseFence(this.baseChild, t);
                                }),
                                (e.prototype.getBaseFence = function (t, e) {
                                    var r, o;
                                    if (!t || !t.node.attributes || !e) return null;
                                    if (t.node.attributes.getExplicit('data-semantic-id') === e)
                                        return t;
                                    try {
                                        for (
                                            var n = s(t.childNodes), i = n.next();
                                            !i.done;
                                            i = n.next()
                                        ) {
                                            var a = i.value,
                                                l = this.getBaseFence(a, e);
                                            if (l) return l;
                                        }
                                    } catch (t) {
                                        r = { error: t };
                                    } finally {
                                        try {
                                            i && !i.done && (o = n.return) && o.call(n);
                                        } finally {
                                            if (r) throw r.error;
                                        }
                                    }
                                    return null;
                                }),
                                (e.prototype.getBaseScale = function () {
                                    for (var t = this.baseCore, e = 1; t && t !== this; ) {
                                        (e *= t.getOuterBBox().rscale), (t = t.parent);
                                    }
                                    return e;
                                }),
                                (e.prototype.getBaseIc = function () {
                                    return this.baseCore.getOuterBBox().ic * this.baseScale;
                                }),
                                (e.prototype.getAdjustedIc = function () {
                                    var t = this.baseCore.getOuterBBox();
                                    return (t.ic ? 1.05 * t.ic + 0.05 : 0) * this.baseScale;
                                }),
                                (e.prototype.isCharBase = function () {
                                    var t = this.baseCore;
                                    return (
                                        ((t.node.isKind('mo') && null === t.size) ||
                                            t.node.isKind('mi') ||
                                            t.node.isKind('mn')) &&
                                        1 === t.bbox.rscale &&
                                        1 === Array.from(t.getText()).length
                                    );
                                }),
                                (e.prototype.checkLineAccents = function () {
                                    if (this.node.isKind('munderover'))
                                        if (this.node.isKind('mover'))
                                            this.isLineAbove = this.isLineAccent(this.scriptChild);
                                        else if (this.node.isKind('munder'))
                                            this.isLineBelow = this.isLineAccent(this.scriptChild);
                                        else {
                                            (this.isLineAbove = this.isLineAccent(this.overChild)),
                                                (this.isLineBelow = this.isLineAccent(
                                                    this.underChild,
                                                ));
                                        }
                                }),
                                (e.prototype.isLineAccent = function (t) {
                                    var e = t.coreMO().node;
                                    return e.isToken && '\u2015' === e.getText();
                                }),
                                (e.prototype.getBaseWidth = function () {
                                    var t = this.baseChild.getOuterBBox();
                                    return (
                                        t.w * t.rscale -
                                        (this.baseRemoveIc ? this.baseIc : 0) +
                                        this.font.params.extra_ic
                                    );
                                }),
                                (e.prototype.computeBBox = function (t, e) {
                                    void 0 === e && (e = !1);
                                    var r = this.getBaseWidth(),
                                        o = i(this.getOffset(), 2),
                                        n = o[0],
                                        a = o[1];
                                    t.append(this.baseChild.getOuterBBox()),
                                        t.combine(this.scriptChild.getOuterBBox(), r + n, a),
                                        (t.w += this.font.params.scriptspace),
                                        t.clean(),
                                        this.setChildPWidths(e);
                                }),
                                (e.prototype.getOffset = function () {
                                    return [0, 0];
                                }),
                                (e.prototype.baseCharZero = function (t) {
                                    var e = !!this.baseCore.node.attributes.get('largeop'),
                                        r = this.baseScale;
                                    return this.baseIsChar && !e && 1 === r ? 0 : t;
                                }),
                                (e.prototype.getV = function () {
                                    var t = this.baseCore.getOuterBBox(),
                                        e = this.scriptChild.getOuterBBox(),
                                        r = this.font.params,
                                        o = this.length2em(
                                            this.node.attributes.get('subscriptshift'),
                                            r.sub1,
                                        );
                                    return Math.max(
                                        this.baseCharZero(
                                            t.d * this.baseScale + r.sub_drop * e.rscale,
                                        ),
                                        o,
                                        e.h * e.rscale - 0.8 * r.x_height,
                                    );
                                }),
                                (e.prototype.getU = function () {
                                    var t = this.baseCore.getOuterBBox(),
                                        e = this.scriptChild.getOuterBBox(),
                                        r = this.font.params,
                                        o = this.node.attributes.getList(
                                            'displaystyle',
                                            'superscriptshift',
                                        ),
                                        n = this.node.getProperty('texprimestyle')
                                            ? r.sup3
                                            : o.displaystyle
                                              ? r.sup1
                                              : r.sup2,
                                        i = this.length2em(o.superscriptshift, n);
                                    return Math.max(
                                        this.baseCharZero(
                                            t.h * this.baseScale - r.sup_drop * e.rscale,
                                        ),
                                        i,
                                        e.d * e.rscale + (1 / 4) * r.x_height,
                                    );
                                }),
                                (e.prototype.hasMovableLimits = function () {
                                    var t = this.node.attributes.get('displaystyle'),
                                        e = this.baseChild.coreMO().node;
                                    return !t && !!e.attributes.get('movablelimits');
                                }),
                                (e.prototype.getOverKU = function (t, e) {
                                    var r = this.node.attributes.get('accent'),
                                        o = this.font.params,
                                        n = e.d * e.rscale,
                                        i = o.rule_thickness * o.separation_factor,
                                        a = this.baseHasAccentOver ? i : 0,
                                        s = this.isLineAbove ? 3 * o.rule_thickness : i,
                                        l =
                                            (r
                                                ? s
                                                : Math.max(
                                                      o.big_op_spacing1,
                                                      o.big_op_spacing3 - Math.max(0, n),
                                                  )) - a;
                                    return [l, t.h * t.rscale + l + n];
                                }),
                                (e.prototype.getUnderKV = function (t, e) {
                                    var r = this.node.attributes.get('accentunder'),
                                        o = this.font.params,
                                        n = e.h * e.rscale,
                                        i = o.rule_thickness * o.separation_factor,
                                        a = this.baseHasAccentUnder ? i : 0,
                                        s = this.isLineBelow ? 3 * o.rule_thickness : i,
                                        l =
                                            (r
                                                ? s
                                                : Math.max(
                                                      o.big_op_spacing2,
                                                      o.big_op_spacing4 - n,
                                                  )) - a;
                                    return [l, -(t.d * t.rscale + l + n)];
                                }),
                                (e.prototype.getDeltaW = function (t, e) {
                                    var r, o, n, l;
                                    void 0 === e && (e = [0, 0, 0]);
                                    var c = this.node.attributes.get('align'),
                                        h = t.map(function (t) {
                                            return t.w * t.rscale;
                                        });
                                    h[0] -=
                                        this.baseRemoveIc &&
                                        !this.baseCore.node.attributes.get('largeop')
                                            ? this.baseIc
                                            : 0;
                                    var u = Math.max.apply(Math, a([], i(h), !1)),
                                        p = [],
                                        d = 0;
                                    try {
                                        for (
                                            var f = s(h.keys()), y = f.next();
                                            !y.done;
                                            y = f.next()
                                        ) {
                                            var m = y.value;
                                            (p[m] =
                                                ('center' === c
                                                    ? (u - h[m]) / 2
                                                    : 'right' === c
                                                      ? u - h[m]
                                                      : 0) + e[m]),
                                                p[m] < d && (d = -p[m]);
                                        }
                                    } catch (t) {
                                        r = { error: t };
                                    } finally {
                                        try {
                                            y && !y.done && (o = f.return) && o.call(f);
                                        } finally {
                                            if (r) throw r.error;
                                        }
                                    }
                                    if (d)
                                        try {
                                            for (
                                                var v = s(p.keys()), g = v.next();
                                                !g.done;
                                                g = v.next()
                                            ) {
                                                m = g.value;
                                                p[m] += d;
                                            }
                                        } catch (t) {
                                            n = { error: t };
                                        } finally {
                                            try {
                                                g && !g.done && (l = v.return) && l.call(v);
                                            } finally {
                                                if (n) throw n.error;
                                            }
                                        }
                                    return (
                                        [1, 2].map(function (e) {
                                            return (p[e] += t[e] ? t[e].dx * t[0].scale : 0);
                                        }),
                                        p
                                    );
                                }),
                                (e.prototype.getDelta = function (t) {
                                    void 0 === t && (t = !1);
                                    var e = this.node.attributes.get('accent'),
                                        r = this.baseCore.getOuterBBox(),
                                        o = r.sk,
                                        n = r.ic;
                                    return (
                                        ((e && !t ? o : 0) + this.font.skewIcFactor * n) *
                                        this.baseScale
                                    );
                                }),
                                (e.prototype.stretchChildren = function () {
                                    var t,
                                        e,
                                        r,
                                        o,
                                        n,
                                        i,
                                        a = [];
                                    try {
                                        for (
                                            var l = s(this.childNodes), c = l.next();
                                            !c.done;
                                            c = l.next()
                                        ) {
                                            (M = c.value).canStretch(2) && a.push(M);
                                        }
                                    } catch (e) {
                                        t = { error: e };
                                    } finally {
                                        try {
                                            c && !c.done && (e = l.return) && e.call(l);
                                        } finally {
                                            if (t) throw t.error;
                                        }
                                    }
                                    var h = a.length,
                                        u = this.childNodes.length;
                                    if (h && u > 1) {
                                        var p = 0,
                                            d = h > 1 && h === u;
                                        try {
                                            for (
                                                var f = s(this.childNodes), y = f.next();
                                                !y.done;
                                                y = f.next()
                                            ) {
                                                var m = 0 === (M = y.value).stretch.dir;
                                                if (d || m) {
                                                    var v = M.getOuterBBox(m),
                                                        g = v.w,
                                                        b = v.rscale;
                                                    g * b > p && (p = g * b);
                                                }
                                            }
                                        } catch (t) {
                                            r = { error: t };
                                        } finally {
                                            try {
                                                y && !y.done && (o = f.return) && o.call(f);
                                            } finally {
                                                if (r) throw r.error;
                                            }
                                        }
                                        try {
                                            for (
                                                var x = s(a), _ = x.next();
                                                !_.done;
                                                _ = x.next()
                                            ) {
                                                var M;
                                                (M = _.value)
                                                    .coreMO()
                                                    .getStretchedVariant([p / M.bbox.rscale]);
                                            }
                                        } catch (t) {
                                            n = { error: t };
                                        } finally {
                                            try {
                                                _ && !_.done && (i = x.return) && i.call(x);
                                            } finally {
                                                if (n) throw n.error;
                                            }
                                        }
                                    }
                                }),
                                e
                            );
                        })(t)),
                        (e.useIC = !0),
                        e
                    );
                };
            },
            3191: function (t, e) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CommonSemanticsMixin = void 0),
                    (e.CommonSemanticsMixin = function (t) {
                        return (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(e, t),
                                (e.prototype.computeBBox = function (t, e) {
                                    if ((void 0 === e && (e = !1), this.childNodes.length)) {
                                        var r = this.childNodes[0].getBBox(),
                                            o = r.w,
                                            n = r.h,
                                            i = r.d;
                                        (t.w = o), (t.h = n), (t.d = i);
                                    }
                                }),
                                e
                            );
                        })(t);
                    });
            },
            6582: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (i =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, o = arguments.length; r < o; r++)
                                            for (var n in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, n) &&
                                                    (t[n] = e[n]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SVG = e.XLINKNS = e.SVGNS = void 0);
                var s = r(716),
                    l = r(9416),
                    c = r(4142),
                    h = r(4129),
                    u = r(6720),
                    p = r(6914);
                (e.SVGNS = 'http://www.w3.org/2000/svg'),
                    (e.XLINKNS = 'http://www.w3.org/1999/xlink');
                var d = (function (t) {
                    function r(e) {
                        void 0 === e && (e = null);
                        var r = t.call(this, e, l.SVGWrapperFactory, c.TeXFont) || this;
                        return (
                            (r.minwidth = 0),
                            (r.shift = 0),
                            (r.container = null),
                            (r.svgStyles = null),
                            (r.fontCache = new h.FontCache(r)),
                            r
                        );
                    }
                    return (
                        n(r, t),
                        (r.prototype.initialize = function () {
                            'global' === this.options.fontCache && this.fontCache.clearCache();
                        }),
                        (r.prototype.clearFontCache = function () {
                            this.fontCache.clearCache();
                        }),
                        (r.prototype.reset = function () {
                            this.clearFontCache();
                        }),
                        (r.prototype.setScale = function (t) {
                            1 !== this.options.scale &&
                                this.adaptor.setStyle(
                                    t,
                                    'fontSize',
                                    (0, p.percent)(this.options.scale),
                                );
                        }),
                        (r.prototype.escaped = function (t, e) {
                            return this.setDocument(e), this.html('span', {}, [this.text(t.math)]);
                        }),
                        (r.prototype.styleSheet = function (e) {
                            if (this.svgStyles) return this.svgStyles;
                            var o = (this.svgStyles = t.prototype.styleSheet.call(this, e));
                            return this.adaptor.setAttribute(o, 'id', r.STYLESHEETID), o;
                        }),
                        (r.prototype.pageElements = function (t) {
                            return 'global' !== this.options.fontCache || this.findCache(t)
                                ? null
                                : this.svg(
                                      'svg',
                                      { id: r.FONTCACHEID, style: { display: 'none' } },
                                      [this.fontCache.getCache()],
                                  );
                        }),
                        (r.prototype.findCache = function (t) {
                            for (
                                var e = this.adaptor,
                                    o = e.tags(e.body(t.document), 'svg'),
                                    n = o.length - 1;
                                n >= 0;
                                n--
                            )
                                if (this.adaptor.getAttribute(o[n], 'id') === r.FONTCACHEID)
                                    return !0;
                            return !1;
                        }),
                        (r.prototype.processMath = function (t, e) {
                            var r = this.container;
                            this.container = e;
                            var o = this.factory.wrap(t),
                                n = a(this.createRoot(o), 2),
                                i = n[0],
                                s = n[1];
                            this.typesetSVG(o, i, s), (this.container = r);
                        }),
                        (r.prototype.createRoot = function (t) {
                            var r = t.getOuterBBox(),
                                o = r.w,
                                n = r.h,
                                i = r.d,
                                a = r.pwidth,
                                s = t.metrics.em / 1e3,
                                l = Math.max(o, s),
                                c = Math.max(n + i, s),
                                h = this.svg('g', {
                                    stroke: 'currentColor',
                                    fill: 'currentColor',
                                    'stroke-width': 0,
                                    transform: 'scale(1,-1)',
                                }),
                                u = this.adaptor,
                                p = u.append(
                                    this.container,
                                    this.svg(
                                        'svg',
                                        {
                                            xmlns: e.SVGNS,
                                            width: this.ex(l),
                                            height: this.ex(c),
                                            role: 'img',
                                            focusable: !1,
                                            style: { 'vertical-align': this.ex(-i) },
                                            viewBox: [
                                                0,
                                                this.fixed(1e3 * -n, 1),
                                                this.fixed(1e3 * l, 1),
                                                this.fixed(1e3 * c, 1),
                                            ].join(' '),
                                        },
                                        [h],
                                    ),
                                );
                            if (
                                (0.001 === l &&
                                    (u.setAttribute(p, 'preserveAspectRatio', 'xMidYMid slice'),
                                    o < 0 &&
                                        u.setStyle(this.container, 'margin-right', this.ex(o))),
                                a)
                            ) {
                                u.setStyle(p, 'min-width', this.ex(l)),
                                    u.setAttribute(p, 'width', a),
                                    u.removeAttribute(p, 'viewBox');
                                var d = this.fixed(
                                    t.metrics.ex / (1e3 * this.font.params.x_height),
                                    6,
                                );
                                u.setAttribute(
                                    h,
                                    'transform',
                                    'scale('
                                        .concat(d, ',-')
                                        .concat(d, ') translate(0, ')
                                        .concat(this.fixed(1e3 * -n, 1), ')'),
                                );
                            }
                            return (
                                'none' !== this.options.fontCache &&
                                    u.setAttribute(p, 'xmlns:xlink', e.XLINKNS),
                                [p, h]
                            );
                        }),
                        (r.prototype.typesetSVG = function (t, e, r) {
                            var o = this.adaptor;
                            if (
                                ((this.minwidth = this.shift = 0),
                                'local' === this.options.fontCache &&
                                    (this.fontCache.clearCache(),
                                    this.fontCache.useLocalID(this.options.localID),
                                    o.insert(this.fontCache.getCache(), r)),
                                t.toSVG(r),
                                this.fontCache.clearLocalID(),
                                this.minwidth)
                            )
                                o.setStyle(e, 'minWidth', this.ex(this.minwidth)),
                                    o.setStyle(this.container, 'minWidth', this.ex(this.minwidth));
                            else if (this.shift) {
                                var n = o.getAttribute(this.container, 'justify') || 'center';
                                this.setIndent(e, n, this.shift);
                            }
                        }),
                        (r.prototype.setIndent = function (t, e, r) {
                            ('center' !== e && 'left' !== e) ||
                                this.adaptor.setStyle(t, 'margin-left', this.ex(r)),
                                ('center' !== e && 'right' !== e) ||
                                    this.adaptor.setStyle(t, 'margin-right', this.ex(-r));
                        }),
                        (r.prototype.ex = function (t) {
                            return (
                                (t /= this.font.params.x_height),
                                Math.abs(t) < 0.001
                                    ? '0'
                                    : t.toFixed(3).replace(/\.?0+$/, '') + 'ex'
                            );
                        }),
                        (r.prototype.svg = function (t, r, o) {
                            return (
                                void 0 === r && (r = {}),
                                void 0 === o && (o = []),
                                this.html(t, r, o, e.SVGNS)
                            );
                        }),
                        (r.prototype.unknownText = function (t, e) {
                            var r = this.math.metrics,
                                o = (this.font.params.x_height / r.ex) * r.em * 1e3,
                                n = this.svg(
                                    'text',
                                    {
                                        'data-variant': e,
                                        transform: 'scale(1,-1)',
                                        'font-size': this.fixed(o, 1) + 'px',
                                    },
                                    [this.text(t)],
                                ),
                                i = this.adaptor;
                            if ('-explicitFont' !== e) {
                                var s = (0, u.unicodeChars)(t);
                                if (1 !== s.length || s[0] < 119808 || s[0] > 120831) {
                                    var l = a(this.font.getCssFont(e), 3),
                                        c = l[0],
                                        h = l[1],
                                        p = l[2];
                                    i.setAttribute(n, 'font-family', c),
                                        h && i.setAttribute(n, 'font-style', 'italic'),
                                        p && i.setAttribute(n, 'font-weight', 'bold');
                                }
                            }
                            return n;
                        }),
                        (r.prototype.measureTextNode = function (t) {
                            var e = this.adaptor;
                            (t = e.clone(t)), e.removeAttribute(t, 'transform');
                            var r = this.fixed(1e3 * this.font.params.x_height, 1),
                                o = this.svg(
                                    'svg',
                                    {
                                        position: 'absolute',
                                        visibility: 'hidden',
                                        width: '1ex',
                                        height: '1ex',
                                        viewBox: [0, 0, r, r].join(' '),
                                    },
                                    [t],
                                );
                            e.append(e.body(e.document), o);
                            var n = e.nodeSize(t, 1e3, !0)[0];
                            return e.remove(o), { w: n, h: 0.75, d: 0.2 };
                        }),
                        (r.NAME = 'SVG'),
                        (r.OPTIONS = i(i({}, s.CommonOutputJax.OPTIONS), {
                            internalSpeechTitles: !0,
                            titleID: 0,
                            fontCache: 'local',
                            localID: null,
                        })),
                        (r.commonStyles = {
                            'mjx-container[jax="SVG"]': { direction: 'ltr' },
                            'mjx-container[jax="SVG"] > svg': {
                                overflow: 'visible',
                                'min-height': '1px',
                                'min-width': '1px',
                            },
                            'mjx-container[jax="SVG"] > svg a': { fill: 'blue', stroke: 'blue' },
                        }),
                        (r.FONTCACHEID = 'MJX-SVG-global-cache'),
                        (r.STYLESHEETID = 'MJX-SVG-styles'),
                        r
                    );
                })(s.CommonOutputJax);
                e.SVG = d;
            },
            4129: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.FontCache = void 0);
                var r = (function () {
                    function t(t) {
                        (this.cache = new Map()),
                            (this.defs = null),
                            (this.localID = ''),
                            (this.nextID = 0),
                            (this.jax = t);
                    }
                    return (
                        (t.prototype.cachePath = function (t, e, r) {
                            var o =
                                'MJX-' +
                                this.localID +
                                (this.jax.font.getVariant(t).cacheID || '') +
                                '-' +
                                e;
                            return (
                                this.cache.has(o) ||
                                    (this.cache.set(o, r),
                                    this.jax.adaptor.append(
                                        this.defs,
                                        this.jax.svg('path', { id: o, d: r }),
                                    )),
                                o
                            );
                        }),
                        (t.prototype.clearLocalID = function () {
                            this.localID = '';
                        }),
                        (t.prototype.useLocalID = function (t) {
                            void 0 === t && (t = null),
                                (this.localID =
                                    (null == t ? ++this.nextID : t) + ('' === t ? '' : '-'));
                        }),
                        (t.prototype.clearCache = function () {
                            (this.cache = new Map()), (this.defs = this.jax.svg('defs'));
                        }),
                        (t.prototype.getCache = function () {
                            return this.defs;
                        }),
                        t
                    );
                })();
                e.FontCache = r;
            },
            9708: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (i =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, o = arguments.length; r < o; r++)
                                            for (var n in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, n) &&
                                                    (t[n] = e[n]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, o) {
                                  void 0 === o && (o = r);
                                  var n = Object.getOwnPropertyDescriptor(e, r);
                                  (n &&
                                      !('get' in n
                                          ? !e.__esModule
                                          : n.writable || n.configurable)) ||
                                      (n = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, o, n);
                              }
                            : function (t, e, r, o) {
                                  void 0 === o && (o = r), (t[o] = e[r]);
                              }),
                    s =
                        (this && this.__exportStar) ||
                        function (t, e) {
                            for (var r in t)
                                'default' === r ||
                                    Object.prototype.hasOwnProperty.call(e, r) ||
                                    a(e, t, r);
                        },
                    l =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AddPaths = e.SVGFontData = void 0);
                var c = r(9250);
                s(r(9250), e);
                var h = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.charOptions = function (e, r) {
                            return t.charOptions.call(this, e, r);
                        }),
                        (e.OPTIONS = i(i({}, c.FontData.OPTIONS), {
                            dynamicPrefix: './output/svg/fonts',
                        })),
                        (e.JAX = 'SVG'),
                        e
                    );
                })(c.FontData);
                (e.SVGFontData = h),
                    (e.AddPaths = function (t, e, r) {
                        var o, n, i, a;
                        try {
                            for (var s = l(Object.keys(e)), c = s.next(); !c.done; c = s.next()) {
                                var u = c.value,
                                    p = parseInt(u);
                                h.charOptions(t, p).p = e[p];
                            }
                        } catch (t) {
                            o = { error: t };
                        } finally {
                            try {
                                c && !c.done && (n = s.return) && n.call(s);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        try {
                            for (var d = l(Object.keys(r)), f = d.next(); !f.done; f = d.next()) {
                                (u = f.value), (p = parseInt(u));
                                h.charOptions(t, p).c = r[p];
                            }
                        } catch (t) {
                            i = { error: t };
                        } finally {
                            try {
                                f && !f.done && (a = d.return) && a.call(d);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                        return t;
                    });
            },
            9737: function (t, e, r) {
                var o =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, o) {
                                  void 0 === o && (o = r);
                                  var n = Object.getOwnPropertyDescriptor(e, r);
                                  (n &&
                                      !('get' in n
                                          ? !e.__esModule
                                          : n.writable || n.configurable)) ||
                                      (n = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, o, n);
                              }
                            : function (t, e, r, o) {
                                  void 0 === o && (o = r), (t[o] = e[r]);
                              }),
                    n =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    i =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        o(e, t, r);
                            return n(e, t), e;
                        },
                    a =
                        (this && this.__exportStar) ||
                        function (t, e) {
                            for (var r in t)
                                'default' === r ||
                                    Object.prototype.hasOwnProperty.call(e, r) ||
                                    o(e, t, r);
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Arrow =
                        e.DiagonalArrow =
                        e.DiagonalStrike =
                        e.Border2 =
                        e.Border =
                        e.RenderLine =
                        e.lineOffset =
                        e.lineData =
                        e.computeLineData =
                            void 0);
                var s = i(r(5373));
                a(r(5373), e),
                    (e.computeLineData = {
                        top: function (t, e, r, o) {
                            return [0, t - o, r, t - o];
                        },
                        right: function (t, e, r, o) {
                            return [r - o, -e, r - o, t];
                        },
                        bottom: function (t, e, r, o) {
                            return [0, o - e, r, o - e];
                        },
                        left: function (t, e, r, o) {
                            return [o, -e, o, t];
                        },
                        vertical: function (t, e, r, o) {
                            return [r / 2, t, r / 2, -e];
                        },
                        horizontal: function (t, e, r, o) {
                            return [0, (t - e) / 2, r, (t - e) / 2];
                        },
                        up: function (t, e, r, o) {
                            return [o, o - e, r - o, t - o];
                        },
                        down: function (t, e, r, o) {
                            return [o, t - o, r - o, o - e];
                        },
                    });
                e.lineData = function (t, r, o) {
                    void 0 === o && (o = '');
                    var n = t.getBBox(),
                        i = n.h,
                        a = n.d,
                        s = n.w,
                        l = t.thickness / 2;
                    return (0, e.lineOffset)(e.computeLineData[r](i, a, s, l), t, o);
                };
                e.lineOffset = function (t, e, r) {
                    if (r) {
                        var o = e.getOffset(r);
                        o && ('X' === r ? ((t[0] -= o), (t[2] -= o)) : ((t[1] -= o), (t[3] -= o)));
                    }
                    return t;
                };
                e.RenderLine = function (t, r) {
                    return (
                        void 0 === r && (r = ''),
                        function (o, n) {
                            var i = o.line((0, e.lineData)(o, t, r));
                            o.adaptor.append(o.element, i);
                        }
                    );
                };
                e.Border = function (t) {
                    return s.CommonBorder(function (r, o) {
                        r.adaptor.append(r.element, r.line((0, e.lineData)(r, t)));
                    })(t);
                };
                e.Border2 = function (t, r, o) {
                    return s.CommonBorder2(function (t, n) {
                        t.adaptor.append(t.element, t.line((0, e.lineData)(t, r))),
                            t.adaptor.append(t.element, t.line((0, e.lineData)(t, o)));
                    })(t, r, o);
                };
                e.DiagonalStrike = function (t) {
                    return s.CommonDiagonalStrike(function (r) {
                        return function (r, o) {
                            r.adaptor.append(r.element, r.line((0, e.lineData)(r, t)));
                        };
                    })(t);
                };
                e.DiagonalArrow = function (t) {
                    return s.CommonDiagonalArrow(function (t, e) {
                        t.adaptor.append(t.element, e);
                    })(t);
                };
                e.Arrow = function (t) {
                    return s.CommonArrow(function (t, e) {
                        t.adaptor.append(t.element, e);
                    })(t);
                };
            },
            9321: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGWrapper = void 0);
                var s = r(3717),
                    l = r(1541),
                    c = r(6582),
                    h = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.element = null), (e.dx = 0), e;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                this.addChildren(this.standardSVGnode(t));
                            }),
                            (e.prototype.addChildren = function (t) {
                                var e,
                                    r,
                                    o = 0;
                                try {
                                    for (
                                        var n = i(this.childNodes), a = n.next();
                                        !a.done;
                                        a = n.next()
                                    ) {
                                        var s = a.value;
                                        s.toSVG(t);
                                        var l = s.getOuterBBox();
                                        s.element && s.place(o + l.L * l.rscale, 0),
                                            (o += (l.L + l.w + l.R) * l.rscale);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        a && !a.done && (r = n.return) && r.call(n);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            }),
                            (e.prototype.standardSVGnode = function (t) {
                                var e = this.createSVGnode(t);
                                return (
                                    this.handleStyles(),
                                    this.handleScale(),
                                    this.handleBorder(),
                                    this.handleColor(),
                                    this.handleAttributes(),
                                    e
                                );
                            }),
                            (e.prototype.createSVGnode = function (t) {
                                this.element = this.svg('g', { 'data-mml-node': this.node.kind });
                                var e = this.node.attributes.get('href');
                                if (e) {
                                    t = this.adaptor.append(t, this.svg('a', { href: e }));
                                    var r = this.getOuterBBox(),
                                        o = r.h,
                                        n = r.d,
                                        i = r.w;
                                    this.adaptor.append(
                                        this.element,
                                        this.svg('rect', {
                                            'data-hitbox': !0,
                                            fill: 'none',
                                            stroke: 'none',
                                            'pointer-events': 'all',
                                            width: this.fixed(i),
                                            height: this.fixed(o + n),
                                            y: this.fixed(-n),
                                        }),
                                    );
                                }
                                return this.adaptor.append(t, this.element), this.element;
                            }),
                            (e.prototype.handleStyles = function () {
                                var t = this;
                                if (this.styles) {
                                    var e = this.styles.cssText;
                                    e && this.adaptor.setAttribute(this.element, 'style', e),
                                        s.BBox.StyleAdjust.forEach(function (e) {
                                            var r = a(e, 3),
                                                o = r[0];
                                            if (0 === r[2]) {
                                                var n = t.styles.get(o);
                                                n && (t.dx += t.length2em(n, 1, t.bbox.rscale));
                                            }
                                        });
                                }
                            }),
                            (e.prototype.handleScale = function () {
                                if (1 !== this.bbox.rscale) {
                                    var t = 'scale(' + this.fixed(this.bbox.rscale / 1e3, 3) + ')';
                                    this.adaptor.setAttribute(this.element, 'transform', t);
                                }
                            }),
                            (e.prototype.handleColor = function () {
                                var t,
                                    e = this.adaptor,
                                    r = this.node.attributes,
                                    o = r.getExplicit('mathcolor'),
                                    n = r.getExplicit('color'),
                                    i = r.getExplicit('mathbackground'),
                                    a = r.getExplicit('background'),
                                    s =
                                        (null === (t = this.styles) || void 0 === t
                                            ? void 0
                                            : t.get('background-color')) || '';
                                if (
                                    ((o || n) &&
                                        (e.setAttribute(this.element, 'fill', o || n),
                                        e.setAttribute(this.element, 'stroke', o || n)),
                                    i || a || s)
                                ) {
                                    var l = this.getOuterBBox(),
                                        c = l.h,
                                        h = l.d,
                                        u = l.w,
                                        p = this.svg('rect', {
                                            fill: i || a || s,
                                            x: this.fixed(-this.dx),
                                            y: this.fixed(-h),
                                            width: this.fixed(u),
                                            height: this.fixed(c + h),
                                            'data-bgcolor': !0,
                                        }),
                                        d = e.firstChild(this.element);
                                    d ? e.insert(p, d) : e.append(this.element, p);
                                }
                            }),
                            (e.prototype.handleBorder = function () {
                                var t, r, o, n;
                                if (this.styles) {
                                    var s = Array(4).fill(0),
                                        l = Array(4),
                                        c = Array(4);
                                    try {
                                        for (
                                            var h = i([
                                                    ['Top', 0],
                                                    ['Right', 1],
                                                    ['Bottom', 2],
                                                    ['Left', 3],
                                                ]),
                                                u = h.next();
                                            !u.done;
                                            u = h.next()
                                        ) {
                                            var p = a(u.value, 2),
                                                d = p[0],
                                                f = p[1],
                                                y = 'border' + d,
                                                m = this.styles.get(y + 'Width');
                                            m &&
                                                ((s[f] = Math.max(
                                                    0,
                                                    this.length2em(m, 1, this.bbox.rscale),
                                                )),
                                                (l[f] = this.styles.get(y + 'Style') || 'solid'),
                                                (c[f] =
                                                    this.styles.get(y + 'Color') ||
                                                    'currentColor'));
                                        }
                                    } catch (e) {
                                        t = { error: e };
                                    } finally {
                                        try {
                                            u && !u.done && (r = h.return) && r.call(h);
                                        } finally {
                                            if (t) throw t.error;
                                        }
                                    }
                                    var v = e.borderFuzz,
                                        g = this.getOuterBBox(),
                                        b = a([g.h + v, g.d + v, g.w + v], 3),
                                        x = b[0],
                                        _ = b[1],
                                        M = b[2],
                                        w = [M, x],
                                        S = [-v, x],
                                        O = [M, -_],
                                        C = [-v, -_],
                                        B = [M - s[1], x - s[0]],
                                        j = [-v + s[3], x - s[0]],
                                        P = [M - s[1], -_ + s[2]],
                                        A = [-v + s[3], -_ + s[2]],
                                        V = [
                                            [S, w, B, j],
                                            [O, w, B, P],
                                            [C, O, P, A],
                                            [C, S, j, A],
                                        ],
                                        T = this.adaptor.firstChild(this.element);
                                    try {
                                        for (
                                            var k = i([0, 1, 2, 3]), G = k.next();
                                            !G.done;
                                            G = k.next()
                                        ) {
                                            if (s[(f = G.value)]) {
                                                var N = V[f];
                                                'dashed' === l[f] || 'dotted' === l[f]
                                                    ? this.addBorderBroken(N, c[f], l[f], s[f], f)
                                                    : this.addBorderSolid(N, c[f], T);
                                            }
                                        }
                                    } catch (t) {
                                        o = { error: t };
                                    } finally {
                                        try {
                                            G && !G.done && (n = k.return) && n.call(k);
                                        } finally {
                                            if (o) throw o.error;
                                        }
                                    }
                                }
                            }),
                            (e.prototype.addBorderSolid = function (t, e, r) {
                                var o = this,
                                    n = this.svg('polygon', {
                                        points: t
                                            .map(function (t) {
                                                var e = a(t, 2),
                                                    r = e[0],
                                                    n = e[1];
                                                return ''
                                                    .concat(o.fixed(r - o.dx), ',')
                                                    .concat(o.fixed(n));
                                            })
                                            .join(' '),
                                        stroke: 'none',
                                        fill: e,
                                    });
                                r
                                    ? this.adaptor.insert(n, r)
                                    : this.adaptor.append(this.element, n);
                            }),
                            (e.prototype.addBorderBroken = function (t, e, r, o, n) {
                                var i = 'dotted' === r,
                                    s = o / 2,
                                    l = a(
                                        [
                                            [s, -s, -s, -s],
                                            [-s, s, -s, -s],
                                            [s, s, -s, s],
                                            [s, s, s, -s],
                                        ][n],
                                        4,
                                    ),
                                    c = l[0],
                                    h = l[1],
                                    u = l[2],
                                    p = l[3],
                                    d = a(t, 2),
                                    f = d[0],
                                    y = d[1],
                                    m = f[0] + c - this.dx,
                                    v = f[1] + h,
                                    g = y[0] + u - this.dx,
                                    b = y[1] + p,
                                    x = Math.abs(n % 2 ? b - v : g - m),
                                    _ = i ? Math.ceil(x / (2 * o)) : Math.ceil((x - o) / (4 * o)),
                                    M = x / (4 * _ + 1),
                                    w = this.svg('line', {
                                        x1: this.fixed(m),
                                        y1: this.fixed(v),
                                        x2: this.fixed(g),
                                        y2: this.fixed(b),
                                        'stroke-width': this.fixed(o),
                                        stroke: e,
                                        'stroke-linecap': i ? 'round' : 'square',
                                        'stroke-dasharray': i
                                            ? [1, this.fixed(x / _ - 0.002)].join(' ')
                                            : [this.fixed(M), this.fixed(3 * M)].join(' '),
                                    }),
                                    S = this.adaptor,
                                    O = S.firstChild(this.element);
                                O ? S.insert(w, O) : S.append(this.element, w);
                            }),
                            (e.prototype.handleAttributes = function () {
                                var t,
                                    r,
                                    o,
                                    n,
                                    a = this.node.attributes,
                                    s = a.getAllDefaults(),
                                    l = e.skipAttributes;
                                try {
                                    for (
                                        var c = i(a.getExplicitNames()), h = c.next();
                                        !h.done;
                                        h = c.next()
                                    ) {
                                        var u = h.value;
                                        (!1 !== l[u] &&
                                            (u in s ||
                                                l[u] ||
                                                this.adaptor.hasAttribute(this.element, u))) ||
                                            this.adaptor.setAttribute(
                                                this.element,
                                                u,
                                                a.getExplicit(u),
                                            );
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        h && !h.done && (r = c.return) && r.call(c);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                                if (a.get('class')) {
                                    var p = a.get('class').trim().split(/ +/);
                                    try {
                                        for (var d = i(p), f = d.next(); !f.done; f = d.next()) {
                                            var y = f.value;
                                            this.adaptor.addClass(this.element, y);
                                        }
                                    } catch (t) {
                                        o = { error: t };
                                    } finally {
                                        try {
                                            f && !f.done && (n = d.return) && n.call(d);
                                        } finally {
                                            if (o) throw o.error;
                                        }
                                    }
                                }
                            }),
                            (e.prototype.place = function (t, e, r) {
                                if ((void 0 === r && (r = null), (t += this.dx) || e)) {
                                    r || ((r = this.element), (e = this.handleId(e)));
                                    var o = 'translate('
                                            .concat(this.fixed(t), ',')
                                            .concat(this.fixed(e), ')'),
                                        n = this.adaptor.getAttribute(r, 'transform') || '';
                                    this.adaptor.setAttribute(
                                        r,
                                        'transform',
                                        o + (n ? ' ' + n : ''),
                                    );
                                }
                            }),
                            (e.prototype.handleId = function (t) {
                                if (!this.node.attributes || !this.node.attributes.get('id'))
                                    return t;
                                var e = this.adaptor,
                                    r = this.getBBox().h,
                                    o = e.childNodes(this.element);
                                o.forEach(function (t) {
                                    return e.remove(t);
                                });
                                var n = this.svg(
                                    'g',
                                    {
                                        'data-idbox': !0,
                                        transform: 'translate(0,'.concat(this.fixed(-r), ')'),
                                    },
                                    o,
                                );
                                return (
                                    e.append(
                                        this.element,
                                        this.svg('text', { 'data-id-align': !0 }, [this.text('')]),
                                    ),
                                    e.append(this.element, n),
                                    t + r
                                );
                            }),
                            (e.prototype.firstChild = function () {
                                var t = this.adaptor,
                                    e = t.firstChild(this.element);
                                return (
                                    e &&
                                        'text' === t.kind(e) &&
                                        t.getAttribute(e, 'data-id-align') &&
                                        (e = t.firstChild(t.next(e))),
                                    e &&
                                        'rect' === t.kind(e) &&
                                        t.getAttribute(e, 'data-hitbox') &&
                                        (e = t.next(e)),
                                    e
                                );
                            }),
                            (e.prototype.placeChar = function (t, e, r, o, n) {
                                var s, l;
                                void 0 === n && (n = null), null === n && (n = this.variant);
                                var c = t.toString(16).toUpperCase(),
                                    h = a(this.getVariantChar(n, t), 4),
                                    u = h[2],
                                    p = h[3];
                                if ('p' in p) {
                                    var d = p.p ? 'M' + p.p + 'Z' : '';
                                    this.place(
                                        e,
                                        r,
                                        this.adaptor.append(o, this.charNode(n, c, d)),
                                    );
                                } else if ('c' in p) {
                                    var f = this.adaptor.append(o, this.svg('g', { 'data-c': c }));
                                    this.place(e, r, f), (e = 0);
                                    try {
                                        for (
                                            var y = i(this.unicodeChars(p.c, n)), m = y.next();
                                            !m.done;
                                            m = y.next()
                                        ) {
                                            var v = m.value;
                                            e += this.placeChar(v, e, r, f, n);
                                        }
                                    } catch (t) {
                                        s = { error: t };
                                    } finally {
                                        try {
                                            m && !m.done && (l = y.return) && l.call(y);
                                        } finally {
                                            if (s) throw s.error;
                                        }
                                    }
                                } else if (p.unknown) {
                                    var g = String.fromCodePoint(t),
                                        b = this.adaptor.append(o, this.jax.unknownText(g, n));
                                    return (
                                        this.place(e, r, b),
                                        this.jax.measureTextNodeWithCache(b, g, n).w
                                    );
                                }
                                return u;
                            }),
                            (e.prototype.charNode = function (t, e, r) {
                                return 'none' !== this.jax.options.fontCache
                                    ? this.useNode(t, e, r)
                                    : this.pathNode(e, r);
                            }),
                            (e.prototype.pathNode = function (t, e) {
                                return this.svg('path', { 'data-c': t, d: e });
                            }),
                            (e.prototype.useNode = function (t, e, r) {
                                var o = this.svg('use', { 'data-c': e }),
                                    n = '#' + this.jax.fontCache.cachePath(t, e, r);
                                return this.adaptor.setAttribute(o, 'href', n, c.XLINKNS), o;
                            }),
                            (e.prototype.drawBBox = function () {
                                var t = this.getBBox(),
                                    e = t.w,
                                    r = t.h,
                                    o = t.d,
                                    n = this.svg('g', { style: { opacity: 0.25 } }, [
                                        this.svg('rect', {
                                            fill: 'red',
                                            height: this.fixed(r),
                                            width: this.fixed(e),
                                        }),
                                        this.svg('rect', {
                                            fill: 'green',
                                            height: this.fixed(o),
                                            width: this.fixed(e),
                                            y: this.fixed(-o),
                                        }),
                                    ]),
                                    i = this.element || this.parent.element;
                                this.adaptor.append(i, n);
                            }),
                            (e.prototype.html = function (t, e, r) {
                                return (
                                    void 0 === e && (e = {}),
                                    void 0 === r && (r = []),
                                    this.jax.html(t, e, r)
                                );
                            }),
                            (e.prototype.svg = function (t, e, r) {
                                return (
                                    void 0 === e && (e = {}),
                                    void 0 === r && (r = []),
                                    this.jax.svg(t, e, r)
                                );
                            }),
                            (e.prototype.text = function (t) {
                                return this.jax.text(t);
                            }),
                            (e.prototype.fixed = function (t, e) {
                                return void 0 === e && (e = 1), this.jax.fixed(1e3 * t, e);
                            }),
                            (e.kind = 'unknown'),
                            (e.borderFuzz = 0.005),
                            e
                        );
                    })(l.CommonWrapper);
                e.SVGWrapper = h;
            },
            9416: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SVGWrapperFactory = void 0);
                var i = r(1475),
                    a = r(4687),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.jax = null), e;
                        }
                        return n(e, t), (e.defaultNodes = a.SVGWrappers), e;
                    })(i.CommonWrapperFactory);
                e.SVGWrapperFactory = s;
            },
            4687: function (t, e, r) {
                var o;
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGWrappers = void 0);
                var n = r(9321),
                    i = r(1211),
                    a = r(322),
                    s = r(2983),
                    l = r(6760),
                    c = r(9810),
                    h = r(3677),
                    u = r(1941),
                    p = r(3007),
                    d = r(2458),
                    f = r(4539),
                    y = r(438),
                    m = r(9295),
                    v = r(9948),
                    g = r(8798),
                    b = r(5258),
                    x = r(7522),
                    _ = r(4299),
                    M = r(4750),
                    w = r(451),
                    S = r(4682),
                    O = r(2673),
                    C = r(4601),
                    B = r(144),
                    j = r(6965),
                    P = r(4916),
                    A = r(484),
                    V = r(7455);
                e.SVGWrappers =
                    (((o = {})[i.SVGmath.kind] = i.SVGmath),
                    (o[a.SVGmrow.kind] = a.SVGmrow),
                    (o[a.SVGinferredMrow.kind] = a.SVGinferredMrow),
                    (o[s.SVGmi.kind] = s.SVGmi),
                    (o[l.SVGmo.kind] = l.SVGmo),
                    (o[c.SVGmn.kind] = c.SVGmn),
                    (o[h.SVGms.kind] = h.SVGms),
                    (o[u.SVGmtext.kind] = u.SVGmtext),
                    (o[p.SVGmerror.kind] = p.SVGmerror),
                    (o[d.SVGmspace.kind] = d.SVGmspace),
                    (o[f.SVGmpadded.kind] = f.SVGmpadded),
                    (o[y.SVGmphantom.kind] = y.SVGmphantom),
                    (o[m.SVGmfrac.kind] = m.SVGmfrac),
                    (o[v.SVGmsqrt.kind] = v.SVGmsqrt),
                    (o[g.SVGmroot.kind] = g.SVGmroot),
                    (o[b.SVGmfenced.kind] = b.SVGmfenced),
                    (o[x.SVGmsub.kind] = x.SVGmsub),
                    (o[x.SVGmsup.kind] = x.SVGmsup),
                    (o[x.SVGmsubsup.kind] = x.SVGmsubsup),
                    (o[_.SVGmunder.kind] = _.SVGmunder),
                    (o[_.SVGmover.kind] = _.SVGmover),
                    (o[_.SVGmunderover.kind] = _.SVGmunderover),
                    (o[M.SVGmmultiscripts.kind] = M.SVGmmultiscripts),
                    (o[w.SVGmtable.kind] = w.SVGmtable),
                    (o[S.SVGmtr.kind] = S.SVGmtr),
                    (o[S.SVGmlabeledtr.kind] = S.SVGmlabeledtr),
                    (o[O.SVGmtd.kind] = O.SVGmtd),
                    (o[C.SVGmaction.kind] = C.SVGmaction),
                    (o[B.SVGmenclose.kind] = B.SVGmenclose),
                    (o[j.SVGsemantics.kind] = j.SVGsemantics),
                    (o[j.SVGannotation.kind] = j.SVGannotation),
                    (o[j.SVGannotationXML.kind] = j.SVGannotationXML),
                    (o[j.SVGxml.kind] = j.SVGxml),
                    (o[P.SVGmglyph.kind] = P.SVGmglyph),
                    (o[A.SVGTeXAtom.kind] = A.SVGTeXAtom),
                    (o[V.SVGTextNode.kind] = V.SVGTextNode),
                    (o[n.SVGWrapper.kind] = n.SVGWrapper),
                    o);
            },
            484: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGTeXAtom = void 0);
                var i = r(9321),
                    a = r(3438),
                    s = r(4282),
                    l = r(8921),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (e) {
                                if (
                                    (t.prototype.toSVG.call(this, e),
                                    this.adaptor.setAttribute(
                                        this.element,
                                        'data-mjx-texclass',
                                        l.TEXCLASSNAMES[this.node.texClass],
                                    ),
                                    this.node.texClass === l.TEXCLASS.VCENTER)
                                ) {
                                    var r = this.childNodes[0].getBBox(),
                                        o = r.h,
                                        n = (o + r.d) / 2 + this.font.params.axis_height - o,
                                        i = 'translate(0 ' + this.fixed(n) + ')';
                                    this.adaptor.setAttribute(this.element, 'transform', i);
                                }
                            }),
                            (e.kind = s.TeXAtom.prototype.kind),
                            e
                        );
                    })((0, a.CommonTeXAtomMixin)(i.SVGWrapper));
                e.SVGTeXAtom = c;
            },
            7455: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGTextNode = void 0);
                var a = r(8921),
                    s = r(9321),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e,
                                    r,
                                    o = this.node.getText(),
                                    n = this.parent.variant;
                                if (0 !== o.length)
                                    if ('-explicitFont' === n)
                                        this.element = this.adaptor.append(
                                            t,
                                            this.jax.unknownText(o, n),
                                        );
                                    else {
                                        var a = this.remappedText(o, n);
                                        this.parent.childNodes.length > 1 &&
                                            (t = this.element =
                                                this.adaptor.append(
                                                    t,
                                                    this.svg('g', { 'data-mml-node': 'text' }),
                                                ));
                                        var s = 0;
                                        try {
                                            for (
                                                var l = i(a), c = l.next();
                                                !c.done;
                                                c = l.next()
                                            ) {
                                                var h = c.value;
                                                s += this.placeChar(h, s, 0, t, n);
                                            }
                                        } catch (t) {
                                            e = { error: t };
                                        } finally {
                                            try {
                                                c && !c.done && (r = l.return) && r.call(l);
                                            } finally {
                                                if (e) throw e.error;
                                            }
                                        }
                                    }
                            }),
                            (e.kind = a.TextNode.prototype.kind),
                            (e.styles = {
                                'mjx-container[jax="SVG"] path[data-c], mjx-container[jax="SVG"] use[data-c]':
                                    { 'stroke-width': 3 },
                            }),
                            e
                        );
                    })((0, r(555).CommonTextNodeMixin)(s.SVGWrapper));
                e.SVGTextNode = l;
            },
            4601: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmaction = void 0);
                var i = r(9321),
                    a = r(3345),
                    s = r(3345),
                    l = r(3969),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.standardSVGnode(t),
                                    r = this.selected,
                                    o = r.getOuterBBox(),
                                    n = o.h,
                                    i = o.d,
                                    a = o.w;
                                this.adaptor.append(
                                    this.element,
                                    this.svg('rect', {
                                        width: this.fixed(a),
                                        height: this.fixed(n + i),
                                        y: this.fixed(-i),
                                        fill: 'none',
                                        'pointer-events': 'all',
                                    }),
                                ),
                                    r.toSVG(e);
                                var s = r.getOuterBBox();
                                r.element && r.place(s.L * s.rscale, 0),
                                    this.action(this, this.data);
                            }),
                            (e.prototype.setEventHandler = function (t, e) {
                                this.element.addEventListener(t, e);
                            }),
                            (e.kind = l.MmlMaction.prototype.kind),
                            (e.styles = {
                                '[jax="SVG"] mjx-tool': {
                                    display: 'inline-block',
                                    position: 'relative',
                                    width: 0,
                                    height: 0,
                                },
                                '[jax="SVG"] mjx-tool > mjx-tip': {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                },
                                'mjx-tool > mjx-tip': {
                                    display: 'inline-block',
                                    padding: '.2em',
                                    border: '1px solid #888',
                                    'font-size': '70%',
                                    'background-color': '#F8F8F8',
                                    color: 'black',
                                    'box-shadow': '2px 2px 5px #AAAAAA',
                                },
                                'g[data-mml-node="maction"][data-toggle]': { cursor: 'pointer' },
                                'mjx-status': {
                                    display: 'block',
                                    position: 'fixed',
                                    left: '1em',
                                    bottom: '1em',
                                    'min-width': '25%',
                                    padding: '.2em .4em',
                                    border: '1px solid #888',
                                    'font-size': '90%',
                                    'background-color': '#F8F8F8',
                                    color: 'black',
                                },
                            }),
                            (e.actions = new Map([
                                [
                                    'toggle',
                                    [
                                        function (t, e) {
                                            t.adaptor.setAttribute(
                                                t.element,
                                                'data-toggle',
                                                t.node.attributes.get('selection'),
                                            );
                                            var r = t.factory.jax.math,
                                                o = t.factory.jax.document,
                                                n = t.node;
                                            t.setEventHandler('click', function (t) {
                                                r.end.node ||
                                                    ((r.start.node = r.end.node = r.typesetRoot),
                                                    (r.start.n = r.end.n = 0)),
                                                    n.nextToggleSelection(),
                                                    r.rerender(o),
                                                    t.stopPropagation();
                                            });
                                        },
                                        {},
                                    ],
                                ],
                                [
                                    'tooltip',
                                    [
                                        function (t, e) {
                                            var r = t.childNodes[1];
                                            if (r) {
                                                var o = t.firstChild();
                                                if (r.node.isKind('mtext')) {
                                                    var n = r.node.getText();
                                                    t.adaptor.insert(
                                                        t.svg('title', {}, [t.text(n)]),
                                                        o,
                                                    );
                                                } else {
                                                    var i = t.adaptor,
                                                        a = t.jax.container,
                                                        s = t.node.factory.create('math', {}, [
                                                            t.childNodes[1].node,
                                                        ]),
                                                        l = t.html('mjx-tool', {}, [
                                                            t.html('mjx-tip'),
                                                        ]),
                                                        c = i.append(
                                                            o,
                                                            t.svg(
                                                                'foreignObject',
                                                                { style: { display: 'none' } },
                                                                [l],
                                                            ),
                                                        );
                                                    t.jax.processMath(s, i.firstChild(l)),
                                                        (t.childNodes[1].node.parent = t.node),
                                                        t.setEventHandler(
                                                            'mouseover',
                                                            function (r) {
                                                                e.stopTimers(t, e),
                                                                    e.hoverTimer.set(
                                                                        t,
                                                                        setTimeout(function () {
                                                                            i.setStyle(
                                                                                l,
                                                                                'left',
                                                                                '0',
                                                                            ),
                                                                                i.setStyle(
                                                                                    l,
                                                                                    'top',
                                                                                    '0',
                                                                                ),
                                                                                i.append(a, l);
                                                                            var e = i.nodeBBox(l),
                                                                                r = i.nodeBBox(
                                                                                    t.element,
                                                                                ),
                                                                                o =
                                                                                    (r.right -
                                                                                        e.left) /
                                                                                        t.metrics
                                                                                            .em +
                                                                                    t.dx,
                                                                                n =
                                                                                    (r.bottom -
                                                                                        e.bottom) /
                                                                                        t.metrics
                                                                                            .em +
                                                                                    t.dy;
                                                                            i.setStyle(
                                                                                l,
                                                                                'left',
                                                                                t.px(o),
                                                                            ),
                                                                                i.setStyle(
                                                                                    l,
                                                                                    'top',
                                                                                    t.px(n),
                                                                                );
                                                                        }, e.postDelay),
                                                                    ),
                                                                    r.stopPropagation();
                                                            },
                                                        ),
                                                        t.setEventHandler('mouseout', function (r) {
                                                            e.stopTimers(t, e);
                                                            var o = setTimeout(function () {
                                                                return i.append(c, l);
                                                            }, e.clearDelay);
                                                            e.clearTimer.set(t, o),
                                                                r.stopPropagation();
                                                        });
                                                }
                                            }
                                        },
                                        s.TooltipData,
                                    ],
                                ],
                                [
                                    'statusline',
                                    [
                                        function (t, e) {
                                            var r = t.childNodes[1];
                                            if (r && r.node.isKind('mtext')) {
                                                var o = t.adaptor,
                                                    n = r.node.getText();
                                                o.setAttribute(t.element, 'data-statusline', n),
                                                    t.setEventHandler('mouseover', function (r) {
                                                        if (null === e.status) {
                                                            var i = o.body(o.document);
                                                            e.status = o.append(
                                                                i,
                                                                t.html('mjx-status', {}, [
                                                                    t.text(n),
                                                                ]),
                                                            );
                                                        }
                                                        r.stopPropagation();
                                                    }),
                                                    t.setEventHandler('mouseout', function (t) {
                                                        e.status &&
                                                            (o.remove(e.status), (e.status = null)),
                                                            t.stopPropagation();
                                                    });
                                            }
                                        },
                                        { status: null },
                                    ],
                                ],
                            ])),
                            e
                        );
                    })((0, a.CommonMactionMixin)(i.SVGWrapper));
                e.SVGmaction = c;
            },
            1211: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmath = void 0);
                var s = r(9321),
                    l = r(2057),
                    c = r(304),
                    h = r(3717),
                    u = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (e) {
                                t.prototype.toSVG.call(this, e);
                                var r = this.adaptor;
                                'block' === this.node.attributes.get('display') &&
                                    (r.setAttribute(this.jax.container, 'display', 'true'),
                                    this.handleDisplay()),
                                    this.jax.document.options.internalSpeechTitles &&
                                        this.handleSpeech();
                            }),
                            (e.prototype.handleDisplay = function () {
                                var t = i(this.getAlignShift(), 2),
                                    e = t[0],
                                    r = t[1];
                                if (
                                    ('center' !== e &&
                                        this.adaptor.setAttribute(this.jax.container, 'justify', e),
                                    this.bbox.pwidth === h.BBox.fullWidth)
                                ) {
                                    if (
                                        (this.adaptor.setAttribute(
                                            this.jax.container,
                                            'width',
                                            'full',
                                        ),
                                        this.jax.table)
                                    ) {
                                        var o = this.jax.table.getOuterBBox(),
                                            n = o.L,
                                            a = o.w,
                                            s = o.R;
                                        'right' === e
                                            ? (s = Math.max(s || -r, -r))
                                            : 'left' === e
                                              ? (n = Math.max(n || r, r))
                                              : 'center' === e && (a += 2 * Math.abs(r)),
                                            (this.jax.minwidth = Math.max(0, n + a + s));
                                    }
                                } else this.jax.shift = r;
                            }),
                            (e.prototype.handleSpeech = function () {
                                var t,
                                    e,
                                    r = this.adaptor,
                                    o = this.node.attributes,
                                    n = o.get('aria-label') || o.get('data-semantic-speech');
                                if (n) {
                                    var i = this.getTitleID(),
                                        s = this.svg('title', { id: i }, [this.text(n)]);
                                    r.insert(s, r.firstChild(this.element)),
                                        r.setAttribute(this.element, 'aria-labeledby', i),
                                        r.removeAttribute(this.element, 'aria-label');
                                    try {
                                        for (
                                            var l = a(this.childNodes[0].childNodes), c = l.next();
                                            !c.done;
                                            c = l.next()
                                        ) {
                                            var h = c.value;
                                            r.setAttribute(h.element, 'aria-hidden', 'true');
                                        }
                                    } catch (e) {
                                        t = { error: e };
                                    } finally {
                                        try {
                                            c && !c.done && (e = l.return) && e.call(l);
                                        } finally {
                                            if (t) throw t.error;
                                        }
                                    }
                                }
                            }),
                            (e.prototype.getTitleID = function () {
                                return 'mjx-svg-title-' + String(this.jax.options.titleID++);
                            }),
                            (e.prototype.setChildPWidths = function (e, r, o) {
                                return (
                                    void 0 === r && (r = null),
                                    void 0 === o && (o = !0),
                                    t.prototype.setChildPWidths.call(
                                        this,
                                        e,
                                        this.parent
                                            ? r
                                            : this.metrics.containerWidth / this.jax.pxPerEm,
                                        !1,
                                    )
                                );
                            }),
                            (e.kind = c.MmlMath.prototype.kind),
                            (e.styles = {
                                'mjx-container[jax="SVG"][display="true"]': {
                                    display: 'block',
                                    'text-align': 'center',
                                    margin: '1em 0',
                                },
                                'mjx-container[jax="SVG"][display="true"][width="full"]': {
                                    display: 'flex',
                                },
                                'mjx-container[jax="SVG"][justify="left"]': {
                                    'text-align': 'left',
                                },
                                'mjx-container[jax="SVG"][justify="right"]': {
                                    'text-align': 'right',
                                },
                            }),
                            e
                        );
                    })((0, l.CommonMathMixin)(s.SVGWrapper));
                e.SVGmath = u;
            },
            144: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, o) {
                                  void 0 === o && (o = r);
                                  var n = Object.getOwnPropertyDescriptor(e, r);
                                  (n &&
                                      !('get' in n
                                          ? !e.__esModule
                                          : n.writable || n.configurable)) ||
                                      (n = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, o, n);
                              }
                            : function (t, e, r, o) {
                                  void 0 === o && (o = r), (t[o] = e[r]);
                              }),
                    a =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    s =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        i(e, t, r);
                            return a(e, t), e;
                        },
                    l =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    c =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmenclose = void 0);
                var h = r(9321),
                    u = r(6200),
                    p = s(r(9737)),
                    d = r(4374),
                    f = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e,
                                    r,
                                    o = this.standardSVGnode(t),
                                    n = this.getBBoxExtenders()[3],
                                    i = {};
                                n > 0 && (i.transform = 'translate(' + this.fixed(n) + ', 0)');
                                var a = this.adaptor.append(o, this.svg('g', i));
                                this.renderChild
                                    ? this.renderChild(this, a)
                                    : this.childNodes[0].toSVG(a);
                                try {
                                    for (
                                        var s = l(Object.keys(this.notations)), c = s.next();
                                        !c.done;
                                        c = s.next()
                                    ) {
                                        var h = c.value,
                                            u = this.notations[h];
                                        !u.renderChild && u.renderer(this, o);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (r = s.return) && r.call(s);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            }),
                            (e.prototype.arrow = function (t, e, r, o, n) {
                                void 0 === o && (o = ''), void 0 === n && (n = 0);
                                var i = this.getBBox(),
                                    a = i.w,
                                    s = (t - a) / 2,
                                    l = (i.h - i.d) / 2,
                                    h = this.thickness,
                                    u = h / 2,
                                    p = c(
                                        [
                                            h * this.arrowhead.x,
                                            h * this.arrowhead.y,
                                            h * this.arrowhead.dx,
                                        ],
                                        3,
                                    ),
                                    d = p[0],
                                    f = p[1],
                                    y = p[2],
                                    m = r
                                        ? this.fill(
                                              'M',
                                              a + s,
                                              l,
                                              'l',
                                              -(d + y),
                                              f,
                                              'l',
                                              y,
                                              u - f,
                                              'L',
                                              d - s,
                                              l + u,
                                              'l',
                                              y,
                                              f - u,
                                              'l',
                                              -(d + y),
                                              -f,
                                              'l',
                                              d + y,
                                              -f,
                                              'l',
                                              -y,
                                              f - u,
                                              'L',
                                              a + s - d,
                                              l - u,
                                              'l',
                                              -y,
                                              u - f,
                                              'Z',
                                          )
                                        : this.fill(
                                              'M',
                                              a + s,
                                              l,
                                              'l',
                                              -(d + y),
                                              f,
                                              'l',
                                              y,
                                              u - f,
                                              'L',
                                              -s,
                                              l + u,
                                              'l',
                                              0,
                                              -h,
                                              'L',
                                              a + s - d,
                                              l - u,
                                              'l',
                                              -y,
                                              u - f,
                                              'Z',
                                          ),
                                    v = [];
                                if (
                                    (n &&
                                        v.push(
                                            'X' === o
                                                ? 'translate('.concat(this.fixed(-n), ' 0)')
                                                : 'translate(0 '.concat(this.fixed(n), ')'),
                                        ),
                                    e)
                                ) {
                                    var g = this.jax.fixed((180 * -e) / Math.PI);
                                    v.push(
                                        'rotate('
                                            .concat(g, ' ')
                                            .concat(this.fixed(a / 2), ' ')
                                            .concat(this.fixed(l), ')'),
                                    );
                                }
                                return (
                                    v.length &&
                                        this.adaptor.setAttribute(m, 'transform', v.join(' ')),
                                    m
                                );
                            }),
                            (e.prototype.line = function (t) {
                                var e = c(t, 4),
                                    r = e[0],
                                    o = e[1],
                                    n = e[2],
                                    i = e[3];
                                return this.svg('line', {
                                    x1: this.fixed(r),
                                    y1: this.fixed(o),
                                    x2: this.fixed(n),
                                    y2: this.fixed(i),
                                    'stroke-width': this.fixed(this.thickness),
                                });
                            }),
                            (e.prototype.box = function (t, e, r, o) {
                                void 0 === o && (o = 0);
                                var n = this.thickness,
                                    i = {
                                        x: this.fixed(n / 2),
                                        y: this.fixed(n / 2 - r),
                                        width: this.fixed(t - n),
                                        height: this.fixed(e + r - n),
                                        fill: 'none',
                                        'stroke-width': this.fixed(n),
                                    };
                                return o && (i.rx = this.fixed(o)), this.svg('rect', i);
                            }),
                            (e.prototype.ellipse = function (t, e, r) {
                                var o = this.thickness;
                                return this.svg('ellipse', {
                                    rx: this.fixed((t - o) / 2),
                                    ry: this.fixed((e + r - o) / 2),
                                    cx: this.fixed(t / 2),
                                    cy: this.fixed((e - r) / 2),
                                    fill: 'none',
                                    'stroke-width': this.fixed(o),
                                });
                            }),
                            (e.prototype.path = function (t) {
                                for (var e = this, r = [], o = 1; o < arguments.length; o++)
                                    r[o - 1] = arguments[o];
                                return this.svg('path', {
                                    d: r
                                        .map(function (t) {
                                            return 'string' == typeof t ? t : e.fixed(t);
                                        })
                                        .join(' '),
                                    style: { 'stroke-width': this.fixed(this.thickness) },
                                    'stroke-linecap': 'round',
                                    'stroke-linejoin': t,
                                    fill: 'none',
                                });
                            }),
                            (e.prototype.fill = function () {
                                for (var t = this, e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                return this.svg('path', {
                                    d: e
                                        .map(function (e) {
                                            return 'string' == typeof e ? e : t.fixed(e);
                                        })
                                        .join(' '),
                                });
                            }),
                            (e.kind = d.MmlMenclose.prototype.kind),
                            (e.notations = new Map([
                                p.Border('top'),
                                p.Border('right'),
                                p.Border('bottom'),
                                p.Border('left'),
                                p.Border2('actuarial', 'top', 'right'),
                                p.Border2('madruwb', 'bottom', 'right'),
                                p.DiagonalStrike('up'),
                                p.DiagonalStrike('down'),
                                [
                                    'horizontalstrike',
                                    {
                                        renderer: p.RenderLine('horizontal', 'Y'),
                                        bbox: function (t) {
                                            return [0, t.padding, 0, t.padding];
                                        },
                                    },
                                ],
                                [
                                    'verticalstrike',
                                    {
                                        renderer: p.RenderLine('vertical', 'X'),
                                        bbox: function (t) {
                                            return [t.padding, 0, t.padding, 0];
                                        },
                                    },
                                ],
                                [
                                    'box',
                                    {
                                        renderer: function (t, e) {
                                            var r = t.getBBox(),
                                                o = r.w,
                                                n = r.h,
                                                i = r.d;
                                            t.adaptor.append(t.element, t.box(o, n, i));
                                        },
                                        bbox: p.fullBBox,
                                        border: p.fullBorder,
                                        remove: 'left right top bottom',
                                    },
                                ],
                                [
                                    'roundedbox',
                                    {
                                        renderer: function (t, e) {
                                            var r = t.getBBox(),
                                                o = r.w,
                                                n = r.h,
                                                i = r.d,
                                                a = t.thickness + t.padding;
                                            t.adaptor.append(t.element, t.box(o, n, i, a));
                                        },
                                        bbox: p.fullBBox,
                                    },
                                ],
                                [
                                    'circle',
                                    {
                                        renderer: function (t, e) {
                                            var r = t.getBBox(),
                                                o = r.w,
                                                n = r.h,
                                                i = r.d;
                                            t.adaptor.append(t.element, t.ellipse(o, n, i));
                                        },
                                        bbox: p.fullBBox,
                                    },
                                ],
                                [
                                    'phasorangle',
                                    {
                                        renderer: function (t, e) {
                                            var r = t.getBBox(),
                                                o = r.w,
                                                n = r.h,
                                                i = r.d,
                                                a = t.getArgMod(1.75 * t.padding, n + i)[0],
                                                s = t.thickness / 2,
                                                l = n + i,
                                                c = Math.cos(a);
                                            t.adaptor.append(
                                                t.element,
                                                t.path(
                                                    'mitre',
                                                    'M',
                                                    o,
                                                    s - i,
                                                    'L',
                                                    s + c * s,
                                                    s - i,
                                                    'L',
                                                    c * l + s,
                                                    l - i - s,
                                                ),
                                            );
                                        },
                                        bbox: function (t) {
                                            var e = t.padding / 2,
                                                r = t.thickness;
                                            return [2 * e, e, e + r, 3 * e + r];
                                        },
                                        border: function (t) {
                                            return [0, 0, t.thickness, 0];
                                        },
                                        remove: 'bottom',
                                    },
                                ],
                                p.Arrow('up'),
                                p.Arrow('down'),
                                p.Arrow('left'),
                                p.Arrow('right'),
                                p.Arrow('updown'),
                                p.Arrow('leftright'),
                                p.DiagonalArrow('updiagonal'),
                                p.DiagonalArrow('northeast'),
                                p.DiagonalArrow('southeast'),
                                p.DiagonalArrow('northwest'),
                                p.DiagonalArrow('southwest'),
                                p.DiagonalArrow('northeastsouthwest'),
                                p.DiagonalArrow('northwestsoutheast'),
                                [
                                    'longdiv',
                                    {
                                        renderer: function (t, e) {
                                            var r = t.getBBox(),
                                                o = r.w,
                                                n = r.h,
                                                i = r.d,
                                                a = t.thickness / 2,
                                                s = t.padding;
                                            t.adaptor.append(
                                                t.element,
                                                t.path(
                                                    'round',
                                                    'M',
                                                    a,
                                                    a - i,
                                                    'a',
                                                    s - a / 2,
                                                    (n + i) / 2 - 4 * a,
                                                    0,
                                                    '0,1',
                                                    0,
                                                    n + i - 2 * a,
                                                    'L',
                                                    o - a,
                                                    n - a,
                                                ),
                                            );
                                        },
                                        bbox: function (t) {
                                            var e = t.padding,
                                                r = t.thickness;
                                            return [e + r, e, e, 2 * e + r / 2];
                                        },
                                    },
                                ],
                                [
                                    'radical',
                                    {
                                        renderer: function (t, e) {
                                            t.msqrt.toSVG(e);
                                            var r = t.sqrtTRBL()[3];
                                            t.place(-r, 0, e);
                                        },
                                        init: function (t) {
                                            t.msqrt = t.createMsqrt(t.childNodes[0]);
                                        },
                                        bbox: function (t) {
                                            return t.sqrtTRBL();
                                        },
                                        renderChild: !0,
                                    },
                                ],
                            ])),
                            e
                        );
                    })((0, u.CommonMencloseMixin)(h.SVGWrapper));
                e.SVGmenclose = f;
            },
            3007: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmerror = void 0);
                var i = r(9321),
                    a = r(8078),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.standardSVGnode(t),
                                    r = this.getBBox(),
                                    o = r.h,
                                    n = r.d,
                                    i = r.w;
                                this.adaptor.append(
                                    this.element,
                                    this.svg('rect', {
                                        'data-background': !0,
                                        width: this.fixed(i),
                                        height: this.fixed(o + n),
                                        y: this.fixed(-n),
                                    }),
                                );
                                var a = this.node.attributes.get('title');
                                a &&
                                    this.adaptor.append(
                                        this.element,
                                        this.svg('title', {}, [this.adaptor.text(a)]),
                                    ),
                                    this.addChildren(e);
                            }),
                            (e.kind = a.MmlMerror.prototype.kind),
                            (e.styles = {
                                'g[data-mml-node="merror"] > g': { fill: 'red', stroke: 'red' },
                                'g[data-mml-node="merror"] > rect[data-background]': {
                                    fill: 'yellow',
                                    stroke: 'none',
                                },
                            }),
                            e
                        );
                    })(i.SVGWrapper);
                e.SVGmerror = s;
            },
            5258: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmfenced = void 0);
                var a = r(9321),
                    s = r(1346),
                    l = r(7451),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.standardSVGnode(t);
                                this.setChildrenParent(this.mrow),
                                    this.mrow.toSVG(e),
                                    this.setChildrenParent(this);
                            }),
                            (e.prototype.setChildrenParent = function (t) {
                                var e, r;
                                try {
                                    for (
                                        var o = i(this.childNodes), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        n.value.parent = t;
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        n && !n.done && (r = o.return) && r.call(o);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            }),
                            (e.kind = l.MmlMfenced.prototype.kind),
                            e
                        );
                    })((0, s.CommonMfencedMixin)(a.SVGWrapper));
                e.SVGmfenced = c;
            },
            9295: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmfrac = void 0);
                var a = r(9321),
                    s = r(5705),
                    l = r(848),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                this.standardSVGnode(t);
                                var e = this.node.attributes.getList('linethickness', 'bevelled'),
                                    r = e.linethickness,
                                    o = e.bevelled,
                                    n = this.isDisplay();
                                if (o) this.makeBevelled(n);
                                else {
                                    var i = this.length2em(String(r), 0.06);
                                    0 === i ? this.makeAtop(n) : this.makeFraction(n, i);
                                }
                            }),
                            (e.prototype.makeFraction = function (t, e) {
                                var r = this.element,
                                    o = this.node.attributes.getList('numalign', 'denomalign'),
                                    n = o.numalign,
                                    a = o.denomalign,
                                    s = i(this.childNodes, 2),
                                    l = s[0],
                                    c = s[1],
                                    h = l.getOuterBBox(),
                                    u = c.getOuterBBox(),
                                    p = this.font.params,
                                    d = p.axis_height,
                                    f = this.node.getProperty('withDelims')
                                        ? 0
                                        : p.nulldelimiterspace,
                                    y = Math.max(
                                        (h.L + h.w + h.R) * h.rscale,
                                        (u.L + u.w + u.R) * u.rscale,
                                    ),
                                    m = this.getAlignX(y, h, n) + 0.1 + f,
                                    v = this.getAlignX(y, u, a) + 0.1 + f,
                                    g = this.getTUV(t, e),
                                    b = g.T,
                                    x = g.u,
                                    _ = g.v;
                                l.toSVG(r),
                                    l.place(m, d + b + Math.max(h.d * h.rscale, x)),
                                    c.toSVG(r),
                                    c.place(v, d - b - Math.max(u.h * u.rscale, _)),
                                    this.adaptor.append(
                                        r,
                                        this.svg('rect', {
                                            width: this.fixed(y + 0.2),
                                            height: this.fixed(e),
                                            x: this.fixed(f),
                                            y: this.fixed(d - e / 2),
                                        }),
                                    );
                            }),
                            (e.prototype.makeAtop = function (t) {
                                var e = this.element,
                                    r = this.node.attributes.getList('numalign', 'denomalign'),
                                    o = r.numalign,
                                    n = r.denomalign,
                                    a = i(this.childNodes, 2),
                                    s = a[0],
                                    l = a[1],
                                    c = s.getOuterBBox(),
                                    h = l.getOuterBBox(),
                                    u = this.font.params,
                                    p = this.node.getProperty('withDelims')
                                        ? 0
                                        : u.nulldelimiterspace,
                                    d = Math.max(
                                        (c.L + c.w + c.R) * c.rscale,
                                        (h.L + h.w + h.R) * h.rscale,
                                    ),
                                    f = this.getAlignX(d, c, o) + p,
                                    y = this.getAlignX(d, h, n) + p,
                                    m = this.getUVQ(t),
                                    v = m.u,
                                    g = m.v;
                                s.toSVG(e), s.place(f, v), l.toSVG(e), l.place(y, -g);
                            }),
                            (e.prototype.makeBevelled = function (t) {
                                var e = this.element,
                                    r = i(this.childNodes, 2),
                                    o = r[0],
                                    n = r[1],
                                    a = this.getBevelData(t),
                                    s = a.u,
                                    l = a.v,
                                    c = a.delta,
                                    h = a.nbox,
                                    u = a.dbox,
                                    p = (h.L + h.w + h.R) * h.rscale;
                                o.toSVG(e),
                                    this.bevel.toSVG(e),
                                    n.toSVG(e),
                                    o.place(h.L * h.rscale, s),
                                    this.bevel.place(p - c / 2, 0),
                                    n.place(
                                        p + this.bevel.getOuterBBox().w + u.L * u.rscale - c,
                                        l,
                                    );
                            }),
                            (e.kind = l.MmlMfrac.prototype.kind),
                            e
                        );
                    })((0, s.CommonMfracMixin)(a.SVGWrapper));
                e.SVGmfrac = c;
            },
            4916: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmglyph = void 0);
                var i = r(9321),
                    a = r(7969),
                    s = r(910),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.standardSVGnode(t);
                                if (this.charWrapper) this.charWrapper.toSVG(e);
                                else {
                                    var r = this.node.attributes.getList('src', 'alt'),
                                        o = r.src,
                                        n = r.alt,
                                        i = this.fixed(this.height),
                                        a = {
                                            width: this.fixed(this.width),
                                            height: i,
                                            transform:
                                                'translate(0 ' +
                                                this.fixed(this.height + (this.valign || 0)) +
                                                ') matrix(1 0 0 -1 0 0)',
                                            preserveAspectRatio: 'none',
                                            'aria-label': n,
                                            href: o,
                                        },
                                        s = this.svg('image', a);
                                    this.adaptor.append(e, s);
                                }
                            }),
                            (e.kind = s.MmlMglyph.prototype.kind),
                            e
                        );
                    })((0, a.CommonMglyphMixin)(i.SVGWrapper));
                e.SVGmglyph = l;
            },
            2983: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmi = void 0);
                var i = r(9321),
                    a = r(1419),
                    s = r(7754),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return n(e, t), (e.kind = s.MmlMi.prototype.kind), e;
                    })((0, a.CommonMiMixin)(i.SVGWrapper));
                e.SVGmi = l;
            },
            4750: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SVGmmultiscripts = e.AlignX = void 0);
                var a = r(7522),
                    s = r(9906),
                    l = r(7764),
                    c = r(6720);
                function h(t) {
                    return (
                        {
                            left: function (t, e) {
                                return 0;
                            },
                            center: function (t, e) {
                                return (e - t) / 2;
                            },
                            right: function (t, e) {
                                return e - t;
                            },
                        }[t] ||
                        function (t, e) {
                            return 0;
                        }
                    );
                }
                e.AlignX = h;
                var u = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.toSVG = function (t) {
                            var e = this.standardSVGnode(t),
                                r = this.scriptData,
                                o = this.node.getProperty('scriptalign') || 'right left',
                                n = i((0, c.split)(o + ' ' + o), 2),
                                a = n[0],
                                s = n[1],
                                l = this.combinePrePost(r.sub, r.psub),
                                h = this.combinePrePost(r.sup, r.psup),
                                u = i(this.getUVQ(l, h), 2),
                                p = u[0],
                                d = u[1],
                                f = 0;
                            r.numPrescripts &&
                                (f = this.addScripts(
                                    0.05,
                                    p,
                                    d,
                                    this.firstPrescript,
                                    r.numPrescripts,
                                    a,
                                ));
                            var y = this.baseChild;
                            y.toSVG(e),
                                y.place(f, 0),
                                (f += y.getOuterBBox().w),
                                r.numScripts && this.addScripts(f, p, d, 1, r.numScripts, s);
                        }),
                        (e.prototype.addScripts = function (t, e, r, o, n, a) {
                            var s = this.adaptor,
                                l = h(a),
                                c = s.append(this.element, this.svg('g')),
                                u = s.append(this.element, this.svg('g'));
                            this.place(t, e, c), this.place(t, r, u);
                            for (var p = o + 2 * n, d = 0; o < p; ) {
                                var f = i([this.childNodes[o++], this.childNodes[o++]], 2),
                                    y = f[0],
                                    m = f[1],
                                    v = i([y.getOuterBBox(), m.getOuterBBox()], 2),
                                    g = v[0],
                                    b = v[1],
                                    x = i([g.rscale, b.rscale], 2),
                                    _ = x[0],
                                    M = x[1],
                                    w = Math.max(g.w * _, b.w * M);
                                y.toSVG(u),
                                    m.toSVG(c),
                                    y.place(d + l(g.w * _, w), 0),
                                    m.place(d + l(b.w * M, w), 0),
                                    (d += w);
                            }
                            return t + d;
                        }),
                        (e.kind = l.MmlMmultiscripts.prototype.kind),
                        e
                    );
                })((0, s.CommonMmultiscriptsMixin)(a.SVGmsubsup));
                e.SVGmmultiscripts = u;
            },
            9810: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmn = void 0);
                var i = r(9321),
                    a = r(2304),
                    s = r(3235),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return n(e, t), (e.kind = s.MmlMn.prototype.kind), e;
                    })((0, a.CommonMnMixin)(i.SVGWrapper));
                e.SVGmn = l;
            },
            6760: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                o = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmo = void 0);
                var s = r(9321),
                    l = r(437),
                    c = r(9946),
                    h = 0.1,
                    u = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.node.attributes,
                                    r = e.get('symmetric') && 2 !== this.stretch.dir,
                                    o = 0 !== this.stretch.dir;
                                o && null === this.size && this.getStretchedVariant([]);
                                var n = this.standardSVGnode(t);
                                if (o && this.size < 0) this.stretchSVG();
                                else {
                                    var i =
                                            r || e.get('largeop')
                                                ? this.fixed(this.getCenterOffset())
                                                : '0',
                                        a = this.node.getProperty('mathaccent')
                                            ? this.fixed(this.getAccentOffset())
                                            : '0';
                                    ('0' === i && '0' === a) ||
                                        this.adaptor.setAttribute(
                                            n,
                                            'transform',
                                            'translate('.concat(a, ' ').concat(i, ')'),
                                        ),
                                        this.addChildren(n);
                                }
                            }),
                            (e.prototype.stretchSVG = function () {
                                var t = this.stretch.stretch,
                                    e = this.getStretchVariants(),
                                    r = this.getBBox();
                                1 === this.stretch.dir
                                    ? this.stretchVertical(t, e, r)
                                    : this.stretchHorizontal(t, e, r);
                            }),
                            (e.prototype.getStretchVariants = function () {
                                var t,
                                    e,
                                    r = this.stretch.c || this.getText().codePointAt(0),
                                    o = [];
                                try {
                                    for (
                                        var n = i(this.stretch.stretch.keys()), a = n.next();
                                        !a.done;
                                        a = n.next()
                                    ) {
                                        var s = a.value;
                                        o[s] = this.font.getStretchVariant(r, s);
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        a && !a.done && (e = n.return) && e.call(n);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                                return o;
                            }),
                            (e.prototype.stretchVertical = function (t, e, r) {
                                var o = r.h,
                                    n = r.d,
                                    i = r.w,
                                    s = this.addTop(t[0], e[0], o, i),
                                    l = this.addBot(t[2], e[2], n, i);
                                if (4 === t.length) {
                                    var c = a(this.addMidV(t[3], e[3], i), 2),
                                        h = c[0],
                                        u = c[1];
                                    this.addExtV(t[1], e[1], o, 0, s, h, i),
                                        this.addExtV(t[1], e[1], 0, n, u, l, i);
                                } else this.addExtV(t[1], e[1], o, n, s, l, i);
                            }),
                            (e.prototype.stretchHorizontal = function (t, e, r) {
                                var o = r.w,
                                    n = this.addLeft(t[0], e[0]),
                                    i = this.addRight(t[2], e[2], o);
                                if (4 === t.length) {
                                    var s = a(this.addMidH(t[3], e[3], o), 2),
                                        l = s[0],
                                        c = s[1],
                                        h = o / 2;
                                    this.addExtH(t[1], e[1], h, n, h - l),
                                        this.addExtH(t[1], e[1], h, c - h, i, h);
                                } else this.addExtH(t[1], e[1], o, n, i);
                            }),
                            (e.prototype.getChar = function (t, e) {
                                var r = this.font.getChar(e, t) || [0, 0, 0, null];
                                return [r[0], r[1], r[2], r[3] || {}];
                            }),
                            (e.prototype.addGlyph = function (t, e, r, o, n) {
                                return (
                                    void 0 === n && (n = null),
                                    this.placeChar(t, r, o, n || this.element, e)
                                );
                            }),
                            (e.prototype.addTop = function (t, e, r, o) {
                                if (!t) return 0;
                                var n = a(this.getChar(t, e), 3),
                                    i = n[0],
                                    s = n[1],
                                    l = n[2];
                                return this.addGlyph(t, e, (o - l) / 2, r - i), i + s;
                            }),
                            (e.prototype.addExtV = function (t, e, r, o, n, i, s) {
                                var l = this;
                                if (t) {
                                    (n = Math.max(0, n - h)), (i = Math.max(0, i - h));
                                    var c = this.adaptor,
                                        u = a(this.getChar(t, e), 3),
                                        p = u[0],
                                        d = u[1],
                                        f = u[2],
                                        y = r + o - n - i,
                                        m = (1.5 * y) / (p + d),
                                        v = (m * (p - d) - y) / 2;
                                    if (!(y <= 0)) {
                                        var g = this.svg('svg', {
                                            width: this.fixed(f),
                                            height: this.fixed(y),
                                            y: this.fixed(i - o),
                                            x: this.fixed((s - f) / 2),
                                            viewBox: [0, v, f, y]
                                                .map(function (t) {
                                                    return l.fixed(t);
                                                })
                                                .join(' '),
                                        });
                                        this.addGlyph(t, e, 0, 0, g);
                                        var b = c.lastChild(g);
                                        c.setAttribute(
                                            b,
                                            'transform',
                                            'scale(1,'.concat(this.jax.fixed(m), ')'),
                                        ),
                                            c.append(this.element, g);
                                    }
                                }
                            }),
                            (e.prototype.addBot = function (t, e, r, o) {
                                if (!t) return 0;
                                var n = a(this.getChar(t, e), 3),
                                    i = n[0],
                                    s = n[1],
                                    l = n[2];
                                return this.addGlyph(t, e, (o - l) / 2, s - r), i + s;
                            }),
                            (e.prototype.addMidV = function (t, e, r) {
                                if (!t) return [0, 0];
                                var o = a(this.getChar(t, e), 3),
                                    n = o[0],
                                    i = o[1],
                                    s = o[2],
                                    l = (i - n) / 2 + this.font.params.axis_height;
                                return this.addGlyph(t, e, (r - s) / 2, l), [n + l, i - l];
                            }),
                            (e.prototype.addLeft = function (t, e) {
                                return t ? this.addGlyph(t, e, 0, 0) : 0;
                            }),
                            (e.prototype.addExtH = function (t, e, r, o, n, i) {
                                var s = this;
                                if ((void 0 === i && (i = 0), t)) {
                                    (n = Math.max(0, n - 0.1)), (o = Math.max(0, o - 0.1));
                                    var l = this.adaptor,
                                        c = a(this.getChar(t, e), 3),
                                        u = c[0],
                                        p = c[1],
                                        d = c[2],
                                        f = r - o - n,
                                        y = u + p + 0.2,
                                        m = (f / d) * 1.5,
                                        v = -(p + h);
                                    if (!(f <= 0)) {
                                        var g = this.svg('svg', {
                                            width: this.fixed(f),
                                            height: this.fixed(y),
                                            x: this.fixed(i + o),
                                            y: this.fixed(v),
                                            viewBox: [(m * d - f) / 2, v, f, y]
                                                .map(function (t) {
                                                    return s.fixed(t);
                                                })
                                                .join(' '),
                                        });
                                        this.addGlyph(t, e, 0, 0, g);
                                        var b = l.lastChild(g);
                                        l.setAttribute(
                                            b,
                                            'transform',
                                            'scale(' + this.jax.fixed(m) + ',1)',
                                        ),
                                            l.append(this.element, g);
                                    }
                                }
                            }),
                            (e.prototype.addRight = function (t, e, r) {
                                if (!t) return 0;
                                var o = this.getChar(t, e)[2];
                                return this.addGlyph(t, e, r - o, 0);
                            }),
                            (e.prototype.addMidH = function (t, e, r) {
                                if (!t) return [0, 0];
                                var o = this.getChar(t, e)[2];
                                return (
                                    this.addGlyph(t, e, (r - o) / 2, 0), [(r - o) / 2, (r + o) / 2]
                                );
                            }),
                            (e.kind = c.MmlMo.prototype.kind),
                            e
                        );
                    })((0, l.CommonMoMixin)(s.SVGWrapper));
                e.SVGmo = u;
            },
            4539: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmpadded = void 0);
                var a = r(9321),
                    s = r(7481),
                    l = r(189),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.standardSVGnode(t),
                                    r = i(this.getDimens(), 9),
                                    o = r[5],
                                    n = r[6],
                                    a = r[7],
                                    s = r[8],
                                    l = this.node.attributes.get('data-align') || 'left',
                                    c =
                                        n +
                                        s -
                                        (o < 0 && 'left' !== l ? ('center' === l ? o / 2 : o) : 0);
                                (c || a) &&
                                    ((e = this.adaptor.append(e, this.svg('g'))),
                                    this.place(c, a, e)),
                                    this.addChildren(e);
                            }),
                            (e.kind = l.MmlMpadded.prototype.kind),
                            e
                        );
                    })((0, s.CommonMpaddedMixin)(a.SVGWrapper));
                e.SVGmpadded = c;
            },
            438: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmphantom = void 0);
                var i = r(9321),
                    a = r(7988),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                this.standardSVGnode(t);
                            }),
                            (e.kind = a.MmlMphantom.prototype.kind),
                            e
                        );
                    })(i.SVGWrapper);
                e.SVGmphantom = s;
            },
            8798: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmroot = void 0);
                var a = r(9948),
                    s = r(5997),
                    l = r(4664),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.addRoot = function (t, e, r, o) {
                                e.toSVG(t);
                                var n = i(this.getRootDimens(r, o), 3),
                                    a = n[0],
                                    s = n[1],
                                    l = n[2],
                                    c = e.getOuterBBox();
                                e.place(l * c.rscale, s), (this.dx = a);
                            }),
                            (e.kind = l.MmlMroot.prototype.kind),
                            e
                        );
                    })((0, s.CommonMrootMixin)(a.SVGmsqrt));
                e.SVGmroot = c;
            },
            322: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SVGinferredMrow = e.SVGmrow = void 0);
                var i = r(9321),
                    a = r(9323),
                    s = r(9323),
                    l = r(1691),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.node.isInferred
                                    ? (this.element = t)
                                    : this.standardSVGnode(t);
                                this.addChildren(e);
                            }),
                            (e.kind = l.MmlMrow.prototype.kind),
                            e
                        );
                    })((0, a.CommonMrowMixin)(i.SVGWrapper));
                e.SVGmrow = c;
                var h = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return n(e, t), (e.kind = l.MmlInferredMrow.prototype.kind), e;
                })((0, s.CommonInferredMrowMixin)(c));
                e.SVGinferredMrow = h;
            },
            3677: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGms = void 0);
                var i = r(9321),
                    a = r(6920),
                    s = r(4042),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return n(e, t), (e.kind = s.MmlMs.prototype.kind), e;
                    })((0, a.CommonMsMixin)(i.SVGWrapper));
                e.SVGms = l;
            },
            2458: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmspace = void 0);
                var i = r(9321),
                    a = r(37),
                    s = r(1465),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return n(e, t), (e.kind = s.MmlMspace.prototype.kind), e;
                    })((0, a.CommonMspaceMixin)(i.SVGWrapper));
                e.SVGmspace = l;
            },
            9948: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmsqrt = void 0);
                var i = r(9321),
                    a = r(222),
                    s = r(4655),
                    l = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.dx = 0), e;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.childNodes[this.surd],
                                    r = this.childNodes[this.base],
                                    o = this.root ? this.childNodes[this.root] : null,
                                    n = e.getBBox(),
                                    i = r.getOuterBBox(),
                                    a = this.getPQ(n)[1],
                                    s = this.font.params.rule_thickness * this.bbox.scale,
                                    l = i.h + a + s,
                                    c = this.standardSVGnode(t),
                                    h = this.adaptor.append(c, this.svg('g'));
                                this.addRoot(c, o, n, l),
                                    e.toSVG(c),
                                    e.place(this.dx, l - n.h),
                                    r.toSVG(h),
                                    r.place(this.dx + n.w, 0),
                                    this.adaptor.append(
                                        c,
                                        this.svg('rect', {
                                            width: this.fixed(i.w),
                                            height: this.fixed(s),
                                            x: this.fixed(this.dx + n.w),
                                            y: this.fixed(l - s),
                                        }),
                                    );
                            }),
                            (e.prototype.addRoot = function (t, e, r, o) {}),
                            (e.kind = s.MmlMsqrt.prototype.kind),
                            e
                        );
                    })((0, a.CommonMsqrtMixin)(i.SVGWrapper));
                e.SVGmsqrt = l;
            },
            7522: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SVGmsubsup = e.SVGmsup = e.SVGmsub = void 0);
                var a = r(1269),
                    s = r(3069),
                    l = r(3069),
                    c = r(3069),
                    h = r(5857),
                    u = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return n(e, t), (e.kind = h.MmlMsub.prototype.kind), e;
                    })((0, s.CommonMsubMixin)(a.SVGscriptbase));
                e.SVGmsub = u;
                var p = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return n(e, t), (e.kind = h.MmlMsup.prototype.kind), e;
                })((0, l.CommonMsupMixin)(a.SVGscriptbase));
                e.SVGmsup = p;
                var d = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.toSVG = function (t) {
                            var e = this.standardSVGnode(t),
                                r = i([this.baseChild, this.supChild, this.subChild], 3),
                                o = r[0],
                                n = r[1],
                                a = r[2],
                                s = this.getBaseWidth(),
                                l = this.getAdjustedIc(),
                                c = i(this.getUVQ(), 2),
                                h = c[0],
                                u = c[1];
                            o.toSVG(e), n.toSVG(e), a.toSVG(e), a.place(s, u), n.place(s + l, h);
                        }),
                        (e.kind = h.MmlMsubsup.prototype.kind),
                        e
                    );
                })((0, c.CommonMsubsupMixin)(a.SVGscriptbase));
                e.SVGmsubsup = d;
            },
            451: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmtable = void 0);
                var s = r(9321),
                    l = r(8589),
                    c = r(4859),
                    h = (function (t) {
                        function e(e, r, o) {
                            void 0 === o && (o = null);
                            var n = t.call(this, e, r, o) || this,
                                i = { 'data-labels': !0 };
                            return (
                                n.isTop && (i.transform = 'matrix(1 0 0 -1 0 0)'),
                                (n.labels = n.svg('g', i)),
                                n
                            );
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.standardSVGnode(t);
                                this.placeRows(e),
                                    this.handleColumnLines(e),
                                    this.handleRowLines(e),
                                    this.handleFrame(e);
                                var r = this.handlePWidth(e);
                                this.handleLabels(e, t, r);
                            }),
                            (e.prototype.placeRows = function (t) {
                                for (
                                    var e,
                                        r,
                                        o,
                                        n = this.node.attributes.get('equalrows'),
                                        s = this.getTableData(),
                                        l = s.H,
                                        c = s.D,
                                        h = this.getEqualRowHeight(),
                                        u = this.getRowHalfSpacing(),
                                        p = a(
                                            a([this.fLine], i(this.rLines), !1),
                                            [this.fLine],
                                            !1,
                                        ),
                                        d = this.getBBox().h - p[0],
                                        f = 0;
                                    f < this.numRows;
                                    f++
                                ) {
                                    var y = this.childNodes[f];
                                    (e = i(this.getRowHD(n, h, l[f], c[f]), 2)),
                                        (y.H = e[0]),
                                        (y.D = e[1]),
                                        (r = i([u[f], u[f + 1]], 2)),
                                        (y.tSpace = r[0]),
                                        (y.bSpace = r[1]),
                                        (o = i([p[f], p[f + 1]], 2)),
                                        (y.tLine = o[0]),
                                        (y.bLine = o[1]),
                                        y.toSVG(t),
                                        y.place(0, d - u[f] - y.H),
                                        (d -= u[f] + y.H + y.D + u[f + 1] + p[f + 1]);
                                }
                            }),
                            (e.prototype.getRowHD = function (t, e, r, o) {
                                return t ? [(e + r - o) / 2, (e - r + o) / 2] : [r, o];
                            }),
                            (e.prototype.handleColor = function () {
                                t.prototype.handleColor.call(this);
                                var e = this.firstChild();
                                e &&
                                    this.adaptor.setAttribute(
                                        e,
                                        'width',
                                        this.fixed(this.getWidth()),
                                    );
                            }),
                            (e.prototype.handleColumnLines = function (t) {
                                if ('none' !== this.node.attributes.get('columnlines')) {
                                    var e = this.getColumnAttributes('columnlines');
                                    if (e)
                                        for (
                                            var r = this.getColumnHalfSpacing(),
                                                o = this.cLines,
                                                n = this.getComputedWidths(),
                                                i = this.fLine,
                                                a = 0;
                                            a < e.length;
                                            a++
                                        )
                                            (i += r[a] + n[a] + r[a + 1]),
                                                'none' !== e[a] &&
                                                    this.adaptor.append(
                                                        t,
                                                        this.makeVLine(i, e[a], o[a]),
                                                    ),
                                                (i += o[a]);
                                }
                            }),
                            (e.prototype.handleRowLines = function (t) {
                                if ('none' !== this.node.attributes.get('rowlines')) {
                                    var e = this.getRowAttributes('rowlines');
                                    if (e)
                                        for (
                                            var r = this.node.attributes.get('equalrows'),
                                                o = this.getTableData(),
                                                n = o.H,
                                                a = o.D,
                                                s = this.getEqualRowHeight(),
                                                l = this.getRowHalfSpacing(),
                                                c = this.rLines,
                                                h = this.getBBox().h - this.fLine,
                                                u = 0;
                                            u < e.length;
                                            u++
                                        ) {
                                            var p = i(this.getRowHD(r, s, n[u], a[u]), 2),
                                                d = p[0],
                                                f = p[1];
                                            (h -= l[u] + d + f + l[u + 1]),
                                                'none' !== e[u] &&
                                                    this.adaptor.append(
                                                        t,
                                                        this.makeHLine(h, e[u], c[u]),
                                                    ),
                                                (h -= c[u]);
                                        }
                                }
                            }),
                            (e.prototype.handleFrame = function (t) {
                                if (this.frame && this.fLine) {
                                    var e = this.getBBox(),
                                        r = e.h,
                                        o = e.d,
                                        n = e.w,
                                        i = this.node.attributes.get('frame');
                                    this.adaptor.append(t, this.makeFrame(n, r, o, i));
                                }
                            }),
                            (e.prototype.handlePWidth = function (t) {
                                if (!this.pWidth) return 0;
                                var e = this.getBBox(),
                                    r = e.w,
                                    o = e.L,
                                    n = e.R,
                                    i = o + this.pWidth + n,
                                    a = this.getAlignShift()[0],
                                    s =
                                        Math.max(
                                            this.isTop ? i : 0,
                                            this.container.getWrapWidth(this.containerI),
                                        ) -
                                        o -
                                        n,
                                    l = r - (this.pWidth > s ? s : this.pWidth),
                                    c = 'left' === a ? 0 : 'right' === a ? l : l / 2;
                                if (c) {
                                    var h = this.svg('g', {}, this.adaptor.childNodes(t));
                                    this.place(c, 0, h), this.adaptor.append(t, h);
                                }
                                return c;
                            }),
                            (e.prototype.lineClass = function (t) {
                                return 'mjx-' + t;
                            }),
                            (e.prototype.makeFrame = function (t, e, r, o) {
                                var n = this.fLine;
                                return this.svg(
                                    'rect',
                                    this.setLineThickness(n, o, {
                                        'data-frame': !0,
                                        class: this.lineClass(o),
                                        width: this.fixed(t - n),
                                        height: this.fixed(e + r - n),
                                        x: this.fixed(n / 2),
                                        y: this.fixed(n / 2 - r),
                                    }),
                                );
                            }),
                            (e.prototype.makeVLine = function (t, e, r) {
                                var o = this.getBBox(),
                                    n = o.h,
                                    i = o.d,
                                    a = 'dotted' === e ? r / 2 : 0,
                                    s = this.fixed(t + r / 2);
                                return this.svg(
                                    'line',
                                    this.setLineThickness(r, e, {
                                        'data-line': 'v',
                                        class: this.lineClass(e),
                                        x1: s,
                                        y1: this.fixed(a - i),
                                        x2: s,
                                        y2: this.fixed(n - a),
                                    }),
                                );
                            }),
                            (e.prototype.makeHLine = function (t, e, r) {
                                var o = this.getBBox().w,
                                    n = 'dotted' === e ? r / 2 : 0,
                                    i = this.fixed(t - r / 2);
                                return this.svg(
                                    'line',
                                    this.setLineThickness(r, e, {
                                        'data-line': 'h',
                                        class: this.lineClass(e),
                                        x1: this.fixed(n),
                                        y1: i,
                                        x2: this.fixed(o - n),
                                        y2: i,
                                    }),
                                );
                            }),
                            (e.prototype.setLineThickness = function (t, e, r) {
                                return (
                                    0.07 !== t &&
                                        ((r['stroke-thickness'] = this.fixed(t)),
                                        'solid' !== e &&
                                            (r['stroke-dasharray'] =
                                                ('dotted' === e ? '0,' : '') + this.fixed(2 * t))),
                                    r
                                );
                            }),
                            (e.prototype.handleLabels = function (t, e, r) {
                                if (this.hasLabels) {
                                    var o = this.labels,
                                        n = this.node.attributes.get('side');
                                    this.spaceLabels(),
                                        this.isTop
                                            ? this.topTable(t, o, n)
                                            : this.subTable(t, o, n, r);
                                }
                            }),
                            (e.prototype.spaceLabels = function () {
                                for (
                                    var t = this.adaptor,
                                        e = this.getBBox().h,
                                        r = this.getTableData().L,
                                        o = this.getRowHalfSpacing(),
                                        n = e - this.fLine,
                                        i = t.firstChild(this.labels),
                                        a = 0;
                                    a < this.numRows;
                                    a++
                                ) {
                                    var s = this.childNodes[a];
                                    if (s.node.isKind('mlabeledtr')) {
                                        var l = s.childNodes[0];
                                        (n -= o[a] + s.H),
                                            s.placeCell(l, {
                                                x: 0,
                                                y: n,
                                                w: r,
                                                lSpace: 0,
                                                rSpace: 0,
                                                lLine: 0,
                                                rLine: 0,
                                            }),
                                            (n -= s.D + o[a + 1] + this.rLines[a]),
                                            (i = t.next(i));
                                    } else n -= o[a] + s.H + s.D + o[a + 1] + this.rLines[a];
                                }
                            }),
                            (e.prototype.topTable = function (t, e, r) {
                                var o = this.adaptor,
                                    n = this.getBBox(),
                                    a = n.h,
                                    s = n.d,
                                    l = n.w,
                                    c = n.L,
                                    h = n.R,
                                    u = c + (this.pWidth || l) + h,
                                    p = this.getTableData().L,
                                    d = i(this.getPadAlignShift(r), 3),
                                    f = d[1],
                                    y =
                                        d[2] +
                                        ('right' === f ? -u : 'center' === f ? -u / 2 : 0) +
                                        c,
                                    m = 'matrix(1 0 0 -1 0 0)',
                                    v = 'scale('.concat(
                                        this.jax.fixed(
                                            (1e3 * this.font.params.x_height) / this.metrics.ex,
                                            2,
                                        ),
                                        ')',
                                    ),
                                    g = 'translate(0 '
                                        .concat(this.fixed(a), ') ')
                                        .concat(m, ' ')
                                        .concat(v),
                                    b = this.svg(
                                        'svg',
                                        {
                                            'data-table': !0,
                                            preserveAspectRatio:
                                                'left' === f
                                                    ? 'xMinYMid'
                                                    : 'right' === f
                                                      ? 'xMaxYMid'
                                                      : 'xMidYMid',
                                            viewBox: [
                                                this.fixed(-y),
                                                this.fixed(-a),
                                                1,
                                                this.fixed(a + s),
                                            ].join(' '),
                                        },
                                        [this.svg('g', { transform: m }, o.childNodes(t))],
                                    );
                                (e = this.svg(
                                    'svg',
                                    {
                                        'data-labels': !0,
                                        preserveAspectRatio: 'left' === r ? 'xMinYMid' : 'xMaxYMid',
                                        viewBox: [
                                            'left' === r ? 0 : this.fixed(p),
                                            this.fixed(-a),
                                            1,
                                            this.fixed(a + s),
                                        ].join(' '),
                                    },
                                    [e],
                                )),
                                    o.append(t, this.svg('g', { transform: g }, [b, e])),
                                    this.place(-c, 0, t);
                            }),
                            (e.prototype.subTable = function (t, e, r, o) {
                                var n = this.adaptor,
                                    i = this.getBBox(),
                                    a = i.w,
                                    s = i.L,
                                    l = i.R,
                                    c = s + (this.pWidth || a) + l,
                                    h = this.getTableData().L,
                                    u = this.getAlignShift()[0],
                                    p = Math.max(c, this.container.getWrapWidth(this.containerI));
                                this.place(
                                    'left' === r
                                        ? ('left' === u
                                              ? 0
                                              : 'right' === u
                                                ? c - p + o
                                                : (c - p) / 2 + o) - s
                                        : ('left' === u
                                              ? p
                                              : 'right' === u
                                                ? c + o
                                                : (p + c) / 2 + o) -
                                              s -
                                              h,
                                    0,
                                    e,
                                ),
                                    n.append(t, e);
                            }),
                            (e.kind = c.MmlMtable.prototype.kind),
                            (e.styles = {
                                'g[data-mml-node="mtable"] > line[data-line], svg[data-table] > g > line[data-line]':
                                    { 'stroke-width': '70px', fill: 'none' },
                                'g[data-mml-node="mtable"] > rect[data-frame], svg[data-table] > g > rect[data-frame]':
                                    { 'stroke-width': '70px', fill: 'none' },
                                'g[data-mml-node="mtable"] > .mjx-dashed, svg[data-table] > g > .mjx-dashed':
                                    { 'stroke-dasharray': '140' },
                                'g[data-mml-node="mtable"] > .mjx-dotted, svg[data-table] > g > .mjx-dotted':
                                    { 'stroke-linecap': 'round', 'stroke-dasharray': '0,140' },
                                'g[data-mml-node="mtable"] > g > svg': { overflow: 'visible' },
                            }),
                            e
                        );
                    })((0, l.CommonMtableMixin)(s.SVGWrapper));
                e.SVGmtable = h;
            },
            2673: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmtd = void 0);
                var i = r(9321),
                    a = r(7805),
                    s = r(2321),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.placeCell = function (t, e, r, o, n) {
                                var i = this.getBBox(),
                                    a = Math.max(i.h, 0.75),
                                    s = Math.max(i.d, 0.25),
                                    l = this.node.attributes.get('columnalign'),
                                    c = this.node.attributes.get('rowalign'),
                                    h = this.getAlignX(r, i, l),
                                    u = this.getAlignY(o, n, a, s, c);
                                return this.place(t + h, e + u), [h, u];
                            }),
                            (e.prototype.placeColor = function (t, e, r, o) {
                                var n = this.adaptor,
                                    i = this.firstChild();
                                i &&
                                    'rect' === n.kind(i) &&
                                    n.getAttribute(i, 'data-bgcolor') &&
                                    (n.setAttribute(i, 'x', this.fixed(t)),
                                    n.setAttribute(i, 'y', this.fixed(e)),
                                    n.setAttribute(i, 'width', this.fixed(r)),
                                    n.setAttribute(i, 'height', this.fixed(o)));
                            }),
                            (e.kind = s.MmlMtd.prototype.kind),
                            e
                        );
                    })((0, a.CommonMtdMixin)(i.SVGWrapper));
                e.SVGmtd = l;
            },
            1941: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGmtext = void 0);
                var i = r(9321),
                    a = r(8325),
                    s = r(6277),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return n(e, t), (e.kind = s.MmlMtext.prototype.kind), e;
                    })((0, a.CommonMtextMixin)(i.SVGWrapper));
                e.SVGmtext = l;
            },
            4682: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, i = e.length; n < i; n++)
                                    (!o && n in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, n)),
                                        (o[n] = e[n]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SVGmlabeledtr = e.SVGmtr = void 0);
                var s = r(9321),
                    l = r(4818),
                    c = r(4818),
                    h = r(4393),
                    u = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.standardSVGnode(t);
                                this.placeCells(e), this.placeColor();
                            }),
                            (e.prototype.placeCells = function (t) {
                                for (
                                    var e = this.parent.getColumnHalfSpacing(),
                                        r = a(
                                            a([this.parent.fLine], i(this.parent.cLines), !1),
                                            [this.parent.fLine],
                                            !1,
                                        ),
                                        o = this.parent.getComputedWidths(),
                                        n = 1 / this.getBBox().rscale,
                                        s = r[0],
                                        l = 0;
                                    l < this.numCells;
                                    l++
                                ) {
                                    var c = this.getChild(l);
                                    c.toSVG(t),
                                        (s += this.placeCell(c, {
                                            x: s,
                                            y: 0,
                                            lSpace: e[l] * n,
                                            rSpace: e[l + 1] * n,
                                            w: o[l] * n,
                                            lLine: r[l] * n,
                                            rLine: r[l + 1] * n,
                                        }));
                                }
                            }),
                            (e.prototype.placeCell = function (t, e) {
                                var r = e.x,
                                    o = e.y,
                                    n = e.lSpace,
                                    a = e.w,
                                    s = e.rSpace,
                                    l = e.lLine,
                                    c = e.rLine,
                                    h = 1 / this.getBBox().rscale,
                                    u = i([this.H * h, this.D * h], 2),
                                    p = u[0],
                                    d = u[1],
                                    f = i([this.tSpace * h, this.bSpace * h], 2),
                                    y = f[0],
                                    m = f[1],
                                    v = i(t.placeCell(r + n, o, a, p, d), 2),
                                    g = v[0],
                                    b = v[1],
                                    x = n + a + s;
                                return (
                                    t.placeColor(
                                        -(g + n + l / 2),
                                        -(d + m + b),
                                        x + (l + c) / 2,
                                        p + d + y + m,
                                    ),
                                    x + c
                                );
                            }),
                            (e.prototype.placeColor = function () {
                                var t = 1 / this.getBBox().rscale,
                                    e = this.adaptor,
                                    r = this.firstChild();
                                if (
                                    r &&
                                    'rect' === e.kind(r) &&
                                    e.getAttribute(r, 'data-bgcolor')
                                ) {
                                    var o = i([(this.tLine / 2) * t, (this.bLine / 2) * t], 2),
                                        n = o[0],
                                        a = o[1],
                                        s = i([this.tSpace * t, this.bSpace * t], 2),
                                        l = s[0],
                                        c = s[1],
                                        h = i([this.H * t, this.D * t], 2),
                                        u = h[0],
                                        p = h[1];
                                    e.setAttribute(r, 'y', this.fixed(-(p + c + a))),
                                        e.setAttribute(
                                            r,
                                            'width',
                                            this.fixed(this.parent.getWidth() * t),
                                        ),
                                        e.setAttribute(
                                            r,
                                            'height',
                                            this.fixed(n + l + u + p + c + a),
                                        );
                                }
                            }),
                            (e.kind = h.MmlMtr.prototype.kind),
                            e
                        );
                    })((0, l.CommonMtrMixin)(s.SVGWrapper));
                e.SVGmtr = u;
                var p = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.toSVG = function (e) {
                            t.prototype.toSVG.call(this, e);
                            var r = this.childNodes[0];
                            r && r.toSVG(this.parent.labels);
                        }),
                        (e.kind = h.MmlMlabeledtr.prototype.kind),
                        e
                    );
                })((0, c.CommonMlabeledtrMixin)(u));
                e.SVGmlabeledtr = p;
            },
            4299: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SVGmunderover = e.SVGmover = e.SVGmunder = void 0);
                var a = r(7522),
                    s = r(9690),
                    l = r(9690),
                    c = r(9690),
                    h = r(3102),
                    u = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (e) {
                                if (this.hasMovableLimits()) t.prototype.toSVG.call(this, e);
                                else {
                                    var r = this.standardSVGnode(e),
                                        o = i([this.baseChild, this.scriptChild], 2),
                                        n = o[0],
                                        a = o[1],
                                        s = i([n.getOuterBBox(), a.getOuterBBox()], 2),
                                        l = s[0],
                                        c = s[1];
                                    n.toSVG(r), a.toSVG(r);
                                    var h = this.isLineBelow ? 0 : this.getDelta(!0),
                                        u = this.getUnderKV(l, c)[1],
                                        p = i(this.getDeltaW([l, c], [0, -h]), 2),
                                        d = p[0],
                                        f = p[1];
                                    n.place(d, 0), a.place(f, u);
                                }
                            }),
                            (e.kind = h.MmlMunder.prototype.kind),
                            e
                        );
                    })((0, s.CommonMunderMixin)(a.SVGmsub));
                e.SVGmunder = u;
                var p = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.toSVG = function (e) {
                            if (this.hasMovableLimits()) t.prototype.toSVG.call(this, e);
                            else {
                                var r = this.standardSVGnode(e),
                                    o = i([this.baseChild, this.scriptChild], 2),
                                    n = o[0],
                                    a = o[1],
                                    s = i([n.getOuterBBox(), a.getOuterBBox()], 2),
                                    l = s[0],
                                    c = s[1];
                                n.toSVG(r), a.toSVG(r);
                                var h = this.isLineAbove ? 0 : this.getDelta(),
                                    u = this.getOverKU(l, c)[1],
                                    p = i(this.getDeltaW([l, c], [0, h]), 2),
                                    d = p[0],
                                    f = p[1];
                                n.place(d, 0), a.place(f, u);
                            }
                        }),
                        (e.kind = h.MmlMover.prototype.kind),
                        e
                    );
                })((0, l.CommonMoverMixin)(a.SVGmsup));
                e.SVGmover = p;
                var d = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.toSVG = function (e) {
                            if (this.hasMovableLimits()) t.prototype.toSVG.call(this, e);
                            else {
                                var r = this.standardSVGnode(e),
                                    o = i([this.baseChild, this.overChild, this.underChild], 3),
                                    n = o[0],
                                    a = o[1],
                                    s = o[2],
                                    l = i(
                                        [n.getOuterBBox(), a.getOuterBBox(), s.getOuterBBox()],
                                        3,
                                    ),
                                    c = l[0],
                                    h = l[1],
                                    u = l[2];
                                n.toSVG(r), s.toSVG(r), a.toSVG(r);
                                var p = this.getDelta(),
                                    d = this.getOverKU(c, h)[1],
                                    f = this.getUnderKV(c, u)[1],
                                    y = i(
                                        this.getDeltaW(
                                            [c, u, h],
                                            [
                                                0,
                                                this.isLineBelow ? 0 : -p,
                                                this.isLineAbove ? 0 : p,
                                            ],
                                        ),
                                        3,
                                    ),
                                    m = y[0],
                                    v = y[1],
                                    g = y[2];
                                n.place(m, 0), s.place(v, f), a.place(g, d);
                            }
                        }),
                        (e.kind = h.MmlMunderover.prototype.kind),
                        e
                    );
                })((0, c.CommonMunderoverMixin)(a.SVGmsubsup));
                e.SVGmunderover = d;
            },
            1269: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var o,
                                n,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = i.next()).done; )
                                    a.push(o.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.SVGscriptbase = void 0);
                var a = r(9321),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.standardSVGnode(t),
                                    r = this.getBaseWidth(),
                                    o = i(this.getOffset(), 2),
                                    n = o[0],
                                    a = o[1];
                                this.baseChild.toSVG(e),
                                    this.scriptChild.toSVG(e),
                                    this.scriptChild.place(r + n, a);
                            }),
                            (e.kind = 'scriptbase'),
                            e
                        );
                    })((0, r(7091).CommonScriptbaseMixin)(a.SVGWrapper));
                e.SVGscriptbase = s;
            },
            6965: function (t, e, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SVGxml = e.SVGannotationXML = e.SVGannotation = e.SVGsemantics = void 0);
                var i = r(9321),
                    a = r(3191),
                    s = r(9167),
                    l = r(8921),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            n(e, t),
                            (e.prototype.toSVG = function (t) {
                                var e = this.standardSVGnode(t);
                                this.childNodes.length && this.childNodes[0].toSVG(e);
                            }),
                            (e.kind = s.MmlSemantics.prototype.kind),
                            e
                        );
                    })((0, a.CommonSemanticsMixin)(i.SVGWrapper));
                e.SVGsemantics = c;
                var h = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.toSVG = function (e) {
                            t.prototype.toSVG.call(this, e);
                        }),
                        (e.prototype.computeBBox = function () {
                            return this.bbox;
                        }),
                        (e.kind = s.MmlAnnotation.prototype.kind),
                        e
                    );
                })(i.SVGWrapper);
                e.SVGannotation = h;
                var u = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.kind = s.MmlAnnotationXML.prototype.kind),
                        (e.styles = {
                            'foreignObject[data-mjx-xml]': {
                                'font-family': 'initial',
                                'line-height': 'normal',
                                overflow: 'visible',
                            },
                        }),
                        e
                    );
                })(i.SVGWrapper);
                e.SVGannotationXML = u;
                var p = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.toSVG = function (t) {
                            var e = this.adaptor.clone(this.node.getXML()),
                                r = this.jax.math.metrics.em * this.jax.math.metrics.scale,
                                o = this.fixed(1 / r),
                                n = this.getBBox(),
                                i = n.w,
                                a = n.h,
                                s = n.d;
                            this.element = this.adaptor.append(
                                t,
                                this.svg(
                                    'foreignObject',
                                    {
                                        'data-mjx-xml': !0,
                                        y: this.jax.fixed(-a * r) + 'px',
                                        width: this.jax.fixed(i * r) + 'px',
                                        height: this.jax.fixed((a + s) * r) + 'px',
                                        transform: 'scale('.concat(o, ') matrix(1 0 0 -1 0 0)'),
                                    },
                                    [e],
                                ),
                            );
                        }),
                        (e.prototype.computeBBox = function (t, e) {
                            void 0 === e && (e = !1);
                            var r = this.jax.measureXMLnode(this.node.getXML()),
                                o = r.w,
                                n = r.h,
                                i = r.d;
                            (t.w = o), (t.h = n), (t.d = i);
                        }),
                        (e.prototype.getStyles = function () {}),
                        (e.prototype.getScale = function () {}),
                        (e.prototype.getVariant = function () {}),
                        (e.kind = l.XMLNode.prototype.kind),
                        (e.autoStyle = !1),
                        e
                    );
                })(i.SVGWrapper);
                e.SVGxml = p;
            },
            8723: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    (e.PV = MathJax._.components.global.combineDefaults),
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            4769: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.protoItem = MathJax._.core.MathItem.protoItem),
                    (e.AbstractMathItem = MathJax._.core.MathItem.AbstractMathItem),
                    (e.STATE = MathJax._.core.MathItem.STATE),
                    (e.newState = MathJax._.core.MathItem.newState);
            },
            8921: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TEXCLASS = MathJax._.core.MmlTree.MmlNode.TEXCLASS),
                    (e.TEXCLASSNAMES = MathJax._.core.MmlTree.MmlNode.TEXCLASSNAMES),
                    (e.indentAttributes = MathJax._.core.MmlTree.MmlNode.indentAttributes),
                    (e.AbstractMmlNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlNode),
                    (e.AbstractMmlTokenNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlTokenNode),
                    (e.AbstractMmlLayoutNode =
                        MathJax._.core.MmlTree.MmlNode.AbstractMmlLayoutNode),
                    (e.AbstractMmlBaseNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlBaseNode),
                    (e.AbstractMmlEmptyNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlEmptyNode),
                    (e.TextNode = MathJax._.core.MmlTree.MmlNode.TextNode),
                    (e.XMLNode = MathJax._.core.MmlTree.MmlNode.XMLNode);
            },
            4282: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TeXAtom = MathJax._.core.MmlTree.MmlNodes.TeXAtom.TeXAtom);
            },
            3969: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMaction = MathJax._.core.MmlTree.MmlNodes.maction.MmlMaction);
            },
            304: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMath = MathJax._.core.MmlTree.MmlNodes.math.MmlMath);
            },
            4374: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMenclose = MathJax._.core.MmlTree.MmlNodes.menclose.MmlMenclose);
            },
            8078: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMerror = MathJax._.core.MmlTree.MmlNodes.merror.MmlMerror);
            },
            7451: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMfenced = MathJax._.core.MmlTree.MmlNodes.mfenced.MmlMfenced);
            },
            848: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMfrac = MathJax._.core.MmlTree.MmlNodes.mfrac.MmlMfrac);
            },
            910: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMglyph = MathJax._.core.MmlTree.MmlNodes.mglyph.MmlMglyph);
            },
            7754: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMi = MathJax._.core.MmlTree.MmlNodes.mi.MmlMi);
            },
            7764: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMmultiscripts =
                        MathJax._.core.MmlTree.MmlNodes.mmultiscripts.MmlMmultiscripts),
                    (e.MmlMprescripts =
                        MathJax._.core.MmlTree.MmlNodes.mmultiscripts.MmlMprescripts),
                    (e.MmlNone = MathJax._.core.MmlTree.MmlNodes.mmultiscripts.MmlNone);
            },
            3235: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMn = MathJax._.core.MmlTree.MmlNodes.mn.MmlMn);
            },
            9946: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMo = MathJax._.core.MmlTree.MmlNodes.mo.MmlMo);
            },
            189: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMpadded = MathJax._.core.MmlTree.MmlNodes.mpadded.MmlMpadded);
            },
            7988: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMphantom = MathJax._.core.MmlTree.MmlNodes.mphantom.MmlMphantom);
            },
            4664: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMroot = MathJax._.core.MmlTree.MmlNodes.mroot.MmlMroot);
            },
            1691: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMrow = MathJax._.core.MmlTree.MmlNodes.mrow.MmlMrow),
                    (e.MmlInferredMrow = MathJax._.core.MmlTree.MmlNodes.mrow.MmlInferredMrow);
            },
            4042: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMs = MathJax._.core.MmlTree.MmlNodes.ms.MmlMs);
            },
            1465: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMspace = MathJax._.core.MmlTree.MmlNodes.mspace.MmlMspace);
            },
            4655: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMsqrt = MathJax._.core.MmlTree.MmlNodes.msqrt.MmlMsqrt);
            },
            5857: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMsubsup = MathJax._.core.MmlTree.MmlNodes.msubsup.MmlMsubsup),
                    (e.MmlMsub = MathJax._.core.MmlTree.MmlNodes.msubsup.MmlMsub),
                    (e.MmlMsup = MathJax._.core.MmlTree.MmlNodes.msubsup.MmlMsup);
            },
            4859: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMtable = MathJax._.core.MmlTree.MmlNodes.mtable.MmlMtable);
            },
            2321: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMtd = MathJax._.core.MmlTree.MmlNodes.mtd.MmlMtd);
            },
            6277: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMtext = MathJax._.core.MmlTree.MmlNodes.mtext.MmlMtext);
            },
            4393: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMtr = MathJax._.core.MmlTree.MmlNodes.mtr.MmlMtr),
                    (e.MmlMlabeledtr = MathJax._.core.MmlTree.MmlNodes.mtr.MmlMlabeledtr);
            },
            3102: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMunderover = MathJax._.core.MmlTree.MmlNodes.munderover.MmlMunderover),
                    (e.MmlMunder = MathJax._.core.MmlTree.MmlNodes.munderover.MmlMunder),
                    (e.MmlMover = MathJax._.core.MmlTree.MmlNodes.munderover.MmlMover);
            },
            9167: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlSemantics = MathJax._.core.MmlTree.MmlNodes.semantics.MmlSemantics),
                    (e.MmlAnnotationXML =
                        MathJax._.core.MmlTree.MmlNodes.semantics.MmlAnnotationXML),
                    (e.MmlAnnotation = MathJax._.core.MmlTree.MmlNodes.semantics.MmlAnnotation);
            },
            3985: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractOutputJax = MathJax._.core.OutputJax.AbstractOutputJax);
            },
            9879: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractWrapper = MathJax._.core.Tree.Wrapper.AbstractWrapper);
            },
            2506: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractWrapperFactory =
                        MathJax._.core.Tree.WrapperFactory.AbstractWrapperFactory);
            },
            3717: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BBox = MathJax._.util.BBox.BBox);
            },
            9077: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.isObject = MathJax._.util.Options.isObject),
                    (e.APPEND = MathJax._.util.Options.APPEND),
                    (e.REMOVE = MathJax._.util.Options.REMOVE),
                    (e.OPTIONS = MathJax._.util.Options.OPTIONS),
                    (e.Expandable = MathJax._.util.Options.Expandable),
                    (e.expandable = MathJax._.util.Options.expandable),
                    (e.makeArray = MathJax._.util.Options.makeArray),
                    (e.keys = MathJax._.util.Options.keys),
                    (e.copy = MathJax._.util.Options.copy),
                    (e.insert = MathJax._.util.Options.insert),
                    (e.defaultOptions = MathJax._.util.Options.defaultOptions),
                    (e.userOptions = MathJax._.util.Options.userOptions),
                    (e.selectOptions = MathJax._.util.Options.selectOptions),
                    (e.selectOptionsFromKeys = MathJax._.util.Options.selectOptionsFromKeys),
                    (e.separateOptions = MathJax._.util.Options.separateOptions),
                    (e.lookup = MathJax._.util.Options.lookup);
            },
            5888: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CssStyles = MathJax._.util.StyleList.CssStyles);
            },
            5878: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Styles = MathJax._.util.Styles.Styles);
            },
            6914: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BIGDIMEN = MathJax._.util.lengths.BIGDIMEN),
                    (e.UNITS = MathJax._.util.lengths.UNITS),
                    (e.RELUNITS = MathJax._.util.lengths.RELUNITS),
                    (e.MATHSPACE = MathJax._.util.lengths.MATHSPACE),
                    (e.length2em = MathJax._.util.lengths.length2em),
                    (e.percent = MathJax._.util.lengths.percent),
                    (e.em = MathJax._.util.lengths.em),
                    (e.emRounded = MathJax._.util.lengths.emRounded),
                    (e.px = MathJax._.util.lengths.px);
            },
            1490: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.sum = MathJax._.util.numeric.sum),
                    (e.max = MathJax._.util.numeric.max);
            },
            6720: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.sortLength = MathJax._.util.string.sortLength),
                    (e.quotePattern = MathJax._.util.string.quotePattern),
                    (e.unicodeChars = MathJax._.util.string.unicodeChars),
                    (e.unicodeString = MathJax._.util.string.unicodeString),
                    (e.isPercent = MathJax._.util.string.isPercent),
                    (e.split = MathJax._.util.string.split);
            },
            4142: function (t, e, r) {
                r.r(e),
                    r.d(e, {
                        TeXFont: function () {
                            return u;
                        },
                    });
                var o = r(9708);
                function n(t) {
                    return (
                        (n =
                            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t &&
                                          'function' == typeof Symbol &&
                                          t.constructor === Symbol &&
                                          t !== Symbol.prototype
                                          ? 'symbol'
                                          : typeof t;
                                  }),
                        n(t)
                    );
                }
                function i(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var o = e[r];
                        (o.enumerable = o.enumerable || !1),
                            (o.configurable = !0),
                            'value' in o && (o.writable = !0),
                            Object.defineProperty(t, o.key, o);
                    }
                }
                function a(t, e) {
                    if (!(t instanceof e)) throw new TypeError('Cannot call a class as a function');
                }
                function s(t, e) {
                    return (
                        (s =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        s(t, e)
                    );
                }
                function l(t) {
                    var e = (function () {
                        if ('undefined' == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ('function' == typeof Proxy) return !0;
                        try {
                            return (
                                Boolean.prototype.valueOf.call(
                                    Reflect.construct(Boolean, [], function () {}),
                                ),
                                !0
                            );
                        } catch (t) {
                            return !1;
                        }
                    })();
                    return function () {
                        var r,
                            o = h(t);
                        if (e) {
                            var n = h(this).constructor;
                            r = Reflect.construct(o, arguments, n);
                        } else r = o.apply(this, arguments);
                        return c(this, r);
                    };
                }
                function c(t, e) {
                    if (e && ('object' === n(e) || 'function' == typeof e)) return e;
                    if (void 0 !== e)
                        throw new TypeError(
                            'Derived constructors may only return object or undefined',
                        );
                    return (function (t) {
                        if (void 0 === t)
                            throw new ReferenceError(
                                "this hasn't been initialised - super() hasn't been called",
                            );
                        return t;
                    })(t);
                }
                function h(t) {
                    return (
                        (h = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        h(t)
                    );
                }
                var u = (function (t) {
                    !(function (t, e) {
                        if ('function' != typeof e && null !== e)
                            throw new TypeError(
                                'Super expression must either be null or a function',
                            );
                        (t.prototype = Object.create(e && e.prototype, {
                            constructor: { value: t, writable: !0, configurable: !0 },
                        })),
                            Object.defineProperty(t, 'prototype', { writable: !1 }),
                            e && s(t, e);
                    })(c, t);
                    var e,
                        r,
                        o,
                        n = l(c);
                    function c() {
                        return a(this, c), n.apply(this, arguments);
                    }
                    return (
                        (e = c),
                        r && i(e.prototype, r),
                        o && i(e, o),
                        Object.defineProperty(e, 'prototype', { writable: !1 }),
                        e
                    );
                })(o.FontData);
                u.OPTIONS = { fontURL: '.' };
            },
        },
        yt = {};
    function mt(t) {
        var e = yt[t];
        if (void 0 !== e) return e.exports;
        var r = (yt[t] = { exports: {} });
        return ft[t].call(r.exports, r, r.exports, mt), r.exports;
    }
    (mt.n = function (t) {
        var e =
            t && t.__esModule
                ? function () {
                      return t.default;
                  }
                : function () {
                      return t;
                  };
        return mt.d(e, { a: e }), e;
    }),
        (mt.d = function (t, e) {
            for (var r in e)
                mt.o(e, r) &&
                    !mt.o(t, r) &&
                    Object.defineProperty(t, r, { enumerable: !0, get: e[r] });
        }),
        (mt.o = function (t, e) {
            return Object.prototype.hasOwnProperty.call(t, e);
        }),
        (mt.r = function (t) {
            'undefined' != typeof Symbol &&
                Symbol.toStringTag &&
                Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
                Object.defineProperty(t, '__esModule', { value: !0 });
        }),
        (t = mt(8723)),
        (e = mt(7306)),
        (r = mt(9250)),
        (o = mt(5373)),
        (n = mt(716)),
        (i = mt(1541)),
        (a = mt(1475)),
        (s = mt(3438)),
        (l = mt(555)),
        (c = mt(3345)),
        (h = mt(2057)),
        (u = mt(6200)),
        (p = mt(1346)),
        (d = mt(5705)),
        (f = mt(7969)),
        (y = mt(1419)),
        (m = mt(9906)),
        (v = mt(2304)),
        (g = mt(437)),
        (b = mt(7481)),
        (x = mt(5997)),
        (_ = mt(9323)),
        (M = mt(6920)),
        (w = mt(37)),
        (S = mt(222)),
        (O = mt(3069)),
        (C = mt(8589)),
        (B = mt(7805)),
        (j = mt(8325)),
        (P = mt(4818)),
        (A = mt(9690)),
        (V = mt(7091)),
        (T = mt(3191)),
        (k = mt(6582)),
        (G = mt(4129)),
        (N = mt(9708)),
        (L = mt(9737)),
        (D = mt(9321)),
        (W = mt(9416)),
        (E = mt(4687)),
        (R = mt(484)),
        (I = mt(7455)),
        (F = mt(4601)),
        (H = mt(1211)),
        (J = mt(144)),
        (X = mt(3007)),
        (z = mt(5258)),
        (q = mt(9295)),
        (K = mt(4916)),
        (U = mt(2983)),
        (Q = mt(4750)),
        (Y = mt(9810)),
        (Z = mt(6760)),
        ($ = mt(4539)),
        (tt = mt(438)),
        (et = mt(8798)),
        (rt = mt(322)),
        (ot = mt(3677)),
        (nt = mt(2458)),
        (it = mt(9948)),
        (at = mt(7522)),
        (st = mt(451)),
        (lt = mt(2673)),
        (ct = mt(1941)),
        (ht = mt(4682)),
        (ut = mt(4299)),
        (pt = mt(1269)),
        (dt = mt(6965)),
        MathJax.loader && MathJax.loader.checkVersion('output/svg', e.q, 'output'),
        (0, t.r8)({
            _: {
                output: {
                    common: {
                        FontData: r,
                        Notation: o,
                        OutputJax: n,
                        Wrapper: i,
                        WrapperFactory: a,
                        Wrappers: {
                            TeXAtom: s,
                            TextNode: l,
                            maction: c,
                            math: h,
                            menclose: u,
                            mfenced: p,
                            mfrac: d,
                            mglyph: f,
                            mi: y,
                            mmultiscripts: m,
                            mn: v,
                            mo: g,
                            mpadded: b,
                            mroot: x,
                            mrow: _,
                            ms: M,
                            mspace: w,
                            msqrt: S,
                            msubsup: O,
                            mtable: C,
                            mtd: B,
                            mtext: j,
                            mtr: P,
                            munderover: A,
                            scriptbase: V,
                            semantics: T,
                        },
                    },
                    svg_ts: k,
                    svg: {
                        FontCache: G,
                        FontData: N,
                        Notation: L,
                        Wrapper: D,
                        WrapperFactory: W,
                        Wrappers_ts: E,
                        Wrappers: {
                            TeXAtom: R,
                            TextNode: I,
                            maction: F,
                            math: H,
                            menclose: J,
                            merror: X,
                            mfenced: z,
                            mfrac: q,
                            mglyph: K,
                            mi: U,
                            mmultiscripts: Q,
                            mn: Y,
                            mo: Z,
                            mpadded: $,
                            mphantom: tt,
                            mroot: et,
                            mrow: rt,
                            ms: ot,
                            mspace: nt,
                            msqrt: it,
                            msubsup: at,
                            mtable: st,
                            mtd: lt,
                            mtext: ct,
                            mtr: ht,
                            munderover: ut,
                            scriptbase: pt,
                            semantics: dt,
                        },
                    },
                },
            },
        }),
        MathJax.loader &&
            (0, t.PV)(MathJax.config.loader, 'output/svg', {
                checkReady: function () {
                    return MathJax.loader.load('output/svg/fonts/tex');
                },
            }),
        MathJax.startup &&
            (MathJax.startup.registerConstructor('svg', k.SVG), MathJax.startup.useOutput('svg'));
})();
