!(function () {
    'use strict';
    var t = {
            7306: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            7205: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
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
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                a.apply(this, arguments)
                            );
                        },
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.TeX = void 0);
                var l = r(3309),
                    c = r(9077),
                    u = r(2982),
                    p = s(r(199)),
                    d = s(r(8321)),
                    f = s(r(810)),
                    h = s(r(3466)),
                    m = s(r(6394)),
                    g = r(7251),
                    y = r(6552);
                r(3606);
                var v = (function (t) {
                    function e(r) {
                        void 0 === r && (r = {});
                        var n = this,
                            o = i((0, c.separateOptions)(r, e.OPTIONS, u.FindTeX.OPTIONS), 3),
                            a = o[0],
                            s = o[1],
                            l = o[2];
                        (n = t.call(this, s) || this).findTeX =
                            n.options.FindTeX || new u.FindTeX(l);
                        var d = n.options.packages,
                            f = (n.configuration = e.configure(d)),
                            h = (n._parseOptions = new m.default(f, [
                                n.options,
                                g.TagsFactory.OPTIONS,
                            ]));
                        return (
                            (0, c.userOptions)(h.options, a),
                            f.config(n),
                            e.tags(h, f),
                            n.postFilters.add(p.default.cleanSubSup, -6),
                            n.postFilters.add(p.default.setInherited, -5),
                            n.postFilters.add(p.default.moveLimits, -4),
                            n.postFilters.add(p.default.cleanStretchy, -3),
                            n.postFilters.add(p.default.cleanAttributes, -2),
                            n.postFilters.add(p.default.combineRelations, -1),
                            n
                        );
                    }
                    return (
                        o(e, t),
                        (e.configure = function (t) {
                            var e = new y.ParserConfiguration(t, ['tex']);
                            return e.init(), e;
                        }),
                        (e.tags = function (t, e) {
                            g.TagsFactory.addTags(e.tags),
                                g.TagsFactory.setDefault(t.options.tags),
                                (t.tags = g.TagsFactory.getDefault()),
                                (t.tags.configuration = t);
                        }),
                        (e.prototype.setMmlFactory = function (e) {
                            t.prototype.setMmlFactory.call(this, e),
                                this._parseOptions.nodeFactory.setMmlFactory(e);
                        }),
                        Object.defineProperty(e.prototype, 'parseOptions', {
                            get: function () {
                                return this._parseOptions;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.reset = function (t) {
                            void 0 === t && (t = 0), this.parseOptions.tags.reset(t);
                        }),
                        (e.prototype.compile = function (t, e) {
                            this.parseOptions.clear(),
                                this.executeFilters(this.preFilters, t, e, this.parseOptions);
                            var r,
                                n,
                                o = t.display;
                            (this.latex = t.math), this.parseOptions.tags.startEquation(t);
                            try {
                                var a = new f.default(
                                    this.latex,
                                    { display: o, isInner: !1 },
                                    this.parseOptions,
                                );
                                (r = a.mml()), (n = a.stack.global);
                            } catch (t) {
                                if (!(t instanceof h.default)) throw t;
                                (this.parseOptions.error = !0),
                                    (r = this.options.formatError(this, t));
                            }
                            return (
                                (r = this.parseOptions.nodeFactory.create('node', 'math', [r])),
                                (null == n ? void 0 : n.indentalign) &&
                                    d.default.setAttribute(r, 'indentalign', n.indentalign),
                                o && d.default.setAttribute(r, 'display', 'block'),
                                this.parseOptions.tags.finishEquation(t),
                                (this.parseOptions.root = r),
                                this.executeFilters(this.postFilters, t, e, this.parseOptions),
                                (this.mathNode = this.parseOptions.root),
                                this.mathNode
                            );
                        }),
                        (e.prototype.findMath = function (t) {
                            return this.findTeX.findMath(t);
                        }),
                        (e.prototype.formatError = function (t) {
                            var e = t.message.replace(/\n.*/, '');
                            return this.parseOptions.nodeFactory.create(
                                'error',
                                e,
                                t.id,
                                this.latex,
                            );
                        }),
                        (e.NAME = 'TeX'),
                        (e.OPTIONS = a(a({}, l.AbstractInputJax.OPTIONS), {
                            FindTeX: null,
                            packages: ['base'],
                            digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/,
                            maxBuffer: 5120,
                            formatError: function (t, e) {
                                return t.formatError(e);
                            },
                        })),
                        e
                    );
                })(l.AbstractInputJax);
                e.TeX = v;
            },
            2160: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AllPackages = void 0),
                    r(3606),
                    r(1313),
                    r(3946),
                    r(6701),
                    r(3067),
                    r(9267),
                    r(1677),
                    r(7404),
                    r(9489),
                    r(2632),
                    r(322),
                    r(4151),
                    r(2298),
                    r(9570),
                    r(3274),
                    r(8430),
                    r(6755),
                    r(5246),
                    r(1307),
                    r(153),
                    r(856),
                    r(1323),
                    r(2200),
                    r(9569),
                    r(8405),
                    r(9589),
                    r(955),
                    r(7368),
                    r(643),
                    r(82),
                    r(3450),
                    r(1158),
                    r(4325),
                    'undefined' != typeof MathJax &&
                        MathJax.loader &&
                        MathJax.loader.preLoad(
                            '[tex]/action',
                            '[tex]/ams',
                            '[tex]/amscd',
                            '[tex]/bbox',
                            '[tex]/boldsymbol',
                            '[tex]/braket',
                            '[tex]/bussproofs',
                            '[tex]/cancel',
                            '[tex]/cases',
                            '[tex]/centernot',
                            '[tex]/color',
                            '[tex]/colorv2',
                            '[tex]/colortbl',
                            '[tex]/empheq',
                            '[tex]/enclose',
                            '[tex]/extpfeil',
                            '[tex]/gensymb',
                            '[tex]/html',
                            '[tex]/mathtools',
                            '[tex]/mhchem',
                            '[tex]/newcommand',
                            '[tex]/noerrors',
                            '[tex]/noundefined',
                            '[tex]/physics',
                            '[tex]/upgreek',
                            '[tex]/unicode',
                            '[tex]/verb',
                            '[tex]/configmacros',
                            '[tex]/tagformat',
                            '[tex]/textcomp',
                            '[tex]/textmacros',
                            '[tex]/setoptions',
                        ),
                    (e.AllPackages = [
                        'base',
                        'action',
                        'ams',
                        'amscd',
                        'bbox',
                        'boldsymbol',
                        'braket',
                        'bussproofs',
                        'cancel',
                        'cases',
                        'centernot',
                        'color',
                        'colortbl',
                        'empheq',
                        'enclose',
                        'extpfeil',
                        'gensymb',
                        'html',
                        'mathtools',
                        'mhchem',
                        'newcommand',
                        'noerrors',
                        'noundefined',
                        'upgreek',
                        'unicode',
                        'verb',
                        'configmacros',
                        'tagformat',
                        'textcomp',
                        'textmacros',
                    ]);
            },
            6552: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ParserConfiguration = e.ConfigurationHandler = e.Configuration = void 0);
                var a,
                    i = r(9077),
                    s = r(2910),
                    l = r(6898),
                    c = r(4297),
                    u = r(7251),
                    p = (function () {
                        function t(t, e, r, n, o, a, i, s, l, c, u, p, d) {
                            void 0 === e && (e = {}),
                                void 0 === r && (r = {}),
                                void 0 === n && (n = {}),
                                void 0 === o && (o = {}),
                                void 0 === a && (a = {}),
                                void 0 === i && (i = {}),
                                void 0 === s && (s = []),
                                void 0 === l && (l = []),
                                void 0 === c && (c = null),
                                void 0 === u && (u = null),
                                (this.name = t),
                                (this.handler = e),
                                (this.fallback = r),
                                (this.items = n),
                                (this.tags = o),
                                (this.options = a),
                                (this.nodes = i),
                                (this.preprocessors = s),
                                (this.postprocessors = l),
                                (this.initMethod = c),
                                (this.configMethod = u),
                                (this.priority = p),
                                (this.parser = d),
                                (this.handler = Object.assign(
                                    { character: [], delimiter: [], macro: [], environment: [] },
                                    e,
                                ));
                        }
                        return (
                            (t.makeProcessor = function (t, e) {
                                return Array.isArray(t) ? t : [t, e];
                            }),
                            (t._create = function (e, r) {
                                var n = this;
                                void 0 === r && (r = {});
                                var o = r.priority || c.PrioritizedList.DEFAULTPRIORITY,
                                    a = r.init ? this.makeProcessor(r.init, o) : null,
                                    i = r.config ? this.makeProcessor(r.config, o) : null,
                                    s = (r.preprocessors || []).map(function (t) {
                                        return n.makeProcessor(t, o);
                                    }),
                                    l = (r.postprocessors || []).map(function (t) {
                                        return n.makeProcessor(t, o);
                                    }),
                                    u = r.parser || 'tex';
                                return new t(
                                    e,
                                    r.handler || {},
                                    r.fallback || {},
                                    r.items || {},
                                    r.tags || {},
                                    r.options || {},
                                    r.nodes || {},
                                    s,
                                    l,
                                    a,
                                    i,
                                    o,
                                    u,
                                );
                            }),
                            (t.create = function (e, r) {
                                void 0 === r && (r = {});
                                var n = t._create(e, r);
                                return a.set(e, n), n;
                            }),
                            (t.local = function (e) {
                                return void 0 === e && (e = {}), t._create('', e);
                            }),
                            Object.defineProperty(t.prototype, 'init', {
                                get: function () {
                                    return this.initMethod ? this.initMethod[0] : null;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(t.prototype, 'config', {
                                get: function () {
                                    return this.configMethod ? this.configMethod[0] : null;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            t
                        );
                    })();
                (e.Configuration = p),
                    (function (t) {
                        var e = new Map();
                        (t.set = function (t, r) {
                            e.set(t, r);
                        }),
                            (t.get = function (t) {
                                return e.get(t);
                            }),
                            (t.keys = function () {
                                return e.keys();
                            });
                    })((a = e.ConfigurationHandler || (e.ConfigurationHandler = {})));
                var d = (function () {
                    function t(t, e) {
                        var r, o, a, i;
                        void 0 === e && (e = ['tex']),
                            (this.initMethod = new l.FunctionList()),
                            (this.configMethod = new l.FunctionList()),
                            (this.configurations = new c.PrioritizedList()),
                            (this.parsers = []),
                            (this.handlers = new s.SubHandlers()),
                            (this.items = {}),
                            (this.tags = {}),
                            (this.options = {}),
                            (this.nodes = {}),
                            (this.parsers = e);
                        try {
                            for (
                                var u = n(t.slice().reverse()), p = u.next();
                                !p.done;
                                p = u.next()
                            ) {
                                var d = p.value;
                                this.addPackage(d);
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
                        try {
                            for (
                                var f = n(this.configurations), h = f.next();
                                !h.done;
                                h = f.next()
                            ) {
                                var m = h.value,
                                    g = m.item,
                                    y = m.priority;
                                this.append(g, y);
                            }
                        } catch (t) {
                            a = { error: t };
                        } finally {
                            try {
                                h && !h.done && (i = f.return) && i.call(f);
                            } finally {
                                if (a) throw a.error;
                            }
                        }
                    }
                    return (
                        (t.prototype.init = function () {
                            this.initMethod.execute(this);
                        }),
                        (t.prototype.config = function (t) {
                            var e, r;
                            this.configMethod.execute(this, t);
                            try {
                                for (
                                    var o = n(this.configurations), a = o.next();
                                    !a.done;
                                    a = o.next()
                                ) {
                                    var i = a.value;
                                    this.addFilters(t, i.item);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                        }),
                        (t.prototype.addPackage = function (t) {
                            var e = 'string' == typeof t ? t : t[0],
                                r = this.getPackage(e);
                            r &&
                                this.configurations.add(
                                    r,
                                    'string' == typeof t ? r.priority : t[1],
                                );
                        }),
                        (t.prototype.add = function (t, e, r) {
                            var o, a;
                            void 0 === r && (r = {});
                            var s = this.getPackage(t);
                            this.append(s), this.configurations.add(s, s.priority), this.init();
                            var l = e.parseOptions;
                            l.nodeFactory.setCreators(s.nodes);
                            try {
                                for (
                                    var c = n(Object.keys(s.items)), p = c.next();
                                    !p.done;
                                    p = c.next()
                                ) {
                                    var d = p.value;
                                    l.itemFactory.setNodeClass(d, s.items[d]);
                                }
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    p && !p.done && (a = c.return) && a.call(c);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            u.TagsFactory.addTags(s.tags),
                                (0, i.defaultOptions)(l.options, s.options),
                                (0, i.userOptions)(l.options, r),
                                this.addFilters(e, s),
                                s.config && s.config(this, e);
                        }),
                        (t.prototype.getPackage = function (t) {
                            var e = a.get(t);
                            if (e && this.parsers.indexOf(e.parser) < 0)
                                throw Error(
                                    'Package '.concat(t, " doesn't target the proper parser"),
                                );
                            return e;
                        }),
                        (t.prototype.append = function (t, e) {
                            (e = e || t.priority),
                                t.initMethod &&
                                    this.initMethod.add(t.initMethod[0], t.initMethod[1]),
                                t.configMethod &&
                                    this.configMethod.add(t.configMethod[0], t.configMethod[1]),
                                this.handlers.add(t.handler, t.fallback, e),
                                Object.assign(this.items, t.items),
                                Object.assign(this.tags, t.tags),
                                (0, i.defaultOptions)(this.options, t.options),
                                Object.assign(this.nodes, t.nodes);
                        }),
                        (t.prototype.addFilters = function (t, e) {
                            var r, a, i, s;
                            try {
                                for (
                                    var l = n(e.preprocessors), c = l.next();
                                    !c.done;
                                    c = l.next()
                                ) {
                                    var u = o(c.value, 2),
                                        p = u[0],
                                        d = u[1];
                                    t.preFilters.add(p, d);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    c && !c.done && (a = l.return) && a.call(l);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            try {
                                for (
                                    var f = n(e.postprocessors), h = f.next();
                                    !h.done;
                                    h = f.next()
                                ) {
                                    var m = o(h.value, 2),
                                        g = m[0];
                                    d = m[1];
                                    t.postFilters.add(g, d);
                                }
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    h && !h.done && (s = f.return) && s.call(f);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                        }),
                        t
                    );
                })();
                e.ParserConfiguration = d;
            },
            199: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a,
                    i = r(8921),
                    s = o(r(8321));
                !(function (t) {
                    (t.cleanStretchy = function (t) {
                        var e,
                            r,
                            o = t.data;
                        try {
                            for (
                                var a = n(o.getList('fixStretchy')), i = a.next();
                                !i.done;
                                i = a.next()
                            ) {
                                var l = i.value;
                                if (s.default.getProperty(l, 'fixStretchy')) {
                                    var c = s.default.getForm(l);
                                    c &&
                                        c[3] &&
                                        c[3].stretchy &&
                                        s.default.setAttribute(l, 'stretchy', !1);
                                    var u = l.parent;
                                    if (!(s.default.getTexClass(l) || (c && c[2]))) {
                                        var p = o.nodeFactory.create('node', 'TeXAtom', [l]);
                                        u.replaceChild(p, l), p.inheritAttributesFrom(l);
                                    }
                                    s.default.removeProperties(l, 'fixStretchy');
                                }
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                i && !i.done && (r = a.return) && r.call(a);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                    }),
                        (t.cleanAttributes = function (t) {
                            t.data.root.walkTree(function (t, e) {
                                var r,
                                    o,
                                    a = t.attributes;
                                if (a) {
                                    var i = new Set((a.get('mjx-keep-attrs') || '').split(/ /));
                                    delete a.getAllAttributes()['mjx-keep-attrs'];
                                    try {
                                        for (
                                            var s = n(a.getExplicitNames()), l = s.next();
                                            !l.done;
                                            l = s.next()
                                        ) {
                                            var c = l.value;
                                            i.has(c) ||
                                                a.attributes[c] !== t.attributes.getInherited(c) ||
                                                delete a.attributes[c];
                                        }
                                    } catch (t) {
                                        r = { error: t };
                                    } finally {
                                        try {
                                            l && !l.done && (o = s.return) && o.call(s);
                                        } finally {
                                            if (r) throw r.error;
                                        }
                                    }
                                }
                            }, {});
                        }),
                        (t.combineRelations = function (t) {
                            var o,
                                a,
                                l,
                                c,
                                u = [];
                            try {
                                for (
                                    var p = n(t.data.getList('mo')), d = p.next();
                                    !d.done;
                                    d = p.next()
                                ) {
                                    var f = d.value;
                                    if (
                                        !f.getProperty('relationsCombined') &&
                                        f.parent &&
                                        (!f.parent || s.default.isType(f.parent, 'mrow')) &&
                                        s.default.getTexClass(f) === i.TEXCLASS.REL
                                    ) {
                                        for (
                                            var h = f.parent,
                                                m = void 0,
                                                g = h.childNodes,
                                                y = g.indexOf(f) + 1,
                                                v = s.default.getProperty(f, 'variantForm');
                                            y < g.length &&
                                            (m = g[y]) &&
                                            s.default.isType(m, 'mo') &&
                                            s.default.getTexClass(m) === i.TEXCLASS.REL;

                                        ) {
                                            if (
                                                v !== s.default.getProperty(m, 'variantForm') ||
                                                !r(f, m)
                                            ) {
                                                null == f.attributes.getExplicit('rspace') &&
                                                    s.default.setAttribute(f, 'rspace', '0pt'),
                                                    null == m.attributes.getExplicit('lspace') &&
                                                        s.default.setAttribute(m, 'lspace', '0pt');
                                                break;
                                            }
                                            s.default.appendChildren(f, s.default.getChildren(m)),
                                                e(['stretchy', 'rspace'], f, m);
                                            try {
                                                for (
                                                    var b = ((l = void 0), n(m.getPropertyNames())),
                                                        x = b.next();
                                                    !x.done;
                                                    x = b.next()
                                                ) {
                                                    var _ = x.value;
                                                    f.setProperty(_, m.getProperty(_));
                                                }
                                            } catch (t) {
                                                l = { error: t };
                                            } finally {
                                                try {
                                                    x && !x.done && (c = b.return) && c.call(b);
                                                } finally {
                                                    if (l) throw l.error;
                                                }
                                            }
                                            g.splice(y, 1),
                                                u.push(m),
                                                (m.parent = null),
                                                m.setProperty('relationsCombined', !0);
                                        }
                                        f.attributes.setInherited('form', f.getForms()[0]);
                                    }
                                }
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    d && !d.done && (a = p.return) && a.call(p);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            t.data.removeFromList('mo', u);
                        });
                    var e = function (t, e, r) {
                            var n = e.attributes,
                                o = r.attributes;
                            t.forEach(function (t) {
                                var e = o.getExplicit(t);
                                null != e && n.set(t, e);
                            });
                        },
                        r = function (t, e) {
                            var r,
                                o,
                                a = function (t, e) {
                                    return t.getExplicitNames().filter(function (r) {
                                        return (
                                            r !== e &&
                                            ('stretchy' !== r || t.getExplicit('stretchy'))
                                        );
                                    });
                                },
                                i = t.attributes,
                                s = e.attributes,
                                l = a(i, 'lspace'),
                                c = a(s, 'rspace');
                            if (l.length !== c.length) return !1;
                            try {
                                for (var u = n(l), p = u.next(); !p.done; p = u.next()) {
                                    var d = p.value;
                                    if (i.getExplicit(d) !== s.getExplicit(d)) return !1;
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
                            return !0;
                        },
                        o = function (t, e, r) {
                            var o,
                                a,
                                i = [];
                            try {
                                for (
                                    var l = n(t.getList('m' + e + r)), c = l.next();
                                    !c.done;
                                    c = l.next()
                                ) {
                                    var u = c.value,
                                        p = u.childNodes;
                                    if (!p[u[e]] || !p[u[r]]) {
                                        var d = u.parent,
                                            f = p[u[e]]
                                                ? t.nodeFactory.create('node', 'm' + e, [
                                                      p[u.base],
                                                      p[u[e]],
                                                  ])
                                                : t.nodeFactory.create('node', 'm' + r, [
                                                      p[u.base],
                                                      p[u[r]],
                                                  ]);
                                        s.default.copyAttributes(u, f),
                                            d ? d.replaceChild(f, u) : (t.root = f),
                                            i.push(u);
                                    }
                                }
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    c && !c.done && (a = l.return) && a.call(l);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            t.removeFromList('m' + e + r, i);
                        };
                    t.cleanSubSup = function (t) {
                        var e = t.data;
                        e.error || (o(e, 'sub', 'sup'), o(e, 'under', 'over'));
                    };
                    var a = function (t, e, r) {
                        var o,
                            a,
                            i = [];
                        try {
                            for (var l = n(t.getList(e)), c = l.next(); !c.done; c = l.next()) {
                                var u = c.value;
                                if (!u.attributes.get('displaystyle')) {
                                    var p = u.childNodes[u.base],
                                        d = p.coreMO();
                                    if (
                                        p.getProperty('movablelimits') &&
                                        !d.attributes.getExplicit('movablelimits')
                                    ) {
                                        var f = t.nodeFactory.create('node', r, u.childNodes);
                                        s.default.copyAttributes(u, f),
                                            u.parent ? u.parent.replaceChild(f, u) : (t.root = f),
                                            i.push(u);
                                    }
                                }
                            }
                        } catch (t) {
                            o = { error: t };
                        } finally {
                            try {
                                c && !c.done && (a = l.return) && a.call(l);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        t.removeFromList(e, i);
                    };
                    (t.moveLimits = function (t) {
                        var e = t.data;
                        a(e, 'munderover', 'msubsup'),
                            a(e, 'munder', 'msub'),
                            a(e, 'mover', 'msup');
                    }),
                        (t.setInherited = function (t) {
                            t.data.root.setInheritedAttributes({}, t.math.display, 0, !1);
                        });
                })(a || (a = {})),
                    (e.default = a);
            },
            2982: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.FindTeX = void 0);
                var i = r(9649),
                    s = r(6720),
                    l = r(4769),
                    c = (function (t) {
                        function e(e) {
                            var r = t.call(this, e) || this;
                            return r.getPatterns(), r;
                        }
                        return (
                            o(e, t),
                            (e.prototype.getPatterns = function () {
                                var t = this,
                                    e = this.options,
                                    r = [],
                                    n = [],
                                    o = [];
                                (this.end = {}), (this.env = this.sub = 0);
                                var a = 1;
                                e.inlineMath.forEach(function (e) {
                                    return t.addPattern(r, e, !1);
                                }),
                                    e.displayMath.forEach(function (e) {
                                        return t.addPattern(r, e, !0);
                                    }),
                                    r.length && n.push(r.sort(s.sortLength).join('|')),
                                    e.processEnvironments &&
                                        (n.push('\\\\begin\\s*\\{([^}]*)\\}'), (this.env = a), a++),
                                    e.processEscapes && o.push('\\\\([\\\\$])'),
                                    e.processRefs && o.push('(\\\\(?:eq)?ref\\s*\\{[^}]*\\})'),
                                    o.length && (n.push('(' + o.join('|') + ')'), (this.sub = a)),
                                    (this.start = new RegExp(n.join('|'), 'g')),
                                    (this.hasPatterns = n.length > 0);
                            }),
                            (e.prototype.addPattern = function (t, e, r) {
                                var n = a(e, 2),
                                    o = n[0],
                                    i = n[1];
                                t.push((0, s.quotePattern)(o)),
                                    (this.end[o] = [i, r, this.endPattern(i)]);
                            }),
                            (e.prototype.endPattern = function (t, e) {
                                return new RegExp(
                                    (e || (0, s.quotePattern)(t)) + '|\\\\(?:[a-zA-Z]|.)|[{}]',
                                    'g',
                                );
                            }),
                            (e.prototype.findEnd = function (t, e, r, n) {
                                for (
                                    var o,
                                        i = a(n, 3),
                                        s = i[0],
                                        c = i[1],
                                        u = i[2],
                                        p = (u.lastIndex = r.index + r[0].length),
                                        d = 0;
                                    (o = u.exec(t));

                                ) {
                                    if ((o[1] || o[0]) === s && 0 === d)
                                        return (0, l.protoItem)(
                                            r[0],
                                            t.substr(p, o.index - p),
                                            o[0],
                                            e,
                                            r.index,
                                            o.index + o[0].length,
                                            c,
                                        );
                                    '{' === o[0] ? d++ : '}' === o[0] && d && d--;
                                }
                                return null;
                            }),
                            (e.prototype.findMathInString = function (t, e, r) {
                                var n, o;
                                for (this.start.lastIndex = 0; (n = this.start.exec(r)); ) {
                                    if (void 0 !== n[this.env] && this.env) {
                                        var a =
                                            '\\\\end\\s*(\\{' +
                                            (0, s.quotePattern)(n[this.env]) +
                                            '\\})';
                                        (o = this.findEnd(r, e, n, [
                                            '{' + n[this.env] + '}',
                                            !0,
                                            this.endPattern(null, a),
                                        ])) &&
                                            ((o.math = o.open + o.math + o.close),
                                            (o.open = o.close = ''));
                                    } else if (void 0 !== n[this.sub] && this.sub) {
                                        var i = n[this.sub];
                                        a = n.index + n[this.sub].length;
                                        o =
                                            2 === i.length
                                                ? (0, l.protoItem)(
                                                      '',
                                                      i.substr(1),
                                                      '',
                                                      e,
                                                      n.index,
                                                      a,
                                                  )
                                                : (0, l.protoItem)('', i, '', e, n.index, a, !1);
                                    } else o = this.findEnd(r, e, n, this.end[n[0]]);
                                    o && (t.push(o), (this.start.lastIndex = o.end.n));
                                }
                            }),
                            (e.prototype.findMath = function (t) {
                                var e = [];
                                if (this.hasPatterns)
                                    for (var r = 0, n = t.length; r < n; r++)
                                        this.findMathInString(e, r, t[r]);
                                return e;
                            }),
                            (e.OPTIONS = {
                                inlineMath: [['\\(', '\\)']],
                                displayMath: [
                                    ['$$', '$$'],
                                    ['\\[', '\\]'],
                                ],
                                processEscapes: !0,
                                processEnvironments: !0,
                                processRefs: !0,
                            }),
                            e
                        );
                    })(i.AbstractFindMath);
                e.FindTeX = c;
            },
            2910: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SubHandlers = e.SubHandler = e.MapHandler = void 0);
                var a,
                    i = r(4297),
                    s = r(6898);
                !(function (t) {
                    var e = new Map();
                    (t.register = function (t) {
                        e.set(t.name, t);
                    }),
                        (t.getMap = function (t) {
                            return e.get(t);
                        });
                })((a = e.MapHandler || (e.MapHandler = {})));
                var l = (function () {
                    function t() {
                        (this._configuration = new i.PrioritizedList()),
                            (this._fallback = new s.FunctionList());
                    }
                    return (
                        (t.prototype.add = function (t, e, r) {
                            var o, s;
                            void 0 === r && (r = i.PrioritizedList.DEFAULTPRIORITY);
                            try {
                                for (
                                    var l = n(t.slice().reverse()), c = l.next();
                                    !c.done;
                                    c = l.next()
                                ) {
                                    var u = c.value,
                                        p = a.getMap(u);
                                    if (!p)
                                        return void this.warn(
                                            'Configuration ' + u + ' not found! Omitted.',
                                        );
                                    this._configuration.add(p, r);
                                }
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    c && !c.done && (s = l.return) && s.call(l);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            e && this._fallback.add(e, r);
                        }),
                        (t.prototype.parse = function (t) {
                            var e, r;
                            try {
                                for (
                                    var a = n(this._configuration), i = a.next();
                                    !i.done;
                                    i = a.next()
                                ) {
                                    var s = i.value.item.parse(t);
                                    if (s) return s;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    i && !i.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            var l = o(t, 2),
                                c = l[0],
                                u = l[1];
                            Array.from(this._fallback)[0].item(c, u);
                        }),
                        (t.prototype.lookup = function (t) {
                            var e = this.applicable(t);
                            return e ? e.lookup(t) : null;
                        }),
                        (t.prototype.contains = function (t) {
                            return !!this.applicable(t);
                        }),
                        (t.prototype.toString = function () {
                            var t,
                                e,
                                r = [];
                            try {
                                for (
                                    var o = n(this._configuration), a = o.next();
                                    !a.done;
                                    a = o.next()
                                ) {
                                    var i = a.value.item;
                                    r.push(i.name);
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    a && !a.done && (e = o.return) && e.call(o);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return r.join(', ');
                        }),
                        (t.prototype.applicable = function (t) {
                            var e, r;
                            try {
                                for (
                                    var o = n(this._configuration), a = o.next();
                                    !a.done;
                                    a = o.next()
                                ) {
                                    var i = a.value.item;
                                    if (i.contains(t)) return i;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return null;
                        }),
                        (t.prototype.retrieve = function (t) {
                            var e, r;
                            try {
                                for (
                                    var o = n(this._configuration), a = o.next();
                                    !a.done;
                                    a = o.next()
                                ) {
                                    var i = a.value.item;
                                    if (i.name === t) return i;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return null;
                        }),
                        (t.prototype.warn = function (t) {
                            console.log('TexParser Warning: ' + t);
                        }),
                        t
                    );
                })();
                e.SubHandler = l;
                var c = (function () {
                    function t() {
                        this.map = new Map();
                    }
                    return (
                        (t.prototype.add = function (t, e, r) {
                            var o, a;
                            void 0 === r && (r = i.PrioritizedList.DEFAULTPRIORITY);
                            try {
                                for (
                                    var s = n(Object.keys(t)), c = s.next();
                                    !c.done;
                                    c = s.next()
                                ) {
                                    var u = c.value,
                                        p = this.get(u);
                                    p || ((p = new l()), this.set(u, p)), p.add(t[u], e[u], r);
                                }
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    c && !c.done && (a = s.return) && a.call(s);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                        }),
                        (t.prototype.set = function (t, e) {
                            this.map.set(t, e);
                        }),
                        (t.prototype.get = function (t) {
                            return this.map.get(t);
                        }),
                        (t.prototype.retrieve = function (t) {
                            var e, r;
                            try {
                                for (
                                    var o = n(this.map.values()), a = o.next();
                                    !a.done;
                                    a = o.next()
                                ) {
                                    var i = a.value.retrieve(t);
                                    if (i) return i;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return null;
                        }),
                        (t.prototype.keys = function () {
                            return this.map.keys();
                        }),
                        t
                    );
                })();
                e.SubHandlers = c;
            },
            8644: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.NodeFactory = void 0);
                var i = a(r(8321)),
                    s = (function () {
                        function t() {
                            (this.mmlFactory = null),
                                (this.factory = {
                                    node: t.createNode,
                                    token: t.createToken,
                                    text: t.createText,
                                    error: t.createError,
                                });
                        }
                        return (
                            (t.createNode = function (t, e, r, n, o) {
                                void 0 === r && (r = []), void 0 === n && (n = {});
                                var a = t.mmlFactory.create(e);
                                return (
                                    a.setChildren(r),
                                    o && a.appendChild(o),
                                    i.default.setProperties(a, n),
                                    a
                                );
                            }),
                            (t.createToken = function (t, e, r, n) {
                                void 0 === r && (r = {}), void 0 === n && (n = '');
                                var o = t.create('text', n);
                                return t.create('node', e, [], r, o);
                            }),
                            (t.createText = function (t, e) {
                                return null == e ? null : t.mmlFactory.create('text').setText(e);
                            }),
                            (t.createError = function (t, e) {
                                var r = t.create('text', e),
                                    n = t.create('node', 'mtext', [], {}, r);
                                return t.create('node', 'merror', [n], { 'data-mjx-error': e });
                            }),
                            (t.prototype.setMmlFactory = function (t) {
                                this.mmlFactory = t;
                            }),
                            (t.prototype.set = function (t, e) {
                                this.factory[t] = e;
                            }),
                            (t.prototype.setCreators = function (t) {
                                for (var e in t) this.set(e, t[e]);
                            }),
                            (t.prototype.create = function (t) {
                                for (var e = [], r = 1; r < arguments.length; r++)
                                    e[r - 1] = arguments[r];
                                var a = this.factory[t] || this.factory.node,
                                    i = a.apply(void 0, o([this, e[0]], n(e.slice(1)), !1));
                                return 'node' === t && this.configuration.addNode(e[0], i), i;
                            }),
                            (t.prototype.get = function (t) {
                                return this.factory[t];
                            }),
                            t
                        );
                    })();
                e.NodeFactory = s;
            },
            8321: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var i,
                    s = r(8921),
                    l = r(9946);
                !(function (t) {
                    var e = new Map([
                        ['autoOP', !0],
                        ['fnOP', !0],
                        ['movesupsub', !0],
                        ['subsupOK', !0],
                        ['texprimestyle', !0],
                        ['useHeight', !0],
                        ['variantForm', !0],
                        ['withDelims', !0],
                        ['mathaccent', !0],
                        ['open', !0],
                        ['close', !0],
                    ]);
                    function r(t, r) {
                        var o, a;
                        try {
                            for (var i = n(Object.keys(r)), s = i.next(); !s.done; s = i.next()) {
                                var l = s.value,
                                    c = r[l];
                                'texClass' === l
                                    ? ((t.texClass = c), t.setProperty(l, c))
                                    : 'movablelimits' === l
                                      ? (t.setProperty('movablelimits', c),
                                        (t.isKind('mo') || t.isKind('mstyle')) &&
                                            t.attributes.set('movablelimits', c))
                                      : 'inferred' === l ||
                                        (e.has(l) ? t.setProperty(l, c) : t.attributes.set(l, c));
                            }
                        } catch (t) {
                            o = { error: t };
                        } finally {
                            try {
                                s && !s.done && (a = i.return) && a.call(i);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                    }
                    function i(t, e, r) {
                        (t.childNodes[e] = r), r && (r.parent = t);
                    }
                    function c(t, e) {
                        return t.isKind(e);
                    }
                    (t.createEntity = function (t) {
                        return String.fromCodePoint(parseInt(t, 16));
                    }),
                        (t.getChildren = function (t) {
                            return t.childNodes;
                        }),
                        (t.getText = function (t) {
                            return t.getText();
                        }),
                        (t.appendChildren = function (t, e) {
                            var r, o;
                            try {
                                for (var a = n(e), i = a.next(); !i.done; i = a.next()) {
                                    var s = i.value;
                                    t.appendChild(s);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    i && !i.done && (o = a.return) && o.call(a);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                        }),
                        (t.setAttribute = function (t, e, r) {
                            t.attributes.set(e, r);
                        }),
                        (t.setProperty = function (t, e, r) {
                            t.setProperty(e, r);
                        }),
                        (t.setProperties = r),
                        (t.getProperty = function (t, e) {
                            return t.getProperty(e);
                        }),
                        (t.getAttribute = function (t, e) {
                            return t.attributes.get(e);
                        }),
                        (t.removeProperties = function (t) {
                            for (var e = [], r = 1; r < arguments.length; r++)
                                e[r - 1] = arguments[r];
                            t.removeProperty.apply(t, a([], o(e), !1));
                        }),
                        (t.getChildAt = function (t, e) {
                            return t.childNodes[e];
                        }),
                        (t.setChild = i),
                        (t.copyChildren = function (t, e) {
                            for (var r = t.childNodes, n = 0; n < r.length; n++) i(e, n, r[n]);
                        }),
                        (t.copyAttributes = function (t, e) {
                            (e.attributes = t.attributes), r(e, t.getAllProperties());
                        }),
                        (t.isType = c),
                        (t.isEmbellished = function (t) {
                            return t.isEmbellished;
                        }),
                        (t.getTexClass = function (t) {
                            return t.texClass;
                        }),
                        (t.getCoreMO = function (t) {
                            return t.coreMO();
                        }),
                        (t.isNode = function (t) {
                            return (
                                t instanceof s.AbstractMmlNode ||
                                t instanceof s.AbstractMmlEmptyNode
                            );
                        }),
                        (t.isInferred = function (t) {
                            return t.isInferred;
                        }),
                        (t.getForm = function (t) {
                            var e, r;
                            if (!c(t, 'mo')) return null;
                            var o = t,
                                a = o.getForms();
                            try {
                                for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
                                    var u = s.value,
                                        p = l.MmlMo.OPTABLE[u][o.getText()];
                                    if (p) return p;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return null;
                        });
                })(i || (i = {})),
                    (e.default = i);
            },
            4708: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var i,
                    s = a(r(8321)),
                    l = r(7007),
                    c = a(r(7702));
                !(function (t) {
                    (t.variable = function (t, e) {
                        var r = c.default.getFontDef(t),
                            n = t.stack.env;
                        n.multiLetterIdentifiers &&
                            '' !== n.font &&
                            ((e = t.string.substr(t.i - 1).match(n.multiLetterIdentifiers)[0]),
                            (t.i += e.length - 1),
                            r.mathvariant === l.TexConstant.Variant.NORMAL &&
                                n.noAutoOP &&
                                e.length > 1 &&
                                (r.autoOP = !1));
                        var o = t.create('token', 'mi', r, e);
                        t.Push(o);
                    }),
                        (t.digit = function (t, e) {
                            var r,
                                n = t.configuration.options.digits,
                                o = t.string.slice(t.i - 1).match(n),
                                a = c.default.getFontDef(t);
                            o
                                ? ((r = t.create('token', 'mn', a, o[0].replace(/[{}]/g, ''))),
                                  (t.i += o[0].length - 1))
                                : (r = t.create('token', 'mo', a, e)),
                                t.Push(r);
                        }),
                        (t.controlSequence = function (t, e) {
                            var r = t.GetCS();
                            t.parse('macro', [t, r]);
                        }),
                        (t.mathchar0mi = function (t, e) {
                            var r = e.attributes || { mathvariant: l.TexConstant.Variant.ITALIC },
                                n = t.create('token', 'mi', r, e.char);
                            t.Push(n);
                        }),
                        (t.mathchar0mo = function (t, e) {
                            var r = e.attributes || {};
                            r.stretchy = !1;
                            var n = t.create('token', 'mo', r, e.char);
                            s.default.setProperty(n, 'fixStretchy', !0),
                                t.configuration.addNode('fixStretchy', n),
                                t.Push(n);
                        }),
                        (t.mathchar7 = function (t, e) {
                            var r = e.attributes || { mathvariant: l.TexConstant.Variant.NORMAL };
                            t.stack.env.font && (r.mathvariant = t.stack.env.font);
                            var n = t.create('token', 'mi', r, e.char);
                            t.Push(n);
                        }),
                        (t.delimiter = function (t, e) {
                            var r = e.attributes || {};
                            r = Object.assign({ fence: !1, stretchy: !1 }, r);
                            var n = t.create('token', 'mo', r, e.char);
                            t.Push(n);
                        }),
                        (t.environment = function (t, e, r, a) {
                            var i = a[0],
                                s = t.itemFactory
                                    .create('begin')
                                    .setProperties({ name: e, end: i });
                            (s = r.apply(void 0, o([t, s], n(a.slice(1)), !1))), t.Push(s);
                        });
                })(i || (i = {})),
                    (e.default = i);
            },
            6394: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = i(r(3239)),
                    l = r(8644),
                    c = i(r(8321)),
                    u = r(9077),
                    p = (function () {
                        function t(t, e) {
                            void 0 === e && (e = []),
                                (this.options = {}),
                                (this.packageData = new Map()),
                                (this.parsers = []),
                                (this.root = null),
                                (this.nodeLists = {}),
                                (this.error = !1),
                                (this.handlers = t.handlers),
                                (this.nodeFactory = new l.NodeFactory()),
                                (this.nodeFactory.configuration = this),
                                this.nodeFactory.setCreators(t.nodes),
                                (this.itemFactory = new s.default(t.items)),
                                (this.itemFactory.configuration = this),
                                u.defaultOptions.apply(void 0, o([this.options], n(e), !1)),
                                (0, u.defaultOptions)(this.options, t.options);
                        }
                        return (
                            (t.prototype.pushParser = function (t) {
                                this.parsers.unshift(t);
                            }),
                            (t.prototype.popParser = function () {
                                this.parsers.shift();
                            }),
                            Object.defineProperty(t.prototype, 'parser', {
                                get: function () {
                                    return this.parsers[0];
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.clear = function () {
                                (this.parsers = []),
                                    (this.root = null),
                                    (this.nodeLists = {}),
                                    (this.error = !1),
                                    this.tags.resetTag();
                            }),
                            (t.prototype.addNode = function (t, e) {
                                var r = this.nodeLists[t];
                                if ((r || (r = this.nodeLists[t] = []), r.push(e), e.kind !== t)) {
                                    var n = c.default.getProperty(e, 'in-lists') || '',
                                        o = (n ? n.split(/,/) : []).concat(t).join(',');
                                    c.default.setProperty(e, 'in-lists', o);
                                }
                            }),
                            (t.prototype.getList = function (t) {
                                var e,
                                    r,
                                    n = this.nodeLists[t] || [],
                                    o = [];
                                try {
                                    for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
                                        var l = s.value;
                                        this.inTree(l) && o.push(l);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (r = i.return) && r.call(i);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return (this.nodeLists[t] = o), o;
                            }),
                            (t.prototype.removeFromList = function (t, e) {
                                var r,
                                    n,
                                    o = this.nodeLists[t] || [];
                                try {
                                    for (var i = a(e), s = i.next(); !s.done; s = i.next()) {
                                        var l = s.value,
                                            c = o.indexOf(l);
                                        c >= 0 && o.splice(c, 1);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (n = i.return) && n.call(i);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }),
                            (t.prototype.inTree = function (t) {
                                for (; t && t !== this.root; ) t = t.parent;
                                return !!t;
                            }),
                            t
                        );
                    })();
                e.default = p;
            },
            7702: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var i,
                    s = r(8921),
                    l = a(r(8321)),
                    c = a(r(810)),
                    u = a(r(3466)),
                    p = r(9029);
                !(function (t) {
                    var e = 7.2,
                        r = {
                            em: function (t) {
                                return t;
                            },
                            ex: function (t) {
                                return 0.43 * t;
                            },
                            pt: function (t) {
                                return t / 10;
                            },
                            pc: function (t) {
                                return 1.2 * t;
                            },
                            px: function (t) {
                                return (t * e) / 72;
                            },
                            in: function (t) {
                                return t * e;
                            },
                            cm: function (t) {
                                return (t * e) / 2.54;
                            },
                            mm: function (t) {
                                return (t * e) / 25.4;
                            },
                            mu: function (t) {
                                return t / 18;
                            },
                        },
                        a = '([-+]?([.,]\\d+|\\d+([.,]\\d*)?))',
                        i = '(pt|em|ex|mu|px|mm|cm|in|pc)',
                        d = RegExp('^\\s*' + a + '\\s*' + i + '\\s*$'),
                        f = RegExp('^\\s*' + a + '\\s*' + i + ' ?');
                    function h(t, e) {
                        void 0 === e && (e = !1);
                        var o = t.match(e ? f : d);
                        return o
                            ? (function (t) {
                                  var e = n(t, 3),
                                      o = e[0],
                                      a = e[1],
                                      i = e[2];
                                  if ('mu' !== a) return [o, a, i];
                                  return [m(r[a](parseFloat(o || '1'))).slice(0, -2), 'em', i];
                              })([o[1].replace(/,/, '.'), o[4], o[0].length])
                            : [null, null, 0];
                    }
                    function m(t) {
                        return Math.abs(t) < 6e-4
                            ? '0em'
                            : t.toFixed(3).replace(/\.?0+$/, '') + 'em';
                    }
                    function g(t, e, r) {
                        ('{' !== e && '}' !== e) || (e = '\\' + e);
                        var n = '{\\bigg' + r + ' ' + e + '}',
                            o = '{\\big' + r + ' ' + e + '}';
                        return new c.default('\\mathchoice' + n + o + o + o, {}, t).mml();
                    }
                    function y(t, e, r) {
                        e = e.replace(/^\s+/, p.entities.nbsp).replace(/\s+$/, p.entities.nbsp);
                        var n = t.create('text', e);
                        return t.create('node', 'mtext', [], r, n);
                    }
                    function v(t, e, r) {
                        if (
                            (r.match(/^[a-z]/i) &&
                                e.match(/(^|[^\\])(\\\\)*\\[a-z]+$/i) &&
                                (e += ' '),
                            e.length + r.length > t.configuration.options.maxBuffer)
                        )
                            throw new u.default(
                                'MaxBufferSize',
                                'MathJax internal buffer size exceeded; is there a recursive macro call?',
                            );
                        return e + r;
                    }
                    function b(t, e) {
                        for (; e > 0; ) (t = t.trim().slice(1, -1)), e--;
                        return t.trim();
                    }
                    function x(t, e) {
                        for (
                            var r = t.length, n = 0, o = '', a = 0, i = 0, s = !0, l = !1;
                            a < r;

                        ) {
                            var c = t[a++];
                            switch (c) {
                                case ' ':
                                    break;
                                case '{':
                                    s ? i++ : ((l = !1), i > n && (i = n)), n++;
                                    break;
                                case '}':
                                    n && n--, (s || l) && (i--, (l = !0)), (s = !1);
                                    break;
                                default:
                                    if (!n && -1 !== e.indexOf(c))
                                        return [l ? 'true' : b(o, i), c, t.slice(a)];
                                    (s = !1), (l = !1);
                            }
                            o += c;
                        }
                        if (n)
                            throw new u.default(
                                'ExtraOpenMissingClose',
                                'Extra open brace or missing close brace',
                            );
                        return [l ? 'true' : b(o, i), '', t.slice(a)];
                    }
                    (t.matchDimen = h),
                        (t.dimen2em = function (t) {
                            var e = n(h(t), 2),
                                o = e[0],
                                a = e[1],
                                i = parseFloat(o || '1'),
                                s = r[a];
                            return s ? s(i) : 0;
                        }),
                        (t.Em = m),
                        (t.cols = function () {
                            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                            return t
                                .map(function (t) {
                                    return m(t);
                                })
                                .join(' ');
                        }),
                        (t.fenced = function (t, e, r, n, o, a) {
                            void 0 === o && (o = ''), void 0 === a && (a = '');
                            var i,
                                u = t.nodeFactory,
                                p = u.create('node', 'mrow', [], {
                                    open: e,
                                    close: n,
                                    texClass: s.TEXCLASS.INNER,
                                });
                            if (o)
                                i = new c.default('\\' + o + 'l' + e, t.parser.stack.env, t).mml();
                            else {
                                var d = u.create('text', e);
                                i = u.create(
                                    'node',
                                    'mo',
                                    [],
                                    {
                                        fence: !0,
                                        stretchy: !0,
                                        symmetric: !0,
                                        texClass: s.TEXCLASS.OPEN,
                                    },
                                    d,
                                );
                            }
                            if ((l.default.appendChildren(p, [i, r]), o))
                                i = new c.default('\\' + o + 'r' + n, t.parser.stack.env, t).mml();
                            else {
                                var f = u.create('text', n);
                                i = u.create(
                                    'node',
                                    'mo',
                                    [],
                                    {
                                        fence: !0,
                                        stretchy: !0,
                                        symmetric: !0,
                                        texClass: s.TEXCLASS.CLOSE,
                                    },
                                    f,
                                );
                            }
                            return (
                                a && i.attributes.set('mathcolor', a),
                                l.default.appendChildren(p, [i]),
                                p
                            );
                        }),
                        (t.fixedFence = function (t, e, r, n) {
                            var o = t.nodeFactory.create('node', 'mrow', [], {
                                open: e,
                                close: n,
                                texClass: s.TEXCLASS.ORD,
                            });
                            return (
                                e && l.default.appendChildren(o, [g(t, e, 'l')]),
                                l.default.isType(r, 'mrow')
                                    ? l.default.appendChildren(o, l.default.getChildren(r))
                                    : l.default.appendChildren(o, [r]),
                                n && l.default.appendChildren(o, [g(t, n, 'r')]),
                                o
                            );
                        }),
                        (t.mathPalette = g),
                        (t.fixInitialMO = function (t, e) {
                            for (var r = 0, n = e.length; r < n; r++) {
                                var o = e[r];
                                if (
                                    o &&
                                    !l.default.isType(o, 'mspace') &&
                                    (!l.default.isType(o, 'TeXAtom') ||
                                        (l.default.getChildren(o)[0] &&
                                            l.default.getChildren(l.default.getChildren(o)[0])
                                                .length))
                                ) {
                                    if (
                                        l.default.isEmbellished(o) ||
                                        (l.default.isType(o, 'TeXAtom') &&
                                            l.default.getTexClass(o) === s.TEXCLASS.REL)
                                    ) {
                                        var a = t.nodeFactory.create('node', 'mi');
                                        e.unshift(a);
                                    }
                                    break;
                                }
                            }
                        }),
                        (t.internalMath = function (t, e, r, n) {
                            if (t.configuration.options.internalMath)
                                return t.configuration.options.internalMath(t, e, r, n);
                            var o,
                                a,
                                i = n || t.stack.env.font,
                                s = i ? { mathvariant: i } : {},
                                l = [],
                                p = 0,
                                d = 0,
                                f = '',
                                h = 0;
                            if (e.match(/\\?[${}\\]|\\\(|\\(eq)?ref\s*\{/)) {
                                for (; p < e.length; )
                                    if ('$' === (o = e.charAt(p++)))
                                        '$' === f && 0 === h
                                            ? ((a = t.create('node', 'TeXAtom', [
                                                  new c.default(
                                                      e.slice(d, p - 1),
                                                      {},
                                                      t.configuration,
                                                  ).mml(),
                                              ])),
                                              l.push(a),
                                              (f = ''),
                                              (d = p))
                                            : '' === f &&
                                              (d < p - 1 && l.push(y(t, e.slice(d, p - 1), s)),
                                              (f = '$'),
                                              (d = p));
                                    else if ('{' === o && '' !== f) h++;
                                    else if ('}' === o)
                                        if ('}' === f && 0 === h) {
                                            var m = new c.default(
                                                e.slice(d, p),
                                                {},
                                                t.configuration,
                                            ).mml();
                                            (a = t.create('node', 'TeXAtom', [m], s)),
                                                l.push(a),
                                                (f = ''),
                                                (d = p);
                                        } else '' !== f && h && h--;
                                    else if ('\\' === o)
                                        if ('' === f && e.substr(p).match(/^(eq)?ref\s*\{/)) {
                                            var g = RegExp['$&'].length;
                                            d < p - 1 && l.push(y(t, e.slice(d, p - 1), s)),
                                                (f = '}'),
                                                (d = p - 1),
                                                (p += g);
                                        } else
                                            '(' === (o = e.charAt(p++)) && '' === f
                                                ? (d < p - 2 && l.push(y(t, e.slice(d, p - 2), s)),
                                                  (f = ')'),
                                                  (d = p))
                                                : ')' === o && ')' === f && 0 === h
                                                  ? ((a = t.create('node', 'TeXAtom', [
                                                        new c.default(
                                                            e.slice(d, p - 2),
                                                            {},
                                                            t.configuration,
                                                        ).mml(),
                                                    ])),
                                                    l.push(a),
                                                    (f = ''),
                                                    (d = p))
                                                  : o.match(/[${}\\]/) &&
                                                    '' === f &&
                                                    (p--, (e = e.substr(0, p - 1) + e.substr(p)));
                                if ('' !== f)
                                    throw new u.default(
                                        'MathNotTerminated',
                                        'Math not terminated in text box',
                                    );
                            }
                            return (
                                d < e.length && l.push(y(t, e.slice(d), s)),
                                null != r
                                    ? (l = [
                                          t.create('node', 'mstyle', l, {
                                              displaystyle: !1,
                                              scriptlevel: r,
                                          }),
                                      ])
                                    : l.length > 1 && (l = [t.create('node', 'mrow', l)]),
                                l
                            );
                        }),
                        (t.internalText = y),
                        (t.underOver = function (e, r, n, o, a) {
                            if (
                                (t.checkMovableLimits(r),
                                l.default.isType(r, 'munderover') && l.default.isEmbellished(r))
                            ) {
                                l.default.setProperties(l.default.getCoreMO(r), {
                                    lspace: 0,
                                    rspace: 0,
                                });
                                var i = e.create('node', 'mo', [], { rspace: 0 });
                                r = e.create('node', 'mrow', [i, r]);
                            }
                            var c = e.create('node', 'munderover', [r]);
                            l.default.setChild(c, 'over' === o ? c.over : c.under, n);
                            var u = c;
                            return (
                                a &&
                                    (u = e.create('node', 'TeXAtom', [c], {
                                        texClass: s.TEXCLASS.OP,
                                        movesupsub: !0,
                                    })),
                                l.default.setProperty(u, 'subsupOK', !0),
                                u
                            );
                        }),
                        (t.checkMovableLimits = function (t) {
                            var e = l.default.isType(t, 'mo') ? l.default.getForm(t) : null;
                            (l.default.getProperty(t, 'movablelimits') ||
                                (e && e[3] && e[3].movablelimits)) &&
                                l.default.setProperties(t, { movablelimits: !1 });
                        }),
                        (t.trimSpaces = function (t) {
                            if ('string' != typeof t) return t;
                            var e = t.trim();
                            return e.match(/\\$/) && t.match(/ $/) && (e += ' '), e;
                        }),
                        (t.setArrayAlign = function (e, r) {
                            return (
                                't' === (r = t.trimSpaces(r || ''))
                                    ? (e.arraydef.align = 'baseline 1')
                                    : 'b' === r
                                      ? (e.arraydef.align = 'baseline -1')
                                      : 'c' === r
                                        ? (e.arraydef.align = 'axis')
                                        : r && (e.arraydef.align = r),
                                e
                            );
                        }),
                        (t.substituteArgs = function (t, e, r) {
                            for (var n = '', o = '', a = 0; a < r.length; ) {
                                var i = r.charAt(a++);
                                if ('\\' === i) n += i + r.charAt(a++);
                                else if ('#' === i)
                                    if ('#' === (i = r.charAt(a++))) n += i;
                                    else {
                                        if (!i.match(/[1-9]/) || parseInt(i, 10) > e.length)
                                            throw new u.default(
                                                'IllegalMacroParam',
                                                'Illegal macro parameter reference',
                                            );
                                        (o = v(t, v(t, o, n), e[parseInt(i, 10) - 1])), (n = '');
                                    }
                                else n += i;
                            }
                            return v(t, o, n);
                        }),
                        (t.addArgs = v),
                        (t.checkMaxMacros = function (t, e) {
                            if (
                                (void 0 === e && (e = !0),
                                !(++t.macroCount <= t.configuration.options.maxMacros))
                            )
                                throw e
                                    ? new u.default(
                                          'MaxMacroSub1',
                                          'MathJax maximum macro substitution count exceeded; is here a recursive macro call?',
                                      )
                                    : new u.default(
                                          'MaxMacroSub2',
                                          'MathJax maximum substitution count exceeded; is there a recursive latex environment?',
                                      );
                        }),
                        (t.checkEqnEnv = function (t) {
                            if (t.stack.global.eqnenv)
                                throw new u.default(
                                    'ErroneousNestingEq',
                                    'Erroneous nesting of equation structures',
                                );
                            t.stack.global.eqnenv = !0;
                        }),
                        (t.copyNode = function (t, e) {
                            var r = t.copy(),
                                n = e.configuration;
                            return (
                                r.walkTree(function (t) {
                                    var e, r;
                                    n.addNode(t.kind, t);
                                    var a = (t.getProperty('in-lists') || '').split(/,/);
                                    try {
                                        for (var i = o(a), s = i.next(); !s.done; s = i.next()) {
                                            var l = s.value;
                                            l && n.addNode(l, t);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            s && !s.done && (r = i.return) && r.call(i);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                                }),
                                r
                            );
                        }),
                        (t.MmlFilterAttribute = function (t, e, r) {
                            return r;
                        }),
                        (t.getFontDef = function (t) {
                            var e = t.stack.env.font;
                            return e ? { mathvariant: e } : {};
                        }),
                        (t.keyvalOptions = function (t, e, r) {
                            var a, i;
                            void 0 === e && (e = null), void 0 === r && (r = !1);
                            var s = (function (t) {
                                var e,
                                    r,
                                    o,
                                    a,
                                    i,
                                    s = {},
                                    l = t;
                                for (; l; )
                                    (a = (e = n(x(l, ['=', ',']), 3))[0]),
                                        (o = e[1]),
                                        (l = e[2]),
                                        '=' === o
                                            ? ((i = (r = n(x(l, [',']), 3))[0]),
                                              (o = r[1]),
                                              (l = r[2]),
                                              (i =
                                                  'false' === i || 'true' === i
                                                      ? JSON.parse(i)
                                                      : i),
                                              (s[a] = i))
                                            : a && (s[a] = !0);
                                return s;
                            })(t);
                            if (e)
                                try {
                                    for (
                                        var l = o(Object.keys(s)), c = l.next();
                                        !c.done;
                                        c = l.next()
                                    ) {
                                        var p = c.value;
                                        if (!e.hasOwnProperty(p)) {
                                            if (r)
                                                throw new u.default(
                                                    'InvalidOption',
                                                    'Invalid option: %1',
                                                    p,
                                                );
                                            delete s[p];
                                        }
                                    }
                                } catch (t) {
                                    a = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (i = l.return) && i.call(l);
                                    } finally {
                                        if (a) throw a.error;
                                    }
                                }
                            return s;
                        });
                })(i || (i = {})),
                    (e.default = i);
            },
            9874: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = i(r(8321)),
                    l = (function () {
                        function t(t, e, r) {
                            (this._factory = t),
                                (this._env = e),
                                (this.global = {}),
                                (this.stack = []),
                                (this.global = { isInner: r }),
                                (this.stack = [this._factory.create('start', this.global)]),
                                e && (this.stack[0].env = e),
                                (this.env = this.stack[0].env);
                        }
                        return (
                            Object.defineProperty(t.prototype, 'env', {
                                get: function () {
                                    return this._env;
                                },
                                set: function (t) {
                                    this._env = t;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.Push = function () {
                                for (var t, e, r = [], i = 0; i < arguments.length; i++)
                                    r[i] = arguments[i];
                                try {
                                    for (var l = n(r), c = l.next(); !c.done; c = l.next()) {
                                        var u = c.value;
                                        if (u) {
                                            var p = s.default.isNode(u)
                                                ? this._factory.create('mml', u)
                                                : u;
                                            p.global = this.global;
                                            var d = o(
                                                    this.stack.length
                                                        ? this.Top().checkItem(p)
                                                        : [null, !0],
                                                    2,
                                                ),
                                                f = d[0],
                                                h = d[1];
                                            h &&
                                                (f
                                                    ? (this.Pop(),
                                                      this.Push.apply(this, a([], o(f), !1)))
                                                    : (this.stack.push(p),
                                                      p.env
                                                          ? (p.copyEnv &&
                                                                Object.assign(p.env, this.env),
                                                            (this.env = p.env))
                                                          : (p.env = this.env)));
                                        }
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
                            }),
                            (t.prototype.Pop = function () {
                                var t = this.stack.pop();
                                return (
                                    t.isOpen || delete t.env,
                                    (this.env = this.stack.length ? this.Top().env : {}),
                                    t
                                );
                            }),
                            (t.prototype.Top = function (t) {
                                return (
                                    void 0 === t && (t = 1),
                                    this.stack.length < t ? null : this.stack[this.stack.length - t]
                                );
                            }),
                            (t.prototype.Prev = function (t) {
                                var e = this.Top();
                                return t ? e.First : e.Pop();
                            }),
                            (t.prototype.toString = function () {
                                return 'stack[\n  ' + this.stack.join('\n  ') + '\n]';
                            }),
                            t
                        );
                    })();
                e.default = l;
            },
            7044: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    s =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BaseItem = e.MmlStack = void 0);
                var c = l(r(3466)),
                    u = (function () {
                        function t(t) {
                            this._nodes = t;
                        }
                        return (
                            Object.defineProperty(t.prototype, 'nodes', {
                                get: function () {
                                    return this._nodes;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.Push = function () {
                                for (var t, e = [], r = 0; r < arguments.length; r++)
                                    e[r] = arguments[r];
                                (t = this._nodes).push.apply(t, i([], a(e), !1));
                            }),
                            (t.prototype.Pop = function () {
                                return this._nodes.pop();
                            }),
                            Object.defineProperty(t.prototype, 'First', {
                                get: function () {
                                    return this._nodes[this.Size() - 1];
                                },
                                set: function (t) {
                                    this._nodes[this.Size() - 1] = t;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(t.prototype, 'Last', {
                                get: function () {
                                    return this._nodes[0];
                                },
                                set: function (t) {
                                    this._nodes[0] = t;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.Peek = function (t) {
                                return null == t && (t = 1), this._nodes.slice(this.Size() - t);
                            }),
                            (t.prototype.Size = function () {
                                return this._nodes.length;
                            }),
                            (t.prototype.Clear = function () {
                                this._nodes = [];
                            }),
                            (t.prototype.toMml = function (t, e) {
                                return (
                                    void 0 === t && (t = !0),
                                    1 !== this._nodes.length || e
                                        ? this.create(
                                              'node',
                                              t ? 'inferredMrow' : 'mrow',
                                              this._nodes,
                                              {},
                                          )
                                        : this.First
                                );
                            }),
                            (t.prototype.create = function (t) {
                                for (var e, r = [], n = 1; n < arguments.length; n++)
                                    r[n - 1] = arguments[n];
                                return (e = this.factory.configuration.nodeFactory).create.apply(
                                    e,
                                    i([t], a(r), !1),
                                );
                            }),
                            t
                        );
                    })();
                e.MmlStack = u;
                var p = (function (t) {
                    function e(e) {
                        for (var r = [], n = 1; n < arguments.length; n++) r[n - 1] = arguments[n];
                        var o = t.call(this, r) || this;
                        return (
                            (o.factory = e),
                            (o.global = {}),
                            (o._properties = {}),
                            o.isOpen && (o._env = {}),
                            o
                        );
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'base';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'env', {
                            get: function () {
                                return this._env;
                            },
                            set: function (t) {
                                this._env = t;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'copyEnv', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.getProperty = function (t) {
                            return this._properties[t];
                        }),
                        (e.prototype.setProperty = function (t, e) {
                            return (this._properties[t] = e), this;
                        }),
                        Object.defineProperty(e.prototype, 'isOpen', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isClose', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isFinal', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.isKind = function (t) {
                            return t === this.kind;
                        }),
                        (e.prototype.checkItem = function (t) {
                            if (
                                (t.isKind('over') &&
                                    this.isOpen &&
                                    (t.setProperty('num', this.toMml(!1)), this.Clear()),
                                t.isKind('cell') && this.isOpen)
                            ) {
                                if (t.getProperty('linebreak')) return e.fail;
                                throw new c.default('Misplaced', 'Misplaced %1', t.getName());
                            }
                            if (t.isClose && this.getErrors(t.kind)) {
                                var r = a(this.getErrors(t.kind), 2),
                                    n = r[0],
                                    o = r[1];
                                throw new c.default(n, o, t.getName());
                            }
                            return t.isFinal ? (this.Push(t.First), e.fail) : e.success;
                        }),
                        (e.prototype.clearEnv = function () {
                            var t, e;
                            try {
                                for (
                                    var r = s(Object.keys(this.env)), n = r.next();
                                    !n.done;
                                    n = r.next()
                                ) {
                                    var o = n.value;
                                    delete this.env[o];
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    n && !n.done && (e = r.return) && e.call(r);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                        }),
                        (e.prototype.setProperties = function (t) {
                            return Object.assign(this._properties, t), this;
                        }),
                        (e.prototype.getName = function () {
                            return this.getProperty('name');
                        }),
                        (e.prototype.toString = function () {
                            return this.kind + '[' + this.nodes.join('; ') + ']';
                        }),
                        (e.prototype.getErrors = function (t) {
                            return (this.constructor.errors || {})[t] || e.errors[t];
                        }),
                        (e.fail = [null, !1]),
                        (e.success = [null, !0]),
                        (e.errors = {
                            end: ['MissingBeginExtraEnd', 'Missing \\begin{%1} or extra \\end{%1}'],
                            close: [
                                'ExtraCloseMissingOpen',
                                'Extra close brace or missing open brace',
                            ],
                            right: ['MissingLeftExtraRight', 'Missing \\left or extra \\right'],
                            middle: ['ExtraMiddle', 'Extra \\middle'],
                        }),
                        e
                    );
                })(u);
                e.BaseItem = p;
            },
            3239: function (t, e, r) {
                var n,
                    o,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 });
                var i = r(7044),
                    s = r(752),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return a(e, t), e;
                    })(i.BaseItem),
                    c = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.defaultKind = 'dummy'), (e.configuration = null), e;
                        }
                        return (
                            a(e, t),
                            (e.DefaultStackItems = (((o = {})[l.prototype.kind] = l), o)),
                            e
                        );
                    })(s.AbstractFactory);
                e.default = c;
            },
            4237: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Macro = e.Symbol = void 0);
                var r = (function () {
                    function t(t, e, r) {
                        (this._symbol = t), (this._char = e), (this._attributes = r);
                    }
                    return (
                        Object.defineProperty(t.prototype, 'symbol', {
                            get: function () {
                                return this._symbol;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(t.prototype, 'char', {
                            get: function () {
                                return this._char;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(t.prototype, 'attributes', {
                            get: function () {
                                return this._attributes;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        t
                    );
                })();
                e.Symbol = r;
                var n = (function () {
                    function t(t, e, r) {
                        void 0 === r && (r = []),
                            (this._symbol = t),
                            (this._func = e),
                            (this._args = r);
                    }
                    return (
                        Object.defineProperty(t.prototype, 'symbol', {
                            get: function () {
                                return this._symbol;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(t.prototype, 'func', {
                            get: function () {
                                return this._func;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(t.prototype, 'args', {
                            get: function () {
                                return this._args;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        t
                    );
                })();
                e.Macro = n;
            },
            7628: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    i =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    s =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.EnvironmentMap =
                        e.CommandMap =
                        e.MacroMap =
                        e.DelimiterMap =
                        e.CharacterMap =
                        e.AbstractParseMap =
                        e.RegExpMap =
                        e.AbstractSymbolMap =
                        e.parseResult =
                            void 0);
                var l = r(4237),
                    c = r(2910);
                function u(t) {
                    return void 0 === t || t;
                }
                e.parseResult = u;
                var p = (function () {
                    function t(t, e) {
                        (this._name = t), (this._parser = e), c.MapHandler.register(this);
                    }
                    return (
                        Object.defineProperty(t.prototype, 'name', {
                            get: function () {
                                return this._name;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (t.prototype.parserFor = function (t) {
                            return this.contains(t) ? this.parser : null;
                        }),
                        (t.prototype.parse = function (t) {
                            var e = a(t, 2),
                                r = e[0],
                                n = e[1],
                                o = this.parserFor(n),
                                i = this.lookup(n);
                            return o && i ? u(o(r, i)) : null;
                        }),
                        Object.defineProperty(t.prototype, 'parser', {
                            get: function () {
                                return this._parser;
                            },
                            set: function (t) {
                                this._parser = t;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        t
                    );
                })();
                e.AbstractSymbolMap = p;
                var d = (function (t) {
                    function e(e, r, n) {
                        var o = t.call(this, e, r) || this;
                        return (o._regExp = n), o;
                    }
                    return (
                        o(e, t),
                        (e.prototype.contains = function (t) {
                            return this._regExp.test(t);
                        }),
                        (e.prototype.lookup = function (t) {
                            return this.contains(t) ? t : null;
                        }),
                        e
                    );
                })(p);
                e.RegExpMap = d;
                var f = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.map = new Map()), e;
                    }
                    return (
                        o(e, t),
                        (e.prototype.lookup = function (t) {
                            return this.map.get(t);
                        }),
                        (e.prototype.contains = function (t) {
                            return this.map.has(t);
                        }),
                        (e.prototype.add = function (t, e) {
                            this.map.set(t, e);
                        }),
                        (e.prototype.remove = function (t) {
                            this.map.delete(t);
                        }),
                        e
                    );
                })(p);
                e.AbstractParseMap = f;
                var h = (function (t) {
                    function e(e, r, n) {
                        var o,
                            s,
                            c = t.call(this, e, r) || this;
                        try {
                            for (var u = i(Object.keys(n)), p = u.next(); !p.done; p = u.next()) {
                                var d = p.value,
                                    f = n[d],
                                    h = a('string' == typeof f ? [f, null] : f, 2),
                                    m = h[0],
                                    g = h[1],
                                    y = new l.Symbol(d, m, g);
                                c.add(d, y);
                            }
                        } catch (t) {
                            o = { error: t };
                        } finally {
                            try {
                                p && !p.done && (s = u.return) && s.call(u);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        return c;
                    }
                    return o(e, t), e;
                })(f);
                e.CharacterMap = h;
                var m = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        (e.prototype.parse = function (e) {
                            var r = a(e, 2),
                                n = r[0],
                                o = r[1];
                            return t.prototype.parse.call(this, [n, '\\' + o]);
                        }),
                        e
                    );
                })(h);
                e.DelimiterMap = m;
                var g = (function (t) {
                    function e(e, r, n) {
                        var o,
                            s,
                            c = t.call(this, e, null) || this;
                        try {
                            for (var u = i(Object.keys(r)), p = u.next(); !p.done; p = u.next()) {
                                var d = p.value,
                                    f = r[d],
                                    h = a('string' == typeof f ? [f] : f),
                                    m = h[0],
                                    g = h.slice(1),
                                    y = new l.Macro(d, n[m], g);
                                c.add(d, y);
                            }
                        } catch (t) {
                            o = { error: t };
                        } finally {
                            try {
                                p && !p.done && (s = u.return) && s.call(u);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        return c;
                    }
                    return (
                        o(e, t),
                        (e.prototype.parserFor = function (t) {
                            var e = this.lookup(t);
                            return e ? e.func : null;
                        }),
                        (e.prototype.parse = function (t) {
                            var e = a(t, 2),
                                r = e[0],
                                n = e[1],
                                o = this.lookup(n),
                                i = this.parserFor(n);
                            return o && i
                                ? u(i.apply(void 0, s([r, o.symbol], a(o.args), !1)))
                                : null;
                        }),
                        e
                    );
                })(f);
                e.MacroMap = g;
                var y = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        (e.prototype.parse = function (t) {
                            var e = a(t, 2),
                                r = e[0],
                                n = e[1],
                                o = this.lookup(n),
                                i = this.parserFor(n);
                            if (!o || !i) return null;
                            var l = r.currentCS;
                            r.currentCS = '\\' + n;
                            var c = i.apply(void 0, s([r, '\\' + o.symbol], a(o.args), !1));
                            return (r.currentCS = l), u(c);
                        }),
                        e
                    );
                })(g);
                e.CommandMap = y;
                var v = (function (t) {
                    function e(e, r, n, o) {
                        var a = t.call(this, e, n, o) || this;
                        return (a.parser = r), a;
                    }
                    return (
                        o(e, t),
                        (e.prototype.parse = function (t) {
                            var e = a(t, 2),
                                r = e[0],
                                n = e[1],
                                o = this.lookup(n),
                                i = this.parserFor(n);
                            return o && i ? u(this.parser(r, o.symbol, i, o.args)) : null;
                        }),
                        e
                    );
                })(g);
                e.EnvironmentMap = v;
            },
            7251: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TagsFactory =
                        e.AllTags =
                        e.NoTags =
                        e.AbstractTags =
                        e.TagInfo =
                        e.Label =
                            void 0);
                var s = i(r(810)),
                    l = function (t, e) {
                        void 0 === t && (t = '???'),
                            void 0 === e && (e = ''),
                            (this.tag = t),
                            (this.id = e);
                    };
                e.Label = l;
                var c = function (t, e, r, n, o, a, i, s) {
                    void 0 === t && (t = ''),
                        void 0 === e && (e = !1),
                        void 0 === r && (r = !1),
                        void 0 === n && (n = null),
                        void 0 === o && (o = ''),
                        void 0 === a && (a = ''),
                        void 0 === i && (i = !1),
                        void 0 === s && (s = ''),
                        (this.env = t),
                        (this.taggable = e),
                        (this.defaultTags = r),
                        (this.tag = n),
                        (this.tagId = o),
                        (this.tagFormat = a),
                        (this.noTag = i),
                        (this.labelId = s);
                };
                e.TagInfo = c;
                var u = (function () {
                    function t() {
                        (this.counter = 0),
                            (this.allCounter = 0),
                            (this.configuration = null),
                            (this.ids = {}),
                            (this.allIds = {}),
                            (this.labels = {}),
                            (this.allLabels = {}),
                            (this.redo = !1),
                            (this.refUpdate = !1),
                            (this.currentTag = new c()),
                            (this.history = []),
                            (this.stack = []),
                            (this.enTag = function (t, e) {
                                var r = this.configuration.nodeFactory,
                                    n = r.create('node', 'mtd', [t]),
                                    o = r.create('node', 'mlabeledtr', [e, n]);
                                return r.create('node', 'mtable', [o], {
                                    side: this.configuration.options.tagSide,
                                    minlabelspacing: this.configuration.options.tagIndent,
                                    displaystyle: !0,
                                });
                            });
                    }
                    return (
                        (t.prototype.start = function (t, e, r) {
                            this.currentTag && this.stack.push(this.currentTag),
                                (this.currentTag = new c(t, e, r));
                        }),
                        Object.defineProperty(t.prototype, 'env', {
                            get: function () {
                                return this.currentTag.env;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (t.prototype.end = function () {
                            this.history.push(this.currentTag),
                                (this.currentTag = this.stack.pop());
                        }),
                        (t.prototype.tag = function (t, e) {
                            (this.currentTag.tag = t),
                                (this.currentTag.tagFormat = e ? t : this.formatTag(t)),
                                (this.currentTag.noTag = !1);
                        }),
                        (t.prototype.notag = function () {
                            this.tag('', !0), (this.currentTag.noTag = !0);
                        }),
                        Object.defineProperty(t.prototype, 'noTag', {
                            get: function () {
                                return this.currentTag.noTag;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(t.prototype, 'label', {
                            get: function () {
                                return this.currentTag.labelId;
                            },
                            set: function (t) {
                                this.currentTag.labelId = t;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (t.prototype.formatUrl = function (t, e) {
                            return e + '#' + encodeURIComponent(t);
                        }),
                        (t.prototype.formatTag = function (t) {
                            return '(' + t + ')';
                        }),
                        (t.prototype.formatId = function (t) {
                            return 'mjx-eqn:' + t.replace(/\s/g, '_');
                        }),
                        (t.prototype.formatNumber = function (t) {
                            return t.toString();
                        }),
                        (t.prototype.autoTag = function () {
                            null == this.currentTag.tag &&
                                (this.counter++, this.tag(this.formatNumber(this.counter), !1));
                        }),
                        (t.prototype.clearTag = function () {
                            (this.label = ''), this.tag(null, !0), (this.currentTag.tagId = '');
                        }),
                        (t.prototype.getTag = function (t) {
                            if ((void 0 === t && (t = !1), t))
                                return this.autoTag(), this.makeTag();
                            var e = this.currentTag;
                            return e.taggable &&
                                !e.noTag &&
                                (e.defaultTags && this.autoTag(), e.tag)
                                ? this.makeTag()
                                : null;
                        }),
                        (t.prototype.resetTag = function () {
                            (this.history = []),
                                (this.redo = !1),
                                (this.refUpdate = !1),
                                this.clearTag();
                        }),
                        (t.prototype.reset = function (t) {
                            void 0 === t && (t = 0),
                                this.resetTag(),
                                (this.counter = this.allCounter = t),
                                (this.allLabels = {}),
                                (this.allIds = {});
                        }),
                        (t.prototype.startEquation = function (t) {
                            (this.history = []),
                                (this.stack = []),
                                this.clearTag(),
                                (this.currentTag = new c('', void 0, void 0)),
                                (this.labels = {}),
                                (this.ids = {}),
                                (this.counter = this.allCounter),
                                (this.redo = !1);
                            var e = t.inputData.recompile;
                            e && ((this.refUpdate = !0), (this.counter = e.counter));
                        }),
                        (t.prototype.finishEquation = function (t) {
                            this.redo &&
                                (t.inputData.recompile = {
                                    state: t.state(),
                                    counter: this.allCounter,
                                }),
                                this.refUpdate || (this.allCounter = this.counter),
                                Object.assign(this.allIds, this.ids),
                                Object.assign(this.allLabels, this.labels);
                        }),
                        (t.prototype.finalize = function (t, e) {
                            if (!e.display || this.currentTag.env || null == this.currentTag.tag)
                                return t;
                            var r = this.makeTag();
                            return this.enTag(t, r);
                        }),
                        (t.prototype.makeId = function () {
                            this.currentTag.tagId = this.formatId(
                                (this.configuration.options.useLabelIds && this.label) ||
                                    this.currentTag.tag,
                            );
                        }),
                        (t.prototype.makeTag = function () {
                            this.makeId(),
                                this.label &&
                                    (this.labels[this.label] = new l(
                                        this.currentTag.tag,
                                        this.currentTag.tagId,
                                    ));
                            var t = new s.default(
                                '\\text{' + this.currentTag.tagFormat + '}',
                                {},
                                this.configuration,
                            ).mml();
                            return this.configuration.nodeFactory.create('node', 'mtd', [t], {
                                id: this.currentTag.tagId,
                            });
                        }),
                        t
                    );
                })();
                e.AbstractTags = u;
                var p = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        (e.prototype.autoTag = function () {}),
                        (e.prototype.getTag = function () {
                            return this.currentTag.tag ? t.prototype.getTag.call(this) : null;
                        }),
                        e
                    );
                })(u);
                e.NoTags = p;
                var d = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        (e.prototype.finalize = function (t, e) {
                            if (
                                !e.display ||
                                this.history.find(function (t) {
                                    return t.taggable;
                                })
                            )
                                return t;
                            var r = this.getTag(!0);
                            return this.enTag(t, r);
                        }),
                        e
                    );
                })(u);
                (e.AllTags = d),
                    (function (t) {
                        var e = new Map([
                                ['none', p],
                                ['all', d],
                            ]),
                            r = 'none';
                        (t.OPTIONS = {
                            tags: r,
                            tagSide: 'right',
                            tagIndent: '0.8em',
                            useLabelIds: !0,
                            ignoreDuplicateLabels: !1,
                        }),
                            (t.add = function (t, r) {
                                e.set(t, r);
                            }),
                            (t.addTags = function (e) {
                                var r, n;
                                try {
                                    for (
                                        var o = a(Object.keys(e)), i = o.next();
                                        !i.done;
                                        i = o.next()
                                    ) {
                                        var s = i.value;
                                        t.add(s, e[s]);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        i && !i.done && (n = o.return) && n.call(o);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }),
                            (t.create = function (t) {
                                var n = e.get(t) || e.get(r);
                                if (!n) throw Error('Unknown tags class');
                                return new n();
                            }),
                            (t.setDefault = function (t) {
                                r = t;
                            }),
                            (t.getDefault = function () {
                                return t.create(r);
                            });
                    })(e.TagsFactory || (e.TagsFactory = {}));
            },
            7007: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TexConstant = void 0),
                    (function (t) {
                        (t.Variant = {
                            NORMAL: 'normal',
                            BOLD: 'bold',
                            ITALIC: 'italic',
                            BOLDITALIC: 'bold-italic',
                            DOUBLESTRUCK: 'double-struck',
                            FRAKTUR: 'fraktur',
                            BOLDFRAKTUR: 'bold-fraktur',
                            SCRIPT: 'script',
                            BOLDSCRIPT: 'bold-script',
                            SANSSERIF: 'sans-serif',
                            BOLDSANSSERIF: 'bold-sans-serif',
                            SANSSERIFITALIC: 'sans-serif-italic',
                            SANSSERIFBOLDITALIC: 'sans-serif-bold-italic',
                            MONOSPACE: 'monospace',
                            INITIAL: 'inital',
                            TAILED: 'tailed',
                            LOOPED: 'looped',
                            STRETCHED: 'stretched',
                            CALLIGRAPHIC: '-tex-calligraphic',
                            BOLDCALLIGRAPHIC: '-tex-bold-calligraphic',
                            OLDSTYLE: '-tex-oldstyle',
                            BOLDOLDSTYLE: '-tex-bold-oldstyle',
                            MATHITALIC: '-tex-mathit',
                        }),
                            (t.Form = { PREFIX: 'prefix', INFIX: 'infix', POSTFIX: 'postfix' }),
                            (t.LineBreak = {
                                AUTO: 'auto',
                                NEWLINE: 'newline',
                                NOBREAK: 'nobreak',
                                GOODBREAK: 'goodbreak',
                                BADBREAK: 'badbreak',
                            }),
                            (t.LineBreakStyle = {
                                BEFORE: 'before',
                                AFTER: 'after',
                                DUPLICATE: 'duplicate',
                                INFIXLINBREAKSTYLE: 'infixlinebreakstyle',
                            }),
                            (t.IndentAlign = {
                                LEFT: 'left',
                                CENTER: 'center',
                                RIGHT: 'right',
                                AUTO: 'auto',
                                ID: 'id',
                                INDENTALIGN: 'indentalign',
                            }),
                            (t.IndentShift = { INDENTSHIFT: 'indentshift' }),
                            (t.LineThickness = { THIN: 'thin', MEDIUM: 'medium', THICK: 'thick' }),
                            (t.Notation = {
                                LONGDIV: 'longdiv',
                                ACTUARIAL: 'actuarial',
                                PHASORANGLE: 'phasorangle',
                                RADICAL: 'radical',
                                BOX: 'box',
                                ROUNDEDBOX: 'roundedbox',
                                CIRCLE: 'circle',
                                LEFT: 'left',
                                RIGHT: 'right',
                                TOP: 'top',
                                BOTTOM: 'bottom',
                                UPDIAGONALSTRIKE: 'updiagonalstrike',
                                DOWNDIAGONALSTRIKE: 'downdiagonalstrike',
                                VERTICALSTRIKE: 'verticalstrike',
                                HORIZONTALSTRIKE: 'horizontalstrike',
                                NORTHEASTARROW: 'northeastarrow',
                                MADRUWB: 'madruwb',
                                UPDIAGONALARROW: 'updiagonalarrow',
                            }),
                            (t.Align = {
                                TOP: 'top',
                                BOTTOM: 'bottom',
                                CENTER: 'center',
                                BASELINE: 'baseline',
                                AXIS: 'axis',
                                LEFT: 'left',
                                RIGHT: 'right',
                            }),
                            (t.Lines = { NONE: 'none', SOLID: 'solid', DASHED: 'dashed' }),
                            (t.Side = {
                                LEFT: 'left',
                                RIGHT: 'right',
                                LEFTOVERLAP: 'leftoverlap',
                                RIGHTOVERLAP: 'rightoverlap',
                            }),
                            (t.Width = { AUTO: 'auto', FIT: 'fit' }),
                            (t.Actiontype = {
                                TOGGLE: 'toggle',
                                STATUSLINE: 'statusline',
                                TOOLTIP: 'tooltip',
                                INPUT: 'input',
                            }),
                            (t.Overflow = {
                                LINBREAK: 'linebreak',
                                SCROLL: 'scroll',
                                ELIDE: 'elide',
                                TRUNCATE: 'truncate',
                                SCALE: 'scale',
                            }),
                            (t.Unit = {
                                EM: 'em',
                                EX: 'ex',
                                PX: 'px',
                                IN: 'in',
                                CM: 'cm',
                                MM: 'mm',
                                PT: 'pt',
                                PC: 'pc',
                            });
                    })(e.TexConstant || (e.TexConstant = {}));
            },
            3466: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 });
                var r = (function () {
                    function t(e, r) {
                        for (var n = [], o = 2; o < arguments.length; o++) n[o - 2] = arguments[o];
                        (this.id = e), (this.message = t.processString(r, n));
                    }
                    return (
                        (t.processString = function (e, r) {
                            for (var n = e.split(t.pattern), o = 1, a = n.length; o < a; o += 2) {
                                var i = n[o].charAt(0);
                                if (i >= '0' && i <= '9')
                                    (n[o] = r[parseInt(n[o], 10) - 1]),
                                        'number' == typeof n[o] && (n[o] = n[o].toString());
                                else if ('{' === i) {
                                    if ((i = n[o].substr(1)) >= '0' && i <= '9')
                                        (n[o] =
                                            r[parseInt(n[o].substr(1, n[o].length - 2), 10) - 1]),
                                            'number' == typeof n[o] && (n[o] = n[o].toString());
                                    else
                                        n[o].match(/^\{([a-z]+):%(\d+)\|(.*)\}$/) &&
                                            (n[o] = '%' + n[o]);
                                }
                                null == n[o] && (n[o] = '???');
                            }
                            return n.join('');
                        }),
                        (t.pattern =
                            /%(\d+|\{\d+\}|\{[a-z]+:\%\d+(?:\|(?:%\{\d+\}|%.|[^\}])*)+\}|.)/g),
                        t
                    );
                })();
                e.default = r;
            },
            810: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = i(r(7702)),
                    l = i(r(9874)),
                    c = i(r(3466)),
                    u = r(8921),
                    p = (function () {
                        function t(t, e, r) {
                            var o, a;
                            (this._string = t),
                                (this.configuration = r),
                                (this.macroCount = 0),
                                (this.i = 0),
                                (this.currentCS = '');
                            var i,
                                s = e.hasOwnProperty('isInner'),
                                c = e.isInner;
                            if ((delete e.isInner, e)) {
                                i = {};
                                try {
                                    for (
                                        var u = n(Object.keys(e)), p = u.next();
                                        !p.done;
                                        p = u.next()
                                    ) {
                                        var d = p.value;
                                        i[d] = e[d];
                                    }
                                } catch (t) {
                                    o = { error: t };
                                } finally {
                                    try {
                                        p && !p.done && (a = u.return) && a.call(u);
                                    } finally {
                                        if (o) throw o.error;
                                    }
                                }
                            }
                            this.configuration.pushParser(this),
                                (this.stack = new l.default(this.itemFactory, i, !s || c)),
                                this.Parse(),
                                this.Push(this.itemFactory.create('stop'));
                        }
                        return (
                            Object.defineProperty(t.prototype, 'options', {
                                get: function () {
                                    return this.configuration.options;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(t.prototype, 'itemFactory', {
                                get: function () {
                                    return this.configuration.itemFactory;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(t.prototype, 'tags', {
                                get: function () {
                                    return this.configuration.tags;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(t.prototype, 'string', {
                                get: function () {
                                    return this._string;
                                },
                                set: function (t) {
                                    this._string = t;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.parse = function (t, e) {
                                return this.configuration.handlers.get(t).parse(e);
                            }),
                            (t.prototype.lookup = function (t, e) {
                                return this.configuration.handlers.get(t).lookup(e);
                            }),
                            (t.prototype.contains = function (t, e) {
                                return this.configuration.handlers.get(t).contains(e);
                            }),
                            (t.prototype.toString = function () {
                                var t,
                                    e,
                                    r = '';
                                try {
                                    for (
                                        var o = n(Array.from(this.configuration.handlers.keys())),
                                            a = o.next();
                                        !a.done;
                                        a = o.next()
                                    ) {
                                        var i = a.value;
                                        r += i + ': ' + this.configuration.handlers.get(i) + '\n';
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        a && !a.done && (e = o.return) && e.call(o);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                                return r;
                            }),
                            (t.prototype.Parse = function () {
                                for (var t; this.i < this.string.length; )
                                    (t = this.getCodePoint()),
                                        (this.i += t.length),
                                        this.parse('character', [this, t]);
                            }),
                            (t.prototype.Push = function (t) {
                                t instanceof u.AbstractMmlNode && t.isInferred
                                    ? this.PushAll(t.childNodes)
                                    : this.stack.Push(t);
                            }),
                            (t.prototype.PushAll = function (t) {
                                var e, r;
                                try {
                                    for (var o = n(t), a = o.next(); !a.done; a = o.next()) {
                                        var i = a.value;
                                        this.stack.Push(i);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        a && !a.done && (r = o.return) && r.call(o);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            }),
                            (t.prototype.mml = function () {
                                if (!this.stack.Top().isKind('mml')) return null;
                                var t = this.stack.Top().First;
                                return this.configuration.popParser(), t;
                            }),
                            (t.prototype.convertDelimiter = function (t) {
                                var e = this.lookup('delimiter', t);
                                return e ? e.char : null;
                            }),
                            (t.prototype.getCodePoint = function () {
                                var t = this.string.codePointAt(this.i);
                                return void 0 === t ? '' : String.fromCodePoint(t);
                            }),
                            (t.prototype.nextIsSpace = function () {
                                return !!this.string.charAt(this.i).match(/\s/);
                            }),
                            (t.prototype.GetNext = function () {
                                for (; this.nextIsSpace(); ) this.i++;
                                return this.getCodePoint();
                            }),
                            (t.prototype.GetCS = function () {
                                var t = this.string
                                    .slice(this.i)
                                    .match(/^(([a-z]+) ?|[\uD800-\uDBFF].|.)/i);
                                return t
                                    ? ((this.i += t[0].length), t[2] || t[1])
                                    : (this.i++, ' ');
                            }),
                            (t.prototype.GetArgument = function (t, e) {
                                switch (this.GetNext()) {
                                    case '':
                                        if (!e)
                                            throw new c.default(
                                                'MissingArgFor',
                                                'Missing argument for %1',
                                                this.currentCS,
                                            );
                                        return null;
                                    case '}':
                                        if (!e)
                                            throw new c.default(
                                                'ExtraCloseMissingOpen',
                                                'Extra close brace or missing open brace',
                                            );
                                        return null;
                                    case '\\':
                                        return this.i++, '\\' + this.GetCS();
                                    case '{':
                                        for (var r = ++this.i, n = 1; this.i < this.string.length; )
                                            switch (this.string.charAt(this.i++)) {
                                                case '\\':
                                                    this.i++;
                                                    break;
                                                case '{':
                                                    n++;
                                                    break;
                                                case '}':
                                                    if (0 == --n)
                                                        return this.string.slice(r, this.i - 1);
                                            }
                                        throw new c.default(
                                            'MissingCloseBrace',
                                            'Missing close brace',
                                        );
                                }
                                var o = this.getCodePoint();
                                return (this.i += o.length), o;
                            }),
                            (t.prototype.GetBrackets = function (t, e) {
                                if ('[' !== this.GetNext()) return e;
                                for (var r = ++this.i, n = 0; this.i < this.string.length; )
                                    switch (this.string.charAt(this.i++)) {
                                        case '{':
                                            n++;
                                            break;
                                        case '\\':
                                            this.i++;
                                            break;
                                        case '}':
                                            if (n-- <= 0)
                                                throw new c.default(
                                                    'ExtraCloseLooking',
                                                    'Extra close brace while looking for %1',
                                                    "']'",
                                                );
                                            break;
                                        case ']':
                                            if (0 === n) return this.string.slice(r, this.i - 1);
                                    }
                                throw new c.default(
                                    'MissingCloseBracket',
                                    "Could not find closing ']' for argument to %1",
                                    this.currentCS,
                                );
                            }),
                            (t.prototype.GetDelimiter = function (t, e) {
                                var r = this.GetNext();
                                if (
                                    ((this.i += r.length),
                                    this.i <= this.string.length &&
                                        ('\\' === r
                                            ? (r += this.GetCS())
                                            : '{' === r &&
                                              e &&
                                              (this.i--, (r = this.GetArgument(t).trim())),
                                        this.contains('delimiter', r)))
                                )
                                    return this.convertDelimiter(r);
                                throw new c.default(
                                    'MissingOrUnrecognizedDelim',
                                    'Missing or unrecognized delimiter for %1',
                                    this.currentCS,
                                );
                            }),
                            (t.prototype.GetDimen = function (t) {
                                if ('{' === this.GetNext()) {
                                    var e = this.GetArgument(t),
                                        r = o(s.default.matchDimen(e), 2),
                                        n = r[0],
                                        a = r[1];
                                    if (n) return n + a;
                                } else {
                                    e = this.string.slice(this.i);
                                    var i = o(s.default.matchDimen(e, !0), 3),
                                        l = ((n = i[0]), (a = i[1]), i[2]);
                                    if (n) return (this.i += l), n + a;
                                }
                                throw new c.default(
                                    'MissingDimOrUnits',
                                    'Missing dimension or its units for %1',
                                    this.currentCS,
                                );
                            }),
                            (t.prototype.GetUpTo = function (t, e) {
                                for (; this.nextIsSpace(); ) this.i++;
                                for (var r = this.i, n = 0; this.i < this.string.length; ) {
                                    var o = this.i,
                                        a = this.GetNext();
                                    switch (((this.i += a.length), a)) {
                                        case '\\':
                                            a += this.GetCS();
                                            break;
                                        case '{':
                                            n++;
                                            break;
                                        case '}':
                                            if (0 === n)
                                                throw new c.default(
                                                    'ExtraCloseLooking',
                                                    'Extra close brace while looking for %1',
                                                    e,
                                                );
                                            n--;
                                    }
                                    if (0 === n && a === e) return this.string.slice(r, o);
                                }
                                throw new c.default(
                                    'TokenNotFoundForCommand',
                                    'Could not find %1 for %2',
                                    e,
                                    this.currentCS,
                                );
                            }),
                            (t.prototype.ParseArg = function (e) {
                                return new t(
                                    this.GetArgument(e),
                                    this.stack.env,
                                    this.configuration,
                                ).mml();
                            }),
                            (t.prototype.ParseUpTo = function (e, r) {
                                return new t(
                                    this.GetUpTo(e, r),
                                    this.stack.env,
                                    this.configuration,
                                ).mml();
                            }),
                            (t.prototype.GetDelimiterArg = function (t) {
                                var e = s.default.trimSpaces(this.GetArgument(t));
                                if ('' === e) return null;
                                if (this.contains('delimiter', e)) return e;
                                throw new c.default(
                                    'MissingOrUnrecognizedDelim',
                                    'Missing or unrecognized delimiter for %1',
                                    this.currentCS,
                                );
                            }),
                            (t.prototype.GetStar = function () {
                                var t = '*' === this.GetNext();
                                return t && this.i++, t;
                            }),
                            (t.prototype.create = function (t) {
                                for (var e, r = [], n = 1; n < arguments.length; n++)
                                    r[n - 1] = arguments[n];
                                return (e = this.configuration.nodeFactory).create.apply(
                                    e,
                                    a([t], o(r), !1),
                                );
                            }),
                            t
                        );
                    })();
                e.default = p;
            },
            1313: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ActionConfiguration = e.ActionMethods = void 0);
                var o = r(6552),
                    a = n(r(810)),
                    i = r(7628),
                    s = n(r(724));
                (e.ActionMethods = {}),
                    (e.ActionMethods.Macro = s.default.Macro),
                    (e.ActionMethods.Toggle = function (t, e) {
                        for (var r, n = []; '\\endtoggle' !== (r = t.GetArgument(e)); )
                            n.push(new a.default(r, t.stack.env, t.configuration).mml());
                        t.Push(t.create('node', 'maction', n, { actiontype: 'toggle' }));
                    }),
                    (e.ActionMethods.Mathtip = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e);
                        t.Push(t.create('node', 'maction', [r, n], { actiontype: 'tooltip' }));
                    }),
                    new i.CommandMap(
                        'action-macros',
                        {
                            toggle: 'Toggle',
                            mathtip: 'Mathtip',
                            texttip: ['Macro', '\\mathtip{#1}{\\text{#2}}', 2],
                        },
                        e.ActionMethods,
                    ),
                    (e.ActionConfiguration = o.Configuration.create('action', {
                        handler: { macro: ['action-macros'] },
                    }));
            },
            3946: function (t, e, r) {
                var n,
                    o,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AmsConfiguration = e.AmsTags = void 0);
                var i = r(6552),
                    s = r(3632),
                    l = r(7251),
                    c = r(2684);
                r(8285);
                var u = r(7628),
                    p = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return a(e, t), e;
                    })(l.AbstractTags);
                e.AmsTags = p;
                e.AmsConfiguration = i.Configuration.create('ams', {
                    handler: {
                        character: ['AMSmath-operatorLetter'],
                        delimiter: ['AMSsymbols-delimiter', 'AMSmath-delimiter'],
                        macro: [
                            'AMSsymbols-mathchar0mi',
                            'AMSsymbols-mathchar0mo',
                            'AMSsymbols-delimiter',
                            'AMSsymbols-macros',
                            'AMSmath-mathchar0mo',
                            'AMSmath-macros',
                            'AMSmath-delimiter',
                        ],
                        environment: ['AMSmath-environment'],
                    },
                    items:
                        ((o = {}),
                        (o[s.MultlineItem.prototype.kind] = s.MultlineItem),
                        (o[s.FlalignItem.prototype.kind] = s.FlalignItem),
                        o),
                    tags: { ams: p },
                    init: function (t) {
                        new u.CommandMap(c.NEW_OPS, {}, {}),
                            t.append(
                                i.Configuration.local({
                                    handler: { macro: [c.NEW_OPS] },
                                    priority: -1,
                                }),
                            );
                    },
                    config: function (t, e) {
                        e.parseOptions.options.multlineWidth &&
                            (e.parseOptions.options.ams.multlineWidth =
                                e.parseOptions.options.multlineWidth),
                            delete e.parseOptions.options.multlineWidth;
                    },
                    options: {
                        multlineWidth: '',
                        ams: { multlineWidth: '100%', multlineIndent: '1em' },
                    },
                });
            },
            3632: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
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
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                a.apply(this, arguments)
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.FlalignItem = e.MultlineItem = void 0);
                var s = r(8389),
                    l = i(r(7702)),
                    c = i(r(8321)),
                    u = i(r(3466)),
                    p = r(7007),
                    d = (function (t) {
                        function e(e) {
                            for (var r = [], n = 1; n < arguments.length; n++)
                                r[n - 1] = arguments[n];
                            var o = t.call(this, e) || this;
                            return o.factory.configuration.tags.start('multline', !0, r[0]), o;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'multline';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.EndEntry = function () {
                                this.table.length &&
                                    l.default.fixInitialMO(this.factory.configuration, this.nodes);
                                var t = this.getProperty('shove'),
                                    e = this.create(
                                        'node',
                                        'mtd',
                                        this.nodes,
                                        t ? { columnalign: t } : {},
                                    );
                                this.setProperty('shove', null), this.row.push(e), this.Clear();
                            }),
                            (e.prototype.EndRow = function () {
                                if (1 !== this.row.length)
                                    throw new u.default(
                                        'MultlineRowsOneCol',
                                        'The rows within the %1 environment must have exactly one column',
                                        'multline',
                                    );
                                var t = this.create('node', 'mtr', this.row);
                                this.table.push(t), (this.row = []);
                            }),
                            (e.prototype.EndTable = function () {
                                if ((t.prototype.EndTable.call(this), this.table.length)) {
                                    var e = this.table.length - 1,
                                        r = -1;
                                    c.default.getAttribute(
                                        c.default.getChildren(this.table[0])[0],
                                        'columnalign',
                                    ) ||
                                        c.default.setAttribute(
                                            c.default.getChildren(this.table[0])[0],
                                            'columnalign',
                                            p.TexConstant.Align.LEFT,
                                        ),
                                        c.default.getAttribute(
                                            c.default.getChildren(this.table[e])[0],
                                            'columnalign',
                                        ) ||
                                            c.default.setAttribute(
                                                c.default.getChildren(this.table[e])[0],
                                                'columnalign',
                                                p.TexConstant.Align.RIGHT,
                                            );
                                    var n = this.factory.configuration.tags.getTag();
                                    if (n) {
                                        r =
                                            this.arraydef.side === p.TexConstant.Align.LEFT
                                                ? 0
                                                : this.table.length - 1;
                                        var o = this.table[r],
                                            a = this.create(
                                                'node',
                                                'mlabeledtr',
                                                [n].concat(c.default.getChildren(o)),
                                            );
                                        c.default.copyAttributes(o, a), (this.table[r] = a);
                                    }
                                }
                                this.factory.configuration.tags.end();
                            }),
                            e
                        );
                    })(s.ArrayItem);
                e.MultlineItem = d;
                var f = (function (t) {
                    function e(e, r, n, o, a) {
                        var i = t.call(this, e) || this;
                        return (
                            (i.name = r),
                            (i.numbered = n),
                            (i.padded = o),
                            (i.center = a),
                            i.factory.configuration.tags.start(r, n, n),
                            i
                        );
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'flalign';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.EndEntry = function () {
                            t.prototype.EndEntry.call(this);
                            var e = this.getProperty('xalignat');
                            if (e && this.row.length > e)
                                throw new u.default(
                                    'XalignOverflow',
                                    'Extra %1 in row of %2',
                                    '&',
                                    this.name,
                                );
                        }),
                        (e.prototype.EndRow = function () {
                            for (
                                var e, r = this.row, n = this.getProperty('xalignat');
                                r.length < n;

                            )
                                r.push(this.create('node', 'mtd'));
                            for (
                                this.row = [],
                                    this.padded && this.row.push(this.create('node', 'mtd'));
                                (e = r.shift());

                            )
                                this.row.push(e),
                                    (e = r.shift()) && this.row.push(e),
                                    (r.length || this.padded) &&
                                        this.row.push(this.create('node', 'mtd'));
                            this.row.length > this.maxrow && (this.maxrow = this.row.length),
                                t.prototype.EndRow.call(this);
                            var o = this.table[this.table.length - 1];
                            if (this.getProperty('zeroWidthLabel') && o.isKind('mlabeledtr')) {
                                var i = c.default.getChildren(o)[0],
                                    s = this.factory.configuration.options.tagSide,
                                    l = a({ width: 0 }, 'right' === s ? { lspace: '-1width' } : {}),
                                    u = this.create('node', 'mpadded', c.default.getChildren(i), l);
                                i.setChildren([u]);
                            }
                        }),
                        (e.prototype.EndTable = function () {
                            (t.prototype.EndTable.call(this), this.center) &&
                                this.maxrow <= 2 &&
                                (delete this.arraydef.width, delete this.global.indentalign);
                        }),
                        e
                    );
                })(s.EqnArrayItem);
                e.FlalignItem = f;
            },
            8285: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, o);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    o =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    a =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return o(e, t), e;
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = r(2684),
                    l = a(r(7628)),
                    c = r(7007),
                    u = i(r(4708)),
                    p = i(r(7702)),
                    d = r(8921),
                    f = r(6914);
                new l.CharacterMap('AMSmath-mathchar0mo', u.default.mathchar0mo, {
                    iiiint: ['\u2a0c', { texClass: d.TEXCLASS.OP }],
                }),
                    new l.RegExpMap('AMSmath-operatorLetter', s.AmsMethods.operatorLetter, /[-*]/i),
                    new l.CommandMap(
                        'AMSmath-macros',
                        {
                            mathring: ['Accent', '02DA'],
                            nobreakspace: 'Tilde',
                            negmedspace: ['Spacer', f.MATHSPACE.negativemediummathspace],
                            negthickspace: ['Spacer', f.MATHSPACE.negativethickmathspace],
                            idotsint: ['MultiIntegral', '\\int\\cdots\\int'],
                            dddot: ['Accent', '20DB'],
                            ddddot: ['Accent', '20DC'],
                            sideset: 'SideSet',
                            boxed: ['Macro', '\\fbox{$\\displaystyle{#1}$}', 1],
                            tag: 'HandleTag',
                            notag: 'HandleNoTag',
                            eqref: ['HandleRef', !0],
                            substack: ['Macro', '\\begin{subarray}{c}#1\\end{subarray}', 1],
                            injlim: ['NamedOp', 'inj&thinsp;lim'],
                            projlim: ['NamedOp', 'proj&thinsp;lim'],
                            varliminf: ['Macro', '\\mathop{\\underline{\\mmlToken{mi}{lim}}}'],
                            varlimsup: ['Macro', '\\mathop{\\overline{\\mmlToken{mi}{lim}}}'],
                            varinjlim: [
                                'Macro',
                                '\\mathop{\\underrightarrow{\\mmlToken{mi}{lim}}}',
                            ],
                            varprojlim: [
                                'Macro',
                                '\\mathop{\\underleftarrow{\\mmlToken{mi}{lim}}}',
                            ],
                            DeclareMathOperator: 'HandleDeclareOp',
                            operatorname: 'HandleOperatorName',
                            genfrac: 'Genfrac',
                            frac: ['Genfrac', '', '', '', ''],
                            tfrac: ['Genfrac', '', '', '', '1'],
                            dfrac: ['Genfrac', '', '', '', '0'],
                            binom: ['Genfrac', '(', ')', '0', ''],
                            tbinom: ['Genfrac', '(', ')', '0', '1'],
                            dbinom: ['Genfrac', '(', ')', '0', '0'],
                            cfrac: 'CFrac',
                            shoveleft: ['HandleShove', c.TexConstant.Align.LEFT],
                            shoveright: ['HandleShove', c.TexConstant.Align.RIGHT],
                            xrightarrow: ['xArrow', 8594, 5, 10],
                            xleftarrow: ['xArrow', 8592, 10, 5],
                        },
                        s.AmsMethods,
                    ),
                    new l.EnvironmentMap(
                        'AMSmath-environment',
                        u.default.environment,
                        {
                            'equation*': ['Equation', null, !1],
                            'eqnarray*': [
                                'EqnArray',
                                null,
                                !1,
                                !0,
                                'rcl',
                                p.default.cols(0, f.MATHSPACE.thickmathspace),
                                '.5em',
                            ],
                            align: ['EqnArray', null, !0, !0, 'rl', p.default.cols(0, 2)],
                            'align*': ['EqnArray', null, !1, !0, 'rl', p.default.cols(0, 2)],
                            multline: ['Multline', null, !0],
                            'multline*': ['Multline', null, !1],
                            split: ['EqnArray', null, !1, !1, 'rl', p.default.cols(0)],
                            gather: ['EqnArray', null, !0, !0, 'c'],
                            'gather*': ['EqnArray', null, !1, !0, 'c'],
                            alignat: ['AlignAt', null, !0, !0],
                            'alignat*': ['AlignAt', null, !1, !0],
                            alignedat: ['AlignAt', null, !1, !1],
                            aligned: [
                                'AmsEqnArray',
                                null,
                                null,
                                null,
                                'rl',
                                p.default.cols(0, 2),
                                '.5em',
                                'D',
                            ],
                            gathered: ['AmsEqnArray', null, null, null, 'c', null, '.5em', 'D'],
                            xalignat: ['XalignAt', null, !0, !0],
                            'xalignat*': ['XalignAt', null, !1, !0],
                            xxalignat: ['XalignAt', null, !1, !1],
                            flalign: ['FlalignArray', null, !0, !1, !0, 'rlc', 'auto auto fit'],
                            'flalign*': ['FlalignArray', null, !1, !1, !0, 'rlc', 'auto auto fit'],
                            subarray: [
                                'Array',
                                null,
                                null,
                                null,
                                null,
                                p.default.cols(0),
                                '0.1em',
                                'S',
                                1,
                            ],
                            smallmatrix: [
                                'Array',
                                null,
                                null,
                                null,
                                'c',
                                p.default.cols(1 / 3),
                                '.2em',
                                'S',
                                1,
                            ],
                            matrix: ['Array', null, null, null, 'c'],
                            pmatrix: ['Array', null, '(', ')', 'c'],
                            bmatrix: ['Array', null, '[', ']', 'c'],
                            Bmatrix: ['Array', null, '\\{', '\\}', 'c'],
                            vmatrix: ['Array', null, '\\vert', '\\vert', 'c'],
                            Vmatrix: ['Array', null, '\\Vert', '\\Vert', 'c'],
                            cases: ['Array', null, '\\{', '.', 'll', null, '.2em', 'T'],
                        },
                        s.AmsMethods,
                    ),
                    new l.DelimiterMap('AMSmath-delimiter', u.default.delimiter, {
                        '\\lvert': ['|', { texClass: d.TEXCLASS.OPEN }],
                        '\\rvert': ['|', { texClass: d.TEXCLASS.CLOSE }],
                        '\\lVert': ['\u2016', { texClass: d.TEXCLASS.OPEN }],
                        '\\rVert': ['\u2016', { texClass: d.TEXCLASS.CLOSE }],
                    }),
                    new l.CharacterMap('AMSsymbols-mathchar0mi', u.default.mathchar0mi, {
                        digamma: '\u03dd',
                        varkappa: '\u03f0',
                        varGamma: ['\u0393', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varDelta: ['\u0394', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varTheta: ['\u0398', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varLambda: ['\u039b', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varXi: ['\u039e', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varPi: ['\u03a0', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varSigma: ['\u03a3', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varUpsilon: ['\u03a5', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varPhi: ['\u03a6', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varPsi: ['\u03a8', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varOmega: ['\u03a9', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        beth: '\u2136',
                        gimel: '\u2137',
                        daleth: '\u2138',
                        backprime: ['\u2035', { variantForm: !0 }],
                        hslash: '\u210f',
                        varnothing: ['\u2205', { variantForm: !0 }],
                        blacktriangle: '\u25b4',
                        triangledown: ['\u25bd', { variantForm: !0 }],
                        blacktriangledown: '\u25be',
                        square: '\u25fb',
                        Box: '\u25fb',
                        blacksquare: '\u25fc',
                        lozenge: '\u25ca',
                        Diamond: '\u25ca',
                        blacklozenge: '\u29eb',
                        circledS: ['\u24c8', { mathvariant: c.TexConstant.Variant.NORMAL }],
                        bigstar: '\u2605',
                        sphericalangle: '\u2222',
                        measuredangle: '\u2221',
                        nexists: '\u2204',
                        complement: '\u2201',
                        mho: '\u2127',
                        eth: ['\xf0', { mathvariant: c.TexConstant.Variant.NORMAL }],
                        Finv: '\u2132',
                        diagup: '\u2571',
                        Game: '\u2141',
                        diagdown: '\u2572',
                        Bbbk: ['k', { mathvariant: c.TexConstant.Variant.DOUBLESTRUCK }],
                        yen: '\xa5',
                        circledR: '\xae',
                        checkmark: '\u2713',
                        maltese: '\u2720',
                    }),
                    new l.CharacterMap('AMSsymbols-mathchar0mo', u.default.mathchar0mo, {
                        dotplus: '\u2214',
                        ltimes: '\u22c9',
                        smallsetminus: ['\u2216', { variantForm: !0 }],
                        rtimes: '\u22ca',
                        Cap: '\u22d2',
                        doublecap: '\u22d2',
                        leftthreetimes: '\u22cb',
                        Cup: '\u22d3',
                        doublecup: '\u22d3',
                        rightthreetimes: '\u22cc',
                        barwedge: '\u22bc',
                        curlywedge: '\u22cf',
                        veebar: '\u22bb',
                        curlyvee: '\u22ce',
                        doublebarwedge: '\u2a5e',
                        boxminus: '\u229f',
                        circleddash: '\u229d',
                        boxtimes: '\u22a0',
                        circledast: '\u229b',
                        boxdot: '\u22a1',
                        circledcirc: '\u229a',
                        boxplus: '\u229e',
                        centerdot: ['\u22c5', { variantForm: !0 }],
                        divideontimes: '\u22c7',
                        intercal: '\u22ba',
                        leqq: '\u2266',
                        geqq: '\u2267',
                        leqslant: '\u2a7d',
                        geqslant: '\u2a7e',
                        eqslantless: '\u2a95',
                        eqslantgtr: '\u2a96',
                        lesssim: '\u2272',
                        gtrsim: '\u2273',
                        lessapprox: '\u2a85',
                        gtrapprox: '\u2a86',
                        approxeq: '\u224a',
                        lessdot: '\u22d6',
                        gtrdot: '\u22d7',
                        lll: '\u22d8',
                        llless: '\u22d8',
                        ggg: '\u22d9',
                        gggtr: '\u22d9',
                        lessgtr: '\u2276',
                        gtrless: '\u2277',
                        lesseqgtr: '\u22da',
                        gtreqless: '\u22db',
                        lesseqqgtr: '\u2a8b',
                        gtreqqless: '\u2a8c',
                        doteqdot: '\u2251',
                        Doteq: '\u2251',
                        eqcirc: '\u2256',
                        risingdotseq: '\u2253',
                        circeq: '\u2257',
                        fallingdotseq: '\u2252',
                        triangleq: '\u225c',
                        backsim: '\u223d',
                        thicksim: ['\u223c', { variantForm: !0 }],
                        backsimeq: '\u22cd',
                        thickapprox: ['\u2248', { variantForm: !0 }],
                        subseteqq: '\u2ac5',
                        supseteqq: '\u2ac6',
                        Subset: '\u22d0',
                        Supset: '\u22d1',
                        sqsubset: '\u228f',
                        sqsupset: '\u2290',
                        preccurlyeq: '\u227c',
                        succcurlyeq: '\u227d',
                        curlyeqprec: '\u22de',
                        curlyeqsucc: '\u22df',
                        precsim: '\u227e',
                        succsim: '\u227f',
                        precapprox: '\u2ab7',
                        succapprox: '\u2ab8',
                        vartriangleleft: '\u22b2',
                        lhd: '\u22b2',
                        vartriangleright: '\u22b3',
                        rhd: '\u22b3',
                        trianglelefteq: '\u22b4',
                        unlhd: '\u22b4',
                        trianglerighteq: '\u22b5',
                        unrhd: '\u22b5',
                        vDash: ['\u22a8', { variantForm: !0 }],
                        Vdash: '\u22a9',
                        Vvdash: '\u22aa',
                        smallsmile: ['\u2323', { variantForm: !0 }],
                        shortmid: ['\u2223', { variantForm: !0 }],
                        smallfrown: ['\u2322', { variantForm: !0 }],
                        shortparallel: ['\u2225', { variantForm: !0 }],
                        bumpeq: '\u224f',
                        between: '\u226c',
                        Bumpeq: '\u224e',
                        pitchfork: '\u22d4',
                        varpropto: ['\u221d', { variantForm: !0 }],
                        backepsilon: '\u220d',
                        blacktriangleleft: '\u25c2',
                        blacktriangleright: '\u25b8',
                        therefore: '\u2234',
                        because: '\u2235',
                        eqsim: '\u2242',
                        vartriangle: ['\u25b3', { variantForm: !0 }],
                        Join: '\u22c8',
                        nless: '\u226e',
                        ngtr: '\u226f',
                        nleq: '\u2270',
                        ngeq: '\u2271',
                        nleqslant: ['\u2a87', { variantForm: !0 }],
                        ngeqslant: ['\u2a88', { variantForm: !0 }],
                        nleqq: ['\u2270', { variantForm: !0 }],
                        ngeqq: ['\u2271', { variantForm: !0 }],
                        lneq: '\u2a87',
                        gneq: '\u2a88',
                        lneqq: '\u2268',
                        gneqq: '\u2269',
                        lvertneqq: ['\u2268', { variantForm: !0 }],
                        gvertneqq: ['\u2269', { variantForm: !0 }],
                        lnsim: '\u22e6',
                        gnsim: '\u22e7',
                        lnapprox: '\u2a89',
                        gnapprox: '\u2a8a',
                        nprec: '\u2280',
                        nsucc: '\u2281',
                        npreceq: ['\u22e0', { variantForm: !0 }],
                        nsucceq: ['\u22e1', { variantForm: !0 }],
                        precneqq: '\u2ab5',
                        succneqq: '\u2ab6',
                        precnsim: '\u22e8',
                        succnsim: '\u22e9',
                        precnapprox: '\u2ab9',
                        succnapprox: '\u2aba',
                        nsim: '\u2241',
                        ncong: '\u2247',
                        nshortmid: ['\u2224', { variantForm: !0 }],
                        nshortparallel: ['\u2226', { variantForm: !0 }],
                        nmid: '\u2224',
                        nparallel: '\u2226',
                        nvdash: '\u22ac',
                        nvDash: '\u22ad',
                        nVdash: '\u22ae',
                        nVDash: '\u22af',
                        ntriangleleft: '\u22ea',
                        ntriangleright: '\u22eb',
                        ntrianglelefteq: '\u22ec',
                        ntrianglerighteq: '\u22ed',
                        nsubseteq: '\u2288',
                        nsupseteq: '\u2289',
                        nsubseteqq: ['\u2288', { variantForm: !0 }],
                        nsupseteqq: ['\u2289', { variantForm: !0 }],
                        subsetneq: '\u228a',
                        supsetneq: '\u228b',
                        varsubsetneq: ['\u228a', { variantForm: !0 }],
                        varsupsetneq: ['\u228b', { variantForm: !0 }],
                        subsetneqq: '\u2acb',
                        supsetneqq: '\u2acc',
                        varsubsetneqq: ['\u2acb', { variantForm: !0 }],
                        varsupsetneqq: ['\u2acc', { variantForm: !0 }],
                        leftleftarrows: '\u21c7',
                        rightrightarrows: '\u21c9',
                        leftrightarrows: '\u21c6',
                        rightleftarrows: '\u21c4',
                        Lleftarrow: '\u21da',
                        Rrightarrow: '\u21db',
                        twoheadleftarrow: '\u219e',
                        twoheadrightarrow: '\u21a0',
                        leftarrowtail: '\u21a2',
                        rightarrowtail: '\u21a3',
                        looparrowleft: '\u21ab',
                        looparrowright: '\u21ac',
                        leftrightharpoons: '\u21cb',
                        rightleftharpoons: ['\u21cc', { variantForm: !0 }],
                        curvearrowleft: '\u21b6',
                        curvearrowright: '\u21b7',
                        circlearrowleft: '\u21ba',
                        circlearrowright: '\u21bb',
                        Lsh: '\u21b0',
                        Rsh: '\u21b1',
                        upuparrows: '\u21c8',
                        downdownarrows: '\u21ca',
                        upharpoonleft: '\u21bf',
                        upharpoonright: '\u21be',
                        downharpoonleft: '\u21c3',
                        restriction: '\u21be',
                        multimap: '\u22b8',
                        downharpoonright: '\u21c2',
                        leftrightsquigarrow: '\u21ad',
                        rightsquigarrow: '\u21dd',
                        leadsto: '\u21dd',
                        dashrightarrow: '\u21e2',
                        dashleftarrow: '\u21e0',
                        nleftarrow: '\u219a',
                        nrightarrow: '\u219b',
                        nLeftarrow: '\u21cd',
                        nRightarrow: '\u21cf',
                        nleftrightarrow: '\u21ae',
                        nLeftrightarrow: '\u21ce',
                    }),
                    new l.DelimiterMap('AMSsymbols-delimiter', u.default.delimiter, {
                        '\\ulcorner': '\u231c',
                        '\\urcorner': '\u231d',
                        '\\llcorner': '\u231e',
                        '\\lrcorner': '\u231f',
                    }),
                    new l.CommandMap(
                        'AMSsymbols-macros',
                        {
                            implies: ['Macro', '\\;\\Longrightarrow\\;'],
                            impliedby: ['Macro', '\\;\\Longleftarrow\\;'],
                        },
                        s.AmsMethods,
                    );
            },
            2684: function (t, e, r) {
                var n =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (n =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                n.apply(this, arguments)
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NEW_OPS = e.AmsMethods = void 0);
                var i = a(r(7702)),
                    s = a(r(4708)),
                    l = a(r(8321)),
                    c = r(7007),
                    u = a(r(810)),
                    p = a(r(3466)),
                    d = r(4237),
                    f = a(r(724)),
                    h = r(8921);
                function m(t) {
                    if (!t || (t.isInferred && 0 === t.childNodes.length)) return [null, null];
                    if (t.isKind('msubsup') && g(t)) return [t, null];
                    var e = l.default.getChildAt(t, 0);
                    return t.isInferred && e && g(e)
                        ? (t.childNodes.splice(0, 1), [e, t])
                        : [null, t];
                }
                function g(t) {
                    var e = t.childNodes[0];
                    return e && e.isKind('mi') && '' === e.getText();
                }
                (e.AmsMethods = {}),
                    (e.AmsMethods.AmsEqnArray = function (t, e, r, n, o, a, s) {
                        var l = t.GetBrackets('\\begin{' + e.getName() + '}'),
                            c = f.default.EqnArray(t, e, r, n, o, a, s);
                        return i.default.setArrayAlign(c, l);
                    }),
                    (e.AmsMethods.AlignAt = function (t, r, n, o) {
                        var a,
                            s,
                            l = r.getName(),
                            c = '',
                            u = [];
                        if (
                            (o || (s = t.GetBrackets('\\begin{' + l + '}')),
                            (a = t.GetArgument('\\begin{' + l + '}')).match(/[^0-9]/))
                        )
                            throw new p.default(
                                'PositiveIntegerArg',
                                'Argument to %1 must me a positive integer',
                                '\\begin{' + l + '}',
                            );
                        for (var d = parseInt(a, 10); d > 0; ) (c += 'rl'), u.push('0em 0em'), d--;
                        var f = u.join(' ');
                        if (o) return e.AmsMethods.EqnArray(t, r, n, o, c, f);
                        var h = e.AmsMethods.EqnArray(t, r, n, o, c, f);
                        return i.default.setArrayAlign(h, s);
                    }),
                    (e.AmsMethods.Multline = function (t, e, r) {
                        t.Push(e), i.default.checkEqnEnv(t);
                        var n = t.itemFactory.create('multline', r, t.stack);
                        return (
                            (n.arraydef = {
                                displaystyle: !0,
                                rowspacing: '.5em',
                                columnspacing: '100%',
                                width: t.options.ams.multlineWidth,
                                side: t.options.tagSide,
                                minlabelspacing: t.options.tagIndent,
                                framespacing: t.options.ams.multlineIndent + ' 0',
                                frame: '',
                                'data-width-includes-label': !0,
                            }),
                            n
                        );
                    }),
                    (e.AmsMethods.XalignAt = function (t, r, n, o) {
                        var a = t.GetArgument('\\begin{' + r.getName() + '}');
                        if (a.match(/[^0-9]/))
                            throw new p.default(
                                'PositiveIntegerArg',
                                'Argument to %1 must me a positive integer',
                                '\\begin{' + r.getName() + '}',
                            );
                        var i = o ? 'crl' : 'rlc',
                            s = o ? 'fit auto auto' : 'auto auto fit',
                            l = e.AmsMethods.FlalignArray(t, r, n, o, !1, i, s, !0);
                        return l.setProperty('xalignat', 2 * parseInt(a)), l;
                    }),
                    (e.AmsMethods.FlalignArray = function (t, e, r, n, o, a, s, l) {
                        void 0 === l && (l = !1),
                            t.Push(e),
                            i.default.checkEqnEnv(t),
                            (a = a
                                .split('')
                                .join(' ')
                                .replace(/r/g, 'right')
                                .replace(/l/g, 'left')
                                .replace(/c/g, 'center'));
                        var c = t.itemFactory.create('flalign', e.getName(), r, n, o, t.stack);
                        return (
                            (c.arraydef = {
                                width: '100%',
                                displaystyle: !0,
                                columnalign: a,
                                columnspacing: '0em',
                                columnwidth: s,
                                rowspacing: '3pt',
                                side: t.options.tagSide,
                                minlabelspacing: l ? '0' : t.options.tagIndent,
                                'data-width-includes-label': !0,
                            }),
                            c.setProperty('zeroWidthLabel', l),
                            c
                        );
                    }),
                    (e.NEW_OPS = 'ams-declare-ops'),
                    (e.AmsMethods.HandleDeclareOp = function (t, r) {
                        var n = t.GetStar() ? '*' : '',
                            o = i.default.trimSpaces(t.GetArgument(r));
                        '\\' === o.charAt(0) && (o = o.substr(1));
                        var a = t.GetArgument(r);
                        t.configuration.handlers
                            .retrieve(e.NEW_OPS)
                            .add(
                                o,
                                new d.Macro(o, e.AmsMethods.Macro, [
                                    '\\operatorname'.concat(n, '{').concat(a, '}'),
                                ]),
                            );
                    }),
                    (e.AmsMethods.HandleOperatorName = function (t, e) {
                        var r = t.GetStar(),
                            o = i.default.trimSpaces(t.GetArgument(e)),
                            a = new u.default(
                                o,
                                n(n({}, t.stack.env), {
                                    font: c.TexConstant.Variant.NORMAL,
                                    multiLetterIdentifiers: /^[-*a-z]+/i,
                                    operatorLetters: !0,
                                }),
                                t.configuration,
                            ).mml();
                        if (
                            (a.isKind('mi') || (a = t.create('node', 'TeXAtom', [a])),
                            l.default.setProperties(a, {
                                movesupsub: r,
                                movablelimits: !0,
                                texClass: h.TEXCLASS.OP,
                            }),
                            !r)
                        ) {
                            var s = t.GetNext(),
                                p = t.i;
                            '\\' === s && ++t.i && 'limits' !== t.GetCS() && (t.i = p);
                        }
                        t.Push(a);
                    }),
                    (e.AmsMethods.SideSet = function (t, e) {
                        var r = o(m(t.ParseArg(e)), 2),
                            n = r[0],
                            a = r[1],
                            s = o(m(t.ParseArg(e)), 2),
                            c = s[0],
                            u = s[1],
                            p = t.ParseArg(e),
                            d = p;
                        n &&
                            (a
                                ? n.replaceChild(
                                      t.create('node', 'mphantom', [
                                          t.create('node', 'mpadded', [i.default.copyNode(p, t)], {
                                              width: 0,
                                          }),
                                      ]),
                                      l.default.getChildAt(n, 0),
                                  )
                                : ((d = t.create('node', 'mmultiscripts', [p])),
                                  c &&
                                      l.default.appendChildren(d, [
                                          l.default.getChildAt(c, 1) || t.create('node', 'none'),
                                          l.default.getChildAt(c, 2) || t.create('node', 'none'),
                                      ]),
                                  l.default.setProperty(d, 'scriptalign', 'left'),
                                  l.default.appendChildren(d, [
                                      t.create('node', 'mprescripts'),
                                      l.default.getChildAt(n, 1) || t.create('node', 'none'),
                                      l.default.getChildAt(n, 2) || t.create('node', 'none'),
                                  ]))),
                            c &&
                                d === p &&
                                (c.replaceChild(p, l.default.getChildAt(c, 0)), (d = c));
                        var f = t.create('node', 'TeXAtom', [], {
                            texClass: h.TEXCLASS.OP,
                            movesupsub: !0,
                            movablelimits: !0,
                        });
                        a && (n && f.appendChild(n), f.appendChild(a)),
                            f.appendChild(d),
                            u && f.appendChild(u),
                            t.Push(f);
                    }),
                    (e.AmsMethods.operatorLetter = function (t, e) {
                        return !!t.stack.env.operatorLetters && s.default.variable(t, e);
                    }),
                    (e.AmsMethods.MultiIntegral = function (t, e, r) {
                        var n = t.GetNext();
                        if ('\\' === n) {
                            var o = t.i;
                            (n = t.GetArgument(e)),
                                (t.i = o),
                                '\\limits' === n &&
                                    (r =
                                        '\\idotsint' === e
                                            ? '\\!\\!\\mathop{\\,\\,' + r + '}'
                                            : '\\!\\!\\!\\mathop{\\,\\,\\,' + r + '}');
                        }
                        (t.string = r + ' ' + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (e.AmsMethods.xArrow = function (t, e, r, n, o) {
                        var a = {
                                width: '+' + i.default.Em((n + o) / 18),
                                lspace: i.default.Em(n / 18),
                            },
                            s = t.GetBrackets(e),
                            c = t.ParseArg(e),
                            p = t.create('node', 'mspace', [], { depth: '.25em' }),
                            d = t.create(
                                'token',
                                'mo',
                                { stretchy: !0, texClass: h.TEXCLASS.REL },
                                String.fromCodePoint(r),
                            );
                        d = t.create('node', 'mstyle', [d], { scriptlevel: 0 });
                        var f = t.create('node', 'munderover', [d]),
                            m = t.create('node', 'mpadded', [c, p], a);
                        if (
                            (l.default.setAttribute(m, 'voffset', '-.2em'),
                            l.default.setAttribute(m, 'height', '-.2em'),
                            l.default.setChild(f, f.over, m),
                            s)
                        ) {
                            var g = new u.default(s, t.stack.env, t.configuration).mml(),
                                y = t.create('node', 'mspace', [], { height: '.75em' });
                            (m = t.create('node', 'mpadded', [g, y], a)),
                                l.default.setAttribute(m, 'voffset', '.15em'),
                                l.default.setAttribute(m, 'depth', '-.15em'),
                                l.default.setChild(f, f.under, m);
                        }
                        l.default.setProperty(f, 'subsupOK', !0), t.Push(f);
                    }),
                    (e.AmsMethods.HandleShove = function (t, e, r) {
                        var n = t.stack.Top();
                        if ('multline' !== n.kind)
                            throw new p.default(
                                'CommandOnlyAllowedInEnv',
                                '%1 only allowed in %2 environment',
                                t.currentCS,
                                'multline',
                            );
                        if (n.Size())
                            throw new p.default(
                                'CommandAtTheBeginingOfLine',
                                '%1 must come at the beginning of the line',
                                t.currentCS,
                            );
                        n.setProperty('shove', r);
                    }),
                    (e.AmsMethods.CFrac = function (t, e) {
                        var r = i.default.trimSpaces(t.GetBrackets(e, '')),
                            n = t.GetArgument(e),
                            o = t.GetArgument(e),
                            a = {
                                l: c.TexConstant.Align.LEFT,
                                r: c.TexConstant.Align.RIGHT,
                                '': '',
                            },
                            s = new u.default(
                                '\\strut\\textstyle{' + n + '}',
                                t.stack.env,
                                t.configuration,
                            ).mml(),
                            d = new u.default(
                                '\\strut\\textstyle{' + o + '}',
                                t.stack.env,
                                t.configuration,
                            ).mml(),
                            f = t.create('node', 'mfrac', [s, d]);
                        if (null == (r = a[r]))
                            throw new p.default(
                                'IllegalAlign',
                                'Illegal alignment specified in %1',
                                t.currentCS,
                            );
                        r && l.default.setProperties(f, { numalign: r, denomalign: r }), t.Push(f);
                    }),
                    (e.AmsMethods.Genfrac = function (t, e, r, n, o, a) {
                        null == r && (r = t.GetDelimiterArg(e)),
                            null == n && (n = t.GetDelimiterArg(e)),
                            null == o && (o = t.GetArgument(e)),
                            null == a && (a = i.default.trimSpaces(t.GetArgument(e)));
                        var s = t.ParseArg(e),
                            c = t.ParseArg(e),
                            u = t.create('node', 'mfrac', [s, c]);
                        if (
                            ('' !== o && l.default.setAttribute(u, 'linethickness', o),
                            (r || n) &&
                                (l.default.setProperty(u, 'withDelims', !0),
                                (u = i.default.fixedFence(t.configuration, r, u, n))),
                            '' !== a)
                        ) {
                            var d = parseInt(a, 10),
                                f = ['D', 'T', 'S', 'SS'][d];
                            if (null == f)
                                throw new p.default(
                                    'BadMathStyleFor',
                                    'Bad math style for %1',
                                    t.currentCS,
                                );
                            (u = t.create('node', 'mstyle', [u])),
                                'D' === f
                                    ? l.default.setProperties(u, {
                                          displaystyle: !0,
                                          scriptlevel: 0,
                                      })
                                    : l.default.setProperties(u, {
                                          displaystyle: !1,
                                          scriptlevel: d - 1,
                                      });
                        }
                        t.Push(u);
                    }),
                    (e.AmsMethods.HandleTag = function (t, e) {
                        if (!t.tags.currentTag.taggable && t.tags.env)
                            throw new p.default(
                                'CommandNotAllowedInEnv',
                                '%1 not allowed in %2 environment',
                                t.currentCS,
                                t.tags.env,
                            );
                        if (t.tags.currentTag.tag)
                            throw new p.default('MultipleCommand', 'Multiple %1', t.currentCS);
                        var r = t.GetStar(),
                            n = i.default.trimSpaces(t.GetArgument(e));
                        t.tags.tag(n, r);
                    }),
                    (e.AmsMethods.HandleNoTag = f.default.HandleNoTag),
                    (e.AmsMethods.HandleRef = f.default.HandleRef),
                    (e.AmsMethods.Macro = f.default.Macro),
                    (e.AmsMethods.Accent = f.default.Accent),
                    (e.AmsMethods.Tilde = f.default.Tilde),
                    (e.AmsMethods.Array = f.default.Array),
                    (e.AmsMethods.Spacer = f.default.Spacer),
                    (e.AmsMethods.NamedOp = f.default.NamedOp),
                    (e.AmsMethods.EqnArray = f.default.EqnArray),
                    (e.AmsMethods.Equation = f.default.Equation);
            },
            6701: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AmsCdConfiguration = void 0);
                var n = r(6552);
                r(7673),
                    (e.AmsCdConfiguration = n.Configuration.create('amscd', {
                        handler: {
                            character: ['amscd_special'],
                            macro: ['amscd_macros'],
                            environment: ['amscd_environment'],
                        },
                        options: {
                            amscd: {
                                colspace: '5pt',
                                rowspace: '5pt',
                                harrowsize: '2.75em',
                                varrowsize: '1.75em',
                                hideHorizontalLabels: !1,
                            },
                        },
                    }));
            },
            7673: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, o);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    o =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    a =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return o(e, t), e;
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = a(r(7628)),
                    l = i(r(4708)),
                    c = i(r(7215));
                new s.EnvironmentMap(
                    'amscd_environment',
                    l.default.environment,
                    { CD: 'CD' },
                    c.default,
                ),
                    new s.CommandMap(
                        'amscd_macros',
                        {
                            minCDarrowwidth: 'minCDarrowwidth',
                            minCDarrowheight: 'minCDarrowheight',
                        },
                        c.default,
                    ),
                    new s.MacroMap('amscd_special', { '@': 'arrow' }, c.default);
            },
            7215: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = n(r(810)),
                    a = r(3606),
                    i = r(8921),
                    s = n(r(8321)),
                    l = {
                        CD: function (t, e) {
                            t.Push(e);
                            var r = t.itemFactory.create('array'),
                                n = t.configuration.options.amscd;
                            return (
                                r.setProperties({
                                    minw: t.stack.env.CD_minw || n.harrowsize,
                                    minh: t.stack.env.CD_minh || n.varrowsize,
                                }),
                                (r.arraydef = {
                                    columnalign: 'center',
                                    columnspacing: n.colspace,
                                    rowspacing: n.rowspace,
                                    displaystyle: !0,
                                }),
                                r
                            );
                        },
                        arrow: function (t, e) {
                            var r = t.string.charAt(t.i);
                            if (!r.match(/[><VA.|=]/)) return (0, a.Other)(t, e);
                            t.i++;
                            var n = t.stack.Top();
                            (n.isKind('array') && !n.Size()) || (l.cell(t, e), (n = t.stack.Top()));
                            for (
                                var c,
                                    u = n,
                                    p = u.table.length % 2 == 1,
                                    d = (u.row.length + (p ? 0 : 1)) % 2;
                                d;

                            )
                                l.cell(t, e), d--;
                            var f = { minsize: u.getProperty('minw'), stretchy: !0 },
                                h = {
                                    minsize: u.getProperty('minh'),
                                    stretchy: !0,
                                    symmetric: !0,
                                    lspace: 0,
                                    rspace: 0,
                                };
                            if ('.' === r);
                            else if ('|' === r) c = t.create('token', 'mo', h, '\u2225');
                            else if ('=' === r) c = t.create('token', 'mo', f, '=');
                            else {
                                var m = { '>': '\u2192', '<': '\u2190', V: '\u2193', A: '\u2191' }[
                                        r
                                    ],
                                    g = t.GetUpTo(e + r, r),
                                    y = t.GetUpTo(e + r, r);
                                if ('>' === r || '<' === r) {
                                    if (
                                        ((c = t.create('token', 'mo', f, m)),
                                        g || (g = '\\kern ' + u.getProperty('minw')),
                                        g || y)
                                    ) {
                                        var v = { width: '+.67em', lspace: '.33em' };
                                        if (((c = t.create('node', 'munderover', [c])), g)) {
                                            var b = new o.default(
                                                    g,
                                                    t.stack.env,
                                                    t.configuration,
                                                ).mml(),
                                                x = t.create('node', 'mpadded', [b], v);
                                            s.default.setAttribute(x, 'voffset', '.1em'),
                                                s.default.setChild(c, c.over, x);
                                        }
                                        if (y) {
                                            var _ = new o.default(
                                                y,
                                                t.stack.env,
                                                t.configuration,
                                            ).mml();
                                            s.default.setChild(
                                                c,
                                                c.under,
                                                t.create('node', 'mpadded', [_], v),
                                            );
                                        }
                                        t.configuration.options.amscd.hideHorizontalLabels &&
                                            (c = t.create('node', 'mpadded', c, {
                                                depth: 0,
                                                height: '.67em',
                                            }));
                                    }
                                } else {
                                    var M = t.create('token', 'mo', h, m);
                                    (c = M),
                                        (g || y) &&
                                            ((c = t.create('node', 'mrow')),
                                            g &&
                                                s.default.appendChildren(c, [
                                                    new o.default(
                                                        '\\scriptstyle\\llap{' + g + '}',
                                                        t.stack.env,
                                                        t.configuration,
                                                    ).mml(),
                                                ]),
                                            (M.texClass = i.TEXCLASS.ORD),
                                            s.default.appendChildren(c, [M]),
                                            y &&
                                                s.default.appendChildren(c, [
                                                    new o.default(
                                                        '\\scriptstyle\\rlap{' + y + '}',
                                                        t.stack.env,
                                                        t.configuration,
                                                    ).mml(),
                                                ]));
                                }
                            }
                            c && t.Push(c), l.cell(t, e);
                        },
                        cell: function (t, e) {
                            var r = t.stack.Top();
                            (r.table || []).length % 2 == 0 &&
                                0 === (r.row || []).length &&
                                t.Push(
                                    t.create('node', 'mpadded', [], {
                                        height: '8.5pt',
                                        depth: '2pt',
                                    }),
                                ),
                                t.Push(
                                    t.itemFactory
                                        .create('cell')
                                        .setProperties({ isEntry: !0, name: e }),
                                );
                        },
                        minCDarrowwidth: function (t, e) {
                            t.stack.env.CD_minw = t.GetDimen(e);
                        },
                        minCDarrowheight: function (t, e) {
                            t.stack.env.CD_minh = t.GetDimen(e);
                        },
                    };
                e.default = l;
            },
            1451: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AutoloadConfiguration = void 0);
                var a = r(6552),
                    i = r(7628),
                    s = r(4237),
                    l = r(4303),
                    c = r(1993),
                    u = r(9077);
                function p(t, e, r, a) {
                    var i, s, u, p;
                    if (c.Package.packages.has(t.options.require.prefix + r)) {
                        var h = t.options.autoload[r],
                            m = n(2 === h.length && Array.isArray(h[0]) ? h : [h, []], 2),
                            g = m[0],
                            y = m[1];
                        try {
                            for (var v = o(g), b = v.next(); !b.done; b = v.next()) {
                                var x = b.value;
                                d.remove(x);
                            }
                        } catch (t) {
                            i = { error: t };
                        } finally {
                            try {
                                b && !b.done && (s = v.return) && s.call(v);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                        try {
                            for (var _ = o(y), M = _.next(); !M.done; M = _.next()) {
                                var w = M.value;
                                f.remove(w);
                            }
                        } catch (t) {
                            u = { error: t };
                        } finally {
                            try {
                                M && !M.done && (p = _.return) && p.call(_);
                            } finally {
                                if (u) throw u.error;
                            }
                        }
                        (t.string =
                            (a ? e + ' ' : '\\begin{' + e.slice(1) + '}') + t.string.slice(t.i)),
                            (t.i = 0);
                    }
                    (0, l.RequireLoad)(t, r);
                }
                var d = new i.CommandMap('autoload-macros', {}, {}),
                    f = new i.CommandMap('autoload-environments', {}, {});
                e.AutoloadConfiguration = a.Configuration.create('autoload', {
                    handler: { macro: ['autoload-macros'], environment: ['autoload-environments'] },
                    options: {
                        autoload: (0, u.expandable)({
                            action: ['toggle', 'mathtip', 'texttip'],
                            amscd: [[], ['CD']],
                            bbox: ['bbox'],
                            boldsymbol: ['boldsymbol'],
                            braket: [
                                'bra',
                                'ket',
                                'braket',
                                'set',
                                'Bra',
                                'Ket',
                                'Braket',
                                'Set',
                                'ketbra',
                                'Ketbra',
                            ],
                            bussproofs: [[], ['prooftree']],
                            cancel: ['cancel', 'bcancel', 'xcancel', 'cancelto'],
                            color: ['color', 'definecolor', 'textcolor', 'colorbox', 'fcolorbox'],
                            enclose: ['enclose'],
                            extpfeil: [
                                'xtwoheadrightarrow',
                                'xtwoheadleftarrow',
                                'xmapsto',
                                'xlongequal',
                                'xtofrom',
                                'Newextarrow',
                            ],
                            html: ['href', 'class', 'style', 'cssId'],
                            mhchem: ['ce', 'pu'],
                            newcommand: [
                                'newcommand',
                                'renewcommand',
                                'newenvironment',
                                'renewenvironment',
                                'def',
                                'let',
                            ],
                            unicode: ['unicode'],
                            verb: ['verb'],
                        }),
                    },
                    config: function (t, e) {
                        var r,
                            a,
                            i,
                            c,
                            u,
                            h,
                            m = e.parseOptions,
                            g = m.handlers.get('macro'),
                            y = m.handlers.get('environment'),
                            v = m.options.autoload;
                        m.packageData.set('autoload', { Autoload: p });
                        try {
                            for (var b = o(Object.keys(v)), x = b.next(); !x.done; x = b.next()) {
                                var _ = x.value,
                                    M = v[_],
                                    w = n(2 === M.length && Array.isArray(M[0]) ? M : [M, []], 2),
                                    A = w[0],
                                    C = w[1];
                                try {
                                    for (
                                        var P = ((i = void 0), o(A)), S = P.next();
                                        !S.done;
                                        S = P.next()
                                    ) {
                                        var O = S.value;
                                        (g.lookup(O) && 'color' !== O) ||
                                            d.add(O, new s.Macro(O, p, [_, !0]));
                                    }
                                } catch (t) {
                                    i = { error: t };
                                } finally {
                                    try {
                                        S && !S.done && (c = P.return) && c.call(P);
                                    } finally {
                                        if (i) throw i.error;
                                    }
                                }
                                try {
                                    for (
                                        var T = ((u = void 0), o(C)), k = T.next();
                                        !k.done;
                                        k = T.next()
                                    ) {
                                        var E = k.value;
                                        y.lookup(E) || f.add(E, new s.Macro(E, p, [_, !1]));
                                    }
                                } catch (t) {
                                    u = { error: t };
                                } finally {
                                    try {
                                        k && !k.done && (h = T.return) && h.call(T);
                                    } finally {
                                        if (u) throw u.error;
                                    }
                                }
                            }
                        } catch (t) {
                            r = { error: t };
                        } finally {
                            try {
                                x && !x.done && (a = b.return) && a.call(b);
                            } finally {
                                if (r) throw r.error;
                            }
                        }
                        m.packageData.get('require') || l.RequireConfiguration.config(t, e);
                    },
                    init: function (t) {
                        t.options.require ||
                            (0, u.defaultOptions)(t.options, l.RequireConfiguration.options);
                    },
                    priority: 10,
                });
            },
            3606: function (t, e, r) {
                var n,
                    o,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, o);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    s =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    l =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        i(e, t, r);
                            return s(e, t), e;
                        },
                    c =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    u =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BaseConfiguration = e.BaseTags = e.Other = void 0);
                var p = r(6552),
                    d = r(2910),
                    f = u(r(3466)),
                    h = u(r(8321)),
                    m = r(7628),
                    g = l(r(8389)),
                    y = r(7251);
                r(4962);
                var v = r(3857);
                function b(t, e) {
                    var r = t.stack.env.font ? { mathvariant: t.stack.env.font } : {},
                        n = d.MapHandler.getMap('remap').lookup(e),
                        o = (0, v.getRange)(e),
                        a = o ? o[3] : 'mo',
                        i = t.create('token', a, r, n ? n.char : e);
                    o[4] && i.attributes.set('mathvariant', o[4]),
                        'mo' === a &&
                            (h.default.setProperty(i, 'fixStretchy', !0),
                            t.configuration.addNode('fixStretchy', i)),
                        t.Push(i);
                }
                new m.CharacterMap('remap', null, { '-': '\u2212', '*': '\u2217', '`': '\u2018' }),
                    (e.Other = b);
                var x = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return a(e, t), e;
                })(y.AbstractTags);
                (e.BaseTags = x),
                    (e.BaseConfiguration = p.Configuration.create('base', {
                        handler: {
                            character: ['command', 'special', 'letter', 'digit'],
                            delimiter: ['delimiter'],
                            macro: [
                                'delimiter',
                                'macros',
                                'mathchar0mi',
                                'mathchar0mo',
                                'mathchar7',
                            ],
                            environment: ['environment'],
                        },
                        fallback: {
                            character: b,
                            macro: function (t, e) {
                                throw new f.default(
                                    'UndefinedControlSequence',
                                    'Undefined control sequence %1',
                                    '\\' + e,
                                );
                            },
                            environment: function (t, e) {
                                throw new f.default('UnknownEnv', "Unknown environment '%1'", e);
                            },
                        },
                        items:
                            ((o = {}),
                            (o[g.StartItem.prototype.kind] = g.StartItem),
                            (o[g.StopItem.prototype.kind] = g.StopItem),
                            (o[g.OpenItem.prototype.kind] = g.OpenItem),
                            (o[g.CloseItem.prototype.kind] = g.CloseItem),
                            (o[g.PrimeItem.prototype.kind] = g.PrimeItem),
                            (o[g.SubsupItem.prototype.kind] = g.SubsupItem),
                            (o[g.OverItem.prototype.kind] = g.OverItem),
                            (o[g.LeftItem.prototype.kind] = g.LeftItem),
                            (o[g.Middle.prototype.kind] = g.Middle),
                            (o[g.RightItem.prototype.kind] = g.RightItem),
                            (o[g.BeginItem.prototype.kind] = g.BeginItem),
                            (o[g.EndItem.prototype.kind] = g.EndItem),
                            (o[g.StyleItem.prototype.kind] = g.StyleItem),
                            (o[g.PositionItem.prototype.kind] = g.PositionItem),
                            (o[g.CellItem.prototype.kind] = g.CellItem),
                            (o[g.MmlItem.prototype.kind] = g.MmlItem),
                            (o[g.FnItem.prototype.kind] = g.FnItem),
                            (o[g.NotItem.prototype.kind] = g.NotItem),
                            (o[g.NonscriptItem.prototype.kind] = g.NonscriptItem),
                            (o[g.DotsItem.prototype.kind] = g.DotsItem),
                            (o[g.ArrayItem.prototype.kind] = g.ArrayItem),
                            (o[g.EqnArrayItem.prototype.kind] = g.EqnArrayItem),
                            (o[g.EquationItem.prototype.kind] = g.EquationItem),
                            o),
                        options: {
                            maxMacros: 1e3,
                            baseURL:
                                'undefined' == typeof document ||
                                0 === document.getElementsByTagName('base').length
                                    ? ''
                                    : String(document.location).replace(/#.*$/, ''),
                        },
                        tags: { base: x },
                        postprocessors: [
                            [
                                function (t) {
                                    var e,
                                        r,
                                        n = t.data;
                                    try {
                                        for (
                                            var o = c(n.getList('nonscript')), a = o.next();
                                            !a.done;
                                            a = o.next()
                                        ) {
                                            var i = a.value;
                                            if (i.attributes.get('scriptlevel') > 0) {
                                                var s = i.parent;
                                                if (
                                                    (s.childNodes.splice(s.childIndex(i), 1),
                                                    n.removeFromList(i.kind, [i]),
                                                    i.isKind('mrow'))
                                                ) {
                                                    var l = i.childNodes[0];
                                                    n.removeFromList('mstyle', [l]),
                                                        n.removeFromList(
                                                            'mspace',
                                                            l.childNodes[0].childNodes,
                                                        );
                                                }
                                            } else
                                                i.isKind('mrow') &&
                                                    (i.parent.replaceChild(i.childNodes[0], i),
                                                    n.removeFromList('mrow', [i]));
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            a && !a.done && (r = o.return) && r.call(o);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                                },
                                -4,
                            ],
                        ],
                    }));
            },
            8389: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.EquationItem =
                        e.EqnArrayItem =
                        e.ArrayItem =
                        e.DotsItem =
                        e.NonscriptItem =
                        e.NotItem =
                        e.FnItem =
                        e.MmlItem =
                        e.CellItem =
                        e.PositionItem =
                        e.StyleItem =
                        e.EndItem =
                        e.BeginItem =
                        e.RightItem =
                        e.Middle =
                        e.LeftItem =
                        e.OverItem =
                        e.SubsupItem =
                        e.PrimeItem =
                        e.CloseItem =
                        e.OpenItem =
                        e.StopItem =
                        e.StartItem =
                            void 0);
                var l = r(2910),
                    c = r(9029),
                    u = r(8921),
                    p = s(r(3466)),
                    d = s(r(7702)),
                    f = s(r(8321)),
                    h = r(7044),
                    m = (function (t) {
                        function e(e, r) {
                            var n = t.call(this, e) || this;
                            return (n.global = r), n;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'start';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isOpen', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (e) {
                                if (e.isKind('stop')) {
                                    var r = this.toMml();
                                    return (
                                        this.global.isInner ||
                                            (r = this.factory.configuration.tags.finalize(
                                                r,
                                                this.env,
                                            )),
                                        [[this.factory.create('mml', r)], !0]
                                    );
                                }
                                return t.prototype.checkItem.call(this, e);
                            }),
                            e
                        );
                    })(h.BaseItem);
                e.StartItem = m;
                var g = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'stop';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isClose', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        e
                    );
                })(h.BaseItem);
                e.StopItem = g;
                var y = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'open';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isOpen', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isKind('close')) {
                                var r = this.toMml(),
                                    n = this.create('node', 'TeXAtom', [r]);
                                return [[this.factory.create('mml', n)], !0];
                            }
                            return t.prototype.checkItem.call(this, e);
                        }),
                        (e.errors = Object.assign(Object.create(h.BaseItem.errors), {
                            stop: [
                                'ExtraOpenMissingClose',
                                'Extra open brace or missing close brace',
                            ],
                        })),
                        e
                    );
                })(h.BaseItem);
                e.OpenItem = y;
                var v = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'close';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isClose', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        e
                    );
                })(h.BaseItem);
                e.CloseItem = v;
                var b = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'prime';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (t) {
                            var e = a(this.Peek(2), 2),
                                r = e[0],
                                n = e[1];
                            return !f.default.isType(r, 'msubsup') || f.default.isType(r, 'msup')
                                ? [[this.create('node', 'msup', [r, n]), t], !0]
                                : (f.default.setChild(r, r.sup, n), [[r, t], !0]);
                        }),
                        e
                    );
                })(h.BaseItem);
                e.PrimeItem = b;
                var x = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'subsup';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isKind('open') || e.isKind('left')) return h.BaseItem.success;
                            var r = this.First,
                                n = this.getProperty('position');
                            if (e.isKind('mml')) {
                                if (this.getProperty('primes'))
                                    if (2 !== n)
                                        f.default.setChild(r, 2, this.getProperty('primes'));
                                    else {
                                        f.default.setProperty(
                                            this.getProperty('primes'),
                                            'variantForm',
                                            !0,
                                        );
                                        var o = this.create('node', 'mrow', [
                                            this.getProperty('primes'),
                                            e.First,
                                        ]);
                                        e.First = o;
                                    }
                                return (
                                    f.default.setChild(r, n, e.First),
                                    null != this.getProperty('movesupsub') &&
                                        f.default.setProperty(
                                            r,
                                            'movesupsub',
                                            this.getProperty('movesupsub'),
                                        ),
                                    [[this.factory.create('mml', r)], !0]
                                );
                            }
                            if (t.prototype.checkItem.call(this, e)[1]) {
                                var s = this.getErrors(['', 'sub', 'sup'][n]);
                                throw new (p.default.bind.apply(
                                    p.default,
                                    i([void 0, s[0], s[1]], a(s.splice(2)), !1),
                                ))();
                            }
                            return null;
                        }),
                        (e.errors = Object.assign(Object.create(h.BaseItem.errors), {
                            stop: ['MissingScript', 'Missing superscript or subscript argument'],
                            sup: ['MissingOpenForSup', 'Missing open brace for superscript'],
                            sub: ['MissingOpenForSub', 'Missing open brace for subscript'],
                        })),
                        e
                    );
                })(h.BaseItem);
                e.SubsupItem = x;
                var _ = (function (t) {
                    function e(e) {
                        var r = t.call(this, e) || this;
                        return r.setProperty('name', '\\over'), r;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'over';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isClose', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isKind('over'))
                                throw new p.default(
                                    'AmbiguousUseOf',
                                    'Ambiguous use of %1',
                                    e.getName(),
                                );
                            if (e.isClose) {
                                var r = this.create('node', 'mfrac', [
                                    this.getProperty('num'),
                                    this.toMml(!1),
                                ]);
                                return (
                                    null != this.getProperty('thickness') &&
                                        f.default.setAttribute(
                                            r,
                                            'linethickness',
                                            this.getProperty('thickness'),
                                        ),
                                    (this.getProperty('open') || this.getProperty('close')) &&
                                        (f.default.setProperty(r, 'withDelims', !0),
                                        (r = d.default.fixedFence(
                                            this.factory.configuration,
                                            this.getProperty('open'),
                                            r,
                                            this.getProperty('close'),
                                        ))),
                                    [[this.factory.create('mml', r), e], !0]
                                );
                            }
                            return t.prototype.checkItem.call(this, e);
                        }),
                        (e.prototype.toString = function () {
                            return (
                                'over[' +
                                this.getProperty('num') +
                                ' / ' +
                                this.nodes.join('; ') +
                                ']'
                            );
                        }),
                        e
                    );
                })(h.BaseItem);
                e.OverItem = _;
                var M = (function (t) {
                    function e(e, r) {
                        var n = t.call(this, e) || this;
                        return n.setProperty('delim', r), n;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'left';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isOpen', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isKind('right'))
                                return [
                                    [
                                        this.factory.create(
                                            'mml',
                                            d.default.fenced(
                                                this.factory.configuration,
                                                this.getProperty('delim'),
                                                this.toMml(),
                                                e.getProperty('delim'),
                                                '',
                                                e.getProperty('color'),
                                            ),
                                        ),
                                    ],
                                    !0,
                                ];
                            if (e.isKind('middle')) {
                                var r = { stretchy: !0 };
                                return (
                                    e.getProperty('color') &&
                                        (r.mathcolor = e.getProperty('color')),
                                    this.Push(
                                        this.create('node', 'TeXAtom', [], {
                                            texClass: u.TEXCLASS.CLOSE,
                                        }),
                                        this.create('token', 'mo', r, e.getProperty('delim')),
                                        this.create('node', 'TeXAtom', [], {
                                            texClass: u.TEXCLASS.OPEN,
                                        }),
                                    ),
                                    (this.env = {}),
                                    [[this], !0]
                                );
                            }
                            return t.prototype.checkItem.call(this, e);
                        }),
                        (e.errors = Object.assign(Object.create(h.BaseItem.errors), {
                            stop: ['ExtraLeftMissingRight', 'Extra \\left or missing \\right'],
                        })),
                        e
                    );
                })(h.BaseItem);
                e.LeftItem = M;
                var w = (function (t) {
                    function e(e, r, n) {
                        var o = t.call(this, e) || this;
                        return o.setProperty('delim', r), n && o.setProperty('color', n), o;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'middle';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isClose', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        e
                    );
                })(h.BaseItem);
                e.Middle = w;
                var A = (function (t) {
                    function e(e, r, n) {
                        var o = t.call(this, e) || this;
                        return o.setProperty('delim', r), n && o.setProperty('color', n), o;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'right';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isClose', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        e
                    );
                })(h.BaseItem);
                e.RightItem = A;
                var C = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'begin';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isOpen', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isKind('end')) {
                                if (e.getName() !== this.getName())
                                    throw new p.default(
                                        'EnvBadEnd',
                                        '\\begin{%1} ended with \\end{%2}',
                                        this.getName(),
                                        e.getName(),
                                    );
                                return this.getProperty('end')
                                    ? h.BaseItem.fail
                                    : [[this.factory.create('mml', this.toMml())], !0];
                            }
                            if (e.isKind('stop'))
                                throw new p.default(
                                    'EnvMissingEnd',
                                    'Missing \\end{%1}',
                                    this.getName(),
                                );
                            return t.prototype.checkItem.call(this, e);
                        }),
                        e
                    );
                })(h.BaseItem);
                e.BeginItem = C;
                var P = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'end';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isClose', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        e
                    );
                })(h.BaseItem);
                e.EndItem = P;
                var S = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'style';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (!e.isClose) return t.prototype.checkItem.call(this, e);
                            var r = this.create(
                                'node',
                                'mstyle',
                                this.nodes,
                                this.getProperty('styles'),
                            );
                            return [[this.factory.create('mml', r), e], !0];
                        }),
                        e
                    );
                })(h.BaseItem);
                e.StyleItem = S;
                var O = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'position';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isClose)
                                throw new p.default(
                                    'MissingBoxFor',
                                    'Missing box for %1',
                                    this.getName(),
                                );
                            if (e.isFinal) {
                                var r = e.toMml();
                                switch (this.getProperty('move')) {
                                    case 'vertical':
                                        return (
                                            (r = this.create('node', 'mpadded', [r], {
                                                height: this.getProperty('dh'),
                                                depth: this.getProperty('dd'),
                                                voffset: this.getProperty('dh'),
                                            })),
                                            [[this.factory.create('mml', r)], !0]
                                        );
                                    case 'horizontal':
                                        return [
                                            [
                                                this.factory.create(
                                                    'mml',
                                                    this.getProperty('left'),
                                                ),
                                                e,
                                                this.factory.create(
                                                    'mml',
                                                    this.getProperty('right'),
                                                ),
                                            ],
                                            !0,
                                        ];
                                }
                            }
                            return t.prototype.checkItem.call(this, e);
                        }),
                        e
                    );
                })(h.BaseItem);
                e.PositionItem = O;
                var T = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'cell';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isClose', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        e
                    );
                })(h.BaseItem);
                e.CellItem = T;
                var k = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'isFinal', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'mml';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        e
                    );
                })(h.BaseItem);
                e.MmlItem = k;
                var E = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'fn';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            var r = this.First;
                            if (r) {
                                if (e.isOpen) return h.BaseItem.success;
                                if (!e.isKind('fn')) {
                                    var n = e.First;
                                    if (!e.isKind('mml') || !n) return [[r, e], !0];
                                    if (
                                        (f.default.isType(n, 'mstyle') &&
                                            n.childNodes.length &&
                                            f.default.isType(
                                                n.childNodes[0].childNodes[0],
                                                'mspace',
                                            )) ||
                                        f.default.isType(n, 'mspace')
                                    )
                                        return [[r, e], !0];
                                    f.default.isEmbellished(n) && (n = f.default.getCoreMO(n));
                                    var o = f.default.getForm(n);
                                    if (null != o && [0, 0, 1, 1, 0, 1, 1, 0, 0, 0][o[2]])
                                        return [[r, e], !0];
                                }
                                var a = this.create(
                                    'token',
                                    'mo',
                                    { texClass: u.TEXCLASS.NONE },
                                    c.entities.ApplyFunction,
                                );
                                return [[r, a, e], !0];
                            }
                            return t.prototype.checkItem.apply(this, arguments);
                        }),
                        e
                    );
                })(h.BaseItem);
                e.FnItem = E;
                var I = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.remap = l.MapHandler.getMap('not_remap')), e;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'not';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (t) {
                            var e, r, n;
                            if (t.isKind('open') || t.isKind('left')) return h.BaseItem.success;
                            if (
                                t.isKind('mml') &&
                                (f.default.isType(t.First, 'mo') ||
                                    f.default.isType(t.First, 'mi') ||
                                    f.default.isType(t.First, 'mtext')) &&
                                ((e = t.First),
                                1 === (r = f.default.getText(e)).length &&
                                    !f.default.getProperty(e, 'movesupsub') &&
                                    1 === f.default.getChildren(e).length)
                            )
                                return (
                                    this.remap.contains(r)
                                        ? ((n = this.create('text', this.remap.lookup(r).char)),
                                          f.default.setChild(e, 0, n))
                                        : ((n = this.create('text', '\u0338')),
                                          f.default.appendChildren(e, [n])),
                                    [[t], !0]
                                );
                            n = this.create('text', '\u29f8');
                            var o = this.create('node', 'mtext', [], {}, n),
                                a = this.create('node', 'mpadded', [o], { width: 0 });
                            return [
                                [
                                    (e = this.create('node', 'TeXAtom', [a], {
                                        texClass: u.TEXCLASS.REL,
                                    })),
                                    t,
                                ],
                                !0,
                            ];
                        }),
                        e
                    );
                })(h.BaseItem);
                e.NotItem = I;
                var N = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'nonscript';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (t) {
                            if (t.isKind('mml') && 1 === t.Size()) {
                                var e = t.First;
                                if (
                                    (e.isKind('mstyle') &&
                                        e.notParent &&
                                        (e = f.default.getChildren(f.default.getChildren(e)[0])[0]),
                                    e.isKind('mspace'))
                                ) {
                                    if (e !== t.First) {
                                        var r = this.create('node', 'mrow', [t.Pop()]);
                                        t.Push(r);
                                    }
                                    this.factory.configuration.addNode('nonscript', t.First);
                                }
                            }
                            return [[t], !0];
                        }),
                        e
                    );
                })(h.BaseItem);
                e.NonscriptItem = N;
                var q = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'dots';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (t) {
                            if (t.isKind('open') || t.isKind('left')) return h.BaseItem.success;
                            var e = this.getProperty('ldots'),
                                r = t.First;
                            if (t.isKind('mml') && f.default.isEmbellished(r)) {
                                var n = f.default.getTexClass(f.default.getCoreMO(r));
                                (n !== u.TEXCLASS.BIN && n !== u.TEXCLASS.REL) ||
                                    (e = this.getProperty('cdots'));
                            }
                            return [[e, t], !0];
                        }),
                        e
                    );
                })(h.BaseItem);
                e.DotsItem = q;
                var L = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (
                            (e.table = []),
                            (e.row = []),
                            (e.frame = []),
                            (e.hfill = []),
                            (e.arraydef = {}),
                            (e.dashed = !1),
                            e
                        );
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'array';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isOpen', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'copyEnv', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isClose && !e.isKind('over')) {
                                if (e.getProperty('isEntry'))
                                    return this.EndEntry(), this.clearEnv(), h.BaseItem.fail;
                                if (e.getProperty('isCR'))
                                    return (
                                        this.EndEntry(),
                                        this.EndRow(),
                                        this.clearEnv(),
                                        h.BaseItem.fail
                                    );
                                this.EndTable(), this.clearEnv();
                                var r = this.factory.create('mml', this.createMml());
                                if (this.getProperty('requireClose')) {
                                    if (e.isKind('close')) return [[r], !0];
                                    throw new p.default('MissingCloseBrace', 'Missing close brace');
                                }
                                return [[r, e], !0];
                            }
                            return t.prototype.checkItem.call(this, e);
                        }),
                        (e.prototype.createMml = function () {
                            var t = this.arraydef.scriptlevel;
                            delete this.arraydef.scriptlevel;
                            var e = this.create('node', 'mtable', this.table, this.arraydef);
                            return (
                                t && e.setProperty('scriptlevel', t),
                                4 === this.frame.length
                                    ? f.default.setAttribute(
                                          e,
                                          'frame',
                                          this.dashed ? 'dashed' : 'solid',
                                      )
                                    : this.frame.length &&
                                      (this.arraydef.rowlines &&
                                          (this.arraydef.rowlines = this.arraydef.rowlines.replace(
                                              /none( none)+$/,
                                              'none',
                                          )),
                                      f.default.setAttribute(e, 'frame', ''),
                                      (e = this.create('node', 'menclose', [e], {
                                          notation: this.frame.join(' '),
                                      })),
                                      ('none' === (this.arraydef.columnlines || 'none') &&
                                          'none' === (this.arraydef.rowlines || 'none')) ||
                                          f.default.setAttribute(e, 'data-padding', 0)),
                                (this.getProperty('open') || this.getProperty('close')) &&
                                    (e = d.default.fenced(
                                        this.factory.configuration,
                                        this.getProperty('open'),
                                        e,
                                        this.getProperty('close'),
                                    )),
                                e
                            );
                        }),
                        (e.prototype.EndEntry = function () {
                            var t = this.create('node', 'mtd', this.nodes);
                            this.hfill.length &&
                                (0 === this.hfill[0] &&
                                    f.default.setAttribute(t, 'columnalign', 'right'),
                                this.hfill[this.hfill.length - 1] === this.Size() &&
                                    f.default.setAttribute(
                                        t,
                                        'columnalign',
                                        f.default.getAttribute(t, 'columnalign')
                                            ? 'center'
                                            : 'left',
                                    )),
                                this.row.push(t),
                                this.Clear(),
                                (this.hfill = []);
                        }),
                        (e.prototype.EndRow = function () {
                            var t;
                            this.getProperty('isNumbered') && 3 === this.row.length
                                ? (this.row.unshift(this.row.pop()),
                                  (t = this.create('node', 'mlabeledtr', this.row)))
                                : (t = this.create('node', 'mtr', this.row)),
                                this.table.push(t),
                                (this.row = []);
                        }),
                        (e.prototype.EndTable = function () {
                            (this.Size() || this.row.length) && (this.EndEntry(), this.EndRow()),
                                this.checkLines();
                        }),
                        (e.prototype.checkLines = function () {
                            if (this.arraydef.rowlines) {
                                var t = this.arraydef.rowlines.split(/ /);
                                t.length === this.table.length
                                    ? (this.frame.push('bottom'),
                                      t.pop(),
                                      (this.arraydef.rowlines = t.join(' ')))
                                    : t.length < this.table.length - 1 &&
                                      (this.arraydef.rowlines += ' none');
                            }
                            if (this.getProperty('rowspacing')) {
                                for (
                                    var e = this.arraydef.rowspacing.split(/ /);
                                    e.length < this.table.length;

                                )
                                    e.push(this.getProperty('rowspacing') + 'em');
                                this.arraydef.rowspacing = e.join(' ');
                            }
                        }),
                        (e.prototype.addRowSpacing = function (t) {
                            if (this.arraydef.rowspacing) {
                                var e = this.arraydef.rowspacing.split(/ /);
                                if (!this.getProperty('rowspacing')) {
                                    var r = d.default.dimen2em(e[0]);
                                    this.setProperty('rowspacing', r);
                                }
                                for (
                                    var n = this.getProperty('rowspacing');
                                    e.length < this.table.length;

                                )
                                    e.push(d.default.Em(n));
                                (e[this.table.length - 1] = d.default.Em(
                                    Math.max(0, n + d.default.dimen2em(t)),
                                )),
                                    (this.arraydef.rowspacing = e.join(' '));
                            }
                        }),
                        e
                    );
                })(h.BaseItem);
                e.ArrayItem = L;
                var F = (function (t) {
                    function e(e) {
                        for (var r = [], n = 1; n < arguments.length; n++) r[n - 1] = arguments[n];
                        var o = t.call(this, e) || this;
                        return (
                            (o.maxrow = 0), o.factory.configuration.tags.start(r[0], r[2], r[1]), o
                        );
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'eqnarray';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.EndEntry = function () {
                            this.row.length &&
                                d.default.fixInitialMO(this.factory.configuration, this.nodes);
                            var t = this.create('node', 'mtd', this.nodes);
                            this.row.push(t), this.Clear();
                        }),
                        (e.prototype.EndRow = function () {
                            this.row.length > this.maxrow && (this.maxrow = this.row.length);
                            var t = 'mtr',
                                e = this.factory.configuration.tags.getTag();
                            e && ((this.row = [e].concat(this.row)), (t = 'mlabeledtr')),
                                this.factory.configuration.tags.clearTag();
                            var r = this.create('node', t, this.row);
                            this.table.push(r), (this.row = []);
                        }),
                        (e.prototype.EndTable = function () {
                            t.prototype.EndTable.call(this),
                                this.factory.configuration.tags.end(),
                                this.extendArray('columnalign', this.maxrow),
                                this.extendArray('columnwidth', this.maxrow),
                                this.extendArray('columnspacing', this.maxrow - 1);
                        }),
                        (e.prototype.extendArray = function (t, e) {
                            if (this.arraydef[t]) {
                                var r = this.arraydef[t].split(/ /),
                                    n = i([], a(r), !1);
                                if (n.length > 1) {
                                    for (; n.length < e; ) n.push.apply(n, i([], a(r), !1));
                                    this.arraydef[t] = n.slice(0, e).join(' ');
                                }
                            }
                        }),
                        e
                    );
                })(L);
                e.EqnArrayItem = F;
                var D = (function (t) {
                    function e(e) {
                        for (var r = [], n = 1; n < arguments.length; n++) r[n - 1] = arguments[n];
                        var o = t.call(this, e) || this;
                        return o.factory.configuration.tags.start('equation', !0, r[0]), o;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'equation';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isOpen', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isKind('end')) {
                                var r = this.toMml(),
                                    n = this.factory.configuration.tags.getTag();
                                return (
                                    this.factory.configuration.tags.end(),
                                    [[n ? this.factory.configuration.tags.enTag(r, n) : r, e], !0]
                                );
                            }
                            if (e.isKind('stop'))
                                throw new p.default(
                                    'EnvMissingEnd',
                                    'Missing \\end{%1}',
                                    this.getName(),
                                );
                            return t.prototype.checkItem.call(this, e);
                        }),
                        e
                    );
                })(h.BaseItem);
                e.EquationItem = D;
            },
            4962: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, o);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    o =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    a =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return o(e, t), e;
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = a(r(7628)),
                    l = r(7007),
                    c = i(r(724)),
                    u = i(r(4708)),
                    p = i(r(7702)),
                    d = r(8921),
                    f = r(6914);
                new s.RegExpMap('letter', u.default.variable, /[a-z]/i),
                    new s.RegExpMap('digit', u.default.digit, /[0-9.,]/),
                    new s.RegExpMap('command', u.default.controlSequence, /^\\/),
                    new s.MacroMap(
                        'special',
                        {
                            '{': 'Open',
                            '}': 'Close',
                            '~': 'Tilde',
                            '^': 'Superscript',
                            _: 'Subscript',
                            ' ': 'Space',
                            '\t': 'Space',
                            '\r': 'Space',
                            '\n': 'Space',
                            "'": 'Prime',
                            '%': 'Comment',
                            '&': 'Entry',
                            '#': 'Hash',
                            '\xa0': 'Space',
                            '\u2019': 'Prime',
                        },
                        c.default,
                    ),
                    new s.CharacterMap('mathchar0mi', u.default.mathchar0mi, {
                        alpha: '\u03b1',
                        beta: '\u03b2',
                        gamma: '\u03b3',
                        delta: '\u03b4',
                        epsilon: '\u03f5',
                        zeta: '\u03b6',
                        eta: '\u03b7',
                        theta: '\u03b8',
                        iota: '\u03b9',
                        kappa: '\u03ba',
                        lambda: '\u03bb',
                        mu: '\u03bc',
                        nu: '\u03bd',
                        xi: '\u03be',
                        omicron: '\u03bf',
                        pi: '\u03c0',
                        rho: '\u03c1',
                        sigma: '\u03c3',
                        tau: '\u03c4',
                        upsilon: '\u03c5',
                        phi: '\u03d5',
                        chi: '\u03c7',
                        psi: '\u03c8',
                        omega: '\u03c9',
                        varepsilon: '\u03b5',
                        vartheta: '\u03d1',
                        varpi: '\u03d6',
                        varrho: '\u03f1',
                        varsigma: '\u03c2',
                        varphi: '\u03c6',
                        S: ['\xa7', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        aleph: ['\u2135', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        hbar: ['\u210f', { variantForm: !0 }],
                        imath: '\u0131',
                        jmath: '\u0237',
                        ell: '\u2113',
                        wp: ['\u2118', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        Re: ['\u211c', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        Im: ['\u2111', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        partial: ['\u2202', { mathvariant: l.TexConstant.Variant.ITALIC }],
                        infty: ['\u221e', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        prime: ['\u2032', { variantForm: !0 }],
                        emptyset: ['\u2205', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        nabla: ['\u2207', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        top: ['\u22a4', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        bot: ['\u22a5', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        angle: ['\u2220', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        triangle: ['\u25b3', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        backslash: ['\u2216', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        forall: ['\u2200', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        exists: ['\u2203', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        neg: ['\xac', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        lnot: ['\xac', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        flat: ['\u266d', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        natural: ['\u266e', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        sharp: ['\u266f', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        clubsuit: ['\u2663', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        diamondsuit: ['\u2662', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        heartsuit: ['\u2661', { mathvariant: l.TexConstant.Variant.NORMAL }],
                        spadesuit: ['\u2660', { mathvariant: l.TexConstant.Variant.NORMAL }],
                    }),
                    new s.CharacterMap('mathchar0mo', u.default.mathchar0mo, {
                        surd: '\u221a',
                        coprod: ['\u2210', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        bigvee: ['\u22c1', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        bigwedge: ['\u22c0', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        biguplus: ['\u2a04', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        bigcap: ['\u22c2', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        bigcup: ['\u22c3', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        int: ['\u222b', { texClass: d.TEXCLASS.OP }],
                        intop: [
                            '\u222b',
                            { texClass: d.TEXCLASS.OP, movesupsub: !0, movablelimits: !0 },
                        ],
                        iint: ['\u222c', { texClass: d.TEXCLASS.OP }],
                        iiint: ['\u222d', { texClass: d.TEXCLASS.OP }],
                        prod: ['\u220f', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        sum: ['\u2211', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        bigotimes: ['\u2a02', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        bigoplus: ['\u2a01', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        bigodot: ['\u2a00', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        oint: ['\u222e', { texClass: d.TEXCLASS.OP }],
                        bigsqcup: ['\u2a06', { texClass: d.TEXCLASS.OP, movesupsub: !0 }],
                        smallint: ['\u222b', { largeop: !1 }],
                        triangleleft: '\u25c3',
                        triangleright: '\u25b9',
                        bigtriangleup: '\u25b3',
                        bigtriangledown: '\u25bd',
                        wedge: '\u2227',
                        land: '\u2227',
                        vee: '\u2228',
                        lor: '\u2228',
                        cap: '\u2229',
                        cup: '\u222a',
                        ddagger: '\u2021',
                        dagger: '\u2020',
                        sqcap: '\u2293',
                        sqcup: '\u2294',
                        uplus: '\u228e',
                        amalg: '\u2a3f',
                        diamond: '\u22c4',
                        bullet: '\u2219',
                        wr: '\u2240',
                        div: '\xf7',
                        divsymbol: '\xf7',
                        odot: ['\u2299', { largeop: !1 }],
                        oslash: ['\u2298', { largeop: !1 }],
                        otimes: ['\u2297', { largeop: !1 }],
                        ominus: ['\u2296', { largeop: !1 }],
                        oplus: ['\u2295', { largeop: !1 }],
                        mp: '\u2213',
                        pm: '\xb1',
                        circ: '\u2218',
                        bigcirc: '\u25ef',
                        setminus: '\u2216',
                        cdot: '\u22c5',
                        ast: '\u2217',
                        times: '\xd7',
                        star: '\u22c6',
                        propto: '\u221d',
                        sqsubseteq: '\u2291',
                        sqsupseteq: '\u2292',
                        parallel: '\u2225',
                        mid: '\u2223',
                        dashv: '\u22a3',
                        vdash: '\u22a2',
                        leq: '\u2264',
                        le: '\u2264',
                        geq: '\u2265',
                        ge: '\u2265',
                        lt: '<',
                        gt: '>',
                        succ: '\u227b',
                        prec: '\u227a',
                        approx: '\u2248',
                        succeq: '\u2ab0',
                        preceq: '\u2aaf',
                        supset: '\u2283',
                        subset: '\u2282',
                        supseteq: '\u2287',
                        subseteq: '\u2286',
                        in: '\u2208',
                        ni: '\u220b',
                        notin: '\u2209',
                        owns: '\u220b',
                        gg: '\u226b',
                        ll: '\u226a',
                        sim: '\u223c',
                        simeq: '\u2243',
                        perp: '\u22a5',
                        equiv: '\u2261',
                        asymp: '\u224d',
                        smile: '\u2323',
                        frown: '\u2322',
                        ne: '\u2260',
                        neq: '\u2260',
                        cong: '\u2245',
                        doteq: '\u2250',
                        bowtie: '\u22c8',
                        models: '\u22a8',
                        notChar: '\u29f8',
                        Leftrightarrow: '\u21d4',
                        Leftarrow: '\u21d0',
                        Rightarrow: '\u21d2',
                        leftrightarrow: '\u2194',
                        leftarrow: '\u2190',
                        gets: '\u2190',
                        rightarrow: '\u2192',
                        to: ['\u2192', { accent: !1 }],
                        mapsto: '\u21a6',
                        leftharpoonup: '\u21bc',
                        leftharpoondown: '\u21bd',
                        rightharpoonup: '\u21c0',
                        rightharpoondown: '\u21c1',
                        nearrow: '\u2197',
                        searrow: '\u2198',
                        nwarrow: '\u2196',
                        swarrow: '\u2199',
                        rightleftharpoons: '\u21cc',
                        hookrightarrow: '\u21aa',
                        hookleftarrow: '\u21a9',
                        longleftarrow: '\u27f5',
                        Longleftarrow: '\u27f8',
                        longrightarrow: '\u27f6',
                        Longrightarrow: '\u27f9',
                        Longleftrightarrow: '\u27fa',
                        longleftrightarrow: '\u27f7',
                        longmapsto: '\u27fc',
                        ldots: '\u2026',
                        cdots: '\u22ef',
                        vdots: '\u22ee',
                        ddots: '\u22f1',
                        dotsc: '\u2026',
                        dotsb: '\u22ef',
                        dotsm: '\u22ef',
                        dotsi: '\u22ef',
                        dotso: '\u2026',
                        ldotp: ['.', { texClass: d.TEXCLASS.PUNCT }],
                        cdotp: ['\u22c5', { texClass: d.TEXCLASS.PUNCT }],
                        colon: [':', { texClass: d.TEXCLASS.PUNCT }],
                    }),
                    new s.CharacterMap('mathchar7', u.default.mathchar7, {
                        Gamma: '\u0393',
                        Delta: '\u0394',
                        Theta: '\u0398',
                        Lambda: '\u039b',
                        Xi: '\u039e',
                        Pi: '\u03a0',
                        Sigma: '\u03a3',
                        Upsilon: '\u03a5',
                        Phi: '\u03a6',
                        Psi: '\u03a8',
                        Omega: '\u03a9',
                        _: '_',
                        '#': '#',
                        $: '$',
                        '%': '%',
                        '&': '&',
                        And: '&',
                    }),
                    new s.DelimiterMap('delimiter', u.default.delimiter, {
                        '(': '(',
                        ')': ')',
                        '[': '[',
                        ']': ']',
                        '<': '\u27e8',
                        '>': '\u27e9',
                        '\\lt': '\u27e8',
                        '\\gt': '\u27e9',
                        '/': '/',
                        '|': ['|', { texClass: d.TEXCLASS.ORD }],
                        '.': '',
                        '\\\\': '\\',
                        '\\lmoustache': '\u23b0',
                        '\\rmoustache': '\u23b1',
                        '\\lgroup': '\u27ee',
                        '\\rgroup': '\u27ef',
                        '\\arrowvert': '\u23d0',
                        '\\Arrowvert': '\u2016',
                        '\\bracevert': '\u23aa',
                        '\\Vert': ['\u2016', { texClass: d.TEXCLASS.ORD }],
                        '\\|': ['\u2016', { texClass: d.TEXCLASS.ORD }],
                        '\\vert': ['|', { texClass: d.TEXCLASS.ORD }],
                        '\\uparrow': '\u2191',
                        '\\downarrow': '\u2193',
                        '\\updownarrow': '\u2195',
                        '\\Uparrow': '\u21d1',
                        '\\Downarrow': '\u21d3',
                        '\\Updownarrow': '\u21d5',
                        '\\backslash': '\\',
                        '\\rangle': '\u27e9',
                        '\\langle': '\u27e8',
                        '\\rbrace': '}',
                        '\\lbrace': '{',
                        '\\}': '}',
                        '\\{': '{',
                        '\\rceil': '\u2309',
                        '\\lceil': '\u2308',
                        '\\rfloor': '\u230b',
                        '\\lfloor': '\u230a',
                        '\\lbrack': '[',
                        '\\rbrack': ']',
                    }),
                    new s.CommandMap(
                        'macros',
                        {
                            displaystyle: ['SetStyle', 'D', !0, 0],
                            textstyle: ['SetStyle', 'T', !1, 0],
                            scriptstyle: ['SetStyle', 'S', !1, 1],
                            scriptscriptstyle: ['SetStyle', 'SS', !1, 2],
                            rm: ['SetFont', l.TexConstant.Variant.NORMAL],
                            mit: ['SetFont', l.TexConstant.Variant.ITALIC],
                            oldstyle: ['SetFont', l.TexConstant.Variant.OLDSTYLE],
                            cal: ['SetFont', l.TexConstant.Variant.CALLIGRAPHIC],
                            it: ['SetFont', l.TexConstant.Variant.MATHITALIC],
                            bf: ['SetFont', l.TexConstant.Variant.BOLD],
                            bbFont: ['SetFont', l.TexConstant.Variant.DOUBLESTRUCK],
                            scr: ['SetFont', l.TexConstant.Variant.SCRIPT],
                            frak: ['SetFont', l.TexConstant.Variant.FRAKTUR],
                            sf: ['SetFont', l.TexConstant.Variant.SANSSERIF],
                            tt: ['SetFont', l.TexConstant.Variant.MONOSPACE],
                            mathrm: ['MathFont', l.TexConstant.Variant.NORMAL],
                            mathup: ['MathFont', l.TexConstant.Variant.NORMAL],
                            mathnormal: ['MathFont', ''],
                            mathbf: ['MathFont', l.TexConstant.Variant.BOLD],
                            mathbfup: ['MathFont', l.TexConstant.Variant.BOLD],
                            mathit: ['MathFont', l.TexConstant.Variant.MATHITALIC],
                            mathbfit: ['MathFont', l.TexConstant.Variant.BOLDITALIC],
                            mathbb: ['MathFont', l.TexConstant.Variant.DOUBLESTRUCK],
                            Bbb: ['MathFont', l.TexConstant.Variant.DOUBLESTRUCK],
                            mathfrak: ['MathFont', l.TexConstant.Variant.FRAKTUR],
                            mathbffrak: ['MathFont', l.TexConstant.Variant.BOLDFRAKTUR],
                            mathscr: ['MathFont', l.TexConstant.Variant.SCRIPT],
                            mathbfscr: ['MathFont', l.TexConstant.Variant.BOLDSCRIPT],
                            mathsf: ['MathFont', l.TexConstant.Variant.SANSSERIF],
                            mathsfup: ['MathFont', l.TexConstant.Variant.SANSSERIF],
                            mathbfsf: ['MathFont', l.TexConstant.Variant.BOLDSANSSERIF],
                            mathbfsfup: ['MathFont', l.TexConstant.Variant.BOLDSANSSERIF],
                            mathsfit: ['MathFont', l.TexConstant.Variant.SANSSERIFITALIC],
                            mathbfsfit: ['MathFont', l.TexConstant.Variant.SANSSERIFBOLDITALIC],
                            mathtt: ['MathFont', l.TexConstant.Variant.MONOSPACE],
                            mathcal: ['MathFont', l.TexConstant.Variant.CALLIGRAPHIC],
                            mathbfcal: ['MathFont', l.TexConstant.Variant.BOLDCALLIGRAPHIC],
                            symrm: ['MathFont', l.TexConstant.Variant.NORMAL],
                            symup: ['MathFont', l.TexConstant.Variant.NORMAL],
                            symnormal: ['MathFont', ''],
                            symbf: ['MathFont', l.TexConstant.Variant.BOLD],
                            symbfup: ['MathFont', l.TexConstant.Variant.BOLD],
                            symit: ['MathFont', l.TexConstant.Variant.ITALIC],
                            symbfit: ['MathFont', l.TexConstant.Variant.BOLDITALIC],
                            symbb: ['MathFont', l.TexConstant.Variant.DOUBLESTRUCK],
                            symfrak: ['MathFont', l.TexConstant.Variant.FRAKTUR],
                            symbffrak: ['MathFont', l.TexConstant.Variant.BOLDFRAKTUR],
                            symscr: ['MathFont', l.TexConstant.Variant.SCRIPT],
                            symbfscr: ['MathFont', l.TexConstant.Variant.BOLDSCRIPT],
                            symsf: ['MathFont', l.TexConstant.Variant.SANSSERIF],
                            symsfup: ['MathFont', l.TexConstant.Variant.SANSSERIF],
                            symbfsf: ['MathFont', l.TexConstant.Variant.BOLDSANSSERIF],
                            symbfsfup: ['MathFont', l.TexConstant.Variant.BOLDSANSSERIF],
                            symsfit: ['MathFont', l.TexConstant.Variant.SANSSERIFITALIC],
                            symbfsfit: ['MathFont', l.TexConstant.Variant.SANSSERIFBOLDITALIC],
                            symtt: ['MathFont', l.TexConstant.Variant.MONOSPACE],
                            symcal: ['MathFont', l.TexConstant.Variant.CALLIGRAPHIC],
                            symbfcal: ['MathFont', l.TexConstant.Variant.BOLDCALLIGRAPHIC],
                            textrm: ['HBox', null, l.TexConstant.Variant.NORMAL],
                            textup: ['HBox', null, l.TexConstant.Variant.NORMAL],
                            textnormal: ['HBox'],
                            textit: ['HBox', null, l.TexConstant.Variant.ITALIC],
                            textbf: ['HBox', null, l.TexConstant.Variant.BOLD],
                            textsf: ['HBox', null, l.TexConstant.Variant.SANSSERIF],
                            texttt: ['HBox', null, l.TexConstant.Variant.MONOSPACE],
                            tiny: ['SetSize', 0.5],
                            Tiny: ['SetSize', 0.6],
                            scriptsize: ['SetSize', 0.7],
                            small: ['SetSize', 0.85],
                            normalsize: ['SetSize', 1],
                            large: ['SetSize', 1.2],
                            Large: ['SetSize', 1.44],
                            LARGE: ['SetSize', 1.73],
                            huge: ['SetSize', 2.07],
                            Huge: ['SetSize', 2.49],
                            arcsin: 'NamedFn',
                            arccos: 'NamedFn',
                            arctan: 'NamedFn',
                            arg: 'NamedFn',
                            cos: 'NamedFn',
                            cosh: 'NamedFn',
                            cot: 'NamedFn',
                            coth: 'NamedFn',
                            csc: 'NamedFn',
                            deg: 'NamedFn',
                            det: 'NamedOp',
                            dim: 'NamedFn',
                            exp: 'NamedFn',
                            gcd: 'NamedOp',
                            hom: 'NamedFn',
                            inf: 'NamedOp',
                            ker: 'NamedFn',
                            lg: 'NamedFn',
                            lim: 'NamedOp',
                            liminf: ['NamedOp', 'lim&thinsp;inf'],
                            limsup: ['NamedOp', 'lim&thinsp;sup'],
                            ln: 'NamedFn',
                            log: 'NamedFn',
                            max: 'NamedOp',
                            min: 'NamedOp',
                            Pr: 'NamedOp',
                            sec: 'NamedFn',
                            sin: 'NamedFn',
                            sinh: 'NamedFn',
                            sup: 'NamedOp',
                            tan: 'NamedFn',
                            tanh: 'NamedFn',
                            limits: ['Limits', 1],
                            nolimits: ['Limits', 0],
                            overline: ['UnderOver', '2015'],
                            underline: ['UnderOver', '2015'],
                            overbrace: ['UnderOver', '23DE', 1],
                            underbrace: ['UnderOver', '23DF', 1],
                            overparen: ['UnderOver', '23DC'],
                            underparen: ['UnderOver', '23DD'],
                            overrightarrow: ['UnderOver', '2192'],
                            underrightarrow: ['UnderOver', '2192'],
                            overleftarrow: ['UnderOver', '2190'],
                            underleftarrow: ['UnderOver', '2190'],
                            overleftrightarrow: ['UnderOver', '2194'],
                            underleftrightarrow: ['UnderOver', '2194'],
                            overset: 'Overset',
                            underset: 'Underset',
                            overunderset: 'Overunderset',
                            stackrel: ['Macro', '\\mathrel{\\mathop{#2}\\limits^{#1}}', 2],
                            stackbin: ['Macro', '\\mathbin{\\mathop{#2}\\limits^{#1}}', 2],
                            over: 'Over',
                            overwithdelims: 'Over',
                            atop: 'Over',
                            atopwithdelims: 'Over',
                            above: 'Over',
                            abovewithdelims: 'Over',
                            brace: ['Over', '{', '}'],
                            brack: ['Over', '[', ']'],
                            choose: ['Over', '(', ')'],
                            frac: 'Frac',
                            sqrt: 'Sqrt',
                            root: 'Root',
                            uproot: ['MoveRoot', 'upRoot'],
                            leftroot: ['MoveRoot', 'leftRoot'],
                            left: 'LeftRight',
                            right: 'LeftRight',
                            middle: 'LeftRight',
                            llap: 'Lap',
                            rlap: 'Lap',
                            raise: 'RaiseLower',
                            lower: 'RaiseLower',
                            moveleft: 'MoveLeftRight',
                            moveright: 'MoveLeftRight',
                            ',': ['Spacer', f.MATHSPACE.thinmathspace],
                            ':': ['Spacer', f.MATHSPACE.mediummathspace],
                            '>': ['Spacer', f.MATHSPACE.mediummathspace],
                            ';': ['Spacer', f.MATHSPACE.thickmathspace],
                            '!': ['Spacer', f.MATHSPACE.negativethinmathspace],
                            enspace: ['Spacer', 0.5],
                            quad: ['Spacer', 1],
                            qquad: ['Spacer', 2],
                            thinspace: ['Spacer', f.MATHSPACE.thinmathspace],
                            negthinspace: ['Spacer', f.MATHSPACE.negativethinmathspace],
                            hskip: 'Hskip',
                            hspace: 'Hskip',
                            kern: 'Hskip',
                            mskip: 'Hskip',
                            mspace: 'Hskip',
                            mkern: 'Hskip',
                            rule: 'rule',
                            Rule: ['Rule'],
                            Space: ['Rule', 'blank'],
                            nonscript: 'Nonscript',
                            big: ['MakeBig', d.TEXCLASS.ORD, 0.85],
                            Big: ['MakeBig', d.TEXCLASS.ORD, 1.15],
                            bigg: ['MakeBig', d.TEXCLASS.ORD, 1.45],
                            Bigg: ['MakeBig', d.TEXCLASS.ORD, 1.75],
                            bigl: ['MakeBig', d.TEXCLASS.OPEN, 0.85],
                            Bigl: ['MakeBig', d.TEXCLASS.OPEN, 1.15],
                            biggl: ['MakeBig', d.TEXCLASS.OPEN, 1.45],
                            Biggl: ['MakeBig', d.TEXCLASS.OPEN, 1.75],
                            bigr: ['MakeBig', d.TEXCLASS.CLOSE, 0.85],
                            Bigr: ['MakeBig', d.TEXCLASS.CLOSE, 1.15],
                            biggr: ['MakeBig', d.TEXCLASS.CLOSE, 1.45],
                            Biggr: ['MakeBig', d.TEXCLASS.CLOSE, 1.75],
                            bigm: ['MakeBig', d.TEXCLASS.REL, 0.85],
                            Bigm: ['MakeBig', d.TEXCLASS.REL, 1.15],
                            biggm: ['MakeBig', d.TEXCLASS.REL, 1.45],
                            Biggm: ['MakeBig', d.TEXCLASS.REL, 1.75],
                            mathord: ['TeXAtom', d.TEXCLASS.ORD],
                            mathop: ['TeXAtom', d.TEXCLASS.OP],
                            mathopen: ['TeXAtom', d.TEXCLASS.OPEN],
                            mathclose: ['TeXAtom', d.TEXCLASS.CLOSE],
                            mathbin: ['TeXAtom', d.TEXCLASS.BIN],
                            mathrel: ['TeXAtom', d.TEXCLASS.REL],
                            mathpunct: ['TeXAtom', d.TEXCLASS.PUNCT],
                            mathinner: ['TeXAtom', d.TEXCLASS.INNER],
                            vcenter: ['TeXAtom', d.TEXCLASS.VCENTER],
                            buildrel: 'BuildRel',
                            hbox: ['HBox', 0],
                            text: 'HBox',
                            mbox: ['HBox', 0],
                            fbox: 'FBox',
                            boxed: ['Macro', '\\fbox{$\\displaystyle{#1}$}', 1],
                            framebox: 'FrameBox',
                            strut: 'Strut',
                            mathstrut: ['Macro', '\\vphantom{(}'],
                            phantom: 'Phantom',
                            vphantom: ['Phantom', 1, 0],
                            hphantom: ['Phantom', 0, 1],
                            smash: 'Smash',
                            acute: ['Accent', '00B4'],
                            grave: ['Accent', '0060'],
                            ddot: ['Accent', '00A8'],
                            tilde: ['Accent', '007E'],
                            bar: ['Accent', '00AF'],
                            breve: ['Accent', '02D8'],
                            check: ['Accent', '02C7'],
                            hat: ['Accent', '005E'],
                            vec: ['Accent', '2192'],
                            dot: ['Accent', '02D9'],
                            widetilde: ['Accent', '007E', 1],
                            widehat: ['Accent', '005E', 1],
                            matrix: 'Matrix',
                            array: 'Matrix',
                            pmatrix: ['Matrix', '(', ')'],
                            cases: ['Matrix', '{', '', 'left left', null, '.1em', null, !0],
                            eqalign: [
                                'Matrix',
                                null,
                                null,
                                'right left',
                                (0, f.em)(f.MATHSPACE.thickmathspace),
                                '.5em',
                                'D',
                            ],
                            displaylines: ['Matrix', null, null, 'center', null, '.5em', 'D'],
                            cr: 'Cr',
                            '\\': 'CrLaTeX',
                            newline: ['CrLaTeX', !0],
                            hline: ['HLine', 'solid'],
                            hdashline: ['HLine', 'dashed'],
                            eqalignno: [
                                'Matrix',
                                null,
                                null,
                                'right left',
                                (0, f.em)(f.MATHSPACE.thickmathspace),
                                '.5em',
                                'D',
                                null,
                                'right',
                            ],
                            leqalignno: [
                                'Matrix',
                                null,
                                null,
                                'right left',
                                (0, f.em)(f.MATHSPACE.thickmathspace),
                                '.5em',
                                'D',
                                null,
                                'left',
                            ],
                            hfill: 'HFill',
                            hfil: 'HFill',
                            hfilll: 'HFill',
                            bmod: [
                                'Macro',
                                '\\mmlToken{mo}[lspace="thickmathspace" rspace="thickmathspace"]{mod}',
                            ],
                            pmod: ['Macro', '\\pod{\\mmlToken{mi}{mod}\\kern 6mu #1}', 1],
                            mod: [
                                'Macro',
                                '\\mathchoice{\\kern18mu}{\\kern12mu}{\\kern12mu}{\\kern12mu}\\mmlToken{mi}{mod}\\,\\,#1',
                                1,
                            ],
                            pod: [
                                'Macro',
                                '\\mathchoice{\\kern18mu}{\\kern8mu}{\\kern8mu}{\\kern8mu}(#1)',
                                1,
                            ],
                            iff: ['Macro', '\\;\\Longleftrightarrow\\;'],
                            skew: ['Macro', '{{#2{#3\\mkern#1mu}\\mkern-#1mu}{}}', 3],
                            pmb: ['Macro', '\\rlap{#1}\\kern1px{#1}', 1],
                            TeX: ['Macro', 'T\\kern-.14em\\lower.5ex{E}\\kern-.115em X'],
                            LaTeX: [
                                'Macro',
                                'L\\kern-.325em\\raise.21em{\\scriptstyle{A}}\\kern-.17em\\TeX',
                            ],
                            ' ': ['Macro', '\\text{ }'],
                            not: 'Not',
                            dots: 'Dots',
                            space: 'Tilde',
                            '\xa0': 'Tilde',
                            begin: 'BeginEnd',
                            end: 'BeginEnd',
                            label: 'HandleLabel',
                            ref: 'HandleRef',
                            nonumber: 'HandleNoTag',
                            mathchoice: 'MathChoice',
                            mmlToken: 'MmlToken',
                        },
                        c.default,
                    ),
                    new s.EnvironmentMap(
                        'environment',
                        u.default.environment,
                        {
                            array: ['AlignedArray'],
                            equation: ['Equation', null, !0],
                            eqnarray: [
                                'EqnArray',
                                null,
                                !0,
                                !0,
                                'rcl',
                                p.default.cols(0, f.MATHSPACE.thickmathspace),
                                '.5em',
                            ],
                        },
                        c.default,
                    ),
                    new s.CharacterMap('not_remap', null, {
                        '\u2190': '\u219a',
                        '\u2192': '\u219b',
                        '\u2194': '\u21ae',
                        '\u21d0': '\u21cd',
                        '\u21d2': '\u21cf',
                        '\u21d4': '\u21ce',
                        '\u2208': '\u2209',
                        '\u220b': '\u220c',
                        '\u2223': '\u2224',
                        '\u2225': '\u2226',
                        '\u223c': '\u2241',
                        '~': '\u2241',
                        '\u2243': '\u2244',
                        '\u2245': '\u2247',
                        '\u2248': '\u2249',
                        '\u224d': '\u226d',
                        '=': '\u2260',
                        '\u2261': '\u2262',
                        '<': '\u226e',
                        '>': '\u226f',
                        '\u2264': '\u2270',
                        '\u2265': '\u2271',
                        '\u2272': '\u2274',
                        '\u2273': '\u2275',
                        '\u2276': '\u2278',
                        '\u2277': '\u2279',
                        '\u227a': '\u2280',
                        '\u227b': '\u2281',
                        '\u2282': '\u2284',
                        '\u2283': '\u2285',
                        '\u2286': '\u2288',
                        '\u2287': '\u2289',
                        '\u22a2': '\u22ac',
                        '\u22a8': '\u22ad',
                        '\u22a9': '\u22ae',
                        '\u22ab': '\u22af',
                        '\u227c': '\u22e0',
                        '\u227d': '\u22e1',
                        '\u2291': '\u22e2',
                        '\u2292': '\u22e3',
                        '\u22b2': '\u22ea',
                        '\u22b3': '\u22eb',
                        '\u22b4': '\u22ec',
                        '\u22b5': '\u22ed',
                        '\u2203': '\u2204',
                    });
            },
            724: function (t, e, r) {
                var n =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (n =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                n.apply(this, arguments)
                            );
                        },
                    o =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, o);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
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
                            return a(e, t), e;
                        },
                    s =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var c = i(r(8389)),
                    u = l(r(8321)),
                    p = l(r(3466)),
                    d = l(r(810)),
                    f = r(7007),
                    h = l(r(7702)),
                    m = r(8921),
                    g = r(7251),
                    y = r(6914),
                    v = r(9029),
                    b = r(9077),
                    x = {},
                    _ = {
                        fontfamily: 1,
                        fontsize: 1,
                        fontweight: 1,
                        fontstyle: 1,
                        color: 1,
                        background: 1,
                        id: 1,
                        class: 1,
                        href: 1,
                        style: 1,
                    };
                function M(t, e) {
                    var r = t.stack.env,
                        n = r.inRoot;
                    r.inRoot = !0;
                    var o = new d.default(e, r, t.configuration),
                        a = o.mml(),
                        i = o.stack.global;
                    if (i.leftRoot || i.upRoot) {
                        var s = {};
                        i.leftRoot && (s.width = i.leftRoot),
                            i.upRoot && ((s.voffset = i.upRoot), (s.height = i.upRoot)),
                            (a = t.create('node', 'mpadded', [a], s));
                    }
                    return (r.inRoot = n), a;
                }
                (x.Open = function (t, e) {
                    t.Push(t.itemFactory.create('open'));
                }),
                    (x.Close = function (t, e) {
                        t.Push(t.itemFactory.create('close'));
                    }),
                    (x.Tilde = function (t, e) {
                        t.Push(t.create('token', 'mtext', {}, v.entities.nbsp));
                    }),
                    (x.Space = function (t, e) {}),
                    (x.Superscript = function (t, e) {
                        var r, n, o;
                        t.GetNext().match(/\d/) &&
                            (t.string =
                                t.string.substr(0, t.i + 1) + ' ' + t.string.substr(t.i + 1));
                        var a = t.stack.Top();
                        a.isKind('prime')
                            ? ((o = (r = s(a.Peek(2), 2))[0]), (n = r[1]), t.stack.Pop())
                            : (o = t.stack.Prev()) || (o = t.create('token', 'mi', {}, ''));
                        var i = u.default.getProperty(o, 'movesupsub'),
                            l = u.default.isType(o, 'msubsup') ? o.sup : o.over;
                        if (
                            (u.default.isType(o, 'msubsup') &&
                                !u.default.isType(o, 'msup') &&
                                u.default.getChildAt(o, o.sup)) ||
                            (u.default.isType(o, 'munderover') &&
                                !u.default.isType(o, 'mover') &&
                                u.default.getChildAt(o, o.over) &&
                                !u.default.getProperty(o, 'subsupOK'))
                        )
                            throw new p.default(
                                'DoubleExponent',
                                'Double exponent: use braces to clarify',
                            );
                        (u.default.isType(o, 'msubsup') && !u.default.isType(o, 'msup')) ||
                            (i
                                ? ((!u.default.isType(o, 'munderover') ||
                                      u.default.isType(o, 'mover') ||
                                      u.default.getChildAt(o, o.over)) &&
                                      (o = t.create('node', 'munderover', [o], { movesupsub: !0 })),
                                  (l = o.over))
                                : (l = (o = t.create('node', 'msubsup', [o])).sup)),
                            t.Push(
                                t.itemFactory
                                    .create('subsup', o)
                                    .setProperties({ position: l, primes: n, movesupsub: i }),
                            );
                    }),
                    (x.Subscript = function (t, e) {
                        var r, n, o;
                        t.GetNext().match(/\d/) &&
                            (t.string =
                                t.string.substr(0, t.i + 1) + ' ' + t.string.substr(t.i + 1));
                        var a = t.stack.Top();
                        a.isKind('prime')
                            ? ((o = (r = s(a.Peek(2), 2))[0]), (n = r[1]), t.stack.Pop())
                            : (o = t.stack.Prev()) || (o = t.create('token', 'mi', {}, ''));
                        var i = u.default.getProperty(o, 'movesupsub'),
                            l = u.default.isType(o, 'msubsup') ? o.sub : o.under;
                        if (
                            (u.default.isType(o, 'msubsup') &&
                                !u.default.isType(o, 'msup') &&
                                u.default.getChildAt(o, o.sub)) ||
                            (u.default.isType(o, 'munderover') &&
                                !u.default.isType(o, 'mover') &&
                                u.default.getChildAt(o, o.under) &&
                                !u.default.getProperty(o, 'subsupOK'))
                        )
                            throw new p.default(
                                'DoubleSubscripts',
                                'Double subscripts: use braces to clarify',
                            );
                        (u.default.isType(o, 'msubsup') && !u.default.isType(o, 'msup')) ||
                            (i
                                ? ((!u.default.isType(o, 'munderover') ||
                                      u.default.isType(o, 'mover') ||
                                      u.default.getChildAt(o, o.under)) &&
                                      (o = t.create('node', 'munderover', [o], { movesupsub: !0 })),
                                  (l = o.under))
                                : (l = (o = t.create('node', 'msubsup', [o])).sub)),
                            t.Push(
                                t.itemFactory
                                    .create('subsup', o)
                                    .setProperties({ position: l, primes: n, movesupsub: i }),
                            );
                    }),
                    (x.Prime = function (t, e) {
                        var r = t.stack.Prev();
                        if (
                            (r || (r = t.create('node', 'mi')),
                            u.default.isType(r, 'msubsup') &&
                                !u.default.isType(r, 'msup') &&
                                u.default.getChildAt(r, r.sup))
                        )
                            throw new p.default(
                                'DoubleExponentPrime',
                                'Prime causes double exponent: use braces to clarify',
                            );
                        var n = '';
                        t.i--;
                        do {
                            (n += v.entities.prime), t.i++, (e = t.GetNext());
                        } while ("'" === e || e === v.entities.rsquo);
                        n = ['', '\u2032', '\u2033', '\u2034', '\u2057'][n.length] || n;
                        var o = t.create('token', 'mo', { variantForm: !0 }, n);
                        t.Push(t.itemFactory.create('prime', r, o));
                    }),
                    (x.Comment = function (t, e) {
                        for (; t.i < t.string.length && '\n' !== t.string.charAt(t.i); ) t.i++;
                    }),
                    (x.Hash = function (t, e) {
                        throw new p.default(
                            'CantUseHash1',
                            "You can't use 'macro parameter character #' in math mode",
                        );
                    }),
                    (x.MathFont = function (t, e, r) {
                        var o = t.GetArgument(e),
                            a = new d.default(
                                o,
                                n(n({}, t.stack.env), {
                                    font: r,
                                    multiLetterIdentifiers: /^[a-zA-Z]+/,
                                    noAutoOP: !0,
                                }),
                                t.configuration,
                            ).mml();
                        t.Push(t.create('node', 'TeXAtom', [a]));
                    }),
                    (x.SetFont = function (t, e, r) {
                        t.stack.env.font = r;
                    }),
                    (x.SetStyle = function (t, e, r, n, o) {
                        (t.stack.env.style = r),
                            (t.stack.env.level = o),
                            t.Push(
                                t.itemFactory
                                    .create('style')
                                    .setProperty('styles', { displaystyle: n, scriptlevel: o }),
                            );
                    }),
                    (x.SetSize = function (t, e, r) {
                        (t.stack.env.size = r),
                            t.Push(
                                t.itemFactory
                                    .create('style')
                                    .setProperty('styles', { mathsize: (0, y.em)(r) }),
                            );
                    }),
                    (x.Spacer = function (t, e, r) {
                        var n = t.create('node', 'mspace', [], { width: (0, y.em)(r) }),
                            o = t.create('node', 'mstyle', [n], { scriptlevel: 0 });
                        t.Push(o);
                    }),
                    (x.LeftRight = function (t, e) {
                        var r = e.substr(1);
                        t.Push(t.itemFactory.create(r, t.GetDelimiter(e), t.stack.env.color));
                    }),
                    (x.NamedFn = function (t, e, r) {
                        r || (r = e.substr(1));
                        var n = t.create('token', 'mi', { texClass: m.TEXCLASS.OP }, r);
                        t.Push(t.itemFactory.create('fn', n));
                    }),
                    (x.NamedOp = function (t, e, r) {
                        r || (r = e.substr(1)), (r = r.replace(/&thinsp;/, '\u2006'));
                        var n = t.create(
                            'token',
                            'mo',
                            {
                                movablelimits: !0,
                                movesupsub: !0,
                                form: f.TexConstant.Form.PREFIX,
                                texClass: m.TEXCLASS.OP,
                            },
                            r,
                        );
                        t.Push(n);
                    }),
                    (x.Limits = function (t, e, r) {
                        var n = t.stack.Prev(!0);
                        if (
                            !n ||
                            (u.default.getTexClass(u.default.getCoreMO(n)) !== m.TEXCLASS.OP &&
                                null == u.default.getProperty(n, 'movesupsub'))
                        )
                            throw new p.default(
                                'MisplacedLimits',
                                '%1 is allowed only on operators',
                                t.currentCS,
                            );
                        var o,
                            a = t.stack.Top();
                        u.default.isType(n, 'munderover') && !r
                            ? ((o = t.create('node', 'msubsup')),
                              u.default.copyChildren(n, o),
                              (n = a.Last = o))
                            : u.default.isType(n, 'msubsup') &&
                              r &&
                              ((o = t.create('node', 'munderover')),
                              u.default.copyChildren(n, o),
                              (n = a.Last = o)),
                            u.default.setProperty(n, 'movesupsub', !!r),
                            u.default.setProperties(u.default.getCoreMO(n), { movablelimits: !1 }),
                            (u.default.getAttribute(n, 'movablelimits') ||
                                u.default.getProperty(n, 'movablelimits')) &&
                                u.default.setProperties(n, { movablelimits: !1 });
                    }),
                    (x.Over = function (t, e, r, n) {
                        var o = t.itemFactory.create('over').setProperty('name', t.currentCS);
                        r || n
                            ? (o.setProperty('open', r), o.setProperty('close', n))
                            : e.match(/withdelims$/) &&
                              (o.setProperty('open', t.GetDelimiter(e)),
                              o.setProperty('close', t.GetDelimiter(e))),
                            e.match(/^\\above/)
                                ? o.setProperty('thickness', t.GetDimen(e))
                                : (e.match(/^\\atop/) || r || n) && o.setProperty('thickness', 0),
                            t.Push(o);
                    }),
                    (x.Frac = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e),
                            o = t.create('node', 'mfrac', [r, n]);
                        t.Push(o);
                    }),
                    (x.Sqrt = function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetArgument(e);
                        '\\frac' === n &&
                            (n += '{' + t.GetArgument(n) + '}{' + t.GetArgument(n) + '}');
                        var o = new d.default(n, t.stack.env, t.configuration).mml();
                        (o = r
                            ? t.create('node', 'mroot', [o, M(t, r)])
                            : t.create('node', 'msqrt', [o])),
                            t.Push(o);
                    }),
                    (x.Root = function (t, e) {
                        var r = t.GetUpTo(e, '\\of'),
                            n = t.ParseArg(e),
                            o = t.create('node', 'mroot', [n, M(t, r)]);
                        t.Push(o);
                    }),
                    (x.MoveRoot = function (t, e, r) {
                        if (!t.stack.env.inRoot)
                            throw new p.default(
                                'MisplacedMoveRoot',
                                '%1 can appear only within a root',
                                t.currentCS,
                            );
                        if (t.stack.global[r])
                            throw new p.default(
                                'MultipleMoveRoot',
                                'Multiple use of %1',
                                t.currentCS,
                            );
                        var n = t.GetArgument(e);
                        if (!n.match(/-?[0-9]+/))
                            throw new p.default(
                                'IntegerArg',
                                'The argument to %1 must be an integer',
                                t.currentCS,
                            );
                        '-' !== (n = parseInt(n, 10) / 15 + 'em').substr(0, 1) && (n = '+' + n),
                            (t.stack.global[r] = n);
                    }),
                    (x.Accent = function (t, e, r, o) {
                        var a = t.ParseArg(e),
                            i = n(n({}, h.default.getFontDef(t)), { accent: !0, mathaccent: !0 }),
                            s = u.default.createEntity(r),
                            l = t.create('token', 'mo', i, s);
                        u.default.setAttribute(l, 'stretchy', !!o);
                        var c = u.default.isEmbellished(a) ? u.default.getCoreMO(a) : a;
                        (u.default.isType(c, 'mo') || u.default.getProperty(c, 'movablelimits')) &&
                            u.default.setProperties(c, { movablelimits: !1 });
                        var p = t.create('node', 'munderover');
                        u.default.setChild(p, 0, a),
                            u.default.setChild(p, 1, null),
                            u.default.setChild(p, 2, l);
                        var d = t.create('node', 'TeXAtom', [p]);
                        t.Push(d);
                    }),
                    (x.UnderOver = function (t, e, r, n) {
                        var o = u.default.createEntity(r),
                            a = t.create('token', 'mo', { stretchy: !0, accent: !0 }, o),
                            i = 'o' === e.charAt(1) ? 'over' : 'under',
                            s = t.ParseArg(e);
                        t.Push(h.default.underOver(t, s, a, i, n));
                    }),
                    (x.Overset = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e);
                        h.default.checkMovableLimits(n),
                            r.isKind('mo') && u.default.setAttribute(r, 'accent', !1);
                        var o = t.create('node', 'mover', [n, r]);
                        t.Push(o);
                    }),
                    (x.Underset = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e);
                        h.default.checkMovableLimits(n),
                            r.isKind('mo') && u.default.setAttribute(r, 'accent', !1);
                        var o = t.create('node', 'munder', [n, r], { accentunder: !1 });
                        t.Push(o);
                    }),
                    (x.Overunderset = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e),
                            o = t.ParseArg(e);
                        h.default.checkMovableLimits(o),
                            r.isKind('mo') && u.default.setAttribute(r, 'accent', !1),
                            n.isKind('mo') && u.default.setAttribute(n, 'accent', !1);
                        var a = t.create('node', 'munderover', [o, n, r], {
                            accent: !1,
                            accentunder: !1,
                        });
                        t.Push(a);
                    }),
                    (x.TeXAtom = function (t, e, r) {
                        var n,
                            o,
                            a,
                            i = { texClass: r };
                        if (r === m.TEXCLASS.OP) {
                            i.movesupsub = i.movablelimits = !0;
                            var s = t.GetArgument(e),
                                l = s.match(/^\s*\\rm\s+([a-zA-Z0-9 ]+)$/);
                            l
                                ? ((i.mathvariant = f.TexConstant.Variant.NORMAL),
                                  (o = t.create('token', 'mi', i, l[1])))
                                : ((a = new d.default(s, t.stack.env, t.configuration).mml()),
                                  (o = t.create('node', 'TeXAtom', [a], i))),
                                (n = t.itemFactory.create('fn', o));
                        } else (a = t.ParseArg(e)), (n = t.create('node', 'TeXAtom', [a], i));
                        t.Push(n);
                    }),
                    (x.MmlToken = function (t, e) {
                        var r,
                            n = t.GetArgument(e),
                            o = t.GetBrackets(e, '').replace(/^\s+/, ''),
                            a = t.GetArgument(e),
                            i = {},
                            s = [];
                        try {
                            r = t.create('node', n);
                        } catch (t) {
                            r = null;
                        }
                        if (!r || !r.isToken)
                            throw new p.default('NotMathMLToken', '%1 is not a token element', n);
                        for (; '' !== o; ) {
                            var l = o.match(/^([a-z]+)\s*=\s*('[^']*'|"[^"]*"|[^ ,]*)\s*,?\s*/i);
                            if (!l)
                                throw new p.default(
                                    'InvalidMathMLAttr',
                                    'Invalid MathML attribute: %1',
                                    o,
                                );
                            if (!r.attributes.hasDefault(l[1]) && !_[l[1]])
                                throw new p.default(
                                    'UnknownAttrForElement',
                                    '%1 is not a recognized attribute for %2',
                                    l[1],
                                    n,
                                );
                            var c = h.default.MmlFilterAttribute(
                                t,
                                l[1],
                                l[2].replace(/^(['"])(.*)\1$/, '$2'),
                            );
                            c &&
                                ('true' === c.toLowerCase()
                                    ? (c = !0)
                                    : 'false' === c.toLowerCase() && (c = !1),
                                (i[l[1]] = c),
                                s.push(l[1])),
                                (o = o.substr(l[0].length));
                        }
                        s.length && (i['mjx-keep-attrs'] = s.join(' '));
                        var d = t.create('text', a);
                        r.appendChild(d), u.default.setProperties(r, i), t.Push(r);
                    }),
                    (x.Strut = function (t, e) {
                        var r = t.create('node', 'mrow'),
                            n = t.create('node', 'mpadded', [r], {
                                height: '8.6pt',
                                depth: '3pt',
                                width: 0,
                            });
                        t.Push(n);
                    }),
                    (x.Phantom = function (t, e, r, n) {
                        var o = t.create('node', 'mphantom', [t.ParseArg(e)]);
                        (r || n) &&
                            ((o = t.create('node', 'mpadded', [o])),
                            n &&
                                (u.default.setAttribute(o, 'height', 0),
                                u.default.setAttribute(o, 'depth', 0)),
                            r && u.default.setAttribute(o, 'width', 0));
                        var a = t.create('node', 'TeXAtom', [o]);
                        t.Push(a);
                    }),
                    (x.Smash = function (t, e) {
                        var r = h.default.trimSpaces(t.GetBrackets(e, '')),
                            n = t.create('node', 'mpadded', [t.ParseArg(e)]);
                        switch (r) {
                            case 'b':
                                u.default.setAttribute(n, 'depth', 0);
                                break;
                            case 't':
                                u.default.setAttribute(n, 'height', 0);
                                break;
                            default:
                                u.default.setAttribute(n, 'height', 0),
                                    u.default.setAttribute(n, 'depth', 0);
                        }
                        var o = t.create('node', 'TeXAtom', [n]);
                        t.Push(o);
                    }),
                    (x.Lap = function (t, e) {
                        var r = t.create('node', 'mpadded', [t.ParseArg(e)], { width: 0 });
                        '\\llap' === e && u.default.setAttribute(r, 'lspace', '-1width');
                        var n = t.create('node', 'TeXAtom', [r]);
                        t.Push(n);
                    }),
                    (x.RaiseLower = function (t, e) {
                        var r = t.GetDimen(e),
                            n = t.itemFactory
                                .create('position')
                                .setProperties({ name: t.currentCS, move: 'vertical' });
                        '-' === r.charAt(0) &&
                            ((r = r.slice(1)),
                            (e = 'raise' === e.substr(1) ? '\\lower' : '\\raise')),
                            '\\lower' === e
                                ? (n.setProperty('dh', '-' + r), n.setProperty('dd', '+' + r))
                                : (n.setProperty('dh', '+' + r), n.setProperty('dd', '-' + r)),
                            t.Push(n);
                    }),
                    (x.MoveLeftRight = function (t, e) {
                        var r = t.GetDimen(e),
                            n = '-' === r.charAt(0) ? r.slice(1) : '-' + r;
                        if ('\\moveleft' === e) {
                            var o = r;
                            (r = n), (n = o);
                        }
                        t.Push(
                            t.itemFactory.create('position').setProperties({
                                name: t.currentCS,
                                move: 'horizontal',
                                left: t.create('node', 'mspace', [], { width: r }),
                                right: t.create('node', 'mspace', [], { width: n }),
                            }),
                        );
                    }),
                    (x.Hskip = function (t, e) {
                        var r = t.create('node', 'mspace', [], { width: t.GetDimen(e) });
                        t.Push(r);
                    }),
                    (x.Nonscript = function (t, e) {
                        t.Push(t.itemFactory.create('nonscript'));
                    }),
                    (x.Rule = function (t, e, r) {
                        var n = {
                            width: t.GetDimen(e),
                            height: t.GetDimen(e),
                            depth: t.GetDimen(e),
                        };
                        'blank' !== r && (n.mathbackground = t.stack.env.color || 'black');
                        var o = t.create('node', 'mspace', [], n);
                        t.Push(o);
                    }),
                    (x.rule = function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetDimen(e),
                            o = t.GetDimen(e),
                            a = t.create('node', 'mspace', [], {
                                width: n,
                                height: o,
                                mathbackground: t.stack.env.color || 'black',
                            });
                        r &&
                            ((a = t.create('node', 'mpadded', [a], { voffset: r })),
                            r.match(/^\-/)
                                ? (u.default.setAttribute(a, 'height', r),
                                  u.default.setAttribute(a, 'depth', '+' + r.substr(1)))
                                : u.default.setAttribute(a, 'height', '+' + r)),
                            t.Push(a);
                    }),
                    (x.MakeBig = function (t, e, r, n) {
                        var o =
                                String((n *= 1.411764705882353)).replace(/(\.\d\d\d).+/, '$1') +
                                'em',
                            a = t.GetDelimiter(e, !0),
                            i = t.create(
                                'token',
                                'mo',
                                { minsize: o, maxsize: o, fence: !0, stretchy: !0, symmetric: !0 },
                                a,
                            ),
                            s = t.create('node', 'TeXAtom', [i], { texClass: r });
                        t.Push(s);
                    }),
                    (x.BuildRel = function (t, e) {
                        var r = t.ParseUpTo(e, '\\over'),
                            n = t.ParseArg(e),
                            o = t.create('node', 'munderover');
                        u.default.setChild(o, 0, n),
                            u.default.setChild(o, 1, null),
                            u.default.setChild(o, 2, r);
                        var a = t.create('node', 'TeXAtom', [o], { texClass: m.TEXCLASS.REL });
                        t.Push(a);
                    }),
                    (x.HBox = function (t, e, r, n) {
                        t.PushAll(h.default.internalMath(t, t.GetArgument(e), r, n));
                    }),
                    (x.FBox = function (t, e) {
                        var r = h.default.internalMath(t, t.GetArgument(e)),
                            n = t.create('node', 'menclose', r, { notation: 'box' });
                        t.Push(n);
                    }),
                    (x.FrameBox = function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetBrackets(e) || 'c',
                            o = h.default.internalMath(t, t.GetArgument(e));
                        r &&
                            (o = [
                                t.create('node', 'mpadded', o, {
                                    width: r,
                                    'data-align': (0, b.lookup)(
                                        n,
                                        { l: 'left', r: 'right' },
                                        'center',
                                    ),
                                }),
                            ]);
                        var a = t.create(
                            'node',
                            'TeXAtom',
                            [t.create('node', 'menclose', o, { notation: 'box' })],
                            { texClass: m.TEXCLASS.ORD },
                        );
                        t.Push(a);
                    }),
                    (x.Not = function (t, e) {
                        t.Push(t.itemFactory.create('not'));
                    }),
                    (x.Dots = function (t, e) {
                        var r = u.default.createEntity('2026'),
                            n = u.default.createEntity('22EF'),
                            o = t.create('token', 'mo', { stretchy: !1 }, r),
                            a = t.create('token', 'mo', { stretchy: !1 }, n);
                        t.Push(t.itemFactory.create('dots').setProperties({ ldots: o, cdots: a }));
                    }),
                    (x.Matrix = function (t, e, r, n, o, a, i, s, l, c) {
                        var u = t.GetNext();
                        if ('' === u)
                            throw new p.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        '{' === u
                            ? t.i++
                            : ((t.string = u + '}' + t.string.slice(t.i + 1)), (t.i = 0));
                        var d = t.itemFactory.create('array').setProperty('requireClose', !0);
                        (d.arraydef = { rowspacing: i || '4pt', columnspacing: a || '1em' }),
                            l && d.setProperty('isCases', !0),
                            c && (d.setProperty('isNumbered', !0), (d.arraydef.side = c)),
                            (r || n) && (d.setProperty('open', r), d.setProperty('close', n)),
                            'D' === s && (d.arraydef.displaystyle = !0),
                            null != o && (d.arraydef.columnalign = o),
                            t.Push(d);
                    }),
                    (x.Entry = function (t, e) {
                        t.Push(
                            t.itemFactory.create('cell').setProperties({ isEntry: !0, name: e }),
                        );
                        var r = t.stack.Top(),
                            n = r.getProperty('casesEnv');
                        if (r.getProperty('isCases') || n) {
                            for (
                                var o = t.string,
                                    a = 0,
                                    i = -1,
                                    s = t.i,
                                    l = o.length,
                                    c = n
                                        ? new RegExp(
                                              '^\\\\end\\s*\\{'.concat(
                                                  n.replace(/\*/, '\\*'),
                                                  '\\}',
                                              ),
                                          )
                                        : null;
                                s < l;

                            ) {
                                var u = o.charAt(s);
                                if ('{' === u) a++, s++;
                                else if ('}' === u)
                                    0 === a ? (l = 0) : (0 === --a && i < 0 && (i = s - t.i), s++);
                                else {
                                    if ('&' === u && 0 === a)
                                        throw new p.default(
                                            'ExtraAlignTab',
                                            'Extra alignment tab in \\cases text',
                                        );
                                    if ('\\' === u) {
                                        var d = o.substr(s);
                                        d.match(/^((\\cr)[^a-zA-Z]|\\\\)/) || (c && d.match(c))
                                            ? (l = 0)
                                            : (s += 2);
                                    } else s++;
                                }
                            }
                            var f = o.substr(t.i, s - t.i);
                            if (
                                !f.match(/^\s*\\text[^a-zA-Z]/) ||
                                i !== f.replace(/\s+$/, '').length - 1
                            ) {
                                var m = h.default.internalMath(t, h.default.trimSpaces(f), 0);
                                t.PushAll(m), (t.i = s);
                            }
                        }
                    }),
                    (x.Cr = function (t, e) {
                        t.Push(t.itemFactory.create('cell').setProperties({ isCR: !0, name: e }));
                    }),
                    (x.CrLaTeX = function (t, e, r) {
                        var n;
                        if (
                            (void 0 === r && (r = !1),
                            !r &&
                                ('*' === t.string.charAt(t.i) && t.i++,
                                '[' === t.string.charAt(t.i)))
                        ) {
                            var o = t.GetBrackets(e, ''),
                                a = s(h.default.matchDimen(o), 2),
                                i = a[0],
                                l = a[1];
                            if (o && !i)
                                throw new p.default(
                                    'BracketMustBeDimension',
                                    'Bracket argument to %1 must be a dimension',
                                    t.currentCS,
                                );
                            n = i + l;
                        }
                        t.Push(
                            t.itemFactory
                                .create('cell')
                                .setProperties({ isCR: !0, name: e, linebreak: !0 }),
                        );
                        var u,
                            d = t.stack.Top();
                        d instanceof c.ArrayItem
                            ? n && d.addRowSpacing(n)
                            : (n && ((u = t.create('node', 'mspace', [], { depth: n })), t.Push(u)),
                              (u = t.create('node', 'mspace', [], {
                                  linebreak: f.TexConstant.LineBreak.NEWLINE,
                              })),
                              t.Push(u));
                    }),
                    (x.HLine = function (t, e, r) {
                        null == r && (r = 'solid');
                        var n = t.stack.Top();
                        if (!(n instanceof c.ArrayItem) || n.Size())
                            throw new p.default('Misplaced', 'Misplaced %1', t.currentCS);
                        if (n.table.length) {
                            for (
                                var o = n.arraydef.rowlines ? n.arraydef.rowlines.split(/ /) : [];
                                o.length < n.table.length;

                            )
                                o.push('none');
                            (o[n.table.length - 1] = r), (n.arraydef.rowlines = o.join(' '));
                        } else n.frame.push('top');
                    }),
                    (x.HFill = function (t, e) {
                        var r = t.stack.Top();
                        if (!(r instanceof c.ArrayItem))
                            throw new p.default(
                                'UnsupportedHFill',
                                'Unsupported use of %1',
                                t.currentCS,
                            );
                        r.hfill.push(r.Size());
                    }),
                    (x.BeginEnd = function (t, e) {
                        var r = t.GetArgument(e);
                        if (r.match(/\\/i))
                            throw new p.default('InvalidEnv', "Invalid environment name '%1'", r);
                        var n = t.configuration.handlers.get('environment').lookup(r);
                        if (n && '\\end' === e) {
                            if (!n.args[0]) {
                                var o = t.itemFactory.create('end').setProperty('name', r);
                                return void t.Push(o);
                            }
                            t.stack.env.closing = r;
                        }
                        h.default.checkMaxMacros(t, !1), t.parse('environment', [t, r]);
                    }),
                    (x.Array = function (t, e, r, n, o, a, i, s, l) {
                        o || (o = t.GetArgument('\\begin{' + e.getName() + '}'));
                        var c = ('c' + o).replace(/[^clr|:]/g, '').replace(/[^|:]([|:])+/g, '$1');
                        o = (o = o
                            .replace(/[^clr]/g, '')
                            .split('')
                            .join(' '))
                            .replace(/l/g, 'left')
                            .replace(/r/g, 'right')
                            .replace(/c/g, 'center');
                        var u = t.itemFactory.create('array');
                        return (
                            (u.arraydef = {
                                columnalign: o,
                                columnspacing: a || '1em',
                                rowspacing: i || '4pt',
                            }),
                            c.match(/[|:]/) &&
                                (c.charAt(0).match(/[|:]/) &&
                                    (u.frame.push('left'), (u.dashed = ':' === c.charAt(0))),
                                c.charAt(c.length - 1).match(/[|:]/) && u.frame.push('right'),
                                (c = c.substr(1, c.length - 2)),
                                (u.arraydef.columnlines = c
                                    .split('')
                                    .join(' ')
                                    .replace(/[^|: ]/g, 'none')
                                    .replace(/\|/g, 'solid')
                                    .replace(/:/g, 'dashed'))),
                            r && u.setProperty('open', t.convertDelimiter(r)),
                            n && u.setProperty('close', t.convertDelimiter(n)),
                            "'" === (s || '').charAt(1) &&
                                ((u.arraydef['data-cramped'] = !0), (s = s.charAt(0))),
                            'D' === s
                                ? (u.arraydef.displaystyle = !0)
                                : s && (u.arraydef.displaystyle = !1),
                            'S' === s && (u.arraydef.scriptlevel = 1),
                            l && (u.arraydef.useHeight = !1),
                            t.Push(e),
                            u
                        );
                    }),
                    (x.AlignedArray = function (t, e) {
                        var r = t.GetBrackets('\\begin{' + e.getName() + '}'),
                            n = x.Array(t, e);
                        return h.default.setArrayAlign(n, r);
                    }),
                    (x.Equation = function (t, e, r) {
                        return (
                            t.Push(e),
                            h.default.checkEqnEnv(t),
                            t.itemFactory.create('equation', r).setProperty('name', e.getName())
                        );
                    }),
                    (x.EqnArray = function (t, e, r, n, o, a) {
                        t.Push(e),
                            n && h.default.checkEqnEnv(t),
                            (o = (o = o
                                .replace(/[^clr]/g, '')
                                .split('')
                                .join(' '))
                                .replace(/l/g, 'left')
                                .replace(/r/g, 'right')
                                .replace(/c/g, 'center'));
                        var i = t.itemFactory.create('eqnarray', e.getName(), r, n, t.stack.global);
                        return (
                            (i.arraydef = {
                                displaystyle: !0,
                                columnalign: o,
                                columnspacing: a || '1em',
                                rowspacing: '3pt',
                                side: t.options.tagSide,
                                minlabelspacing: t.options.tagIndent,
                            }),
                            i
                        );
                    }),
                    (x.HandleNoTag = function (t, e) {
                        t.tags.notag();
                    }),
                    (x.HandleLabel = function (t, e) {
                        var r = t.GetArgument(e);
                        if ('' !== r && !t.tags.refUpdate) {
                            if (t.tags.label)
                                throw new p.default('MultipleCommand', 'Multiple %1', t.currentCS);
                            if (
                                ((t.tags.label = r),
                                (t.tags.allLabels[r] || t.tags.labels[r]) &&
                                    !t.options.ignoreDuplicateLabels)
                            )
                                throw new p.default(
                                    'MultipleLabel',
                                    "Label '%1' multiply defined",
                                    r,
                                );
                            t.tags.labels[r] = new g.Label();
                        }
                    }),
                    (x.HandleRef = function (t, e, r) {
                        var n = t.GetArgument(e),
                            o = t.tags.allLabels[n] || t.tags.labels[n];
                        o || (t.tags.refUpdate || (t.tags.redo = !0), (o = new g.Label()));
                        var a = o.tag;
                        r && (a = t.tags.formatTag(a));
                        var i = t.create('node', 'mrow', h.default.internalMath(t, a), {
                            href: t.tags.formatUrl(o.id, t.options.baseURL),
                            class: 'MathJax_ref',
                        });
                        t.Push(i);
                    }),
                    (x.Macro = function (t, e, r, n, o) {
                        if (n) {
                            var a = [];
                            if (null != o) {
                                var i = t.GetBrackets(e);
                                a.push(null == i ? o : i);
                            }
                            for (var s = a.length; s < n; s++) a.push(t.GetArgument(e));
                            r = h.default.substituteArgs(t, a, r);
                        }
                        (t.string = h.default.addArgs(t, r, t.string.slice(t.i))),
                            (t.i = 0),
                            h.default.checkMaxMacros(t);
                    }),
                    (x.MathChoice = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e),
                            o = t.ParseArg(e),
                            a = t.ParseArg(e);
                        t.Push(t.create('node', 'MathChoice', [r, n, o, a]));
                    }),
                    (e.default = x);
            },
            3067: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BboxConfiguration = e.BboxMethods = void 0);
                var o = r(6552),
                    a = r(7628),
                    i = n(r(3466));
                (e.BboxMethods = {}),
                    (e.BboxMethods.BBox = function (t, e) {
                        for (
                            var r,
                                n,
                                o,
                                a = t.GetBrackets(e, ''),
                                c = t.ParseArg(e),
                                u = a.split(/,/),
                                p = 0,
                                d = u.length;
                            p < d;
                            p++
                        ) {
                            var f = u[p].trim(),
                                h = f.match(/^(\.\d+|\d+(\.\d*)?)(pt|em|ex|mu|px|in|cm|mm)$/);
                            if (h) {
                                if (r)
                                    throw new i.default(
                                        'MultipleBBoxProperty',
                                        '%1 specified twice in %2',
                                        'Padding',
                                        e,
                                    );
                                var m = l(h[1] + h[3]);
                                m &&
                                    (r = {
                                        height: '+' + m,
                                        depth: '+' + m,
                                        lspace: m,
                                        width: '+' + 2 * parseInt(h[1], 10) + h[3],
                                    });
                            } else if (f.match(/^([a-z0-9]+|\#[0-9a-f]{6}|\#[0-9a-f]{3})$/i)) {
                                if (n)
                                    throw new i.default(
                                        'MultipleBBoxProperty',
                                        '%1 specified twice in %2',
                                        'Background',
                                        e,
                                    );
                                n = f;
                            } else if (f.match(/^[-a-z]+:/i)) {
                                if (o)
                                    throw new i.default(
                                        'MultipleBBoxProperty',
                                        '%1 specified twice in %2',
                                        'Style',
                                        e,
                                    );
                                o = s(f);
                            } else if ('' !== f)
                                throw new i.default(
                                    'InvalidBBoxProperty',
                                    '"%1" doesn\'t look like a color, a padding dimension, or a style',
                                    f,
                                );
                        }
                        r && (c = t.create('node', 'mpadded', [c], r)),
                            (n || o) &&
                                ((r = {}),
                                n && Object.assign(r, { mathbackground: n }),
                                o && Object.assign(r, { style: o }),
                                (c = t.create('node', 'mstyle', [c], r))),
                            t.Push(c);
                    });
                var s = function (t) {
                        return t;
                    },
                    l = function (t) {
                        return t;
                    };
                new a.CommandMap('bbox', { bbox: 'BBox' }, e.BboxMethods),
                    (e.BboxConfiguration = o.Configuration.create('bbox', {
                        handler: { macro: ['bbox'] },
                    }));
            },
            9267: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BoldsymbolConfiguration =
                        e.rewriteBoldTokens =
                        e.createBoldToken =
                        e.BoldsymbolMethods =
                            void 0);
                var a = r(6552),
                    i = o(r(8321)),
                    s = r(7007),
                    l = r(7628),
                    c = r(8644),
                    u = {};
                function p(t, e, r, n) {
                    var o = c.NodeFactory.createToken(t, e, r, n);
                    return (
                        'mtext' !== e &&
                            t.configuration.parser.stack.env.boldsymbol &&
                            (i.default.setProperty(o, 'fixBold', !0),
                            t.configuration.addNode('fixBold', o)),
                        o
                    );
                }
                function d(t) {
                    var e, r;
                    try {
                        for (
                            var o = n(t.data.getList('fixBold')), a = o.next();
                            !a.done;
                            a = o.next()
                        ) {
                            var l = a.value;
                            if (i.default.getProperty(l, 'fixBold')) {
                                var c = i.default.getAttribute(l, 'mathvariant');
                                null == c
                                    ? i.default.setAttribute(
                                          l,
                                          'mathvariant',
                                          s.TexConstant.Variant.BOLD,
                                      )
                                    : i.default.setAttribute(l, 'mathvariant', u[c] || c),
                                    i.default.removeProperties(l, 'fixBold');
                            }
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            a && !a.done && (r = o.return) && r.call(o);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                }
                (u[s.TexConstant.Variant.NORMAL] = s.TexConstant.Variant.BOLD),
                    (u[s.TexConstant.Variant.ITALIC] = s.TexConstant.Variant.BOLDITALIC),
                    (u[s.TexConstant.Variant.FRAKTUR] = s.TexConstant.Variant.BOLDFRAKTUR),
                    (u[s.TexConstant.Variant.SCRIPT] = s.TexConstant.Variant.BOLDSCRIPT),
                    (u[s.TexConstant.Variant.SANSSERIF] = s.TexConstant.Variant.BOLDSANSSERIF),
                    (u['-tex-calligraphic'] = '-tex-bold-calligraphic'),
                    (u['-tex-oldstyle'] = '-tex-bold-oldstyle'),
                    (u['-tex-mathit'] = s.TexConstant.Variant.BOLDITALIC),
                    (e.BoldsymbolMethods = {}),
                    (e.BoldsymbolMethods.Boldsymbol = function (t, e) {
                        var r = t.stack.env.boldsymbol;
                        t.stack.env.boldsymbol = !0;
                        var n = t.ParseArg(e);
                        (t.stack.env.boldsymbol = r), t.Push(n);
                    }),
                    new l.CommandMap(
                        'boldsymbol',
                        { boldsymbol: 'Boldsymbol' },
                        e.BoldsymbolMethods,
                    ),
                    (e.createBoldToken = p),
                    (e.rewriteBoldTokens = d),
                    (e.BoldsymbolConfiguration = a.Configuration.create('boldsymbol', {
                        handler: { macro: ['boldsymbol'] },
                        nodes: { token: p },
                        postprocessors: [d],
                    }));
            },
            1677: function (t, e, r) {
                var n;
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BraketConfiguration = void 0);
                var o = r(6552),
                    a = r(9365);
                r(7076),
                    (e.BraketConfiguration = o.Configuration.create('braket', {
                        handler: { character: ['Braket-characters'], macro: ['Braket-macros'] },
                        items: ((n = {}), (n[a.BraketItem.prototype.kind] = a.BraketItem), n),
                    }));
            },
            9365: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.BraketItem = void 0);
                var i = r(7044),
                    s = r(8921),
                    l = a(r(7702)),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'braket';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isOpen', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (e) {
                                return e.isKind('close')
                                    ? [[this.factory.create('mml', this.toMml())], !0]
                                    : e.isKind('mml')
                                      ? (this.Push(e.toMml()),
                                        this.getProperty('single')
                                            ? [[this.toMml()], !0]
                                            : i.BaseItem.fail)
                                      : t.prototype.checkItem.call(this, e);
                            }),
                            (e.prototype.toMml = function () {
                                var e = t.prototype.toMml.call(this),
                                    r = this.getProperty('open'),
                                    n = this.getProperty('close');
                                if (this.getProperty('stretchy'))
                                    return l.default.fenced(this.factory.configuration, r, e, n);
                                var o = {
                                        fence: !0,
                                        stretchy: !1,
                                        symmetric: !0,
                                        texClass: s.TEXCLASS.OPEN,
                                    },
                                    a = this.create('token', 'mo', o, r);
                                o.texClass = s.TEXCLASS.CLOSE;
                                var i = this.create('token', 'mo', o, n);
                                return this.create('node', 'mrow', [a, e, i], {
                                    open: r,
                                    close: n,
                                    texClass: s.TEXCLASS.INNER,
                                });
                            }),
                            e
                        );
                    })(i.BaseItem);
                e.BraketItem = c;
            },
            7076: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = r(7628),
                    a = n(r(1990));
                new o.CommandMap(
                    'Braket-macros',
                    {
                        bra: ['Macro', '{\\langle {#1} \\vert}', 1],
                        ket: ['Macro', '{\\vert {#1} \\rangle}', 1],
                        braket: ['Braket', '\u27e8', '\u27e9', !1, 1 / 0],
                        set: ['Braket', '{', '}', !1, 1],
                        Bra: ['Macro', '{\\left\\langle {#1} \\right\\vert}', 1],
                        Ket: ['Macro', '{\\left\\vert {#1} \\right\\rangle}', 1],
                        Braket: ['Braket', '\u27e8', '\u27e9', !0, 1 / 0],
                        Set: ['Braket', '{', '}', !0, 1],
                        ketbra: ['Macro', '{\\vert {#1} \\rangle\\langle {#2} \\vert}', 2],
                        Ketbra: [
                            'Macro',
                            '{\\left\\vert {#1} \\right\\rangle\\left\\langle {#2} \\right\\vert}',
                            2,
                        ],
                        '|': 'Bar',
                    },
                    a.default,
                ),
                    new o.MacroMap('Braket-characters', { '|': 'Bar' }, a.default);
            },
            1990: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = n(r(724)),
                    a = r(8921),
                    i = n(r(3466)),
                    s = {};
                (s.Macro = o.default.Macro),
                    (s.Braket = function (t, e, r, n, o, a) {
                        var s = t.GetNext();
                        if ('' === s)
                            throw new i.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        var l = !0;
                        '{' === s && (t.i++, (l = !1)),
                            t.Push(
                                t.itemFactory.create('braket').setProperties({
                                    barmax: a,
                                    barcount: 0,
                                    open: r,
                                    close: n,
                                    stretchy: o,
                                    single: l,
                                }),
                            );
                    }),
                    (s.Bar = function (t, e) {
                        var r = '|' === e ? '|' : '\u2225',
                            n = t.stack.Top();
                        if (
                            'braket' !== n.kind ||
                            n.getProperty('barcount') >= n.getProperty('barmax')
                        ) {
                            var o = t.create(
                                'token',
                                'mo',
                                { texClass: a.TEXCLASS.ORD, stretchy: !1 },
                                r,
                            );
                            t.Push(o);
                        } else {
                            if (
                                ('|' === r && '|' === t.GetNext() && (t.i++, (r = '\u2225')),
                                n.getProperty('stretchy'))
                            ) {
                                var i = t.create('node', 'TeXAtom', [], {
                                    texClass: a.TEXCLASS.CLOSE,
                                });
                                t.Push(i),
                                    n.setProperty('barcount', n.getProperty('barcount') + 1),
                                    (i = t.create(
                                        'token',
                                        'mo',
                                        { stretchy: !0, braketbar: !0 },
                                        r,
                                    )),
                                    t.Push(i),
                                    (i = t.create('node', 'TeXAtom', [], {
                                        texClass: a.TEXCLASS.OPEN,
                                    })),
                                    t.Push(i);
                            } else {
                                var s = t.create('token', 'mo', { stretchy: !1, braketbar: !0 }, r);
                                t.Push(s);
                            }
                        }
                    }),
                    (e.default = s);
            },
            7404: function (t, e, r) {
                var n;
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BussproofsConfiguration = void 0);
                var o = r(6552),
                    a = r(2146),
                    i = r(3118);
                r(1597),
                    (e.BussproofsConfiguration = o.Configuration.create('bussproofs', {
                        handler: {
                            macro: ['Bussproofs-macros'],
                            environment: ['Bussproofs-environments'],
                        },
                        items: ((n = {}), (n[a.ProofTreeItem.prototype.kind] = a.ProofTreeItem), n),
                        preprocessors: [[i.saveDocument, 1]],
                        postprocessors: [
                            [i.clearDocument, 3],
                            [i.makeBsprAttributes, 2],
                            [i.balanceRules, 1],
                        ],
                    }));
            },
            2146: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, o);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    i =
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
                                        a(e, t, r);
                            return i(e, t), e;
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.ProofTreeItem = void 0);
                var c = l(r(3466)),
                    u = r(7044),
                    p = l(r(9874)),
                    d = s(r(3118)),
                    f = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (
                                (e.leftLabel = null),
                                (e.rigthLabel = null),
                                (e.innerStack = new p.default(e.factory, {}, !0)),
                                e
                            );
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'proofTree';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (t) {
                                if (t.isKind('end') && 'prooftree' === t.getName()) {
                                    var e = this.toMml();
                                    return (
                                        d.setProperty(e, 'proof', !0),
                                        [[this.factory.create('mml', e), t], !0]
                                    );
                                }
                                if (t.isKind('stop'))
                                    throw new c.default(
                                        'EnvMissingEnd',
                                        'Missing \\end{%1}',
                                        this.getName(),
                                    );
                                return this.innerStack.Push(t), u.BaseItem.fail;
                            }),
                            (e.prototype.toMml = function () {
                                var e = t.prototype.toMml.call(this),
                                    r = this.innerStack.Top();
                                if (r.isKind('start') && !r.Size()) return e;
                                this.innerStack.Push(this.factory.create('stop'));
                                var n = this.innerStack.Top().toMml();
                                return this.create('node', 'mrow', [n, e], {});
                            }),
                            e
                        );
                    })(u.BaseItem);
                e.ProofTreeItem = f;
            },
            1597: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = n(r(3583)),
                    a = n(r(4708)),
                    i = r(7628);
                new i.CommandMap(
                    'Bussproofs-macros',
                    {
                        AxiomC: 'Axiom',
                        UnaryInfC: ['Inference', 1],
                        BinaryInfC: ['Inference', 2],
                        TrinaryInfC: ['Inference', 3],
                        QuaternaryInfC: ['Inference', 4],
                        QuinaryInfC: ['Inference', 5],
                        RightLabel: ['Label', 'right'],
                        LeftLabel: ['Label', 'left'],
                        AXC: 'Axiom',
                        UIC: ['Inference', 1],
                        BIC: ['Inference', 2],
                        TIC: ['Inference', 3],
                        RL: ['Label', 'right'],
                        LL: ['Label', 'left'],
                        noLine: ['SetLine', 'none', !1],
                        singleLine: ['SetLine', 'solid', !1],
                        solidLine: ['SetLine', 'solid', !1],
                        dashedLine: ['SetLine', 'dashed', !1],
                        alwaysNoLine: ['SetLine', 'none', !0],
                        alwaysSingleLine: ['SetLine', 'solid', !0],
                        alwaysSolidLine: ['SetLine', 'solid', !0],
                        alwaysDashedLine: ['SetLine', 'dashed', !0],
                        rootAtTop: ['RootAtTop', !0],
                        alwaysRootAtTop: ['RootAtTop', !0],
                        rootAtBottom: ['RootAtTop', !1],
                        alwaysRootAtBottom: ['RootAtTop', !1],
                        fCenter: 'FCenter',
                        Axiom: 'AxiomF',
                        UnaryInf: ['InferenceF', 1],
                        BinaryInf: ['InferenceF', 2],
                        TrinaryInf: ['InferenceF', 3],
                        QuaternaryInf: ['InferenceF', 4],
                        QuinaryInf: ['InferenceF', 5],
                    },
                    o.default,
                ),
                    new i.EnvironmentMap(
                        'Bussproofs-environments',
                        a.default.environment,
                        { prooftree: ['Prooftree', null, !1] },
                        o.default,
                    );
            },
            3583: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, o);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    o =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    a =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return o(e, t), e;
                        },
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    s =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var c = l(r(3466)),
                    u = l(r(810)),
                    p = l(r(7702)),
                    d = a(r(3118)),
                    f = {
                        Prooftree: function (t, e) {
                            return (
                                t.Push(e),
                                t.itemFactory.create('proofTree').setProperties({
                                    name: e.getName(),
                                    line: 'solid',
                                    currentLine: 'solid',
                                    rootAtTop: !1,
                                })
                            );
                        },
                        Axiom: function (t, e) {
                            var r = t.stack.Top();
                            if ('proofTree' !== r.kind)
                                throw new c.default(
                                    'IllegalProofCommand',
                                    'Proof commands only allowed in prooftree environment.',
                                );
                            var n = h(t, t.GetArgument(e));
                            d.setProperty(n, 'axiom', !0), r.Push(n);
                        },
                    },
                    h = function (t, e) {
                        var r = p.default.internalMath(t, p.default.trimSpaces(e), 0);
                        if (!r[0].childNodes[0].childNodes.length)
                            return t.create('node', 'mrow', []);
                        var n = t.create('node', 'mspace', [], { width: '.5ex' }),
                            o = t.create('node', 'mspace', [], { width: '.5ex' });
                        return t.create('node', 'mrow', s(s([n], i(r), !1), [o], !1));
                    };
                function m(t, e, r, n, o, a, i) {
                    var s,
                        l,
                        c,
                        u,
                        p = t.create('node', 'mtr', [t.create('node', 'mtd', [e], {})], {}),
                        f = t.create('node', 'mtr', [t.create('node', 'mtd', r, {})], {}),
                        h = t.create('node', 'mtable', i ? [f, p] : [p, f], {
                            align: 'top 2',
                            rowlines: a,
                            framespacing: '0 0',
                        });
                    if (
                        (d.setProperty(h, 'inferenceRule', i ? 'up' : 'down'),
                        n &&
                            ((s = t.create('node', 'mpadded', [n], {
                                height: '+.5em',
                                width: '+.5em',
                                voffset: '-.15em',
                            })),
                            d.setProperty(s, 'prooflabel', 'left')),
                        o &&
                            ((l = t.create('node', 'mpadded', [o], {
                                height: '+.5em',
                                width: '+.5em',
                                voffset: '-.15em',
                            })),
                            d.setProperty(l, 'prooflabel', 'right')),
                        n && o)
                    )
                        (c = [s, h, l]), (u = 'both');
                    else if (n) (c = [s, h]), (u = 'left');
                    else {
                        if (!o) return h;
                        (c = [h, l]), (u = 'right');
                    }
                    return (
                        (h = t.create('node', 'mrow', c)), d.setProperty(h, 'labelledRule', u), h
                    );
                }
                function g(t, e) {
                    if ('$' !== t.GetNext())
                        throw new c.default(
                            'IllegalUseOfCommand',
                            "Use of %1 does not match it's definition.",
                            e,
                        );
                    t.i++;
                    var r = t.GetUpTo(e, '$');
                    if (-1 === r.indexOf('\\fCenter'))
                        throw new c.default('IllegalUseOfCommand', 'Missing \\fCenter in %1.', e);
                    var n = i(r.split('\\fCenter'), 2),
                        o = n[0],
                        a = n[1],
                        s = new u.default(o, t.stack.env, t.configuration).mml(),
                        l = new u.default(a, t.stack.env, t.configuration).mml(),
                        p = new u.default('\\fCenter', t.stack.env, t.configuration).mml(),
                        f = t.create('node', 'mtd', [s], {}),
                        h = t.create('node', 'mtd', [p], {}),
                        m = t.create('node', 'mtd', [l], {}),
                        g = t.create('node', 'mtr', [f, h, m], {}),
                        y = t.create('node', 'mtable', [g], {
                            columnspacing: '.5ex',
                            columnalign: 'center 2',
                        });
                    return (
                        d.setProperty(y, 'sequent', !0), t.configuration.addNode('sequent', g), y
                    );
                }
                (f.Inference = function (t, e, r) {
                    var n = t.stack.Top();
                    if ('proofTree' !== n.kind)
                        throw new c.default(
                            'IllegalProofCommand',
                            'Proof commands only allowed in prooftree environment.',
                        );
                    if (n.Size() < r)
                        throw new c.default('BadProofTree', 'Proof tree badly specified.');
                    var o = n.getProperty('rootAtTop'),
                        a = 1 !== r || n.Peek()[0].childNodes.length ? r : 0,
                        i = [];
                    do {
                        i.length && i.unshift(t.create('node', 'mtd', [], {})),
                            i.unshift(
                                t.create('node', 'mtd', [n.Pop()], {
                                    rowalign: o ? 'top' : 'bottom',
                                }),
                            ),
                            r--;
                    } while (r > 0);
                    var s = t.create('node', 'mtr', i, {}),
                        l = t.create('node', 'mtable', [s], { framespacing: '0 0' }),
                        u = h(t, t.GetArgument(e)),
                        p = n.getProperty('currentLine');
                    p !== n.getProperty('line') &&
                        n.setProperty('currentLine', n.getProperty('line'));
                    var f = m(t, l, [u], n.getProperty('left'), n.getProperty('right'), p, o);
                    n.setProperty('left', null),
                        n.setProperty('right', null),
                        d.setProperty(f, 'inference', a),
                        t.configuration.addNode('inference', f),
                        n.Push(f);
                }),
                    (f.Label = function (t, e, r) {
                        var n = t.stack.Top();
                        if ('proofTree' !== n.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        var o = p.default.internalMath(t, t.GetArgument(e), 0),
                            a = o.length > 1 ? t.create('node', 'mrow', o, {}) : o[0];
                        n.setProperty(r, a);
                    }),
                    (f.SetLine = function (t, e, r, n) {
                        var o = t.stack.Top();
                        if ('proofTree' !== o.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        o.setProperty('currentLine', r), n && o.setProperty('line', r);
                    }),
                    (f.RootAtTop = function (t, e, r) {
                        var n = t.stack.Top();
                        if ('proofTree' !== n.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        n.setProperty('rootAtTop', r);
                    }),
                    (f.AxiomF = function (t, e) {
                        var r = t.stack.Top();
                        if ('proofTree' !== r.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        var n = g(t, e);
                        d.setProperty(n, 'axiom', !0), r.Push(n);
                    }),
                    (f.FCenter = function (t, e) {}),
                    (f.InferenceF = function (t, e, r) {
                        var n = t.stack.Top();
                        if ('proofTree' !== n.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        if (n.Size() < r)
                            throw new c.default('BadProofTree', 'Proof tree badly specified.');
                        var o = n.getProperty('rootAtTop'),
                            a = 1 !== r || n.Peek()[0].childNodes.length ? r : 0,
                            i = [];
                        do {
                            i.length && i.unshift(t.create('node', 'mtd', [], {})),
                                i.unshift(
                                    t.create('node', 'mtd', [n.Pop()], {
                                        rowalign: o ? 'top' : 'bottom',
                                    }),
                                ),
                                r--;
                        } while (r > 0);
                        var s = t.create('node', 'mtr', i, {}),
                            l = t.create('node', 'mtable', [s], { framespacing: '0 0' }),
                            u = g(t, e),
                            p = n.getProperty('currentLine');
                        p !== n.getProperty('line') &&
                            n.setProperty('currentLine', n.getProperty('line'));
                        var f = m(t, l, [u], n.getProperty('left'), n.getProperty('right'), p, o);
                        n.setProperty('left', null),
                            n.setProperty('right', null),
                            d.setProperty(f, 'inference', a),
                            t.configuration.addNode('inference', f),
                            n.Push(f);
                    }),
                    (e.default = f);
            },
            3118: function (t, e, r) {
                var n,
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.clearDocument =
                        e.saveDocument =
                        e.makeBsprAttributes =
                        e.removeProperty =
                        e.getProperty =
                        e.setProperty =
                        e.balanceRules =
                            void 0);
                var s = i(r(8321)),
                    l = i(r(7702)),
                    c = null,
                    u = null,
                    p = function (t) {
                        return (u.root = t), c.outputJax.getBBox(u, c).w;
                    },
                    d = function (t) {
                        for (var e = 0; t && !s.default.isType(t, 'mtable'); ) {
                            if (s.default.isType(t, 'text')) return null;
                            s.default.isType(t, 'mrow')
                                ? ((t = t.childNodes[0]), (e = 0))
                                : ((t = t.parent.childNodes[e]), e++);
                        }
                        return t;
                    },
                    f = function (t, e) {
                        return t.childNodes['up' === e ? 1 : 0].childNodes[0].childNodes[0]
                            .childNodes[0].childNodes[0];
                    },
                    h = function (t, e) {
                        return t.childNodes[e].childNodes[0].childNodes[0];
                    },
                    m = function (t) {
                        return h(t, 0);
                    },
                    g = function (t) {
                        return h(t, t.childNodes.length - 1);
                    },
                    y = function (t, e) {
                        return t.childNodes['up' === e ? 0 : 1].childNodes[0].childNodes[0]
                            .childNodes[0];
                    },
                    v = function (t) {
                        for (; t && !s.default.isType(t, 'mtd'); ) t = t.parent;
                        return t;
                    },
                    b = function (t) {
                        return t.parent.childNodes[t.parent.childNodes.indexOf(t) + 1];
                    },
                    x = function (t) {
                        for (; t && null == (0, e.getProperty)(t, 'inference'); ) t = t.parent;
                        return t;
                    },
                    _ = function (t, e, r) {
                        void 0 === r && (r = !1);
                        var n = 0;
                        if (t === e) return n;
                        if (t !== e.parent) {
                            var o = t.childNodes,
                                a = r ? o.length - 1 : 0;
                            s.default.isType(o[a], 'mspace') && (n += p(o[a])), (t = e.parent);
                        }
                        if (t === e) return n;
                        var i = t.childNodes,
                            l = r ? i.length - 1 : 0;
                        return i[l] !== e && (n += p(i[l])), n;
                    },
                    M = function (t, r) {
                        void 0 === r && (r = !1);
                        var n = d(t),
                            o = y(n, (0, e.getProperty)(n, 'inferenceRule'));
                        return _(t, n, r) + (p(n) - p(o)) / 2;
                    },
                    w = function (t, r, n, o) {
                        if (
                            (void 0 === o && (o = !1),
                            (0, e.getProperty)(r, 'inferenceRule') ||
                                (0, e.getProperty)(r, 'labelledRule'))
                        ) {
                            var a = t.nodeFactory.create('node', 'mrow');
                            r.parent.replaceChild(a, r), a.setChildren([r]), A(r, a), (r = a);
                        }
                        var i = o ? r.childNodes.length - 1 : 0,
                            c = r.childNodes[i];
                        s.default.isType(c, 'mspace')
                            ? s.default.setAttribute(
                                  c,
                                  'width',
                                  l.default.Em(
                                      l.default.dimen2em(s.default.getAttribute(c, 'width')) + n,
                                  ),
                              )
                            : ((c = t.nodeFactory.create('node', 'mspace', [], {
                                  width: l.default.Em(n),
                              })),
                              o ? r.appendChild(c) : ((c.parent = r), r.childNodes.unshift(c)));
                    },
                    A = function (t, r) {
                        ['inference', 'proof', 'maxAdjust', 'labelledRule'].forEach(function (n) {
                            var o = (0, e.getProperty)(t, n);
                            null != o && ((0, e.setProperty)(r, n, o), (0, e.removeProperty)(t, n));
                        });
                    },
                    C = function (t, r, n, o, a) {
                        var i = t.nodeFactory.create('node', 'mspace', [], {
                            width: l.default.Em(a),
                        });
                        if ('left' === o) {
                            var s = r.childNodes[n].childNodes[0];
                            (i.parent = s), s.childNodes.unshift(i);
                        } else r.childNodes[n].appendChild(i);
                        (0, e.setProperty)(r.parent, 'sequentAdjust_' + o, a);
                    },
                    P = function (t, r) {
                        for (var n = r.pop(); r.length; ) {
                            var a = r.pop(),
                                i = o(S(n, a), 2),
                                s = i[0],
                                l = i[1];
                            (0, e.getProperty)(n.parent, 'axiom') &&
                                (C(t, s < 0 ? n : a, 0, 'left', Math.abs(s)),
                                C(t, l < 0 ? n : a, 2, 'right', Math.abs(l))),
                                (n = a);
                        }
                    },
                    S = function (t, e) {
                        var r = p(t.childNodes[2]),
                            n = p(e.childNodes[2]);
                        return [p(t.childNodes[0]) - p(e.childNodes[0]), r - n];
                    };
                e.balanceRules = function (t) {
                    var r, n;
                    u = new t.document.options.MathItem('', null, t.math.display);
                    var o = t.data;
                    !(function (t) {
                        var r = t.nodeLists.sequent;
                        if (r)
                            for (var n = r.length - 1, o = void 0; (o = r[n]); n--)
                                if ((0, e.getProperty)(o, 'sequentProcessed'))
                                    (0, e.removeProperty)(o, 'sequentProcessed');
                                else {
                                    var a = [],
                                        i = x(o);
                                    if (1 === (0, e.getProperty)(i, 'inference')) {
                                        for (
                                            a.push(o);
                                            1 === (0, e.getProperty)(i, 'inference');

                                        ) {
                                            i = d(i);
                                            var s = m(f(i, (0, e.getProperty)(i, 'inferenceRule'))),
                                                l = (0, e.getProperty)(s, 'inferenceRule')
                                                    ? y(s, (0, e.getProperty)(s, 'inferenceRule'))
                                                    : s;
                                            (0, e.getProperty)(l, 'sequent') &&
                                                ((o = l.childNodes[0]),
                                                a.push(o),
                                                (0, e.setProperty)(o, 'sequentProcessed', !0)),
                                                (i = s);
                                        }
                                        P(t, a);
                                    }
                                }
                    })(o);
                    var i = o.nodeLists.inference || [];
                    try {
                        for (var s = a(i), l = s.next(); !l.done; l = s.next()) {
                            var c = l.value,
                                p = (0, e.getProperty)(c, 'proof'),
                                h = d(c),
                                A = f(h, (0, e.getProperty)(h, 'inferenceRule')),
                                C = m(A);
                            if ((0, e.getProperty)(C, 'inference')) {
                                var S = M(C);
                                if (S) {
                                    w(o, C, -S);
                                    var O = _(c, h, !1);
                                    w(o, c, S - O);
                                }
                            }
                            var T = g(A);
                            if (null != (0, e.getProperty)(T, 'inference')) {
                                var k = M(T, !0);
                                w(o, T, -k, !0);
                                var E = _(c, h, !0),
                                    I = (0, e.getProperty)(c, 'maxAdjust');
                                null != I && (k = Math.max(k, I));
                                var N = void 0;
                                if (!p && (N = v(c))) {
                                    var q = b(N);
                                    if (q) {
                                        var L = o.nodeFactory.create('node', 'mspace', [], {
                                            width: k - E + 'em',
                                        });
                                        q.appendChild(L), c.removeProperty('maxAdjust');
                                    } else {
                                        var F = x(N);
                                        F &&
                                            ((k = (0, e.getProperty)(F, 'maxAdjust')
                                                ? Math.max((0, e.getProperty)(F, 'maxAdjust'), k)
                                                : k),
                                            (0, e.setProperty)(F, 'maxAdjust', k));
                                    }
                                } else
                                    w(o, (0, e.getProperty)(c, 'proof') ? c : c.parent, k - E, !0);
                            }
                        }
                    } catch (t) {
                        r = { error: t };
                    } finally {
                        try {
                            l && !l.done && (n = s.return) && n.call(s);
                        } finally {
                            if (r) throw r.error;
                        }
                    }
                };
                var O = 'bspr_',
                    T = (((n = {}).bspr_maxAdjust = !0), n);
                e.setProperty = function (t, e, r) {
                    s.default.setProperty(t, O + e, r);
                };
                e.getProperty = function (t, e) {
                    return s.default.getProperty(t, O + e);
                };
                e.removeProperty = function (t, e) {
                    t.removeProperty(O + e);
                };
                e.makeBsprAttributes = function (t) {
                    t.data.root.walkTree(function (t, e) {
                        var r = [];
                        t.getPropertyNames().forEach(function (e) {
                            !T[e] &&
                                e.match(RegExp('^bspr_')) &&
                                r.push(e + ':' + t.getProperty(e));
                        }),
                            r.length && s.default.setAttribute(t, 'semantics', r.join(';'));
                    });
                };
                e.saveDocument = function (t) {
                    if (!('getBBox' in (c = t.document).outputJax))
                        throw Error(
                            'The bussproofs extension requires an output jax with a getBBox() method',
                        );
                };
                e.clearDocument = function (t) {
                    c = null;
                };
            },
            9489: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CancelConfiguration = e.CancelMethods = void 0);
                var o = r(6552),
                    a = r(7007),
                    i = r(7628),
                    s = n(r(7702)),
                    l = r(6755);
                (e.CancelMethods = {}),
                    (e.CancelMethods.Cancel = function (t, e, r) {
                        var n = t.GetBrackets(e, ''),
                            o = t.ParseArg(e),
                            a = s.default.keyvalOptions(n, l.ENCLOSE_OPTIONS);
                        (a.notation = r), t.Push(t.create('node', 'menclose', [o], a));
                    }),
                    (e.CancelMethods.CancelTo = function (t, e) {
                        var r = t.GetBrackets(e, ''),
                            n = t.ParseArg(e),
                            o = t.ParseArg(e),
                            i = s.default.keyvalOptions(r, l.ENCLOSE_OPTIONS);
                        (i.notation = [
                            a.TexConstant.Notation.UPDIAGONALSTRIKE,
                            a.TexConstant.Notation.UPDIAGONALARROW,
                            a.TexConstant.Notation.NORTHEASTARROW,
                        ].join(' ')),
                            (n = t.create('node', 'mpadded', [n], {
                                depth: '-.1em',
                                height: '+.1em',
                                voffset: '.1em',
                            })),
                            t.Push(
                                t.create('node', 'msup', [t.create('node', 'menclose', [o], i), n]),
                            );
                    }),
                    new i.CommandMap(
                        'cancel',
                        {
                            cancel: ['Cancel', a.TexConstant.Notation.UPDIAGONALSTRIKE],
                            bcancel: ['Cancel', a.TexConstant.Notation.DOWNDIAGONALSTRIKE],
                            xcancel: [
                                'Cancel',
                                a.TexConstant.Notation.UPDIAGONALSTRIKE +
                                    ' ' +
                                    a.TexConstant.Notation.DOWNDIAGONALSTRIKE,
                            ],
                            cancelto: 'CancelTo',
                        },
                        e.CancelMethods,
                    ),
                    (e.CancelConfiguration = o.Configuration.create('cancel', {
                        handler: { macro: ['cancel'] },
                    }));
            },
            2632: function (t, e, r) {
                var n,
                    o,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CasesConfiguration =
                        e.CasesMethods =
                        e.CasesTags =
                        e.CasesBeginItem =
                            void 0);
                var s = r(6552),
                    l = r(7628),
                    c = i(r(7702)),
                    u = i(r(724)),
                    p = i(r(3466)),
                    d = r(8389),
                    f = r(3946),
                    h = r(3904),
                    m = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            a(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'cases-begin';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (e) {
                                return e.isKind('end') &&
                                    e.getName() === this.getName() &&
                                    this.getProperty('end')
                                    ? (this.setProperty('end', !1), [[], !0])
                                    : t.prototype.checkItem.call(this, e);
                            }),
                            e
                        );
                    })(d.BeginItem);
                e.CasesBeginItem = m;
                var g = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.subcounter = 0), e;
                    }
                    return (
                        a(e, t),
                        (e.prototype.start = function (e, r, n) {
                            (this.subcounter = 0), t.prototype.start.call(this, e, r, n);
                        }),
                        (e.prototype.autoTag = function () {
                            null == this.currentTag.tag &&
                                ('subnumcases' === this.currentTag.env
                                    ? (0 === this.subcounter && this.counter++,
                                      this.subcounter++,
                                      this.tag(
                                          this.formatNumber(this.counter, this.subcounter),
                                          !1,
                                      ))
                                    : ((0 !== this.subcounter &&
                                          'numcases-left' === this.currentTag.env) ||
                                          this.counter++,
                                      this.tag(this.formatNumber(this.counter), !1)));
                        }),
                        (e.prototype.formatNumber = function (t, e) {
                            return (
                                void 0 === e && (e = null),
                                t.toString() + (null === e ? '' : String.fromCharCode(96 + e))
                            );
                        }),
                        e
                    );
                })(f.AmsTags);
                (e.CasesTags = g),
                    (e.CasesMethods = {
                        NumCases: function (t, e) {
                            if (t.stack.env.closing === e.getName()) {
                                delete t.stack.env.closing,
                                    t.Push(
                                        t.itemFactory
                                            .create('end')
                                            .setProperty('name', e.getName()),
                                    );
                                var r = t.stack.Top(),
                                    n = r.Last,
                                    o = c.default.copyNode(n, t),
                                    a = r.getProperty('left');
                                return (
                                    h.EmpheqUtil.left(
                                        n,
                                        o,
                                        a + '\\empheqlbrace\\,',
                                        t,
                                        'numcases-left',
                                    ),
                                    t.Push(
                                        t.itemFactory
                                            .create('end')
                                            .setProperty('name', e.getName()),
                                    ),
                                    null
                                );
                            }
                            a = t.GetArgument('\\begin{' + e.getName() + '}');
                            e.setProperty('left', a);
                            var i = u.default.EqnArray(t, e, !0, !0, 'll');
                            return (
                                (i.arraydef.displaystyle = !1),
                                (i.arraydef.rowspacing = '.2em'),
                                i.setProperty('numCases', !0),
                                t.Push(e),
                                i
                            );
                        },
                        Entry: function (t, e) {
                            if (!t.stack.Top().getProperty('numCases'))
                                return u.default.Entry(t, e);
                            t.Push(
                                t.itemFactory
                                    .create('cell')
                                    .setProperties({ isEntry: !0, name: e }),
                            );
                            for (var r = t.string, n = 0, o = t.i, a = r.length; o < a; ) {
                                var i = r.charAt(o);
                                if ('{' === i) n++, o++;
                                else if ('}' === i) {
                                    if (0 === n) break;
                                    n--, o++;
                                } else {
                                    if ('&' === i && 0 === n)
                                        throw new p.default(
                                            'ExtraCasesAlignTab',
                                            'Extra alignment tab in text for numcase environment',
                                        );
                                    if ('\\' === i && 0 === n) {
                                        var s = (r.slice(o + 1).match(/^[a-z]+|./i) || [])[0];
                                        if (
                                            '\\' === s ||
                                            'cr' === s ||
                                            'end' === s ||
                                            'label' === s
                                        )
                                            break;
                                        o += s.length;
                                    } else o++;
                                }
                            }
                            var l = r.substr(t.i, o - t.i).replace(/^\s*/, '');
                            t.PushAll(c.default.internalMath(t, l, 0)), (t.i = o);
                        },
                    }),
                    new l.EnvironmentMap(
                        'cases-env',
                        h.EmpheqUtil.environment,
                        { numcases: ['NumCases', 'cases'], subnumcases: ['NumCases', 'cases'] },
                        e.CasesMethods,
                    ),
                    new l.MacroMap('cases-macros', { '&': 'Entry' }, e.CasesMethods),
                    (e.CasesConfiguration = s.Configuration.create('cases', {
                        handler: { environment: ['cases-env'], character: ['cases-macros'] },
                        items: ((o = {}), (o[m.prototype.kind] = m), o),
                        tags: { cases: g },
                    }));
            },
            322: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CenternotConfiguration = e.filterCenterOver = void 0);
                var a = r(6552),
                    i = o(r(810)),
                    s = o(r(8321)),
                    l = r(7628),
                    c = o(r(724));
                function u(t) {
                    var e,
                        r,
                        o = t.data;
                    try {
                        for (
                            var a = n(o.getList('centerOver')), i = a.next();
                            !i.done;
                            i = a.next()
                        ) {
                            var l = i.value,
                                c = s.default.getTexClass(l.childNodes[0].childNodes[0]);
                            null !== c &&
                                s.default.setProperties(
                                    l.parent.parent.parent.parent.parent.parent,
                                    { texClass: c },
                                );
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            i && !i.done && (r = a.return) && r.call(a);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                }
                new l.CommandMap(
                    'centernot',
                    {
                        centerOver: 'CenterOver',
                        centernot: ['Macro', '\\centerOver{#1}{{\u29f8}}', 1],
                    },
                    {
                        CenterOver: function (t, e) {
                            var r = '{' + t.GetArgument(e) + '}',
                                n = t.ParseArg(e),
                                o = new i.default(r, t.stack.env, t.configuration).mml(),
                                a = t.create('node', 'TeXAtom', [
                                    new i.default(r, t.stack.env, t.configuration).mml(),
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [
                                            t.create('node', 'mpadded', [n], {
                                                width: 0,
                                                lspace: '-.5width',
                                            }),
                                            t.create('node', 'mphantom', [o]),
                                        ],
                                        { width: 0, lspace: '-.5width' },
                                    ),
                                ]);
                            t.configuration.addNode('centerOver', o), t.Push(a);
                        },
                        Macro: c.default.Macro,
                    },
                ),
                    (e.filterCenterOver = u),
                    (e.CenternotConfiguration = a.Configuration.create('centernot', {
                        handler: { macro: ['centernot'] },
                        postprocessors: [u],
                    }));
            },
            4151: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ColorConfiguration = void 0);
                var n = r(7628),
                    o = r(6552),
                    a = r(9574),
                    i = r(3997);
                new n.CommandMap(
                    'color',
                    {
                        color: 'Color',
                        textcolor: 'TextColor',
                        definecolor: 'DefineColor',
                        colorbox: 'ColorBox',
                        fcolorbox: 'FColorBox',
                    },
                    a.ColorMethods,
                );
                e.ColorConfiguration = o.Configuration.create('color', {
                    handler: { macro: ['color'] },
                    options: { color: { padding: '5px', borderWidth: '2px' } },
                    config: function (t, e) {
                        e.parseOptions.packageData.set('color', { model: new i.ColorModel() });
                    },
                });
            },
            6961: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.COLORS = void 0),
                    (e.COLORS = new Map([
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
            9574: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.ColorMethods = void 0);
                var o = n(r(8321)),
                    a = n(r(7702));
                function i(t) {
                    var e = '+'.concat(t),
                        r = t.replace(/^.*?([a-z]*)$/, '$1'),
                        n = 2 * parseFloat(e);
                    return { width: '+'.concat(n).concat(r), height: e, depth: e, lspace: t };
                }
                (e.ColorMethods = {}),
                    (e.ColorMethods.Color = function (t, e) {
                        var r = t.GetBrackets(e, ''),
                            n = t.GetArgument(e),
                            o = t.configuration.packageData.get('color').model.getColor(r, n),
                            a = t.itemFactory
                                .create('style')
                                .setProperties({ styles: { mathcolor: o } });
                        (t.stack.env.color = o), t.Push(a);
                    }),
                    (e.ColorMethods.TextColor = function (t, e) {
                        var r = t.GetBrackets(e, ''),
                            n = t.GetArgument(e),
                            o = t.configuration.packageData.get('color').model.getColor(r, n),
                            a = t.stack.env.color;
                        t.stack.env.color = o;
                        var i = t.ParseArg(e);
                        a ? (t.stack.env.color = a) : delete t.stack.env.color;
                        var s = t.create('node', 'mstyle', [i], { mathcolor: o });
                        t.Push(s);
                    }),
                    (e.ColorMethods.DefineColor = function (t, e) {
                        var r = t.GetArgument(e),
                            n = t.GetArgument(e),
                            o = t.GetArgument(e);
                        t.configuration.packageData.get('color').model.defineColor(n, r, o);
                    }),
                    (e.ColorMethods.ColorBox = function (t, e) {
                        var r = t.GetArgument(e),
                            n = a.default.internalMath(t, t.GetArgument(e)),
                            s = t.configuration.packageData.get('color').model,
                            l = t.create('node', 'mpadded', n, {
                                mathbackground: s.getColor('named', r),
                            });
                        o.default.setProperties(l, i(t.options.color.padding)), t.Push(l);
                    }),
                    (e.ColorMethods.FColorBox = function (t, e) {
                        var r = t.GetArgument(e),
                            n = t.GetArgument(e),
                            s = a.default.internalMath(t, t.GetArgument(e)),
                            l = t.options.color,
                            c = t.configuration.packageData.get('color').model,
                            u = t.create('node', 'mpadded', s, {
                                mathbackground: c.getColor('named', n),
                                style: 'border: '
                                    .concat(l.borderWidth, ' solid ')
                                    .concat(c.getColor('named', r)),
                            });
                        o.default.setProperties(u, i(l.padding)), t.Push(u);
                    });
            },
            3997: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.ColorModel = void 0);
                var a = o(r(3466)),
                    i = r(6961),
                    s = new Map(),
                    l = (function () {
                        function t() {
                            this.userColors = new Map();
                        }
                        return (
                            (t.prototype.normalizeColor = function (t, e) {
                                if (!t || 'named' === t) return e;
                                if (s.has(t)) return s.get(t)(e);
                                throw new a.default(
                                    'UndefinedColorModel',
                                    "Color model '%1' not defined",
                                    t,
                                );
                            }),
                            (t.prototype.getColor = function (t, e) {
                                return t && 'named' !== t
                                    ? this.normalizeColor(t, e)
                                    : this.getColorByName(e);
                            }),
                            (t.prototype.getColorByName = function (t) {
                                return this.userColors.has(t)
                                    ? this.userColors.get(t)
                                    : i.COLORS.has(t)
                                      ? i.COLORS.get(t)
                                      : t;
                            }),
                            (t.prototype.defineColor = function (t, e, r) {
                                var n = this.normalizeColor(t, r);
                                this.userColors.set(e, n);
                            }),
                            t
                        );
                    })();
                (e.ColorModel = l),
                    s.set('rgb', function (t) {
                        var e,
                            r,
                            o = t.trim().split(/\s*,\s*/),
                            i = '#';
                        if (3 !== o.length)
                            throw new a.default(
                                'ModelArg1',
                                'Color values for the %1 model require 3 numbers',
                                'rgb',
                            );
                        try {
                            for (var s = n(o), l = s.next(); !l.done; l = s.next()) {
                                var c = l.value;
                                if (!c.match(/^(\d+(\.\d*)?|\.\d+)$/))
                                    throw new a.default(
                                        'InvalidDecimalNumber',
                                        'Invalid decimal number',
                                    );
                                var u = parseFloat(c);
                                if (u < 0 || u > 1)
                                    throw new a.default(
                                        'ModelArg2',
                                        'Color values for the %1 model must be between %2 and %3',
                                        'rgb',
                                        '0',
                                        '1',
                                    );
                                var p = Math.floor(255 * u).toString(16);
                                p.length < 2 && (p = '0' + p), (i += p);
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                l && !l.done && (r = s.return) && r.call(s);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                        return i;
                    }),
                    s.set('RGB', function (t) {
                        var e,
                            r,
                            o = t.trim().split(/\s*,\s*/),
                            i = '#';
                        if (3 !== o.length)
                            throw new a.default(
                                'ModelArg1',
                                'Color values for the %1 model require 3 numbers',
                                'RGB',
                            );
                        try {
                            for (var s = n(o), l = s.next(); !l.done; l = s.next()) {
                                var c = l.value;
                                if (!c.match(/^\d+$/))
                                    throw new a.default('InvalidNumber', 'Invalid number');
                                var u = parseInt(c);
                                if (u > 255)
                                    throw new a.default(
                                        'ModelArg2',
                                        'Color values for the %1 model must be between %2 and %3',
                                        'RGB',
                                        '0',
                                        '255',
                                    );
                                var p = u.toString(16);
                                p.length < 2 && (p = '0' + p), (i += p);
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                l && !l.done && (r = s.return) && r.call(s);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                        return i;
                    }),
                    s.set('gray', function (t) {
                        if (!t.match(/^\s*(\d+(\.\d*)?|\.\d+)\s*$/))
                            throw new a.default('InvalidDecimalNumber', 'Invalid decimal number');
                        var e = parseFloat(t);
                        if (e < 0 || e > 1)
                            throw new a.default(
                                'ModelArg2',
                                'Color values for the %1 model must be between %2 and %3',
                                'gray',
                                '0',
                                '1',
                            );
                        var r = Math.floor(255 * e).toString(16);
                        return r.length < 2 && (r = '0' + r), '#'.concat(r).concat(r).concat(r);
                    });
            },
            9570: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ColortblConfiguration = e.ColorArrayItem = void 0);
                var i = r(8389),
                    s = r(6552),
                    l = r(7628),
                    c = a(r(3466)),
                    u = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.color = { cell: '', row: '', col: [] }), (e.hasColor = !1), e;
                        }
                        return (
                            o(e, t),
                            (e.prototype.EndEntry = function () {
                                t.prototype.EndEntry.call(this);
                                var e = this.row[this.row.length - 1],
                                    r =
                                        this.color.cell ||
                                        this.color.row ||
                                        this.color.col[this.row.length - 1];
                                r &&
                                    (e.attributes.set('mathbackground', r),
                                    (this.color.cell = ''),
                                    (this.hasColor = !0));
                            }),
                            (e.prototype.EndRow = function () {
                                t.prototype.EndRow.call(this), (this.color.row = '');
                            }),
                            (e.prototype.createMml = function () {
                                var e = t.prototype.createMml.call(this),
                                    r = e.isKind('mrow') ? e.childNodes[1] : e;
                                return (
                                    r.isKind('menclose') && (r = r.childNodes[0].childNodes[0]),
                                    this.hasColor &&
                                        'none' === r.attributes.get('frame') &&
                                        r.attributes.set('frame', ''),
                                    e
                                );
                            }),
                            e
                        );
                    })(i.ArrayItem);
                (e.ColorArrayItem = u),
                    new l.CommandMap(
                        'colortbl',
                        {
                            cellcolor: ['TableColor', 'cell'],
                            rowcolor: ['TableColor', 'row'],
                            columncolor: ['TableColor', 'col'],
                        },
                        {
                            TableColor: function (t, e, r) {
                                var n = t.configuration.packageData.get('color').model,
                                    o = t.GetBrackets(e, ''),
                                    a = n.getColor(o, t.GetArgument(e)),
                                    i = t.stack.Top();
                                if (!(i instanceof u))
                                    throw new c.default(
                                        'UnsupportedTableColor',
                                        'Unsupported use of %1',
                                        t.currentCS,
                                    );
                                if ('col' === r) {
                                    if (i.table.length)
                                        throw new c.default(
                                            'ColumnColorNotTop',
                                            '%1 must be in the top row',
                                            e,
                                        );
                                    (i.color.col[i.row.length] = a),
                                        t.GetBrackets(e, '') && t.GetBrackets(e, '');
                                } else if (
                                    ((i.color[r] = a), 'row' === r && (i.Size() || i.row.length))
                                )
                                    throw new c.default(
                                        'RowColorNotFirst',
                                        '%1 must be at the beginning of a row',
                                        e,
                                    );
                            },
                        },
                    );
                e.ColortblConfiguration = s.Configuration.create('colortbl', {
                    handler: { macro: ['colortbl'] },
                    items: { array: u },
                    priority: 10,
                    config: [
                        function (t, e) {
                            e.parseOptions.packageData.has('color') ||
                                s.ConfigurationHandler.get('color').config(t, e);
                        },
                        10,
                    ],
                });
            },
            2298: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ColorConfiguration = e.ColorV2Methods = void 0);
                var n = r(7628),
                    o = r(6552);
                (e.ColorV2Methods = {
                    Color: function (t, e) {
                        var r = t.GetArgument(e),
                            n = t.stack.env.color;
                        t.stack.env.color = r;
                        var o = t.ParseArg(e);
                        n ? (t.stack.env.color = n) : delete t.stack.env.color;
                        var a = t.create('node', 'mstyle', [o], { mathcolor: r });
                        t.Push(a);
                    },
                }),
                    new n.CommandMap('colorv2', { color: 'Color' }, e.ColorV2Methods),
                    (e.ColorConfiguration = o.Configuration.create('colorv2', {
                        handler: { macro: ['colorv2'] },
                    }));
            },
            3274: function (t, e, r) {
                var n,
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ConfigMacrosConfiguration = void 0);
                var i = r(6552),
                    s = r(9077),
                    l = r(7628),
                    c = a(r(4708)),
                    u = r(4237),
                    p = a(r(8562)),
                    d = r(6706),
                    f = 'configmacros-map',
                    h = 'configmacros-env-map';
                e.ConfigMacrosConfiguration = i.Configuration.create('configmacros', {
                    init: function (t) {
                        new l.CommandMap(f, {}, {}),
                            new l.EnvironmentMap(h, c.default.environment, {}, {}),
                            t.append(
                                i.Configuration.local({
                                    handler: { macro: [f], environment: [h] },
                                    priority: 3,
                                }),
                            );
                    },
                    config: function (t, e) {
                        !(function (t) {
                            var e,
                                r,
                                n = t.parseOptions.handlers.retrieve(f),
                                a = t.parseOptions.options.macros;
                            try {
                                for (
                                    var i = o(Object.keys(a)), s = i.next();
                                    !s.done;
                                    s = i.next()
                                ) {
                                    var l = s.value,
                                        c = 'string' == typeof a[l] ? [a[l]] : a[l],
                                        d = Array.isArray(c[2])
                                            ? new u.Macro(
                                                  l,
                                                  p.default.MacroWithTemplate,
                                                  c.slice(0, 2).concat(c[2]),
                                              )
                                            : new u.Macro(l, p.default.Macro, c);
                                    n.add(l, d);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                        })(e),
                            (function (t) {
                                var e,
                                    r,
                                    n = t.parseOptions.handlers.retrieve(h),
                                    a = t.parseOptions.options.environments;
                                try {
                                    for (
                                        var i = o(Object.keys(a)), s = i.next();
                                        !s.done;
                                        s = i.next()
                                    ) {
                                        var l = s.value;
                                        n.add(
                                            l,
                                            new u.Macro(l, p.default.BeginEnv, [!0].concat(a[l])),
                                        );
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (r = i.return) && r.call(i);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            })(e);
                    },
                    items: ((n = {}), (n[d.BeginEnvItem.prototype.kind] = d.BeginEnvItem), n),
                    options: { macros: (0, s.expandable)({}), environments: (0, s.expandable)({}) },
                });
            },
            8430: function (t, e, r) {
                var n,
                    o,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
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
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.EmpheqConfiguration = e.EmpheqMethods = e.EmpheqBeginItem = void 0);
                var l = r(6552),
                    c = r(7628),
                    u = s(r(7702)),
                    p = s(r(3466)),
                    d = r(8389),
                    f = r(3904),
                    h = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            a(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'empheq-begin';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (e) {
                                return (
                                    e.isKind('end') &&
                                        e.getName() === this.getName() &&
                                        this.setProperty('end', !1),
                                    t.prototype.checkItem.call(this, e)
                                );
                            }),
                            e
                        );
                    })(d.BeginItem);
                (e.EmpheqBeginItem = h),
                    (e.EmpheqMethods = {
                        Empheq: function (t, e) {
                            if (t.stack.env.closing === e.getName()) {
                                delete t.stack.env.closing,
                                    t.Push(
                                        t.itemFactory
                                            .create('end')
                                            .setProperty('name', t.stack.global.empheq),
                                    ),
                                    (t.stack.global.empheq = '');
                                var r = t.stack.Top();
                                f.EmpheqUtil.adjustTable(r, t),
                                    t.Push(
                                        t.itemFactory.create('end').setProperty('name', 'empheq'),
                                    );
                            } else {
                                u.default.checkEqnEnv(t), delete t.stack.global.eqnenv;
                                var n = t.GetBrackets('\\begin{' + e.getName() + '}') || '',
                                    o = i(
                                        (t.GetArgument('\\begin{' + e.getName() + '}') || '').split(
                                            /=/,
                                        ),
                                        2,
                                    ),
                                    a = o[0],
                                    s = o[1];
                                if (!f.EmpheqUtil.checkEnv(a))
                                    throw new p.default(
                                        'UnknownEnv',
                                        'Unknown environment "%1"',
                                        a,
                                    );
                                n &&
                                    e.setProperties(
                                        f.EmpheqUtil.splitOptions(n, { left: 1, right: 1 }),
                                    ),
                                    (t.stack.global.empheq = a),
                                    (t.string =
                                        '\\begin{' +
                                        a +
                                        '}' +
                                        (s ? '{' + s + '}' : '') +
                                        t.string.slice(t.i)),
                                    (t.i = 0),
                                    t.Push(e);
                            }
                        },
                        EmpheqMO: function (t, e, r) {
                            t.Push(t.create('token', 'mo', {}, r));
                        },
                        EmpheqDelim: function (t, e) {
                            var r = t.GetDelimiter(e);
                            t.Push(t.create('token', 'mo', { stretchy: !0, symmetric: !0 }, r));
                        },
                    }),
                    new c.EnvironmentMap(
                        'empheq-env',
                        f.EmpheqUtil.environment,
                        { empheq: ['Empheq', 'empheq'] },
                        e.EmpheqMethods,
                    ),
                    new c.CommandMap(
                        'empheq-macros',
                        {
                            empheqlbrace: ['EmpheqMO', '{'],
                            empheqrbrace: ['EmpheqMO', '}'],
                            empheqlbrack: ['EmpheqMO', '['],
                            empheqrbrack: ['EmpheqMO', ']'],
                            empheqlangle: ['EmpheqMO', '\u27e8'],
                            empheqrangle: ['EmpheqMO', '\u27e9'],
                            empheqlparen: ['EmpheqMO', '('],
                            empheqrparen: ['EmpheqMO', ')'],
                            empheqlvert: ['EmpheqMO', '|'],
                            empheqrvert: ['EmpheqMO', '|'],
                            empheqlVert: ['EmpheqMO', '\u2016'],
                            empheqrVert: ['EmpheqMO', '\u2016'],
                            empheqlfloor: ['EmpheqMO', '\u230a'],
                            empheqrfloor: ['EmpheqMO', '\u230b'],
                            empheqlceil: ['EmpheqMO', '\u2308'],
                            empheqrceil: ['EmpheqMO', '\u2309'],
                            empheqbiglbrace: ['EmpheqMO', '{'],
                            empheqbigrbrace: ['EmpheqMO', '}'],
                            empheqbiglbrack: ['EmpheqMO', '['],
                            empheqbigrbrack: ['EmpheqMO', ']'],
                            empheqbiglangle: ['EmpheqMO', '\u27e8'],
                            empheqbigrangle: ['EmpheqMO', '\u27e9'],
                            empheqbiglparen: ['EmpheqMO', '('],
                            empheqbigrparen: ['EmpheqMO', ')'],
                            empheqbiglvert: ['EmpheqMO', '|'],
                            empheqbigrvert: ['EmpheqMO', '|'],
                            empheqbiglVert: ['EmpheqMO', '\u2016'],
                            empheqbigrVert: ['EmpheqMO', '\u2016'],
                            empheqbiglfloor: ['EmpheqMO', '\u230a'],
                            empheqbigrfloor: ['EmpheqMO', '\u230b'],
                            empheqbiglceil: ['EmpheqMO', '\u2308'],
                            empheqbigrceil: ['EmpheqMO', '\u2309'],
                            empheql: 'EmpheqDelim',
                            empheqr: 'EmpheqDelim',
                            empheqbigl: 'EmpheqDelim',
                            empheqbigr: 'EmpheqDelim',
                        },
                        e.EmpheqMethods,
                    ),
                    (e.EmpheqConfiguration = l.Configuration.create('empheq', {
                        handler: { macro: ['empheq-macros'], environment: ['empheq-env'] },
                        items: ((o = {}), (o[h.prototype.kind] = h), o),
                    }));
            },
            3904: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.EmpheqUtil = void 0);
                var s = i(r(7702)),
                    l = i(r(810));
                e.EmpheqUtil = {
                    environment: function (t, e, r, a) {
                        var i = a[0],
                            s = t.itemFactory
                                .create(i + '-begin')
                                .setProperties({ name: e, end: i });
                        t.Push(r.apply(void 0, o([t, s], n(a.slice(1)), !1)));
                    },
                    splitOptions: function (t, e) {
                        return void 0 === e && (e = null), s.default.keyvalOptions(t, e, !0);
                    },
                    columnCount: function (t) {
                        var e,
                            r,
                            n = 0;
                        try {
                            for (var o = a(t.childNodes), i = o.next(); !i.done; i = o.next()) {
                                var s = i.value,
                                    l = s.childNodes.length - (s.isKind('mlabeledtr') ? 1 : 0);
                                l > n && (n = l);
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                i && !i.done && (r = o.return) && r.call(o);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                        return n;
                    },
                    cellBlock: function (t, e, r, n) {
                        var o,
                            i,
                            s = r.create('node', 'mpadded', [], {
                                height: 0,
                                depth: 0,
                                voffset: '-1height',
                            }),
                            c = new l.default(t, r.stack.env, r.configuration),
                            u = c.mml();
                        n &&
                            c.configuration.tags.label &&
                            ((c.configuration.tags.currentTag.env = n),
                            c.configuration.tags.getTag(!0));
                        try {
                            for (
                                var p = a(u.isInferred ? u.childNodes : [u]), d = p.next();
                                !d.done;
                                d = p.next()
                            ) {
                                var f = d.value;
                                s.appendChild(f);
                            }
                        } catch (t) {
                            o = { error: t };
                        } finally {
                            try {
                                d && !d.done && (i = p.return) && i.call(p);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        return (
                            s.appendChild(
                                r.create('node', 'mphantom', [
                                    r.create('node', 'mpadded', [e], { width: 0 }),
                                ]),
                            ),
                            s
                        );
                    },
                    topRowTable: function (t, e) {
                        var r = s.default.copyNode(t, e);
                        return (
                            r.setChildren(r.childNodes.slice(0, 1)),
                            r.attributes.set('align', 'baseline 1'),
                            t.factory.create('mphantom', {}, [
                                e.create('node', 'mpadded', [r], { width: 0 }),
                            ])
                        );
                    },
                    rowspanCell: function (t, e, r, n, o) {
                        t.appendChild(
                            n.create(
                                'node',
                                'mpadded',
                                [
                                    this.cellBlock(e, s.default.copyNode(r, n), n, o),
                                    this.topRowTable(r, n),
                                ],
                                { height: 0, depth: 0, voffset: 'height' },
                            ),
                        );
                    },
                    left: function (t, e, r, n, o) {
                        var i, s, l;
                        void 0 === o && (o = ''),
                            t.attributes.set(
                                'columnalign',
                                'right ' + (t.attributes.get('columnalign') || ''),
                            ),
                            t.attributes.set(
                                'columnspacing',
                                '0em ' + (t.attributes.get('columnspacing') || ''),
                            );
                        try {
                            for (
                                var c = a(t.childNodes.slice(0).reverse()), u = c.next();
                                !u.done;
                                u = c.next()
                            ) {
                                var p = u.value;
                                (l = n.create('node', 'mtd')),
                                    p.childNodes.unshift(l),
                                    (l.parent = p),
                                    p.isKind('mlabeledtr') &&
                                        ((p.childNodes[0] = p.childNodes[1]),
                                        (p.childNodes[1] = l));
                            }
                        } catch (t) {
                            i = { error: t };
                        } finally {
                            try {
                                u && !u.done && (s = c.return) && s.call(c);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                        this.rowspanCell(l, r, e, n, o);
                    },
                    right: function (t, r, n, o, a) {
                        void 0 === a && (a = ''),
                            0 === t.childNodes.length && t.appendChild(o.create('node', 'mtr'));
                        for (
                            var i = e.EmpheqUtil.columnCount(t), s = t.childNodes[0];
                            s.childNodes.length < i;

                        )
                            s.appendChild(o.create('node', 'mtd'));
                        var l = s.appendChild(o.create('node', 'mtd'));
                        e.EmpheqUtil.rowspanCell(l, n, r, o, a),
                            t.attributes.set(
                                'columnalign',
                                (t.attributes.get('columnalign') || '')
                                    .split(/ /)
                                    .slice(0, i)
                                    .join(' ') + ' left',
                            ),
                            t.attributes.set(
                                'columnspacing',
                                (t.attributes.get('columnspacing') || '')
                                    .split(/ /)
                                    .slice(0, i - 1)
                                    .join(' ') + ' 0em',
                            );
                    },
                    adjustTable: function (t, e) {
                        var r = t.getProperty('left'),
                            n = t.getProperty('right');
                        if (r || n) {
                            var o = t.Last,
                                a = s.default.copyNode(o, e);
                            r && this.left(o, a, r, e), n && this.right(o, a, n, e);
                        }
                    },
                    allowEnv: {
                        equation: !0,
                        align: !0,
                        gather: !0,
                        flalign: !0,
                        alignat: !0,
                        multline: !0,
                    },
                    checkEnv: function (t) {
                        return this.allowEnv.hasOwnProperty(t.replace(/\*$/, '')) || !1;
                    },
                };
            },
            6755: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.EncloseConfiguration = e.EncloseMethods = e.ENCLOSE_OPTIONS = void 0);
                var o = r(6552),
                    a = r(7628),
                    i = n(r(7702));
                (e.ENCLOSE_OPTIONS = {
                    'data-arrowhead': 1,
                    color: 1,
                    mathcolor: 1,
                    background: 1,
                    mathbackground: 1,
                    'data-padding': 1,
                    'data-thickness': 1,
                }),
                    (e.EncloseMethods = {}),
                    (e.EncloseMethods.Enclose = function (t, r) {
                        var n = t.GetArgument(r).replace(/,/g, ' '),
                            o = t.GetBrackets(r, ''),
                            a = t.ParseArg(r),
                            s = i.default.keyvalOptions(o, e.ENCLOSE_OPTIONS);
                        (s.notation = n), t.Push(t.create('node', 'menclose', [a], s));
                    }),
                    new a.CommandMap('enclose', { enclose: 'Enclose' }, e.EncloseMethods),
                    (e.EncloseConfiguration = o.Configuration.create('enclose', {
                        handler: { macro: ['enclose'] },
                    }));
            },
            5246: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ExtpfeilConfiguration = e.ExtpfeilMethods = void 0);
                var o = r(6552),
                    a = r(7628),
                    i = r(2684),
                    s = n(r(5282)),
                    l = r(2200),
                    c = n(r(3466));
                (e.ExtpfeilMethods = {}),
                    (e.ExtpfeilMethods.xArrow = i.AmsMethods.xArrow),
                    (e.ExtpfeilMethods.NewExtArrow = function (t, r) {
                        var n = t.GetArgument(r),
                            o = t.GetArgument(r),
                            a = t.GetArgument(r);
                        if (!n.match(/^\\([a-z]+|.)$/i))
                            throw new c.default(
                                'NewextarrowArg1',
                                'First argument to %1 must be a control sequence name',
                                r,
                            );
                        if (!o.match(/^(\d+),(\d+)$/))
                            throw new c.default(
                                'NewextarrowArg2',
                                'Second argument to %1 must be two integers separated by a comma',
                                r,
                            );
                        if (!a.match(/^(\d+|0x[0-9A-F]+)$/i))
                            throw new c.default(
                                'NewextarrowArg3',
                                'Third argument to %1 must be a unicode character number',
                                r,
                            );
                        n = n.substr(1);
                        var i = o.split(',');
                        s.default.addMacro(t, n, e.ExtpfeilMethods.xArrow, [
                            parseInt(a),
                            parseInt(i[0]),
                            parseInt(i[1]),
                        ]);
                    }),
                    new a.CommandMap(
                        'extpfeil',
                        {
                            xtwoheadrightarrow: ['xArrow', 8608, 12, 16],
                            xtwoheadleftarrow: ['xArrow', 8606, 17, 13],
                            xmapsto: ['xArrow', 8614, 6, 7],
                            xlongequal: ['xArrow', 61, 7, 7],
                            xtofrom: ['xArrow', 8644, 12, 12],
                            Newextarrow: 'NewExtArrow',
                        },
                        e.ExtpfeilMethods,
                    );
                e.ExtpfeilConfiguration = o.Configuration.create('extpfeil', {
                    handler: { macro: ['extpfeil'] },
                    init: function (t) {
                        l.NewcommandConfiguration.init(t);
                    },
                });
            },
            1307: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.GensymbConfiguration = void 0);
                var n = r(6552),
                    o = r(7007);
                new (r(7628).CharacterMap)(
                    'gensymb-symbols',
                    function (t, e) {
                        var r = e.attributes || {};
                        (r.mathvariant = o.TexConstant.Variant.NORMAL), (r.class = 'MathML-Unit');
                        var n = t.create('token', 'mi', r, e.char);
                        t.Push(n);
                    },
                    {
                        ohm: '\u2126',
                        degree: '\xb0',
                        celsius: '\u2103',
                        perthousand: '\u2030',
                        micro: '\xb5',
                    },
                ),
                    (e.GensymbConfiguration = n.Configuration.create('gensymb', {
                        handler: { macro: ['gensymb-symbols'] },
                    }));
            },
            153: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.HtmlConfiguration = void 0);
                var o = r(6552),
                    a = r(7628),
                    i = n(r(2565));
                new a.CommandMap(
                    'html_macros',
                    { href: 'Href', class: 'Class', style: 'Style', cssId: 'Id' },
                    i.default,
                ),
                    (e.HtmlConfiguration = o.Configuration.create('html', {
                        handler: { macro: ['html_macros'] },
                    }));
            },
            2565: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = n(r(8321)),
                    a = {
                        Href: function (t, e) {
                            var r = t.GetArgument(e),
                                n = i(t, e);
                            o.default.setAttribute(n, 'href', r), t.Push(n);
                        },
                        Class: function (t, e) {
                            var r = t.GetArgument(e),
                                n = i(t, e),
                                a = o.default.getAttribute(n, 'class');
                            a && (r = a + ' ' + r),
                                o.default.setAttribute(n, 'class', r),
                                t.Push(n);
                        },
                        Style: function (t, e) {
                            var r = t.GetArgument(e),
                                n = i(t, e),
                                a = o.default.getAttribute(n, 'style');
                            a && (';' !== r.charAt(r.length - 1) && (r += ';'), (r = a + ' ' + r)),
                                o.default.setAttribute(n, 'style', r),
                                t.Push(n);
                        },
                        Id: function (t, e) {
                            var r = t.GetArgument(e),
                                n = i(t, e);
                            o.default.setAttribute(n, 'id', r), t.Push(n);
                        },
                    },
                    i = function (t, e) {
                        var r = t.ParseArg(e);
                        if (!o.default.isInferred(r)) return r;
                        var n = o.default.getChildren(r);
                        if (1 === n.length) return n[0];
                        var a = t.create('node', 'mrow');
                        return o.default.copyChildren(r, a), o.default.copyAttributes(r, a), a;
                    };
                e.default = a;
            },
            856: function (t, e, r) {
                var n,
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathtoolsConfiguration = e.fixPrescripts = e.PAIREDDELIMS = void 0);
                var i = r(6552),
                    s = r(7628),
                    l = a(r(8321)),
                    c = r(9077);
                r(3642);
                var u = r(885),
                    p = r(1331),
                    d = r(9095);
                function f(t) {
                    var e,
                        r,
                        n,
                        a,
                        i,
                        s,
                        c = t.data;
                    try {
                        for (
                            var u = o(c.getList('mmultiscripts')), p = u.next();
                            !p.done;
                            p = u.next()
                        ) {
                            var d = p.value;
                            if (d.getProperty('fixPrescript')) {
                                var f = l.default.getChildren(d),
                                    h = 0;
                                try {
                                    for (
                                        var m = ((n = void 0), o([1, 2])), g = m.next();
                                        !g.done;
                                        g = m.next()
                                    ) {
                                        f[(b = g.value)] ||
                                            (l.default.setChild(
                                                d,
                                                b,
                                                c.nodeFactory.create('node', 'none'),
                                            ),
                                            h++);
                                    }
                                } catch (t) {
                                    n = { error: t };
                                } finally {
                                    try {
                                        g && !g.done && (a = m.return) && a.call(m);
                                    } finally {
                                        if (n) throw n.error;
                                    }
                                }
                                try {
                                    for (
                                        var y = ((i = void 0), o([4, 5])), v = y.next();
                                        !v.done;
                                        v = y.next()
                                    ) {
                                        var b = v.value;
                                        l.default.isType(f[b], 'mrow') &&
                                            0 === l.default.getChildren(f[b]).length &&
                                            l.default.setChild(
                                                d,
                                                b,
                                                c.nodeFactory.create('node', 'none'),
                                            );
                                    }
                                } catch (t) {
                                    i = { error: t };
                                } finally {
                                    try {
                                        v && !v.done && (s = y.return) && s.call(y);
                                    } finally {
                                        if (i) throw i.error;
                                    }
                                }
                                2 === h && f.splice(1, 2);
                            }
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
                }
                (e.PAIREDDELIMS = 'mathtools-paired-delims'),
                    (e.fixPrescripts = f),
                    (e.MathtoolsConfiguration = i.Configuration.create('mathtools', {
                        handler: {
                            macro: ['mathtools-macros', 'mathtools-delimiters'],
                            environment: ['mathtools-environments'],
                            delimiter: ['mathtools-delimiters'],
                            character: ['mathtools-characters'],
                        },
                        items: ((n = {}), (n[d.MultlinedItem.prototype.kind] = d.MultlinedItem), n),
                        init: function (t) {
                            new s.CommandMap(e.PAIREDDELIMS, {}, {}),
                                t.append(
                                    i.Configuration.local({
                                        handler: { macro: [e.PAIREDDELIMS] },
                                        priority: -5,
                                    }),
                                );
                        },
                        config: function (t, e) {
                            var r,
                                n,
                                a = e.parseOptions,
                                i = a.options.mathtools.pairedDelimiters;
                            try {
                                for (
                                    var s = o(Object.keys(i)), l = s.next();
                                    !l.done;
                                    l = s.next()
                                ) {
                                    var c = l.value;
                                    u.MathtoolsUtil.addPairedDelims(a, c, i[c]);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    l && !l.done && (n = s.return) && n.call(s);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            (0, p.MathtoolsTagFormat)(t, e);
                        },
                        postprocessors: [[f, -6]],
                        options: {
                            mathtools: {
                                multlinegap: '1em',
                                'multlined-pos': 'c',
                                'firstline-afterskip': '',
                                'lastline-preskip': '',
                                'smallmatrix-align': 'c',
                                shortvdotsadjustabove: '.2em',
                                shortvdotsadjustbelow: '.2em',
                                centercolon: !1,
                                'centercolon-offset': '.04em',
                                'thincolon-dx': '-.04em',
                                'thincolon-dw': '-.08em',
                                'use-unicode': !1,
                                'prescript-sub-format': '',
                                'prescript-sup-format': '',
                                'prescript-arg-format': '',
                                'allow-mathtoolsset': !0,
                                pairedDelimiters: (0, c.expandable)({}),
                                tagforms: (0, c.expandable)({}),
                            },
                        },
                    }));
            },
            9095: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MultlinedItem = void 0);
                var i = r(3632),
                    s = a(r(8321)),
                    l = r(7007),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'multlined';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.EndTable = function () {
                                if (
                                    ((this.Size() || this.row.length) &&
                                        (this.EndEntry(), this.EndRow()),
                                    this.table.length > 1)
                                ) {
                                    var e = this.factory.configuration.options.mathtools,
                                        r = e.multlinegap,
                                        n = e['firstline-afterskip'] || r,
                                        o = e['lastline-preskip'] || r,
                                        a = s.default.getChildren(this.table[0])[0];
                                    s.default.getAttribute(a, 'columnalign') !==
                                        l.TexConstant.Align.RIGHT &&
                                        a.appendChild(
                                            this.create('node', 'mspace', [], { width: n }),
                                        );
                                    var i = s.default.getChildren(
                                        this.table[this.table.length - 1],
                                    )[0];
                                    if (
                                        s.default.getAttribute(i, 'columnalign') !==
                                        l.TexConstant.Align.LEFT
                                    ) {
                                        var c = s.default.getChildren(i)[0];
                                        c.childNodes.unshift(null);
                                        var u = this.create('node', 'mspace', [], { width: o });
                                        s.default.setChild(c, 0, u);
                                    }
                                }
                                t.prototype.EndTable.call(this);
                            }),
                            e
                        );
                    })(i.MultlineItem);
                e.MultlinedItem = c;
            },
            3642: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = n(r(4708)),
                    a = r(7628),
                    i = r(7007),
                    s = r(8155);
                new a.CommandMap(
                    'mathtools-macros',
                    {
                        shoveleft: ['HandleShove', i.TexConstant.Align.LEFT],
                        shoveright: ['HandleShove', i.TexConstant.Align.RIGHT],
                        xleftrightarrow: ['xArrow', 8596, 10, 10],
                        xLeftarrow: ['xArrow', 8656, 12, 7],
                        xRightarrow: ['xArrow', 8658, 7, 12],
                        xLeftrightarrow: ['xArrow', 8660, 12, 12],
                        xhookleftarrow: ['xArrow', 8617, 10, 5],
                        xhookrightarrow: ['xArrow', 8618, 5, 10],
                        xmapsto: ['xArrow', 8614, 10, 10],
                        xrightharpoondown: ['xArrow', 8641, 5, 10],
                        xleftharpoondown: ['xArrow', 8637, 10, 5],
                        xrightleftharpoons: ['xArrow', 8652, 10, 10],
                        xrightharpoonup: ['xArrow', 8640, 5, 10],
                        xleftharpoonup: ['xArrow', 8636, 10, 5],
                        xleftrightharpoons: ['xArrow', 8651, 10, 10],
                        mathllap: ['MathLap', 'l', !1],
                        mathrlap: ['MathLap', 'r', !1],
                        mathclap: ['MathLap', 'c', !1],
                        clap: ['MtLap', 'c'],
                        textllap: ['MtLap', 'l'],
                        textrlap: ['MtLap', 'r'],
                        textclap: ['MtLap', 'c'],
                        cramped: 'Cramped',
                        crampedllap: ['MathLap', 'l', !0],
                        crampedrlap: ['MathLap', 'r', !0],
                        crampedclap: ['MathLap', 'c', !0],
                        crampedsubstack: [
                            'Macro',
                            '\\begin{crampedsubarray}{c}#1\\end{crampedsubarray}',
                            1,
                        ],
                        mathmbox: 'MathMBox',
                        mathmakebox: 'MathMakeBox',
                        overbracket: 'UnderOverBracket',
                        underbracket: 'UnderOverBracket',
                        refeq: 'HandleRef',
                        MoveEqLeft: ['Macro', '\\hspace{#1em}&\\hspace{-#1em}', 1, '2'],
                        Aboxed: 'Aboxed',
                        ArrowBetweenLines: 'ArrowBetweenLines',
                        vdotswithin: 'VDotsWithin',
                        shortvdotswithin: 'ShortVDotsWithin',
                        MTFlushSpaceAbove: 'FlushSpaceAbove',
                        MTFlushSpaceBelow: 'FlushSpaceBelow',
                        DeclarePairedDelimiter: 'DeclarePairedDelimiter',
                        DeclarePairedDelimiterX: 'DeclarePairedDelimiterX',
                        DeclarePairedDelimiterXPP: 'DeclarePairedDelimiterXPP',
                        DeclarePairedDelimiters: 'DeclarePairedDelimiter',
                        DeclarePairedDelimitersX: 'DeclarePairedDelimiterX',
                        DeclarePairedDelimitersXPP: 'DeclarePairedDelimiterXPP',
                        centercolon: ['CenterColon', !0, !0],
                        ordinarycolon: ['CenterColon', !1],
                        MTThinColon: ['CenterColon', !0, !0, !0],
                        coloneqq: ['Relation', ':=', '\u2254'],
                        Coloneqq: ['Relation', '::=', '\u2a74'],
                        coloneq: ['Relation', ':-'],
                        Coloneq: ['Relation', '::-'],
                        eqqcolon: ['Relation', '=:', '\u2255'],
                        Eqqcolon: ['Relation', '=::'],
                        eqcolon: ['Relation', '-:', '\u2239'],
                        Eqcolon: ['Relation', '-::'],
                        colonapprox: ['Relation', ':\\approx'],
                        Colonapprox: ['Relation', '::\\approx'],
                        colonsim: ['Relation', ':\\sim'],
                        Colonsim: ['Relation', '::\\sim'],
                        dblcolon: ['Relation', '::', '\u2237'],
                        nuparrow: ['NArrow', '\u2191', '.06em'],
                        ndownarrow: ['NArrow', '\u2193', '.25em'],
                        bigtimes: [
                            'Macro',
                            '\\mathop{\\Large\\kern-.1em\\boldsymbol{\\times}\\kern-.1em}',
                        ],
                        splitfrac: ['SplitFrac', !1],
                        splitdfrac: ['SplitFrac', !0],
                        xmathstrut: 'XMathStrut',
                        prescript: 'Prescript',
                        newtagform: ['NewTagForm', !1],
                        renewtagform: ['NewTagForm', !0],
                        usetagform: 'UseTagForm',
                        adjustlimits: [
                            'MacroWithTemplate',
                            '\\mathop{{#1}\\vphantom{{#3}}}_{{#2}\\vphantom{{#4}}}\\mathop{{#3}\\vphantom{{#1}}}_{{#4}\\vphantom{{#2}}}',
                            4,
                            ,
                            '_',
                            ,
                            '_',
                        ],
                        mathtoolsset: 'SetOptions',
                    },
                    s.MathtoolsMethods,
                ),
                    new a.EnvironmentMap(
                        'mathtools-environments',
                        o.default.environment,
                        {
                            dcases: ['Array', null, '\\{', '', 'll', null, '.2em', 'D'],
                            rcases: ['Array', null, '', '\\}', 'll', null, '.2em'],
                            drcases: ['Array', null, '', '\\}', 'll', null, '.2em', 'D'],
                            'dcases*': ['Cases', null, '{', '', 'D'],
                            'rcases*': ['Cases', null, '', '}'],
                            'drcases*': ['Cases', null, '', '}', 'D'],
                            'cases*': ['Cases', null, '{', ''],
                            'matrix*': ['MtMatrix', null, null, null],
                            'pmatrix*': ['MtMatrix', null, '(', ')'],
                            'bmatrix*': ['MtMatrix', null, '[', ']'],
                            'Bmatrix*': ['MtMatrix', null, '\\{', '\\}'],
                            'vmatrix*': ['MtMatrix', null, '\\vert', '\\vert'],
                            'Vmatrix*': ['MtMatrix', null, '\\Vert', '\\Vert'],
                            'smallmatrix*': ['MtSmallMatrix', null, null, null],
                            psmallmatrix: ['MtSmallMatrix', null, '(', ')', 'c'],
                            'psmallmatrix*': ['MtSmallMatrix', null, '(', ')'],
                            bsmallmatrix: ['MtSmallMatrix', null, '[', ']', 'c'],
                            'bsmallmatrix*': ['MtSmallMatrix', null, '[', ']'],
                            Bsmallmatrix: ['MtSmallMatrix', null, '\\{', '\\}', 'c'],
                            'Bsmallmatrix*': ['MtSmallMatrix', null, '\\{', '\\}'],
                            vsmallmatrix: ['MtSmallMatrix', null, '\\vert', '\\vert', 'c'],
                            'vsmallmatrix*': ['MtSmallMatrix', null, '\\vert', '\\vert'],
                            Vsmallmatrix: ['MtSmallMatrix', null, '\\Vert', '\\Vert', 'c'],
                            'Vsmallmatrix*': ['MtSmallMatrix', null, '\\Vert', '\\Vert'],
                            crampedsubarray: [
                                'Array',
                                null,
                                null,
                                null,
                                null,
                                '0em',
                                '0.1em',
                                "S'",
                                1,
                            ],
                            multlined: 'MtMultlined',
                            spreadlines: ['SpreadLines', !0],
                            lgathered: ['AmsEqnArray', null, null, null, 'l', null, '.5em', 'D'],
                            rgathered: ['AmsEqnArray', null, null, null, 'r', null, '.5em', 'D'],
                        },
                        s.MathtoolsMethods,
                    ),
                    new a.DelimiterMap('mathtools-delimiters', o.default.delimiter, {
                        '\\lparen': '(',
                        '\\rparen': ')',
                    }),
                    new a.CommandMap(
                        'mathtools-characters',
                        { ':': ['CenterColon', !0] },
                        s.MathtoolsMethods,
                    );
            },
            8155: function (t, e, r) {
                var n =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (n =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                n.apply(this, arguments)
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathtoolsMethods = void 0);
                var s = i(r(7702)),
                    l = r(2684),
                    c = i(r(724)),
                    u = i(r(810)),
                    p = i(r(3466)),
                    d = i(r(8321)),
                    f = r(8921),
                    h = r(6914),
                    m = r(9077),
                    g = i(r(5282)),
                    y = i(r(8562)),
                    v = r(885);
                e.MathtoolsMethods = {
                    MtMatrix: function (t, r, n, o) {
                        var a = t.GetBrackets('\\begin{'.concat(r.getName(), '}'), 'c');
                        return e.MathtoolsMethods.Array(t, r, n, o, a);
                    },
                    MtSmallMatrix: function (t, r, n, o, a) {
                        return (
                            a ||
                                (a = t.GetBrackets(
                                    '\\begin{'.concat(r.getName(), '}'),
                                    t.options.mathtools['smallmatrix-align'],
                                )),
                            e.MathtoolsMethods.Array(
                                t,
                                r,
                                n,
                                o,
                                a,
                                s.default.Em(1 / 3),
                                '.2em',
                                'S',
                                1,
                            )
                        );
                    },
                    MtMultlined: function (t, e) {
                        var r,
                            n = '\\begin{'.concat(e.getName(), '}'),
                            a = t.GetBrackets(n, t.options.mathtools['multlined-pos'] || 'c'),
                            i = a ? t.GetBrackets(n, '') : '';
                        a && !a.match(/^[cbt]$/) && ((i = (r = o([a, i], 2))[0]), (a = r[1])),
                            t.Push(e);
                        var l = t.itemFactory.create('multlined', t, e);
                        return (
                            (l.arraydef = {
                                displaystyle: !0,
                                rowspacing: '.5em',
                                width: i || 'auto',
                                columnwidth: '100%',
                            }),
                            s.default.setArrayAlign(l, a || 'c')
                        );
                    },
                    HandleShove: function (t, e, r) {
                        var n = t.stack.Top();
                        if ('multline' !== n.kind && 'multlined' !== n.kind)
                            throw new p.default(
                                'CommandInMultlined',
                                '%1 can only appear within the multline or multlined environments',
                                e,
                            );
                        if (n.Size())
                            throw new p.default(
                                'CommandAtTheBeginingOfLine',
                                '%1 must come at the beginning of the line',
                                e,
                            );
                        n.setProperty('shove', r);
                        var o = t.GetBrackets(e),
                            a = t.ParseArg(e);
                        if (o) {
                            var i = t.create('node', 'mrow', []),
                                s = t.create('node', 'mspace', [], { width: o });
                            'left' === r
                                ? (i.appendChild(s), i.appendChild(a))
                                : (i.appendChild(a), i.appendChild(s)),
                                (a = i);
                        }
                        t.Push(a);
                    },
                    SpreadLines: function (t, e) {
                        var r, n;
                        if (t.stack.env.closing === e.getName()) {
                            delete t.stack.env.closing;
                            var o = t.stack.Pop(),
                                i = o.toMml(),
                                s = o.getProperty('spread');
                            if (i.isInferred)
                                try {
                                    for (
                                        var l = a(d.default.getChildren(i)), c = l.next();
                                        !c.done;
                                        c = l.next()
                                    ) {
                                        var u = c.value;
                                        v.MathtoolsUtil.spreadLines(u, s);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (n = l.return) && n.call(l);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            else v.MathtoolsUtil.spreadLines(i, s);
                            t.Push(i);
                        } else {
                            s = t.GetDimen('\\begin{'.concat(e.getName(), '}'));
                            e.setProperty('spread', s), t.Push(e);
                        }
                    },
                    Cases: function (t, e, r, n, o) {
                        var a = t.itemFactory.create('array').setProperty('casesEnv', e.getName());
                        return (
                            (a.arraydef = {
                                rowspacing: '.2em',
                                columnspacing: '1em',
                                columnalign: 'left',
                            }),
                            'D' === o && (a.arraydef.displaystyle = !0),
                            a.setProperties({ open: r, close: n }),
                            t.Push(e),
                            a
                        );
                    },
                    MathLap: function (t, e, r, o) {
                        var a = t.GetBrackets(e, '').trim(),
                            i = t.create(
                                'node',
                                'mstyle',
                                [
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [t.ParseArg(e)],
                                        n(
                                            { width: 0 },
                                            'r' === r
                                                ? {}
                                                : { lspace: 'l' === r ? '-1width' : '-.5width' },
                                        ),
                                    ),
                                ],
                                { 'data-cramped': o },
                            );
                        v.MathtoolsUtil.setDisplayLevel(i, a),
                            t.Push(t.create('node', 'TeXAtom', [i]));
                    },
                    Cramped: function (t, e) {
                        var r = t.GetBrackets(e, '').trim(),
                            n = t.ParseArg(e),
                            o = t.create('node', 'mstyle', [n], { 'data-cramped': !0 });
                        v.MathtoolsUtil.setDisplayLevel(o, r), t.Push(o);
                    },
                    MtLap: function (t, e, r) {
                        var n = s.default.internalMath(t, t.GetArgument(e), 0),
                            o = t.create('node', 'mpadded', n, { width: 0 });
                        'r' !== r &&
                            d.default.setAttribute(o, 'lspace', 'l' === r ? '-1width' : '-.5width'),
                            t.Push(o);
                    },
                    MathMakeBox: function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetBrackets(e, 'c'),
                            o = t.create('node', 'mpadded', [t.ParseArg(e)]);
                        r && d.default.setAttribute(o, 'width', r);
                        var a = (0, m.lookup)(n, { c: 'center', r: 'right' }, '');
                        a && d.default.setAttribute(o, 'data-align', a), t.Push(o);
                    },
                    MathMBox: function (t, e) {
                        t.Push(t.create('node', 'mrow', [t.ParseArg(e)]));
                    },
                    UnderOverBracket: function (t, e) {
                        var r = (0, h.length2em)(t.GetBrackets(e, '.1em'), 0.1),
                            n = t.GetBrackets(e, '.2em'),
                            a = t.GetArgument(e),
                            i = o(
                                'o' === e.charAt(1)
                                    ? ['over', 'accent', 'bottom']
                                    : ['under', 'accentunder', 'top'],
                                3,
                            ),
                            l = i[0],
                            c = i[1],
                            p = i[2],
                            f = (0, h.em)(r),
                            m = new u.default(a, t.stack.env, t.configuration).mml(),
                            g = new u.default(a, t.stack.env, t.configuration).mml(),
                            y = t.create('node', 'mpadded', [t.create('node', 'mphantom', [g])], {
                                style: 'border: '.concat(f, ' solid; border-').concat(p, ': none'),
                                height: n,
                                depth: 0,
                            }),
                            v = s.default.underOver(t, m, y, l, !0),
                            b = d.default.getChildAt(d.default.getChildAt(v, 0), 0);
                        d.default.setAttribute(b, c, !0), t.Push(v);
                    },
                    Aboxed: function (t, e) {
                        var r = v.MathtoolsUtil.checkAlignment(t, e);
                        r.row.length % 2 == 1 && r.row.push(t.create('node', 'mtd', []));
                        var n = t.GetArgument(e),
                            o = t.string.substr(t.i);
                        (t.string = n + '&&\\endAboxed'), (t.i = 0);
                        var a = t.GetUpTo(e, '&'),
                            i = t.GetUpTo(e, '&');
                        t.GetUpTo(e, '\\endAboxed');
                        var l = s.default.substituteArgs(
                            t,
                            [a, i],
                            '\\rlap{\\boxed{#1{}#2}}\\kern.267em\\phantom{#1}&\\phantom{{}#2}\\kern.267em',
                        );
                        (t.string = l + o), (t.i = 0);
                    },
                    ArrowBetweenLines: function (t, e) {
                        var r = v.MathtoolsUtil.checkAlignment(t, e);
                        if (r.Size() || r.row.length)
                            throw new p.default('BetweenLines', '%1 must be on a row by itself', e);
                        var n = t.GetStar(),
                            o = t.GetBrackets(e, '\\Updownarrow');
                        n && (r.EndEntry(), r.EndEntry());
                        var a = n ? '\\quad' + o : o + '\\quad',
                            i = new u.default(a, t.stack.env, t.configuration).mml();
                        t.Push(i), r.EndEntry(), r.EndRow();
                    },
                    VDotsWithin: function (t, e) {
                        var r = t.stack.Top(),
                            o = r.getProperty('flushspaceabove') === r.table.length,
                            a = '\\mmlToken{mi}{}' + t.GetArgument(e) + '\\mmlToken{mi}{}',
                            i = new u.default(a, t.stack.env, t.configuration).mml(),
                            s = t.create(
                                'node',
                                'mpadded',
                                [
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [t.create('node', 'mo', [t.create('text', '\u22ee')])],
                                        n(
                                            { width: 0, lspace: '-.5width' },
                                            o ? { height: '-.6em', voffset: '-.18em' } : {},
                                        ),
                                    ),
                                    t.create('node', 'mphantom', [i]),
                                ],
                                { lspace: '.5width' },
                            );
                        t.Push(s);
                    },
                    ShortVDotsWithin: function (t, r) {
                        var n = t.stack.Top(),
                            o = t.GetStar();
                        e.MathtoolsMethods.FlushSpaceAbove(t, '\\MTFlushSpaceAbove'),
                            !o && n.EndEntry(),
                            e.MathtoolsMethods.VDotsWithin(t, '\\vdotswithin'),
                            o && n.EndEntry(),
                            e.MathtoolsMethods.FlushSpaceBelow(t, '\\MTFlushSpaceBelow');
                    },
                    FlushSpaceAbove: function (t, e) {
                        var r = v.MathtoolsUtil.checkAlignment(t, e);
                        r.setProperty('flushspaceabove', r.table.length),
                            r.addRowSpacing('-' + t.options.mathtools.shortvdotsadjustabove);
                    },
                    FlushSpaceBelow: function (t, e) {
                        var r = v.MathtoolsUtil.checkAlignment(t, e);
                        r.Size() && r.EndEntry(),
                            r.EndRow(),
                            r.addRowSpacing('-' + t.options.mathtools.shortvdotsadjustbelow);
                    },
                    PairedDelimiters: function (t, e, r, n, a, i, l, c) {
                        void 0 === a && (a = '#1'),
                            void 0 === i && (i = 1),
                            void 0 === l && (l = ''),
                            void 0 === c && (c = '');
                        var u = t.GetStar(),
                            p = u ? '' : t.GetBrackets(e),
                            d = o(u ? ['\\left', '\\right'] : p ? [p + 'l', p + 'r'] : ['', ''], 2),
                            f = d[0],
                            h = d[1],
                            m = u ? '\\middle' : p || '';
                        if (i) {
                            for (var g = [], y = g.length; y < i; y++) g.push(t.GetArgument(e));
                            (l = s.default.substituteArgs(t, g, l)),
                                (a = s.default.substituteArgs(t, g, a)),
                                (c = s.default.substituteArgs(t, g, c));
                        }
                        (a = a.replace(/\\delimsize/g, m)),
                            (t.string = [l, f, r, a, h, n, c, t.string.substr(t.i)].reduce(
                                function (e, r) {
                                    return s.default.addArgs(t, e, r);
                                },
                                '',
                            )),
                            (t.i = 0),
                            s.default.checkMaxMacros(t);
                    },
                    DeclarePairedDelimiter: function (t, e) {
                        var r = g.default.GetCsNameArgument(t, e),
                            n = t.GetArgument(e),
                            o = t.GetArgument(e);
                        v.MathtoolsUtil.addPairedDelims(t.configuration, r, [n, o]);
                    },
                    DeclarePairedDelimiterX: function (t, e) {
                        var r = g.default.GetCsNameArgument(t, e),
                            n = g.default.GetArgCount(t, e),
                            o = t.GetArgument(e),
                            a = t.GetArgument(e),
                            i = t.GetArgument(e);
                        v.MathtoolsUtil.addPairedDelims(t.configuration, r, [o, a, i, n]);
                    },
                    DeclarePairedDelimiterXPP: function (t, e) {
                        var r = g.default.GetCsNameArgument(t, e),
                            n = g.default.GetArgCount(t, e),
                            o = t.GetArgument(e),
                            a = t.GetArgument(e),
                            i = t.GetArgument(e),
                            s = t.GetArgument(e),
                            l = t.GetArgument(e);
                        v.MathtoolsUtil.addPairedDelims(t.configuration, r, [a, i, l, n, o, s]);
                    },
                    CenterColon: function (t, e, r, o, a) {
                        void 0 === o && (o = !1), void 0 === a && (a = !1);
                        var i = t.options.mathtools,
                            s = t.create('token', 'mo', {}, ':');
                        if (r && (i.centercolon || o)) {
                            var l = i['centercolon-offset'];
                            s = t.create(
                                'node',
                                'mpadded',
                                [s],
                                n(
                                    { voffset: l, height: '+'.concat(l), depth: '-'.concat(l) },
                                    a
                                        ? { width: i['thincolon-dw'], lspace: i['thincolon-dx'] }
                                        : {},
                                ),
                            );
                        }
                        t.Push(s);
                    },
                    Relation: function (t, e, r, n) {
                        t.options.mathtools['use-unicode'] && n
                            ? t.Push(t.create('token', 'mo', { texClass: f.TEXCLASS.REL }, n))
                            : ((r =
                                  '\\mathrel{' +
                                  r.replace(/:/g, '\\MTThinColon').replace(/-/g, '\\mathrel{-}') +
                                  '}'),
                              (t.string = s.default.addArgs(t, r, t.string.substr(t.i))),
                              (t.i = 0));
                    },
                    NArrow: function (t, e, r, n) {
                        t.Push(
                            t.create(
                                'node',
                                'TeXAtom',
                                [
                                    t.create('token', 'mtext', {}, r),
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [
                                            t.create(
                                                'node',
                                                'mpadded',
                                                [
                                                    t.create(
                                                        'node',
                                                        'menclose',
                                                        [
                                                            t.create('node', 'mspace', [], {
                                                                height: '.2em',
                                                                depth: 0,
                                                                width: '.4em',
                                                            }),
                                                        ],
                                                        {
                                                            notation: 'updiagonalstrike',
                                                            'data-thickness': '.05em',
                                                            'data-padding': 0,
                                                        },
                                                    ),
                                                ],
                                                { width: 0, lspace: '-.5width', voffset: n },
                                            ),
                                            t.create('node', 'mphantom', [
                                                t.create('token', 'mtext', {}, r),
                                            ]),
                                        ],
                                        { width: 0, lspace: '-.5width' },
                                    ),
                                ],
                                { texClass: f.TEXCLASS.REL },
                            ),
                        );
                    },
                    SplitFrac: function (t, e, r) {
                        var n = t.ParseArg(e),
                            o = t.ParseArg(e);
                        t.Push(
                            t.create(
                                'node',
                                'mstyle',
                                [
                                    t.create(
                                        'node',
                                        'mfrac',
                                        [
                                            t.create(
                                                'node',
                                                'mstyle',
                                                [
                                                    n,
                                                    t.create('token', 'mi'),
                                                    t.create('token', 'mspace', { width: '1em' }),
                                                ],
                                                { scriptlevel: 0 },
                                            ),
                                            t.create(
                                                'node',
                                                'mstyle',
                                                [
                                                    t.create('token', 'mspace', { width: '1em' }),
                                                    t.create('token', 'mi'),
                                                    o,
                                                ],
                                                { scriptlevel: 0 },
                                            ),
                                        ],
                                        { linethickness: 0, numalign: 'left', denomalign: 'right' },
                                    ),
                                ],
                                { displaystyle: r, scriptlevel: 0 },
                            ),
                        );
                    },
                    XMathStrut: function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetArgument(e);
                        (n = v.MathtoolsUtil.plusOrMinus(e, n)),
                            (r = v.MathtoolsUtil.plusOrMinus(e, r || n)),
                            t.Push(
                                t.create(
                                    'node',
                                    'TeXAtom',
                                    [
                                        t.create(
                                            'node',
                                            'mpadded',
                                            [
                                                t.create('node', 'mphantom', [
                                                    t.create('token', 'mo', { stretchy: !1 }, '('),
                                                ]),
                                            ],
                                            { width: 0, height: n + 'height', depth: r + 'depth' },
                                        ),
                                    ],
                                    { texClass: f.TEXCLASS.ORD },
                                ),
                            );
                    },
                    Prescript: function (t, e) {
                        var r = v.MathtoolsUtil.getScript(t, e, 'sup'),
                            n = v.MathtoolsUtil.getScript(t, e, 'sub'),
                            o = v.MathtoolsUtil.getScript(t, e, 'arg');
                        if (d.default.isType(r, 'none') && d.default.isType(n, 'none')) t.Push(o);
                        else {
                            var a = t.create('node', 'mmultiscripts', [o]);
                            d.default.getChildren(a).push(null, null),
                                d.default.appendChildren(a, [
                                    t.create('node', 'mprescripts'),
                                    n,
                                    r,
                                ]),
                                a.setProperty('fixPrescript', !0),
                                t.Push(a);
                        }
                    },
                    NewTagForm: function (t, e, r) {
                        void 0 === r && (r = !1);
                        var n = t.tags;
                        if (!('mtFormats' in n))
                            throw new p.default(
                                'TagsNotMT',
                                '%1 can only be used with ams or mathtools tags',
                                e,
                            );
                        var o = t.GetArgument(e).trim();
                        if (!o)
                            throw new p.default('InvalidTagFormID', "Tag form name can't be empty");
                        var a = t.GetBrackets(e, ''),
                            i = t.GetArgument(e),
                            s = t.GetArgument(e);
                        if (!r && n.mtFormats.has(o))
                            throw new p.default('DuplicateTagForm', 'Duplicate tag form: %1', o);
                        n.mtFormats.set(o, [i, s, a]);
                    },
                    UseTagForm: function (t, e) {
                        var r = t.tags;
                        if (!('mtFormats' in r))
                            throw new p.default(
                                'TagsNotMT',
                                '%1 can only be used with ams or mathtools tags',
                                e,
                            );
                        var n = t.GetArgument(e).trim();
                        if (n) {
                            if (!r.mtFormats.has(n))
                                throw new p.default(
                                    'UndefinedTagForm',
                                    'Undefined tag form: %1',
                                    n,
                                );
                            r.mtCurrent = r.mtFormats.get(n);
                        } else r.mtCurrent = null;
                    },
                    SetOptions: function (t, e) {
                        var r,
                            n,
                            o = t.options.mathtools;
                        if (!o['allow-mathtoolsset'])
                            throw new p.default('ForbiddenMathtoolsSet', '%1 is disabled', e);
                        var i = {};
                        Object.keys(o).forEach(function (t) {
                            'pariedDelimiters' !== t &&
                                'tagforms' !== t &&
                                'allow-mathtoolsset' !== t &&
                                (i[t] = 1);
                        });
                        var l = t.GetArgument(e),
                            c = s.default.keyvalOptions(l, i, !0);
                        try {
                            for (var u = a(Object.keys(c)), d = u.next(); !d.done; d = u.next()) {
                                var f = d.value;
                                o[f] = c[f];
                            }
                        } catch (t) {
                            r = { error: t };
                        } finally {
                            try {
                                d && !d.done && (n = u.return) && n.call(u);
                            } finally {
                                if (r) throw r.error;
                            }
                        }
                    },
                    Array: c.default.Array,
                    Macro: c.default.Macro,
                    xArrow: l.AmsMethods.xArrow,
                    HandleRef: l.AmsMethods.HandleRef,
                    AmsEqnArray: l.AmsMethods.AmsEqnArray,
                    MacroWithTemplate: y.default.MacroWithTemplate,
                };
            },
            1331: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
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
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathtoolsTagFormat = void 0);
                var l = s(r(3466)),
                    c = r(7251),
                    u = 0;
                e.MathtoolsTagFormat = function (t, e) {
                    var r = e.parseOptions.options.tags;
                    'base' !== r && t.tags.hasOwnProperty(r) && c.TagsFactory.add(r, t.tags[r]);
                    var n = (function (t) {
                            function r() {
                                var r,
                                    n,
                                    o = t.call(this) || this;
                                (o.mtFormats = new Map()), (o.mtCurrent = null);
                                var i = e.parseOptions.options.mathtools.tagforms;
                                try {
                                    for (
                                        var s = a(Object.keys(i)), c = s.next();
                                        !c.done;
                                        c = s.next()
                                    ) {
                                        var u = c.value;
                                        if (!Array.isArray(i[u]) || 3 !== i[u].length)
                                            throw new l.default(
                                                'InvalidTagFormDef',
                                                'The tag form definition for "%1" should be an array fo three strings',
                                                u,
                                            );
                                        o.mtFormats.set(u, i[u]);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (n = s.return) && n.call(s);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                                return o;
                            }
                            return (
                                o(r, t),
                                (r.prototype.formatTag = function (e) {
                                    if (this.mtCurrent) {
                                        var r = i(this.mtCurrent, 3),
                                            n = r[0],
                                            o = r[1],
                                            a = r[2];
                                        return a
                                            ? ''.concat(n).concat(a, '{').concat(e, '}').concat(o)
                                            : ''.concat(n).concat(e).concat(o);
                                    }
                                    return t.prototype.formatTag.call(this, e);
                                }),
                                r
                            );
                        })(c.TagsFactory.create(e.parseOptions.options.tags).constructor),
                        s = 'MathtoolsTags-' + ++u;
                    c.TagsFactory.add(s, n), (e.parseOptions.options.tags = s);
                };
            },
            885: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MathtoolsUtil = void 0);
                var a = r(8389),
                    i = o(r(7702)),
                    s = o(r(810)),
                    l = o(r(3466)),
                    c = r(4237),
                    u = r(9077),
                    p = r(8155),
                    d = r(856);
                e.MathtoolsUtil = {
                    setDisplayLevel: function (t, e) {
                        if (e) {
                            var r = n(
                                    (0, u.lookup)(
                                        e,
                                        {
                                            '\\displaystyle': [!0, 0],
                                            '\\textstyle': [!1, 0],
                                            '\\scriptstyle': [!1, 1],
                                            '\\scriptscriptstyle': [!1, 2],
                                        },
                                        [null, null],
                                    ),
                                    2,
                                ),
                                o = r[0],
                                a = r[1];
                            null !== o &&
                                (t.attributes.set('displaystyle', o),
                                t.attributes.set('scriptlevel', a));
                        }
                    },
                    checkAlignment: function (t, e) {
                        var r = t.stack.Top();
                        if (r.kind !== a.EqnArrayItem.prototype.kind)
                            throw new l.default(
                                'NotInAlignment',
                                '%1 can only be used in aligment environments',
                                e,
                            );
                        return r;
                    },
                    addPairedDelims: function (t, e, r) {
                        t.handlers
                            .retrieve(d.PAIREDDELIMS)
                            .add(e, new c.Macro(e, p.MathtoolsMethods.PairedDelimiters, r));
                    },
                    spreadLines: function (t, e) {
                        if (t.isKind('mtable')) {
                            var r = t.attributes.get('rowspacing');
                            if (r) {
                                var n = i.default.dimen2em(e);
                                r = r
                                    .split(/ /)
                                    .map(function (t) {
                                        return i.default.Em(Math.max(0, i.default.dimen2em(t) + n));
                                    })
                                    .join(' ');
                            } else r = e;
                            t.attributes.set('rowspacing', r);
                        }
                    },
                    plusOrMinus: function (t, e) {
                        if (!(e = e.trim()).match(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/))
                            throw new l.default('NotANumber', 'Argument to %1 is not a number', t);
                        return e.match(/^[-+]/) ? e : '+' + e;
                    },
                    getScript: function (t, e, r) {
                        var n = i.default.trimSpaces(t.GetArgument(e));
                        if ('' === n) return t.create('node', 'none');
                        var o = t.options.mathtools['prescript-'.concat(r, '-format')];
                        return (
                            o && (n = ''.concat(o, '{').concat(n, '}')),
                            new s.default(n, t.stack.env, t.configuration).mml()
                        );
                    },
                };
            },
            1323: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MhchemConfiguration = void 0);
                var o = r(6552),
                    a = r(7628),
                    i = n(r(3466)),
                    s = n(r(724)),
                    l = r(2684),
                    c = r(7865),
                    u = {};
                (u.Macro = s.default.Macro),
                    (u.xArrow = l.AmsMethods.xArrow),
                    (u.Machine = function (t, e, r) {
                        var n,
                            o = t.GetArgument(e);
                        try {
                            n = c.mhchemParser.toTex(o, r);
                        } catch (t) {
                            throw new i.default(t[0], t[1]);
                        }
                        (t.string = n + t.string.substr(t.i)), (t.i = 0);
                    }),
                    new a.CommandMap(
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
                        u,
                    ),
                    (e.MhchemConfiguration = o.Configuration.create('mhchem', {
                        handler: { macro: ['mhchem'] },
                    }));
            },
            2200: function (t, e, r) {
                var n,
                    o =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, o);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
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
                            return a(e, t), e;
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NewcommandConfiguration = void 0);
                var l = r(6552),
                    c = r(6706),
                    u = s(r(5282));
                r(6823);
                var p = s(r(4708)),
                    d = i(r(7628));
                e.NewcommandConfiguration = l.Configuration.create('newcommand', {
                    handler: { macro: ['Newcommand-macros'] },
                    items: ((n = {}), (n[c.BeginEnvItem.prototype.kind] = c.BeginEnvItem), n),
                    options: { maxMacros: 1e3 },
                    init: function (t) {
                        new d.DelimiterMap(u.default.NEW_DELIMITER, p.default.delimiter, {}),
                            new d.CommandMap(u.default.NEW_COMMAND, {}, {}),
                            new d.EnvironmentMap(
                                u.default.NEW_ENVIRONMENT,
                                p.default.environment,
                                {},
                                {},
                            ),
                            t.append(
                                l.Configuration.local({
                                    handler: {
                                        character: [],
                                        delimiter: [u.default.NEW_DELIMITER],
                                        macro: [u.default.NEW_DELIMITER, u.default.NEW_COMMAND],
                                        environment: [u.default.NEW_ENVIRONMENT],
                                    },
                                    priority: -1,
                                }),
                            );
                    },
                });
            },
            6706: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.BeginEnvItem = void 0);
                var i = a(r(3466)),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'beginEnv';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isOpen', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (e) {
                                if (e.isKind('end')) {
                                    if (e.getName() !== this.getName())
                                        throw new i.default(
                                            'EnvBadEnd',
                                            '\\begin{%1} ended with \\end{%2}',
                                            this.getName(),
                                            e.getName(),
                                        );
                                    return [[this.factory.create('mml', this.toMml())], !0];
                                }
                                if (e.isKind('stop'))
                                    throw new i.default(
                                        'EnvMissingEnd',
                                        'Missing \\end{%1}',
                                        this.getName(),
                                    );
                                return t.prototype.checkItem.call(this, e);
                            }),
                            e
                        );
                    })(r(7044).BaseItem);
                e.BeginEnvItem = s;
            },
            6823: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = n(r(8562));
                new (r(7628).CommandMap)(
                    'Newcommand-macros',
                    {
                        newcommand: 'NewCommand',
                        renewcommand: 'NewCommand',
                        newenvironment: 'NewEnvironment',
                        renewenvironment: 'NewEnvironment',
                        def: 'MacroDef',
                        let: 'Let',
                    },
                    o.default,
                );
            },
            8562: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, o);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    o =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    a =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return o(e, t), e;
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = i(r(3466)),
                    l = a(r(7628)),
                    c = i(r(724)),
                    u = i(r(7702)),
                    p = i(r(5282)),
                    d = {
                        NewCommand: function (t, e) {
                            var r = p.default.GetCsNameArgument(t, e),
                                n = p.default.GetArgCount(t, e),
                                o = t.GetBrackets(e),
                                a = t.GetArgument(e);
                            p.default.addMacro(t, r, d.Macro, [a, n, o]);
                        },
                        NewEnvironment: function (t, e) {
                            var r = u.default.trimSpaces(t.GetArgument(e)),
                                n = p.default.GetArgCount(t, e),
                                o = t.GetBrackets(e),
                                a = t.GetArgument(e),
                                i = t.GetArgument(e);
                            p.default.addEnvironment(t, r, d.BeginEnv, [!0, a, i, n, o]);
                        },
                        MacroDef: function (t, e) {
                            var r = p.default.GetCSname(t, e),
                                n = p.default.GetTemplate(t, e, '\\' + r),
                                o = t.GetArgument(e);
                            n instanceof Array
                                ? p.default.addMacro(t, r, d.MacroWithTemplate, [o].concat(n))
                                : p.default.addMacro(t, r, d.Macro, [o, n]);
                        },
                        Let: function (t, e) {
                            var r = p.default.GetCSname(t, e),
                                n = t.GetNext();
                            '=' === n && (t.i++, (n = t.GetNext()));
                            var o = t.configuration.handlers;
                            if ('\\' !== n) {
                                t.i++;
                                var a = o.get('delimiter').lookup(n);
                                a
                                    ? p.default.addDelimiter(t, '\\' + r, a.char, a.attributes)
                                    : p.default.addMacro(t, r, d.Macro, [n]);
                            } else {
                                e = p.default.GetCSname(t, e);
                                var i = o.get('delimiter').lookup('\\' + e);
                                if (i)
                                    return void p.default.addDelimiter(
                                        t,
                                        '\\' + r,
                                        i.char,
                                        i.attributes,
                                    );
                                var s = o.get('macro').applicable(e);
                                if (!s) return;
                                if (s instanceof l.MacroMap) {
                                    var c = s.lookup(e);
                                    return void p.default.addMacro(t, r, c.func, c.args, c.symbol);
                                }
                                i = s.lookup(e);
                                var u = p.default.disassembleSymbol(r, i);
                                p.default.addMacro(
                                    t,
                                    r,
                                    function (t, e) {
                                        for (var r = [], n = 2; n < arguments.length; n++)
                                            r[n - 2] = arguments[n];
                                        var o = p.default.assembleSymbol(r);
                                        return s.parser(t, o);
                                    },
                                    u,
                                );
                            }
                        },
                        MacroWithTemplate: function (t, e, r, n) {
                            for (var o = [], a = 4; a < arguments.length; a++)
                                o[a - 4] = arguments[a];
                            var i = parseInt(n, 10);
                            if (i) {
                                var l = [];
                                if ((t.GetNext(), o[0] && !p.default.MatchParam(t, o[0])))
                                    throw new s.default(
                                        'MismatchUseDef',
                                        "Use of %1 doesn't match its definition",
                                        e,
                                    );
                                for (var c = 0; c < i; c++)
                                    l.push(p.default.GetParameter(t, e, o[c + 1]));
                                r = u.default.substituteArgs(t, l, r);
                            }
                            (t.string = u.default.addArgs(t, r, t.string.slice(t.i))),
                                (t.i = 0),
                                u.default.checkMaxMacros(t);
                        },
                        BeginEnv: function (t, e, r, n, o, a) {
                            if (e.getProperty('end') && t.stack.env.closing === e.getName()) {
                                delete t.stack.env.closing;
                                var i = t.string.slice(t.i);
                                return (
                                    (t.string = n),
                                    (t.i = 0),
                                    t.Parse(),
                                    (t.string = i),
                                    (t.i = 0),
                                    t.itemFactory.create('end').setProperty('name', e.getName())
                                );
                            }
                            if (o) {
                                var s = [];
                                if (null != a) {
                                    var l = t.GetBrackets('\\begin{' + e.getName() + '}');
                                    s.push(null == l ? a : l);
                                }
                                for (var c = s.length; c < o; c++)
                                    s.push(t.GetArgument('\\begin{' + e.getName() + '}'));
                                (r = u.default.substituteArgs(t, s, r)),
                                    (n = u.default.substituteArgs(t, [], n));
                            }
                            return (
                                (t.string = u.default.addArgs(t, r, t.string.slice(t.i))),
                                (t.i = 0),
                                t.itemFactory.create('beginEnv').setProperty('name', e.getName())
                            );
                        },
                    };
                (d.Macro = c.default.Macro), (e.default = d);
            },
            5282: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o,
                    a = n(r(7702)),
                    i = n(r(3466)),
                    s = r(4237);
                !(function (t) {
                    function e(t, e) {
                        return t.string.substr(t.i, e.length) !== e ||
                            (e.match(/\\[a-z]+$/i) &&
                                t.string.charAt(t.i + e.length).match(/[a-z]/i))
                            ? 0
                            : ((t.i += e.length), 1);
                    }
                    (t.disassembleSymbol = function (t, e) {
                        var r = [t, e.char];
                        if (e.attributes)
                            for (var n in e.attributes) r.push(n), r.push(e.attributes[n]);
                        return r;
                    }),
                        (t.assembleSymbol = function (t) {
                            for (var e = t[0], r = t[1], n = {}, o = 2; o < t.length; o += 2)
                                n[t[o]] = t[o + 1];
                            return new s.Symbol(e, r, n);
                        }),
                        (t.GetCSname = function (t, e) {
                            if ('\\' !== t.GetNext())
                                throw new i.default(
                                    'MissingCS',
                                    '%1 must be followed by a control sequence',
                                    e,
                                );
                            return a.default.trimSpaces(t.GetArgument(e)).substr(1);
                        }),
                        (t.GetCsNameArgument = function (t, e) {
                            var r = a.default.trimSpaces(t.GetArgument(e));
                            if (
                                ('\\' === r.charAt(0) && (r = r.substr(1)),
                                !r.match(/^(.|[a-z]+)$/i))
                            )
                                throw new i.default(
                                    'IllegalControlSequenceName',
                                    'Illegal control sequence name for %1',
                                    e,
                                );
                            return r;
                        }),
                        (t.GetArgCount = function (t, e) {
                            var r = t.GetBrackets(e);
                            if (r && !(r = a.default.trimSpaces(r)).match(/^[0-9]+$/))
                                throw new i.default(
                                    'IllegalParamNumber',
                                    'Illegal number of parameters specified in %1',
                                    e,
                                );
                            return r;
                        }),
                        (t.GetTemplate = function (t, e, r) {
                            for (
                                var n = t.GetNext(), o = [], a = 0, s = t.i;
                                t.i < t.string.length;

                            ) {
                                if ('#' === (n = t.GetNext())) {
                                    if (
                                        (s !== t.i && (o[a] = t.string.substr(s, t.i - s)),
                                        !(n = t.string.charAt(++t.i)).match(/^[1-9]$/))
                                    )
                                        throw new i.default(
                                            'CantUseHash2',
                                            'Illegal use of # in template for %1',
                                            r,
                                        );
                                    if (parseInt(n) !== ++a)
                                        throw new i.default(
                                            'SequentialParam',
                                            'Parameters for %1 must be numbered sequentially',
                                            r,
                                        );
                                    s = t.i + 1;
                                } else if ('{' === n)
                                    return (
                                        s !== t.i && (o[a] = t.string.substr(s, t.i - s)),
                                        o.length > 0 ? [a.toString()].concat(o) : a
                                    );
                                t.i++;
                            }
                            throw new i.default(
                                'MissingReplacementString',
                                'Missing replacement string for definition of %1',
                                e,
                            );
                        }),
                        (t.GetParameter = function (t, r, n) {
                            if (null == n) return t.GetArgument(r);
                            for (var o = t.i, a = 0, s = 0; t.i < t.string.length; ) {
                                var l = t.string.charAt(t.i);
                                if ('{' === l)
                                    t.i === o && (s = 1), t.GetArgument(r), (a = t.i - o);
                                else {
                                    if (e(t, n)) return s && (o++, (a -= 2)), t.string.substr(o, a);
                                    if ('\\' === l) {
                                        t.i++, a++, (s = 0);
                                        var c = t.string.substr(t.i).match(/[a-z]+|./i);
                                        c && ((t.i += c[0].length), (a = t.i - o));
                                    } else t.i++, a++, (s = 0);
                                }
                            }
                            throw new i.default('RunawayArgument', 'Runaway argument for %1?', r);
                        }),
                        (t.MatchParam = e),
                        (t.addDelimiter = function (e, r, n, o) {
                            e.configuration.handlers
                                .retrieve(t.NEW_DELIMITER)
                                .add(r, new s.Symbol(r, n, o));
                        }),
                        (t.addMacro = function (e, r, n, o, a) {
                            void 0 === a && (a = ''),
                                e.configuration.handlers
                                    .retrieve(t.NEW_COMMAND)
                                    .add(r, new s.Macro(a || r, n, o));
                        }),
                        (t.addEnvironment = function (e, r, n, o) {
                            e.configuration.handlers
                                .retrieve(t.NEW_ENVIRONMENT)
                                .add(r, new s.Macro(r, n, o));
                        }),
                        (t.NEW_DELIMITER = 'new-Delimiter'),
                        (t.NEW_COMMAND = 'new-Command'),
                        (t.NEW_ENVIRONMENT = 'new-Environment');
                })(o || (o = {})),
                    (e.default = o);
            },
            9569: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NoErrorsConfiguration = void 0);
                var n = r(6552);
                e.NoErrorsConfiguration = n.Configuration.create('noerrors', {
                    nodes: {
                        error: function (t, e, r, n) {
                            var o = t.create('token', 'mtext', {}, n.replace(/\n/g, ' '));
                            return t.create('node', 'merror', [o], {
                                'data-mjx-error': e,
                                title: e,
                            });
                        },
                    },
                });
            },
            8405: function (t, e, r) {
                var n =
                    (this && this.__values) ||
                    function (t) {
                        var e = 'function' == typeof Symbol && Symbol.iterator,
                            r = e && t[e],
                            n = 0;
                        if (r) return r.call(t);
                        if (t && 'number' == typeof t.length)
                            return {
                                next: function () {
                                    return (
                                        t && n >= t.length && (t = void 0),
                                        { value: t && t[n++], done: !t }
                                    );
                                },
                            };
                        throw new TypeError(
                            e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                        );
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NoUndefinedConfiguration = void 0);
                var o = r(6552);
                e.NoUndefinedConfiguration = o.Configuration.create('noundefined', {
                    fallback: {
                        macro: function (t, e) {
                            var r,
                                o,
                                a = t.create('text', '\\' + e),
                                i = t.options.noundefined || {},
                                s = {};
                            try {
                                for (
                                    var l = n(['color', 'background', 'size']), c = l.next();
                                    !c.done;
                                    c = l.next()
                                ) {
                                    var u = c.value;
                                    i[u] && (s['math' + u] = i[u]);
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
                            t.Push(t.create('node', 'mtext', [], s, a));
                        },
                    },
                    options: { noundefined: { color: 'red', background: '', size: '' } },
                    priority: 3,
                });
            },
            9589: function (t, e, r) {
                var n;
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.PhysicsConfiguration = void 0);
                var o = r(6552),
                    a = r(4996);
                r(8047),
                    (e.PhysicsConfiguration = o.Configuration.create('physics', {
                        handler: {
                            macro: [
                                'Physics-automatic-bracing-macros',
                                'Physics-vector-macros',
                                'Physics-vector-mo',
                                'Physics-vector-mi',
                                'Physics-derivative-macros',
                                'Physics-expressions-macros',
                                'Physics-quick-quad-macros',
                                'Physics-bra-ket-macros',
                                'Physics-matrix-macros',
                            ],
                            character: ['Physics-characters'],
                            environment: ['Physics-aux-envs'],
                        },
                        items: ((n = {}), (n[a.AutoOpen.prototype.kind] = a.AutoOpen), n),
                        options: { physics: { italicdiff: !1, arrowdel: !1 } },
                    }));
            },
            4996: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.AutoOpen = void 0);
                var i = r(7044),
                    s = a(r(7702)),
                    l = a(r(8321)),
                    c = a(r(810)),
                    u = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.openCount = 0), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'auto open';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isOpen', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.toMml = function () {
                                var e = this.factory.configuration.parser,
                                    r = this.getProperty('right');
                                if (this.getProperty('smash')) {
                                    var n = t.prototype.toMml.call(this),
                                        o = e.create('node', 'mpadded', [n], {
                                            height: 0,
                                            depth: 0,
                                        });
                                    this.Clear(), this.Push(e.create('node', 'TeXAtom', [o]));
                                }
                                r &&
                                    this.Push(new c.default(r, e.stack.env, e.configuration).mml());
                                var a = s.default.fenced(
                                    this.factory.configuration,
                                    this.getProperty('open'),
                                    t.prototype.toMml.call(this),
                                    this.getProperty('close'),
                                    this.getProperty('big'),
                                );
                                return (
                                    l.default.removeProperties(a, 'open', 'close', 'texClass'), a
                                );
                            }),
                            (e.prototype.checkItem = function (e) {
                                if (e.isKind('mml') && 1 === e.Size()) {
                                    var r = e.toMml();
                                    r.isKind('mo') &&
                                        r.getText() === this.getProperty('open') &&
                                        this.openCount++;
                                }
                                var n = e.getProperty('autoclose');
                                return n && n === this.getProperty('close') && !this.openCount--
                                    ? this.getProperty('ignore')
                                        ? (this.Clear(), [[], !0])
                                        : [[this.toMml()], !0]
                                    : t.prototype.checkItem.call(this, e);
                            }),
                            (e.errors = Object.assign(Object.create(i.BaseItem.errors), {
                                stop: [
                                    'ExtraOrMissingDelims',
                                    'Extra open or missing close delimiter',
                                ],
                            })),
                            e
                        );
                    })(i.BaseItem);
                e.AutoOpen = u;
            },
            8047: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = r(7628),
                    a = n(r(1541)),
                    i = r(7007),
                    s = n(r(4708)),
                    l = r(8921);
                new o.CommandMap(
                    'Physics-automatic-bracing-macros',
                    {
                        quantity: 'Quantity',
                        qty: 'Quantity',
                        pqty: ['Quantity', '(', ')', !0],
                        bqty: ['Quantity', '[', ']', !0],
                        vqty: ['Quantity', '|', '|', !0],
                        Bqty: ['Quantity', '\\{', '\\}', !0],
                        absolutevalue: ['Quantity', '|', '|', !0],
                        abs: ['Quantity', '|', '|', !0],
                        norm: ['Quantity', '\\|', '\\|', !0],
                        evaluated: 'Eval',
                        eval: 'Eval',
                        order: ['Quantity', '(', ')', !0, 'O', i.TexConstant.Variant.CALLIGRAPHIC],
                        commutator: 'Commutator',
                        comm: 'Commutator',
                        anticommutator: ['Commutator', '\\{', '\\}'],
                        acomm: ['Commutator', '\\{', '\\}'],
                        poissonbracket: ['Commutator', '\\{', '\\}'],
                        pb: ['Commutator', '\\{', '\\}'],
                    },
                    a.default,
                ),
                    new o.CharacterMap('Physics-vector-mo', s.default.mathchar0mo, {
                        dotproduct: ['\u22c5', { mathvariant: i.TexConstant.Variant.BOLD }],
                        vdot: ['\u22c5', { mathvariant: i.TexConstant.Variant.BOLD }],
                        crossproduct: '\xd7',
                        cross: '\xd7',
                        cp: '\xd7',
                        gradientnabla: ['\u2207', { mathvariant: i.TexConstant.Variant.BOLD }],
                    }),
                    new o.CharacterMap('Physics-vector-mi', s.default.mathchar0mi, {
                        real: ['\u211c', { mathvariant: i.TexConstant.Variant.NORMAL }],
                        imaginary: ['\u2111', { mathvariant: i.TexConstant.Variant.NORMAL }],
                    }),
                    new o.CommandMap(
                        'Physics-vector-macros',
                        {
                            vnabla: 'Vnabla',
                            vectorbold: 'VectorBold',
                            vb: 'VectorBold',
                            vectorarrow: ['StarMacro', 1, '\\vec{\\vb', '{#1}}'],
                            va: ['StarMacro', 1, '\\vec{\\vb', '{#1}}'],
                            vectorunit: ['StarMacro', 1, '\\hat{\\vb', '{#1}}'],
                            vu: ['StarMacro', 1, '\\hat{\\vb', '{#1}}'],
                            gradient: ['OperatorApplication', '\\vnabla', '(', '['],
                            grad: ['OperatorApplication', '\\vnabla', '(', '['],
                            divergence: ['VectorOperator', '\\vnabla\\vdot', '(', '['],
                            div: ['VectorOperator', '\\vnabla\\vdot', '(', '['],
                            curl: ['VectorOperator', '\\vnabla\\crossproduct', '(', '['],
                            laplacian: ['OperatorApplication', '\\nabla^2', '(', '['],
                        },
                        a.default,
                    ),
                    new o.CommandMap(
                        'Physics-expressions-macros',
                        {
                            sin: 'Expression',
                            sinh: 'Expression',
                            arcsin: 'Expression',
                            asin: 'Expression',
                            cos: 'Expression',
                            cosh: 'Expression',
                            arccos: 'Expression',
                            acos: 'Expression',
                            tan: 'Expression',
                            tanh: 'Expression',
                            arctan: 'Expression',
                            atan: 'Expression',
                            csc: 'Expression',
                            csch: 'Expression',
                            arccsc: 'Expression',
                            acsc: 'Expression',
                            sec: 'Expression',
                            sech: 'Expression',
                            arcsec: 'Expression',
                            asec: 'Expression',
                            cot: 'Expression',
                            coth: 'Expression',
                            arccot: 'Expression',
                            acot: 'Expression',
                            exp: ['Expression', !1],
                            log: 'Expression',
                            ln: 'Expression',
                            det: ['Expression', !1],
                            Pr: ['Expression', !1],
                            tr: ['Expression', !1],
                            trace: ['Expression', !1, 'tr'],
                            Tr: ['Expression', !1],
                            Trace: ['Expression', !1, 'Tr'],
                            rank: 'NamedFn',
                            erf: ['Expression', !1],
                            Residue: ['Macro', '\\mathrm{Res}'],
                            Res: ['OperatorApplication', '\\Residue', '(', '[', '{'],
                            principalvalue: ['OperatorApplication', '{\\cal P}'],
                            pv: ['OperatorApplication', '{\\cal P}'],
                            PV: ['OperatorApplication', '{\\rm P.V.}'],
                            Re: ['OperatorApplication', '\\mathrm{Re}', '{'],
                            Im: ['OperatorApplication', '\\mathrm{Im}', '{'],
                            sine: ['NamedFn', 'sin'],
                            hypsine: ['NamedFn', 'sinh'],
                            arcsine: ['NamedFn', 'arcsin'],
                            asine: ['NamedFn', 'asin'],
                            cosine: ['NamedFn', 'cos'],
                            hypcosine: ['NamedFn', 'cosh'],
                            arccosine: ['NamedFn', 'arccos'],
                            acosine: ['NamedFn', 'acos'],
                            tangent: ['NamedFn', 'tan'],
                            hyptangent: ['NamedFn', 'tanh'],
                            arctangent: ['NamedFn', 'arctan'],
                            atangent: ['NamedFn', 'atan'],
                            cosecant: ['NamedFn', 'csc'],
                            hypcosecant: ['NamedFn', 'csch'],
                            arccosecant: ['NamedFn', 'arccsc'],
                            acosecant: ['NamedFn', 'acsc'],
                            secant: ['NamedFn', 'sec'],
                            hypsecant: ['NamedFn', 'sech'],
                            arcsecant: ['NamedFn', 'arcsec'],
                            asecant: ['NamedFn', 'asec'],
                            cotangent: ['NamedFn', 'cot'],
                            hypcotangent: ['NamedFn', 'coth'],
                            arccotangent: ['NamedFn', 'arccot'],
                            acotangent: ['NamedFn', 'acot'],
                            exponential: ['NamedFn', 'exp'],
                            logarithm: ['NamedFn', 'log'],
                            naturallogarithm: ['NamedFn', 'ln'],
                            determinant: ['NamedFn', 'det'],
                            Probability: ['NamedFn', 'Pr'],
                        },
                        a.default,
                    ),
                    new o.CommandMap(
                        'Physics-quick-quad-macros',
                        {
                            qqtext: 'Qqtext',
                            qq: 'Qqtext',
                            qcomma: ['Macro', '\\qqtext*{,}'],
                            qc: ['Macro', '\\qqtext*{,}'],
                            qcc: ['Qqtext', 'c.c.'],
                            qif: ['Qqtext', 'if'],
                            qthen: ['Qqtext', 'then'],
                            qelse: ['Qqtext', 'else'],
                            qotherwise: ['Qqtext', 'otherwise'],
                            qunless: ['Qqtext', 'unless'],
                            qgiven: ['Qqtext', 'given'],
                            qusing: ['Qqtext', 'using'],
                            qassume: ['Qqtext', 'assume'],
                            qsince: ['Qqtext', 'since'],
                            qlet: ['Qqtext', 'let'],
                            qfor: ['Qqtext', 'for'],
                            qall: ['Qqtext', 'all'],
                            qeven: ['Qqtext', 'even'],
                            qodd: ['Qqtext', 'odd'],
                            qinteger: ['Qqtext', 'integer'],
                            qand: ['Qqtext', 'and'],
                            qor: ['Qqtext', 'or'],
                            qas: ['Qqtext', 'as'],
                            qin: ['Qqtext', 'in'],
                        },
                        a.default,
                    ),
                    new o.CommandMap(
                        'Physics-derivative-macros',
                        {
                            diffd: 'DiffD',
                            flatfrac: ['Macro', '\\left.#1\\middle/#2\\right.', 2],
                            differential: ['Differential', '\\diffd'],
                            dd: ['Differential', '\\diffd'],
                            variation: ['Differential', '\\delta'],
                            var: ['Differential', '\\delta'],
                            derivative: ['Derivative', 2, '\\diffd'],
                            dv: ['Derivative', 2, '\\diffd'],
                            partialderivative: ['Derivative', 3, '\\partial'],
                            pderivative: ['Derivative', 3, '\\partial'],
                            pdv: ['Derivative', 3, '\\partial'],
                            functionalderivative: ['Derivative', 2, '\\delta'],
                            fderivative: ['Derivative', 2, '\\delta'],
                            fdv: ['Derivative', 2, '\\delta'],
                        },
                        a.default,
                    ),
                    new o.CommandMap(
                        'Physics-bra-ket-macros',
                        {
                            bra: 'Bra',
                            ket: 'Ket',
                            innerproduct: 'BraKet',
                            ip: 'BraKet',
                            braket: 'BraKet',
                            outerproduct: 'KetBra',
                            dyad: 'KetBra',
                            ketbra: 'KetBra',
                            op: 'KetBra',
                            expectationvalue: 'Expectation',
                            expval: 'Expectation',
                            ev: 'Expectation',
                            matrixelement: 'MatrixElement',
                            matrixel: 'MatrixElement',
                            mel: 'MatrixElement',
                        },
                        a.default,
                    ),
                    new o.CommandMap(
                        'Physics-matrix-macros',
                        {
                            matrixquantity: 'MatrixQuantity',
                            mqty: 'MatrixQuantity',
                            pmqty: ['Macro', '\\mqty(#1)', 1],
                            Pmqty: ['Macro', '\\mqty*(#1)', 1],
                            bmqty: ['Macro', '\\mqty[#1]', 1],
                            vmqty: ['Macro', '\\mqty|#1|', 1],
                            smallmatrixquantity: ['MatrixQuantity', !0],
                            smqty: ['MatrixQuantity', !0],
                            spmqty: ['Macro', '\\smqty(#1)', 1],
                            sPmqty: ['Macro', '\\smqty*(#1)', 1],
                            sbmqty: ['Macro', '\\smqty[#1]', 1],
                            svmqty: ['Macro', '\\smqty|#1|', 1],
                            matrixdeterminant: ['Macro', '\\vmqty{#1}', 1],
                            mdet: ['Macro', '\\vmqty{#1}', 1],
                            smdet: ['Macro', '\\svmqty{#1}', 1],
                            identitymatrix: 'IdentityMatrix',
                            imat: 'IdentityMatrix',
                            xmatrix: 'XMatrix',
                            xmat: 'XMatrix',
                            zeromatrix: ['Macro', '\\xmat{0}{#1}{#2}', 2],
                            zmat: ['Macro', '\\xmat{0}{#1}{#2}', 2],
                            paulimatrix: 'PauliMatrix',
                            pmat: 'PauliMatrix',
                            diagonalmatrix: 'DiagonalMatrix',
                            dmat: 'DiagonalMatrix',
                            antidiagonalmatrix: ['DiagonalMatrix', !0],
                            admat: ['DiagonalMatrix', !0],
                        },
                        a.default,
                    ),
                    new o.EnvironmentMap(
                        'Physics-aux-envs',
                        s.default.environment,
                        {
                            smallmatrix: [
                                'Array',
                                null,
                                null,
                                null,
                                'c',
                                '0.333em',
                                '.2em',
                                'S',
                                1,
                            ],
                        },
                        a.default,
                    ),
                    new o.MacroMap(
                        'Physics-characters',
                        { '|': ['AutoClose', l.TEXCLASS.ORD], ')': 'AutoClose', ']': 'AutoClose' },
                        a.default,
                    );
            },
            1541: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = o(r(724)),
                    i = o(r(810)),
                    s = o(r(3466)),
                    l = r(8921),
                    c = o(r(7702)),
                    u = o(r(8321)),
                    p = r(8644),
                    d = {},
                    f = { '(': ')', '[': ']', '{': '}', '|': '|' },
                    h = /^(b|B)i(g{1,2})$/;
                (d.Quantity = function (t, e, r, n, o, a, p) {
                    void 0 === r && (r = '('),
                        void 0 === n && (n = ')'),
                        void 0 === o && (o = !1),
                        void 0 === a && (a = ''),
                        void 0 === p && (p = '');
                    var d = !!o && t.GetStar(),
                        m = t.GetNext(),
                        g = t.i,
                        y = null;
                    if ('\\' === m) {
                        if ((t.i++, !(y = t.GetCS()).match(h))) {
                            var v = t.create('node', 'mrow');
                            return (
                                t.Push(c.default.fenced(t.configuration, r, v, n)), void (t.i = g)
                            );
                        }
                        m = t.GetNext();
                    }
                    var b = f[m];
                    if (o && '{' !== m)
                        throw new s.default(
                            'MissingArgFor',
                            'Missing argument for %1',
                            t.currentCS,
                        );
                    if (!b) {
                        v = t.create('node', 'mrow');
                        return t.Push(c.default.fenced(t.configuration, r, v, n)), void (t.i = g);
                    }
                    if (a) {
                        var x = t.create('token', 'mi', { texClass: l.TEXCLASS.OP }, a);
                        p && u.default.setAttribute(x, 'mathvariant', p),
                            t.Push(t.itemFactory.create('fn', x));
                    }
                    if ('{' === m) {
                        var _ = t.GetArgument(e);
                        return (
                            (m = o ? r : '\\{'),
                            (b = o ? n : '\\}'),
                            (_ = d
                                ? m + ' ' + _ + ' ' + b
                                : y
                                  ? '\\' + y + 'l' + m + ' ' + _ + ' \\' + y + 'r' + b
                                  : '\\left' + m + ' ' + _ + ' \\right' + b),
                            void t.Push(new i.default(_, t.stack.env, t.configuration).mml())
                        );
                    }
                    o && ((m = r), (b = n)),
                        t.i++,
                        t.Push(
                            t.itemFactory
                                .create('auto open')
                                .setProperties({ open: m, close: b, big: y }),
                        );
                }),
                    (d.Eval = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetNext();
                        if ('{' !== n) {
                            if ('(' === n || '[' === n)
                                return (
                                    t.i++,
                                    void t.Push(
                                        t.itemFactory.create('auto open').setProperties({
                                            open: n,
                                            close: '|',
                                            smash: r,
                                            right: '\\vphantom{\\int}',
                                        }),
                                    )
                                );
                            throw new s.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        }
                        var o = t.GetArgument(e),
                            a =
                                '\\left. ' +
                                (r ? '\\smash{' + o + '}' : o) +
                                ' \\vphantom{\\int}\\right|';
                        t.string = t.string.slice(0, t.i) + a + t.string.slice(t.i);
                    }),
                    (d.Commutator = function (t, e, r, n) {
                        void 0 === r && (r = '['), void 0 === n && (n = ']');
                        var o = t.GetStar(),
                            a = t.GetNext(),
                            l = null;
                        if ('\\' === a) {
                            if ((t.i++, !(l = t.GetCS()).match(h)))
                                throw new s.default(
                                    'MissingArgFor',
                                    'Missing argument for %1',
                                    t.currentCS,
                                );
                            a = t.GetNext();
                        }
                        if ('{' !== a)
                            throw new s.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        var c = t.GetArgument(e) + ',' + t.GetArgument(e);
                        (c = o
                            ? r + ' ' + c + ' ' + n
                            : l
                              ? '\\' + l + 'l' + r + ' ' + c + ' \\' + l + 'r' + n
                              : '\\left' + r + ' ' + c + ' \\right' + n),
                            t.Push(new i.default(c, t.stack.env, t.configuration).mml());
                    });
                var m = [65, 90],
                    g = [97, 122],
                    y = [913, 937],
                    v = [945, 969],
                    b = [48, 57];
                function x(t, e) {
                    return t >= e[0] && t <= e[1];
                }
                function _(t, e, r, n) {
                    var o = t.configuration.parser,
                        a = p.NodeFactory.createToken(t, e, r, n),
                        i = n.codePointAt(0);
                    return (
                        1 === n.length &&
                            !o.stack.env.font &&
                            o.stack.env.vectorFont &&
                            (x(i, m) ||
                                x(i, g) ||
                                x(i, y) ||
                                x(i, b) ||
                                (x(i, v) && o.stack.env.vectorStar) ||
                                u.default.getAttribute(a, 'accent')) &&
                            u.default.setAttribute(a, 'mathvariant', o.stack.env.vectorFont),
                        a
                    );
                }
                (d.VectorBold = function (t, e) {
                    var r = t.GetStar(),
                        n = t.GetArgument(e),
                        o = t.configuration.nodeFactory.get('token'),
                        a = t.stack.env.font;
                    delete t.stack.env.font,
                        t.configuration.nodeFactory.set('token', _),
                        (t.stack.env.vectorFont = r ? 'bold-italic' : 'bold'),
                        (t.stack.env.vectorStar = r);
                    var s = new i.default(n, t.stack.env, t.configuration).mml();
                    a && (t.stack.env.font = a),
                        delete t.stack.env.vectorFont,
                        delete t.stack.env.vectorStar,
                        t.configuration.nodeFactory.set('token', o),
                        t.Push(s);
                }),
                    (d.StarMacro = function (t, e, r) {
                        for (var n = [], o = 3; o < arguments.length; o++) n[o - 3] = arguments[o];
                        var a = t.GetStar(),
                            i = [];
                        if (r) for (var s = i.length; s < r; s++) i.push(t.GetArgument(e));
                        var l = n.join(a ? '*' : '');
                        (l = c.default.substituteArgs(t, i, l)),
                            (t.string = c.default.addArgs(t, l, t.string.slice(t.i))),
                            (t.i = 0),
                            c.default.checkMaxMacros(t);
                    });
                var M = function (t, e, r, n, o) {
                    var a = new i.default(n, t.stack.env, t.configuration).mml();
                    t.Push(t.itemFactory.create(e, a));
                    var s = t.GetNext(),
                        l = f[s];
                    if (l) {
                        var c = -1 !== o.indexOf(s);
                        if ('{' === s) {
                            var u =
                                (c ? '\\left\\{' : '') +
                                ' ' +
                                t.GetArgument(r) +
                                ' ' +
                                (c ? '\\right\\}' : '');
                            return (t.string = u + t.string.slice(t.i)), void (t.i = 0);
                        }
                        c &&
                            (t.i++,
                            t.Push(
                                t.itemFactory
                                    .create('auto open')
                                    .setProperties({ open: s, close: l }),
                            ));
                    }
                };
                function w(t, e, r) {
                    var o = n(t, 3),
                        a = o[0],
                        i = o[1],
                        s = o[2];
                    return e && r
                        ? '\\left\\langle{'
                              .concat(a, '}\\middle\\vert{')
                              .concat(i, '}\\middle\\vert{')
                              .concat(s, '}\\right\\rangle')
                        : e
                          ? '\\langle{'
                                .concat(a, '}\\vert{')
                                .concat(i, '}\\vert{')
                                .concat(s, '}\\rangle')
                          : '\\left\\langle{'
                                .concat(a, '}\\right\\vert{')
                                .concat(i, '}\\left\\vert{')
                                .concat(s, '}\\right\\rangle');
                }
                (d.OperatorApplication = function (t, e, r) {
                    for (var n = [], o = 3; o < arguments.length; o++) n[o - 3] = arguments[o];
                    M(t, 'fn', e, r, n);
                }),
                    (d.VectorOperator = function (t, e, r) {
                        for (var n = [], o = 3; o < arguments.length; o++) n[o - 3] = arguments[o];
                        M(t, 'mml', e, r, n);
                    }),
                    (d.Expression = function (t, e, r, n) {
                        void 0 === r && (r = !0), void 0 === n && (n = ''), (n = n || e.slice(1));
                        var o = r ? t.GetBrackets(e) : null,
                            a = t.create('token', 'mi', { texClass: l.TEXCLASS.OP }, n);
                        if (o) {
                            var s = new i.default(o, t.stack.env, t.configuration).mml();
                            a = t.create('node', 'msup', [a, s]);
                        }
                        t.Push(t.itemFactory.create('fn', a)),
                            '(' === t.GetNext() &&
                                (t.i++,
                                t.Push(
                                    t.itemFactory
                                        .create('auto open')
                                        .setProperties({ open: '(', close: ')' }),
                                ));
                    }),
                    (d.Qqtext = function (t, e, r) {
                        var n =
                            (t.GetStar() ? '' : '\\quad') +
                            '\\text{' +
                            (r || t.GetArgument(e)) +
                            '}\\quad ';
                        t.string = t.string.slice(0, t.i) + n + t.string.slice(t.i);
                    }),
                    (d.Differential = function (t, e, r) {
                        var n = t.GetBrackets(e),
                            o = null != n ? '^{' + n + '}' : ' ',
                            a = '(' === t.GetNext(),
                            s = '{' === t.GetNext(),
                            c = r + o;
                        if (a || s)
                            if (s) {
                                c += t.GetArgument(e);
                                u = new i.default(c, t.stack.env, t.configuration).mml();
                                t.Push(
                                    t.create('node', 'TeXAtom', [u], { texClass: l.TEXCLASS.OP }),
                                );
                            } else
                                t.Push(new i.default(c, t.stack.env, t.configuration).mml()),
                                    t.i++,
                                    t.Push(
                                        t.itemFactory
                                            .create('auto open')
                                            .setProperties({ open: '(', close: ')' }),
                                    );
                        else {
                            c += t.GetArgument(e, !0) || '';
                            var u = new i.default(c, t.stack.env, t.configuration).mml();
                            t.Push(u);
                        }
                    }),
                    (d.Derivative = function (t, e, r, n) {
                        var o = t.GetStar(),
                            a = t.GetBrackets(e),
                            s = 1,
                            l = [];
                        for (l.push(t.GetArgument(e)); '{' === t.GetNext() && s < r; )
                            l.push(t.GetArgument(e)), s++;
                        var c = !1,
                            u = ' ',
                            p = ' ';
                        r > 2 && l.length > 2
                            ? ((u = '^{' + (l.length - 1) + '}'), (c = !0))
                            : null != a &&
                              (r > 2 && l.length > 1 && (c = !0), (p = u = '^{' + a + '}'));
                        for (
                            var d = o ? '\\flatfrac' : '\\frac',
                                f = l.length > 1 ? l[0] : '',
                                h = l.length > 1 ? l[1] : l[0],
                                m = '',
                                g = 2,
                                y = void 0;
                            (y = l[g]);
                            g++
                        )
                            m += n + ' ' + y;
                        var v = d + '{' + n + u + f + '}{' + n + ' ' + h + p + ' ' + m + '}';
                        t.Push(new i.default(v, t.stack.env, t.configuration).mml()),
                            '(' === t.GetNext() &&
                                (t.i++,
                                t.Push(
                                    t.itemFactory
                                        .create('auto open')
                                        .setProperties({ open: '(', close: ')', ignore: c }),
                                ));
                    }),
                    (d.Bra = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            o = '',
                            a = !1,
                            s = !1;
                        if ('\\' === t.GetNext()) {
                            var l = t.i;
                            t.i++;
                            var c = t.GetCS(),
                                u = t.lookup('macro', c);
                            u && 'ket' === u.symbol
                                ? ((a = !0),
                                  (l = t.i),
                                  (s = t.GetStar()),
                                  '{' === t.GetNext()
                                      ? (o = t.GetArgument(c, !0))
                                      : ((t.i = l), (s = !1)))
                                : (t.i = l);
                        }
                        var p = '';
                        (p = a
                            ? r || s
                                ? '\\langle{'.concat(n, '}\\vert{').concat(o, '}\\rangle')
                                : '\\left\\langle{'
                                      .concat(n, '}\\middle\\vert{')
                                      .concat(o, '}\\right\\rangle')
                            : r || s
                              ? '\\langle{'.concat(n, '}\\vert')
                              : '\\left\\langle{'.concat(n, '}\\right\\vert{').concat(o, '}')),
                            t.Push(new i.default(p, t.stack.env, t.configuration).mml());
                    }),
                    (d.Ket = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            o = r
                                ? '\\vert{'.concat(n, '}\\rangle')
                                : '\\left\\vert{'.concat(n, '}\\right\\rangle');
                        t.Push(new i.default(o, t.stack.env, t.configuration).mml());
                    }),
                    (d.BraKet = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            o = null;
                        '{' === t.GetNext() && (o = t.GetArgument(e, !0));
                        var a = '';
                        (a =
                            null == o
                                ? r
                                    ? '\\langle{'.concat(n, '}\\vert{').concat(n, '}\\rangle')
                                    : '\\left\\langle{'
                                          .concat(n, '}\\middle\\vert{')
                                          .concat(n, '}\\right\\rangle')
                                : r
                                  ? '\\langle{'.concat(n, '}\\vert{').concat(o, '}\\rangle')
                                  : '\\left\\langle{'
                                        .concat(n, '}\\middle\\vert{')
                                        .concat(o, '}\\right\\rangle')),
                            t.Push(new i.default(a, t.stack.env, t.configuration).mml());
                    }),
                    (d.KetBra = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            o = null;
                        '{' === t.GetNext() && (o = t.GetArgument(e, !0));
                        var a = '';
                        (a =
                            null == o
                                ? r
                                    ? '\\vert{'
                                          .concat(n, '}\\rangle\\!\\langle{')
                                          .concat(n, '}\\vert')
                                    : '\\left\\vert{'
                                          .concat(n, '}\\middle\\rangle\\!\\middle\\langle{')
                                          .concat(n, '}\\right\\vert')
                                : r
                                  ? '\\vert{'
                                        .concat(n, '}\\rangle\\!\\langle{')
                                        .concat(o, '}\\vert')
                                  : '\\left\\vert{'
                                        .concat(n, '}\\middle\\rangle\\!\\middle\\langle{')
                                        .concat(o, '}\\right\\vert')),
                            t.Push(new i.default(a, t.stack.env, t.configuration).mml());
                    }),
                    (d.Expectation = function (t, e) {
                        var r = t.GetStar(),
                            n = r && t.GetStar(),
                            o = t.GetArgument(e),
                            a = null;
                        '{' === t.GetNext() && (a = t.GetArgument(e, !0));
                        var s =
                            o && a
                                ? w([a, o, a], r, n)
                                : r
                                  ? '\\langle {'.concat(o, '} \\rangle')
                                  : '\\left\\langle {'.concat(o, '} \\right\\rangle');
                        t.Push(new i.default(s, t.stack.env, t.configuration).mml());
                    }),
                    (d.MatrixElement = function (t, e) {
                        var r = t.GetStar(),
                            n = r && t.GetStar(),
                            o = w([t.GetArgument(e), t.GetArgument(e), t.GetArgument(e)], r, n);
                        t.Push(new i.default(o, t.stack.env, t.configuration).mml());
                    }),
                    (d.MatrixQuantity = function (t, e, r) {
                        var n = t.GetStar(),
                            o = r ? 'smallmatrix' : 'array',
                            a = '',
                            s = '',
                            l = '';
                        switch (t.GetNext()) {
                            case '{':
                                a = t.GetArgument(e);
                                break;
                            case '(':
                                t.i++,
                                    (s = n ? '\\lgroup' : '('),
                                    (l = n ? '\\rgroup' : ')'),
                                    (a = t.GetUpTo(e, ')'));
                                break;
                            case '[':
                                t.i++, (s = '['), (l = ']'), (a = t.GetUpTo(e, ']'));
                                break;
                            case '|':
                                t.i++, (s = '|'), (l = '|'), (a = t.GetUpTo(e, '|'));
                                break;
                            default:
                                (s = '('), (l = ')');
                        }
                        var c =
                            (s ? '\\left' : '') +
                            s +
                            '\\begin{' +
                            o +
                            '}{} ' +
                            a +
                            '\\end{' +
                            o +
                            '}' +
                            (s ? '\\right' : '') +
                            l;
                        t.Push(new i.default(c, t.stack.env, t.configuration).mml());
                    }),
                    (d.IdentityMatrix = function (t, e) {
                        var r = t.GetArgument(e),
                            n = parseInt(r, 10);
                        if (isNaN(n)) throw new s.default('InvalidNumber', 'Invalid number');
                        if (n <= 1) return (t.string = '1' + t.string.slice(t.i)), void (t.i = 0);
                        for (var o = Array(n).fill('0'), a = [], i = 0; i < n; i++) {
                            var l = o.slice();
                            (l[i] = '1'), a.push(l.join(' & '));
                        }
                        (t.string = a.join('\\\\ ') + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (d.XMatrix = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            o = t.GetArgument(e),
                            a = t.GetArgument(e),
                            i = parseInt(o, 10),
                            l = parseInt(a, 10);
                        if (isNaN(i) || isNaN(l) || l.toString() !== a || i.toString() !== o)
                            throw new s.default('InvalidNumber', 'Invalid number');
                        if (((i = i < 1 ? 1 : i), (l = l < 1 ? 1 : l), !r)) {
                            var c = Array(l).fill(n).join(' & '),
                                u = Array(i).fill(c).join('\\\\ ');
                            return (t.string = u + t.string.slice(t.i)), void (t.i = 0);
                        }
                        var p = '';
                        if (1 === i && 1 === l) p = n;
                        else if (1 === i) {
                            c = [];
                            for (var d = 1; d <= l; d++) c.push(''.concat(n, '_{').concat(d, '}'));
                            p = c.join(' & ');
                        } else if (1 === l) {
                            for (c = [], d = 1; d <= i; d++)
                                c.push(''.concat(n, '_{').concat(d, '}'));
                            p = c.join('\\\\ ');
                        } else {
                            var f = [];
                            for (d = 1; d <= i; d++) {
                                c = [];
                                for (var h = 1; h <= l; h++)
                                    c.push(''.concat(n, '_{{').concat(d, '}{').concat(h, '}}'));
                                f.push(c.join(' & '));
                            }
                            p = f.join('\\\\ ');
                        }
                        (t.string = p + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (d.PauliMatrix = function (t, e) {
                        var r = t.GetArgument(e),
                            n = r.slice(1);
                        switch (r[0]) {
                            case '0':
                                n += ' 1 & 0\\\\ 0 & 1';
                                break;
                            case '1':
                            case 'x':
                                n += ' 0 & 1\\\\ 1 & 0';
                                break;
                            case '2':
                            case 'y':
                                n += ' 0 & -i\\\\ i & 0';
                                break;
                            case '3':
                            case 'z':
                                n += ' 1 & 0\\\\ 0 & -1';
                        }
                        (t.string = n + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (d.DiagonalMatrix = function (t, e, r) {
                        if ('{' === t.GetNext()) {
                            var n = t.i;
                            t.GetArgument(e);
                            var o = t.i;
                            t.i = n + 1;
                            for (var a = [], i = '', s = t.i; s < o; ) {
                                try {
                                    i = t.GetUpTo(e, ',');
                                } catch (e) {
                                    (t.i = o), a.push(t.string.slice(s, o - 1));
                                    break;
                                }
                                if (t.i >= o) {
                                    a.push(t.string.slice(s, o));
                                    break;
                                }
                                (s = t.i), a.push(i);
                            }
                            (t.string =
                                (function (t, e) {
                                    for (var r = t.length, n = [], o = 0; o < r; o++)
                                        n.push(
                                            Array(e ? r - o : o + 1).join('&') +
                                                '\\mqty{' +
                                                t[o] +
                                                '}',
                                        );
                                    return n.join('\\\\ ');
                                })(a, r) + t.string.slice(o)),
                                (t.i = 0);
                        }
                    }),
                    (d.AutoClose = function (t, e, r) {
                        var n = t.create('token', 'mo', { stretchy: !1 }, e),
                            o = t.itemFactory.create('mml', n).setProperties({ autoclose: e });
                        t.Push(o);
                    }),
                    (d.Vnabla = function (t, e) {
                        var r = t.options.physics.arrowdel
                            ? '\\vec{\\gradientnabla}'
                            : '{\\gradientnabla}';
                        return t.Push(new i.default(r, t.stack.env, t.configuration).mml());
                    }),
                    (d.DiffD = function (t, e) {
                        var r = t.options.physics.italicdiff ? 'd' : '{\\rm d}';
                        return t.Push(new i.default(r, t.stack.env, t.configuration).mml());
                    }),
                    (d.Macro = a.default.Macro),
                    (d.NamedFn = a.default.NamedFn),
                    (d.Array = a.default.Array),
                    (e.default = d);
            },
            4303: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.RequireConfiguration =
                        e.options =
                        e.RequireMethods =
                        e.RequireLoad =
                            void 0);
                var s = r(6552),
                    l = r(7628),
                    c = i(r(3466)),
                    u = r(8723),
                    p = r(1993),
                    d = r(847),
                    f = r(3184),
                    h = r(9077),
                    m = u.MathJax.config;
                function g(t, e) {
                    var r,
                        o = t.parseOptions.options.require,
                        a = t.parseOptions.packageData.get('require').required,
                        i = e.substr(o.prefix.length);
                    if (a.indexOf(i) < 0) {
                        a.push(i),
                            (function (t, e) {
                                var r, o;
                                void 0 === e && (e = []);
                                var a = t.parseOptions.options.require.prefix;
                                try {
                                    for (var i = n(e), s = i.next(); !s.done; s = i.next()) {
                                        var l = s.value;
                                        l.substr(0, a.length) === a && g(t, l);
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
                            })(t, d.CONFIG.dependencies[e]);
                        var l = s.ConfigurationHandler.get(i);
                        if (l) {
                            var c = m[e] || {};
                            l.options &&
                                1 === Object.keys(l.options).length &&
                                l.options[i] &&
                                (((r = {})[i] = c), (c = r)),
                                t.configuration.add(i, t, c);
                            var u = t.parseOptions.packageData.get('require').configured;
                            l.preprocessors.length &&
                                !u.has(i) &&
                                (u.set(i, !0), f.mathjax.retryAfter(Promise.resolve()));
                        }
                    }
                }
                function y(t, e) {
                    var r = t.options.require,
                        n = r.allow,
                        o = ('[' === e.substr(0, 1) ? '' : r.prefix) + e;
                    if (!(n.hasOwnProperty(o) ? n[o] : n.hasOwnProperty(e) ? n[e] : r.defaultAllow))
                        throw new c.default(
                            'BadRequire',
                            'Extension "%1" is not allowed to be loaded',
                            o,
                        );
                    p.Package.packages.has(o)
                        ? g(t.configuration.packageData.get('require').jax, o)
                        : f.mathjax.retryAfter(d.Loader.load(o));
                }
                (e.RequireLoad = y),
                    (e.RequireMethods = {
                        Require: function (t, e) {
                            var r = t.GetArgument(e);
                            if (r.match(/[^_a-zA-Z0-9]/) || '' === r)
                                throw new c.default(
                                    'BadPackageName',
                                    'Argument for %1 is not a valid package name',
                                    e,
                                );
                            y(t, r);
                        },
                    }),
                    (e.options = {
                        require: {
                            allow: (0, h.expandable)({
                                base: !1,
                                'all-packages': !1,
                                autoload: !1,
                                configmacros: !1,
                                tagformat: !1,
                                setoptions: !1,
                            }),
                            defaultAllow: !0,
                            prefix: 'tex',
                        },
                    }),
                    new l.CommandMap('require', { require: 'Require' }, e.RequireMethods),
                    (e.RequireConfiguration = s.Configuration.create('require', {
                        handler: { macro: ['require'] },
                        config: function (t, e) {
                            e.parseOptions.packageData.set('require', {
                                jax: e,
                                required: a([], o(e.options.packages), !1),
                                configured: new Map(),
                            });
                            var r = e.parseOptions.options.require,
                                n = r.prefix;
                            if (n.match(/[^_a-zA-Z0-9]/))
                                throw Error('Illegal characters used in \\require prefix');
                            d.CONFIG.paths[n] ||
                                (d.CONFIG.paths[n] = '[mathjax]/input/tex/extensions'),
                                (r.prefix = '[' + n + ']/');
                        },
                        options: e.options,
                    }));
            },
            955: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SetOptionsConfiguration = e.SetOptionsUtil = void 0);
                var a = r(6552),
                    i = r(7628),
                    s = o(r(3466)),
                    l = o(r(7702)),
                    c = r(4237),
                    u = o(r(724)),
                    p = r(9077);
                e.SetOptionsUtil = {
                    filterPackage: function (t, e) {
                        if ('tex' !== e && !a.ConfigurationHandler.get(e))
                            throw new s.default('NotAPackage', 'Not a defined package: %1', e);
                        var r = t.options.setoptions,
                            n = r.allowOptions[e];
                        if ((void 0 === n && !r.allowPackageDefault) || !1 === n)
                            throw new s.default(
                                'PackageNotSettable',
                                'Options can\'t be set for package "%1"',
                                e,
                            );
                        return !0;
                    },
                    filterOption: function (t, e, r) {
                        var n,
                            o = t.options.setoptions,
                            a = o.allowOptions[e] || {},
                            i = a.hasOwnProperty(r) && !(0, p.isObject)(a[r]) ? a[r] : null;
                        if (!1 === i || (null === i && !o.allowOptionsDefault))
                            throw new s.default(
                                'OptionNotSettable',
                                'Option "%1" is not allowed to be set',
                                r,
                            );
                        if (
                            !(null === (n = 'tex' === e ? t.options : t.options[e]) || void 0 === n
                                ? void 0
                                : n.hasOwnProperty(r))
                        )
                            throw 'tex' === e
                                ? new s.default('InvalidTexOption', 'Invalid TeX option "%1"', r)
                                : new s.default(
                                      'InvalidOptionKey',
                                      'Invalid option "%1" for package "%2"',
                                      r,
                                      e,
                                  );
                        return !0;
                    },
                    filterValue: function (t, e, r, n) {
                        return n;
                    },
                };
                var d = new i.CommandMap(
                    'setoptions',
                    { setOptions: 'SetOptions' },
                    {
                        SetOptions: function (t, e) {
                            var r,
                                o,
                                a = t.GetBrackets(e) || 'tex',
                                i = l.default.keyvalOptions(t.GetArgument(e)),
                                s = t.options.setoptions;
                            if (s.filterPackage(t, a))
                                try {
                                    for (
                                        var c = n(Object.keys(i)), u = c.next();
                                        !u.done;
                                        u = c.next()
                                    ) {
                                        var p = u.value;
                                        s.filterOption(t, a, p) &&
                                            (('tex' === a ? t.options : t.options[a])[p] =
                                                s.filterValue(t, a, p, i[p]));
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        u && !u.done && (o = c.return) && o.call(c);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                        },
                    },
                );
                e.SetOptionsConfiguration = a.Configuration.create('setoptions', {
                    handler: { macro: ['setoptions'] },
                    config: function (t, e) {
                        var r = e.parseOptions.handlers.get('macro').lookup('require');
                        r &&
                            (d.add('Require', new c.Macro('Require', r._func)),
                            d.add(
                                'require',
                                new c.Macro('require', u.default.Macro, [
                                    '\\Require{#2}\\setOptions[#2]{#1}',
                                    2,
                                    '',
                                ]),
                            ));
                    },
                    priority: 3,
                    options: {
                        setoptions: {
                            filterPackage: e.SetOptionsUtil.filterPackage,
                            filterOption: e.SetOptionsUtil.filterOption,
                            filterValue: e.SetOptionsUtil.filterValue,
                            allowPackageDefault: !0,
                            allowOptionsDefault: !0,
                            allowOptions: (0, p.expandable)({
                                tex: {
                                    FindTeX: !1,
                                    formatError: !1,
                                    package: !1,
                                    baseURL: !1,
                                    tags: !1,
                                    maxBuffer: !1,
                                    maxMaxros: !1,
                                    macros: !1,
                                    environments: !1,
                                },
                                setoptions: !1,
                                autoload: !1,
                                require: !1,
                                configmacros: !1,
                                tagformat: !1,
                            }),
                        },
                    },
                });
            },
            7368: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TagFormatConfiguration = e.tagformatConfig = void 0);
                var a = r(6552),
                    i = r(7251),
                    s = 0;
                function l(t, e) {
                    var r = e.parseOptions.options.tags;
                    'base' !== r && t.tags.hasOwnProperty(r) && i.TagsFactory.add(r, t.tags[r]);
                    var n = (function (t) {
                            function r() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                o(r, t),
                                (r.prototype.formatNumber = function (t) {
                                    return e.parseOptions.options.tagformat.number(t);
                                }),
                                (r.prototype.formatTag = function (t) {
                                    return e.parseOptions.options.tagformat.tag(t);
                                }),
                                (r.prototype.formatId = function (t) {
                                    return e.parseOptions.options.tagformat.id(t);
                                }),
                                (r.prototype.formatUrl = function (t, r) {
                                    return e.parseOptions.options.tagformat.url(t, r);
                                }),
                                r
                            );
                        })(i.TagsFactory.create(e.parseOptions.options.tags).constructor),
                        a = 'configTags-' + ++s;
                    i.TagsFactory.add(a, n), (e.parseOptions.options.tags = a);
                }
                (e.tagformatConfig = l),
                    (e.TagFormatConfiguration = a.Configuration.create('tagformat', {
                        config: [l, 10],
                        options: {
                            tagformat: {
                                number: function (t) {
                                    return t.toString();
                                },
                                tag: function (t) {
                                    return '(' + t + ')';
                                },
                                id: function (t) {
                                    return 'mjx-eqn:' + t.replace(/\s/g, '_');
                                },
                                url: function (t, e) {
                                    return e + '#' + encodeURIComponent(t);
                                },
                            },
                        },
                    }));
            },
            643: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextcompConfiguration = void 0);
                var n = r(6552);
                r(4609),
                    (e.TextcompConfiguration = n.Configuration.create('textcomp', {
                        handler: { macro: ['textcomp-macros'] },
                    }));
            },
            4609: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = r(7628),
                    a = r(7007),
                    i = r(440),
                    s = n(r(7702)),
                    l = r(4302);
                new o.CommandMap(
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
                        textcentoldstyle: ['Insert', '\xa2', a.TexConstant.Variant.OLDSTYLE],
                        textdollaroldstyle: ['Insert', '$', a.TexConstant.Variant.OLDSTYLE],
                        textzerooldstyle: ['Insert', '0', a.TexConstant.Variant.OLDSTYLE],
                        textoneoldstyle: ['Insert', '1', a.TexConstant.Variant.OLDSTYLE],
                        texttwooldstyle: ['Insert', '2', a.TexConstant.Variant.OLDSTYLE],
                        textthreeoldstyle: ['Insert', '3', a.TexConstant.Variant.OLDSTYLE],
                        textfouroldstyle: ['Insert', '4', a.TexConstant.Variant.OLDSTYLE],
                        textfiveoldstyle: ['Insert', '5', a.TexConstant.Variant.OLDSTYLE],
                        textsixoldstyle: ['Insert', '6', a.TexConstant.Variant.OLDSTYLE],
                        textsevenoldstyle: ['Insert', '7', a.TexConstant.Variant.OLDSTYLE],
                        texteightoldstyle: ['Insert', '8', a.TexConstant.Variant.OLDSTYLE],
                        textnineoldstyle: ['Insert', '9', a.TexConstant.Variant.OLDSTYLE],
                    },
                    {
                        Insert: function (t, e, r, n) {
                            if (t instanceof l.TextParser) {
                                if (!n) return void i.TextMacrosMethods.Insert(t, e, r);
                                t.saveText();
                            }
                            t.Push(s.default.internalText(t, r, n ? { mathvariant: n } : {}));
                        },
                    },
                );
            },
            82: function (t, e, r) {
                var n,
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextMacrosConfiguration = e.TextBaseConfiguration = void 0);
                var a = r(6552),
                    i = o(r(6394)),
                    s = r(7251),
                    l = r(8389),
                    c = r(4302),
                    u = r(440);
                function p(t, e, r, n) {
                    var o = t.configuration.packageData.get('textmacros');
                    return (
                        t instanceof c.TextParser || (o.texParser = t),
                        [new c.TextParser(e, n ? { mathvariant: n } : {}, o.parseOptions, r).mml()]
                    );
                }
                r(7900),
                    (e.TextBaseConfiguration = a.Configuration.create('text-base', {
                        parser: 'text',
                        handler: { character: ['command', 'text-special'], macro: ['text-macros'] },
                        fallback: {
                            character: function (t, e) {
                                t.text += e;
                            },
                            macro: function (t, e) {
                                var r = t.texParser,
                                    n = r.lookup('macro', e);
                                n &&
                                    n._func !== u.TextMacrosMethods.Macro &&
                                    t.Error(
                                        'MathMacro',
                                        '%1 is only supported in math mode',
                                        '\\' + e,
                                    ),
                                    r.parse('macro', [t, e]);
                            },
                        },
                        items:
                            ((n = {}),
                            (n[l.StartItem.prototype.kind] = l.StartItem),
                            (n[l.StopItem.prototype.kind] = l.StopItem),
                            (n[l.MmlItem.prototype.kind] = l.MmlItem),
                            (n[l.StyleItem.prototype.kind] = l.StyleItem),
                            n),
                    })),
                    (e.TextMacrosConfiguration = a.Configuration.create('textmacros', {
                        config: function (t, e) {
                            var r = new a.ParserConfiguration(
                                e.parseOptions.options.textmacros.packages,
                                ['tex', 'text'],
                            );
                            r.init();
                            var n = new i.default(r, []);
                            (n.options = e.parseOptions.options),
                                r.config(e),
                                s.TagsFactory.addTags(r.tags),
                                (n.tags = s.TagsFactory.getDefault()),
                                (n.tags.configuration = n),
                                (n.packageData = e.parseOptions.packageData),
                                n.packageData.set('textmacros', {
                                    parseOptions: n,
                                    jax: e,
                                    texParser: null,
                                }),
                                (n.options.internalMath = p);
                        },
                        preprocessors: [
                            function (t) {
                                var e = t.data.packageData.get('textmacros');
                                e.parseOptions.nodeFactory.setMmlFactory(e.jax.mmlFactory);
                            },
                        ],
                        options: { textmacros: { packages: ['text-base'] } },
                    }));
            },
            7900: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 });
                var n = r(7628),
                    o = r(7007),
                    a = r(440),
                    i = r(6914);
                new n.MacroMap(
                    'text-special',
                    {
                        $: 'Math',
                        '%': 'Comment',
                        '^': 'MathModeOnly',
                        _: 'MathModeOnly',
                        '&': 'Misplaced',
                        '#': 'Misplaced',
                        '~': 'Tilde',
                        ' ': 'Space',
                        '\t': 'Space',
                        '\r': 'Space',
                        '\n': 'Space',
                        '\xa0': 'Tilde',
                        '{': 'OpenBrace',
                        '}': 'CloseBrace',
                        '`': 'OpenQuote',
                        "'": 'CloseQuote',
                    },
                    a.TextMacrosMethods,
                ),
                    new n.CommandMap(
                        'text-macros',
                        {
                            '(': 'Math',
                            $: 'SelfQuote',
                            _: 'SelfQuote',
                            '%': 'SelfQuote',
                            '{': 'SelfQuote',
                            '}': 'SelfQuote',
                            ' ': 'SelfQuote',
                            '&': 'SelfQuote',
                            '#': 'SelfQuote',
                            '\\': 'SelfQuote',
                            "'": ['Accent', '\xb4'],
                            '\u2019': ['Accent', '\xb4'],
                            '`': ['Accent', '`'],
                            '\u2018': ['Accent', '`'],
                            '^': ['Accent', '^'],
                            '"': ['Accent', '\xa8'],
                            '~': ['Accent', '~'],
                            '=': ['Accent', '\xaf'],
                            '.': ['Accent', '\u02d9'],
                            u: ['Accent', '\u02d8'],
                            v: ['Accent', '\u02c7'],
                            emph: 'Emph',
                            rm: ['SetFont', o.TexConstant.Variant.NORMAL],
                            mit: ['SetFont', o.TexConstant.Variant.ITALIC],
                            oldstyle: ['SetFont', o.TexConstant.Variant.OLDSTYLE],
                            cal: ['SetFont', o.TexConstant.Variant.CALLIGRAPHIC],
                            it: ['SetFont', '-tex-mathit'],
                            bf: ['SetFont', o.TexConstant.Variant.BOLD],
                            bbFont: ['SetFont', o.TexConstant.Variant.DOUBLESTRUCK],
                            scr: ['SetFont', o.TexConstant.Variant.SCRIPT],
                            frak: ['SetFont', o.TexConstant.Variant.FRAKTUR],
                            sf: ['SetFont', o.TexConstant.Variant.SANSSERIF],
                            tt: ['SetFont', o.TexConstant.Variant.MONOSPACE],
                            tiny: ['SetSize', 0.5],
                            Tiny: ['SetSize', 0.6],
                            scriptsize: ['SetSize', 0.7],
                            small: ['SetSize', 0.85],
                            normalsize: ['SetSize', 1],
                            large: ['SetSize', 1.2],
                            Large: ['SetSize', 1.44],
                            LARGE: ['SetSize', 1.73],
                            huge: ['SetSize', 2.07],
                            Huge: ['SetSize', 2.49],
                            Bbb: ['Macro', '{\\bbFont #1}', 1],
                            textnormal: ['Macro', '{\\rm #1}', 1],
                            textup: ['Macro', '{\\rm #1}', 1],
                            textrm: ['Macro', '{\\rm #1}', 1],
                            textit: ['Macro', '{\\it #1}', 1],
                            textbf: ['Macro', '{\\bf #1}', 1],
                            textsf: ['Macro', '{\\sf #1}', 1],
                            texttt: ['Macro', '{\\tt #1}', 1],
                            dagger: ['Insert', '\u2020'],
                            ddagger: ['Insert', '\u2021'],
                            S: ['Insert', '\xa7'],
                            ',': ['Spacer', i.MATHSPACE.thinmathspace],
                            ':': ['Spacer', i.MATHSPACE.mediummathspace],
                            '>': ['Spacer', i.MATHSPACE.mediummathspace],
                            ';': ['Spacer', i.MATHSPACE.thickmathspace],
                            '!': ['Spacer', i.MATHSPACE.negativethinmathspace],
                            enspace: ['Spacer', 0.5],
                            quad: ['Spacer', 1],
                            qquad: ['Spacer', 2],
                            thinspace: ['Spacer', i.MATHSPACE.thinmathspace],
                            negthinspace: ['Spacer', i.MATHSPACE.negativethinmathspace],
                            hskip: 'Hskip',
                            hspace: 'Hskip',
                            kern: 'Hskip',
                            mskip: 'Hskip',
                            mspace: 'Hskip',
                            mkern: 'Hskip',
                            rule: 'rule',
                            Rule: ['Rule'],
                            Space: ['Rule', 'blank'],
                            color: 'CheckAutoload',
                            textcolor: 'CheckAutoload',
                            colorbox: 'CheckAutoload',
                            fcolorbox: 'CheckAutoload',
                            href: 'CheckAutoload',
                            style: 'CheckAutoload',
                            class: 'CheckAutoload',
                            cssId: 'CheckAutoload',
                            unicode: 'CheckAutoload',
                            ref: ['HandleRef', !1],
                            eqref: ['HandleRef', !0],
                        },
                        a.TextMacrosMethods,
                    );
            },
            440: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextMacrosMethods = void 0);
                var o = n(r(810)),
                    a = r(239),
                    i = n(r(724));
                e.TextMacrosMethods = {
                    Comment: function (t, e) {
                        for (; t.i < t.string.length && '\n' !== t.string.charAt(t.i); ) t.i++;
                        t.i++;
                    },
                    Math: function (t, e) {
                        t.saveText();
                        for (var r, n, a = t.i, i = 0; (n = t.GetNext()); )
                            switch (((r = t.i++), n)) {
                                case '\\':
                                    ')' === t.GetCS() && (n = '\\(');
                                case '$':
                                    if (0 === i && e === n) {
                                        var s = t.texParser.configuration,
                                            l = new o.default(
                                                t.string.substr(a, r - a),
                                                t.stack.env,
                                                s,
                                            ).mml();
                                        return void t.PushMath(l);
                                    }
                                    break;
                                case '{':
                                    i++;
                                    break;
                                case '}':
                                    0 === i &&
                                        t.Error(
                                            'ExtraCloseMissingOpen',
                                            'Extra close brace or missing open brace',
                                        ),
                                        i--;
                            }
                        t.Error('MathNotTerminated', 'Math-mode is not properly terminated');
                    },
                    MathModeOnly: function (t, e) {
                        t.Error('MathModeOnly', "'%1' allowed only in math mode", e);
                    },
                    Misplaced: function (t, e) {
                        t.Error('Misplaced', "'%1' can not be used here", e);
                    },
                    OpenBrace: function (t, e) {
                        var r = t.stack.env;
                        t.envStack.push(r), (t.stack.env = Object.assign({}, r));
                    },
                    CloseBrace: function (t, e) {
                        t.envStack.length
                            ? (t.saveText(), (t.stack.env = t.envStack.pop()))
                            : t.Error(
                                  'ExtraCloseMissingOpen',
                                  'Extra close brace or missing open brace',
                              );
                    },
                    OpenQuote: function (t, e) {
                        t.string.charAt(t.i) === e
                            ? ((t.text += '\u201c'), t.i++)
                            : (t.text += '\u2018');
                    },
                    CloseQuote: function (t, e) {
                        t.string.charAt(t.i) === e
                            ? ((t.text += '\u201d'), t.i++)
                            : (t.text += '\u2019');
                    },
                    Tilde: function (t, e) {
                        t.text += '\xa0';
                    },
                    Space: function (t, e) {
                        for (t.text += ' '; t.GetNext().match(/\s/); ) t.i++;
                    },
                    SelfQuote: function (t, e) {
                        t.text += e.substr(1);
                    },
                    Insert: function (t, e, r) {
                        t.text += r;
                    },
                    Accent: function (t, e, r) {
                        var n = t.ParseArg(e),
                            o = t.create('token', 'mo', {}, r);
                        t.addAttributes(o), t.Push(t.create('node', 'mover', [n, o]));
                    },
                    Emph: function (t, e) {
                        var r =
                            '-tex-mathit' === t.stack.env.mathvariant ? 'normal' : '-tex-mathit';
                        t.Push(t.ParseTextArg(e, { mathvariant: r }));
                    },
                    SetFont: function (t, e, r) {
                        t.saveText(), (t.stack.env.mathvariant = r);
                    },
                    SetSize: function (t, e, r) {
                        t.saveText(), (t.stack.env.mathsize = r);
                    },
                    CheckAutoload: function (t, e) {
                        var r = t.configuration.packageData.get('autoload'),
                            n = t.texParser;
                        e = e.slice(1);
                        var o = n.lookup('macro', e);
                        if (!o || (r && o._func === r.Autoload)) {
                            if ((n.parse('macro', [n, e]), !o)) return;
                            (0, a.retryAfter)(Promise.resolve());
                        }
                        n.parse('macro', [t, e]);
                    },
                    Macro: i.default.Macro,
                    Spacer: i.default.Spacer,
                    Hskip: i.default.Hskip,
                    rule: i.default.rule,
                    Rule: i.default.Rule,
                    HandleRef: i.default.HandleRef,
                };
            },
            4302: function (t, e, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
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
                                n(t, e)
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
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
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
                            var n,
                                o,
                                a = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    s =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = e.length; o < a; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.TextParser = void 0);
                var c = l(r(810)),
                    u = l(r(3466)),
                    p = l(r(7702)),
                    d = r(8921),
                    f = l(r(8321)),
                    h = r(8389),
                    m = (function (t) {
                        function e(e, r, n, o) {
                            var a = t.call(this, e, r, n) || this;
                            return (a.level = o), a;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'texParser', {
                                get: function () {
                                    return this.configuration.packageData.get('textmacros')
                                        .texParser;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'tags', {
                                get: function () {
                                    return this.texParser.tags;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.mml = function () {
                                return null != this.level
                                    ? this.create('node', 'mstyle', this.nodes, {
                                          displaystyle: !1,
                                          scriptlevel: this.level,
                                      })
                                    : 1 === this.nodes.length
                                      ? this.nodes[0]
                                      : this.create('node', 'mrow', this.nodes);
                            }),
                            (e.prototype.Parse = function () {
                                (this.text = ''),
                                    (this.nodes = []),
                                    (this.envStack = []),
                                    t.prototype.Parse.call(this);
                            }),
                            (e.prototype.saveText = function () {
                                if (this.text) {
                                    var t = this.stack.env.mathvariant,
                                        e = p.default.internalText(
                                            this,
                                            this.text,
                                            t ? { mathvariant: t } : {},
                                        );
                                    (this.text = ''), this.Push(e);
                                }
                            }),
                            (e.prototype.Push = function (e) {
                                if ((this.text && this.saveText(), e instanceof h.StopItem))
                                    return t.prototype.Push.call(this, e);
                                e instanceof h.StyleItem
                                    ? (this.stack.env.mathcolor = this.stack.env.color)
                                    : e instanceof d.AbstractMmlNode &&
                                      (this.addAttributes(e), this.nodes.push(e));
                            }),
                            (e.prototype.PushMath = function (t) {
                                var e,
                                    r,
                                    n = this.stack.env;
                                t.isKind('TeXAtom') || (t = this.create('node', 'TeXAtom', [t]));
                                try {
                                    for (
                                        var o = a(['mathsize', 'mathcolor']), i = o.next();
                                        !i.done;
                                        i = o.next()
                                    ) {
                                        var s = i.value;
                                        n[s] &&
                                            !t.attributes.getExplicit(s) &&
                                            (t.isToken ||
                                                t.isKind('mstyle') ||
                                                (t = this.create('node', 'mstyle', [t])),
                                            f.default.setAttribute(t, s, n[s]));
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        i && !i.done && (r = o.return) && r.call(o);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                t.isInferred && (t = this.create('node', 'mrow', t.childNodes)),
                                    this.nodes.push(t);
                            }),
                            (e.prototype.addAttributes = function (t) {
                                var e,
                                    r,
                                    n = this.stack.env;
                                if (t.isToken)
                                    try {
                                        for (
                                            var o = a(['mathsize', 'mathcolor', 'mathvariant']),
                                                i = o.next();
                                            !i.done;
                                            i = o.next()
                                        ) {
                                            var s = i.value;
                                            n[s] &&
                                                !t.attributes.getExplicit(s) &&
                                                f.default.setAttribute(t, s, n[s]);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            i && !i.done && (r = o.return) && r.call(o);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                            }),
                            (e.prototype.ParseTextArg = function (t, r) {
                                return new e(
                                    this.GetArgument(t),
                                    (r = Object.assign(Object.assign({}, this.stack.env), r)),
                                    this.configuration,
                                ).mml();
                            }),
                            (e.prototype.ParseArg = function (t) {
                                return new e(
                                    this.GetArgument(t),
                                    this.stack.env,
                                    this.configuration,
                                ).mml();
                            }),
                            (e.prototype.Error = function (t, e) {
                                for (var r = [], n = 2; n < arguments.length; n++)
                                    r[n - 2] = arguments[n];
                                throw new (u.default.bind.apply(
                                    u.default,
                                    s([void 0, t, e], i(r), !1),
                                ))();
                            }),
                            e
                        );
                    })(c.default);
                e.TextParser = m;
            },
            1158: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.UnicodeConfiguration = e.UnicodeMethods = void 0);
                var o = r(6552),
                    a = n(r(3466)),
                    i = r(7628),
                    s = n(r(7702)),
                    l = n(r(8321)),
                    c = r(9029);
                e.UnicodeMethods = {};
                var u = {};
                (e.UnicodeMethods.Unicode = function (t, e) {
                    var r = t.GetBrackets(e),
                        n = null,
                        o = null;
                    r &&
                        (r.replace(/ /g, '').match(/^(\d+(\.\d*)?|\.\d+),(\d+(\.\d*)?|\.\d+)$/)
                            ? ((n = r.replace(/ /g, '').split(/,/)), (o = t.GetBrackets(e)))
                            : (o = r));
                    var i = s.default.trimSpaces(t.GetArgument(e)).replace(/^0x/, 'x');
                    if (!i.match(/^(x[0-9A-Fa-f]+|[0-9]+)$/))
                        throw new a.default('BadUnicode', 'Argument to \\unicode must be a number');
                    var p = parseInt(i.match(/^x/) ? '0' + i : i);
                    u[p] ? o || (o = u[p][2]) : (u[p] = [800, 200, o, p]),
                        n &&
                            ((u[p][0] = Math.floor(1e3 * parseFloat(n[0]))),
                            (u[p][1] = Math.floor(1e3 * parseFloat(n[1]))));
                    var d = t.stack.env.font,
                        f = {};
                    o
                        ? ((u[p][2] = f.fontfamily = o.replace(/'/g, "'")),
                          d &&
                              (d.match(/bold/) && (f.fontweight = 'bold'),
                              d.match(/italic|-mathit/) && (f.fontstyle = 'italic')))
                        : d && (f.mathvariant = d);
                    var h = t.create('token', 'mtext', f, (0, c.numeric)(i));
                    l.default.setProperty(h, 'unicode', !0), t.Push(h);
                }),
                    new i.CommandMap('unicode', { unicode: 'Unicode' }, e.UnicodeMethods),
                    (e.UnicodeConfiguration = o.Configuration.create('unicode', {
                        handler: { macro: ['unicode'] },
                    }));
            },
            3450: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.UpgreekConfiguration = void 0);
                var n = r(6552),
                    o = r(7628),
                    a = r(7007);
                new o.CharacterMap(
                    'upgreek',
                    function (t, e) {
                        var r = e.attributes || {};
                        r.mathvariant = a.TexConstant.Variant.NORMAL;
                        var n = t.create('token', 'mi', r, e.char);
                        t.Push(n);
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
                    (e.UpgreekConfiguration = n.Configuration.create('upgreek', {
                        handler: { macro: ['upgreek'] },
                    }));
            },
            4325: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.VerbConfiguration = e.VerbMethods = void 0);
                var o = r(6552),
                    a = r(7007),
                    i = r(7628),
                    s = n(r(3466));
                (e.VerbMethods = {}),
                    (e.VerbMethods.Verb = function (t, e) {
                        var r = t.GetNext(),
                            n = ++t.i;
                        if ('' === r)
                            throw new s.default('MissingArgFor', 'Missing argument for %1', e);
                        for (; t.i < t.string.length && t.string.charAt(t.i) !== r; ) t.i++;
                        if (t.i === t.string.length)
                            throw new s.default(
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
                                    { mathvariant: a.TexConstant.Variant.MONOSPACE },
                                    o,
                                ),
                            );
                    }),
                    new i.CommandMap('verb', { verb: 'Verb' }, e.VerbMethods),
                    (e.VerbConfiguration = o.Configuration.create('verb', {
                        handler: { macro: ['verb'] },
                    }));
            },
            8723: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.isObject = MathJax._.components.global.isObject),
                    (e.combineConfig = MathJax._.components.global.combineConfig),
                    (e.combineDefaults = MathJax._.components.global.combineDefaults),
                    (e.combineWithMathJax = MathJax._.components.global.combineWithMathJax),
                    (e.MathJax = MathJax._.components.global.MathJax);
            },
            9649: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractFindMath = MathJax._.core.FindMath.AbstractFindMath);
            },
            3309: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractInputJax = MathJax._.core.InputJax.AbstractInputJax);
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
            9946: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMo = MathJax._.core.MmlTree.MmlNodes.mo.MmlMo);
            },
            3857: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.OPDEF = MathJax._.core.MmlTree.OperatorDictionary.OPDEF),
                    (e.MO = MathJax._.core.MmlTree.OperatorDictionary.MO),
                    (e.RANGES = MathJax._.core.MmlTree.OperatorDictionary.RANGES),
                    (e.getRange = MathJax._.core.MmlTree.OperatorDictionary.getRange),
                    (e.MMLSPACING = MathJax._.core.MmlTree.OperatorDictionary.MMLSPACING),
                    (e.OPTABLE = MathJax._.core.MmlTree.OperatorDictionary.OPTABLE);
            },
            752: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractFactory = MathJax._.core.Tree.Factory.AbstractFactory);
            },
            3184: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.mathjax = MathJax._.mathjax.mathjax);
            },
            9029: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.options = MathJax._.util.Entities.options),
                    (e.entities = MathJax._.util.Entities.entities),
                    (e.add = MathJax._.util.Entities.add),
                    (e.remove = MathJax._.util.Entities.remove),
                    (e.translate = MathJax._.util.Entities.translate),
                    (e.numeric = MathJax._.util.Entities.numeric);
            },
            6898: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.FunctionList = MathJax._.util.FunctionList.FunctionList);
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
            4297: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.PrioritizedList = MathJax._.util.PrioritizedList.PrioritizedList);
            },
            239: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.handleRetriesFor = MathJax._.util.Retries.handleRetriesFor),
                    (e.retryAfter = MathJax._.util.Retries.retryAfter);
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
            6720: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.sortLength = MathJax._.util.string.sortLength),
                    (e.quotePattern = MathJax._.util.string.quotePattern),
                    (e.unicodeChars = MathJax._.util.string.unicodeChars),
                    (e.unicodeString = MathJax._.util.string.unicodeString),
                    (e.isPercent = MathJax._.util.string.isPercent),
                    (e.split = MathJax._.util.string.split);
            },
            847: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.PathFilters = MathJax._.components.loader.PathFilters),
                    (e.Loader = MathJax._.components.loader.Loader),
                    (e.MathJax = MathJax._.components.loader.MathJax),
                    (e.CONFIG = MathJax._.components.loader.CONFIG);
            },
            1993: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.PackageError = MathJax._.components.package.PackageError),
                    (e.Package = MathJax._.components.package.Package);
            },
            7865: function (t, e) {
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
                var r = (function () {
                    function t() {}
                    return (
                        (t.toTex = function (t, e) {
                            return a.go(o.go(t, e), 'tex' !== e);
                        }),
                        t
                    );
                })();
                function n(t) {
                    var e,
                        r,
                        n = {};
                    for (e in t)
                        for (r in t[e]) {
                            var o = r.split('|');
                            t[e][r].stateArray = o;
                            for (var a = 0; a < o.length; a++) n[o[a]] = [];
                        }
                    for (e in t)
                        for (r in t[e])
                            for (o = t[e][r].stateArray || [], a = 0; a < o.length; a++) {
                                var i = t[e][r];
                                i.action_ = [].concat(i.action_);
                                for (var s = 0; s < i.action_.length; s++)
                                    'string' == typeof i.action_[s] &&
                                        (i.action_[s] = { type_: i.action_[s] });
                                for (var l = e.split('|'), c = 0; c < l.length; c++)
                                    if ('*' === o[a]) {
                                        var u = void 0;
                                        for (u in n) n[u].push({ pattern: l[c], task: i });
                                    } else n[o[a]].push({ pattern: l[c], task: i });
                            }
                    return n;
                }
                e.mhchemParser = r;
                var o = {
                        go: function (t, e) {
                            if (!t) return [];
                            void 0 === e && (e = 'ce');
                            var r,
                                n = '0',
                                a = {};
                            (a.parenthesisLevel = 0),
                                (t = (t = (t = t.replace(/\n/g, ' ')).replace(
                                    /[\u2212\u2013\u2014\u2010]/g,
                                    '-',
                                )).replace(/[\u2026]/g, '...'));
                            for (var i = 10, s = []; ; ) {
                                r !== t ? ((i = 10), (r = t)) : i--;
                                var l = o.stateMachines[e],
                                    c = l.transitions[n] || l.transitions['*'];
                                t: for (var u = 0; u < c.length; u++) {
                                    var p = o.patterns.match_(c[u].pattern, t);
                                    if (p) {
                                        for (var d = c[u].task, f = 0; f < d.action_.length; f++) {
                                            var h = void 0;
                                            if (l.actions[d.action_[f].type_])
                                                h = l.actions[d.action_[f].type_](
                                                    a,
                                                    p.match_,
                                                    d.action_[f].option,
                                                );
                                            else {
                                                if (!o.actions[d.action_[f].type_])
                                                    throw [
                                                        'MhchemBugA',
                                                        'mhchem bug A. Please report. (' +
                                                            d.action_[f].type_ +
                                                            ')',
                                                    ];
                                                h = o.actions[d.action_[f].type_](
                                                    a,
                                                    p.match_,
                                                    d.action_[f].option,
                                                );
                                            }
                                            o.concatArray(s, h);
                                        }
                                        if (((n = d.nextState || n), !(t.length > 0))) return s;
                                        if ((d.revisit || (t = p.remainder), !d.toContinue))
                                            break t;
                                    }
                                }
                                if (i <= 0) throw ['MhchemBugU', 'mhchem bug U. Please report.'];
                            }
                        },
                        concatArray: function (t, e) {
                            if (e)
                                if (Array.isArray(e))
                                    for (var r = 0; r < e.length; r++) t.push(e[r]);
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
                                    var e = o.patterns.findObserveGroups(
                                        t,
                                        '',
                                        /^\([a-z]{1,3}(?=[\),])/,
                                        ')',
                                        '',
                                    );
                                    if (e && e.remainder.match(/^($|[\s,;\)\]\}])/)) return e;
                                    var r = t.match(/^(?:\((?:\\ca\s?)?\$[amothc]\$\))/);
                                    return r
                                        ? { match_: r[0], remainder: t.substr(r[0].length) }
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
                                    return o.patterns.findObserveGroups(t, '^{', '', '', '}');
                                },
                                '^($...$)': function (t) {
                                    return o.patterns.findObserveGroups(t, '^', '$', '$', '');
                                },
                                '^a': /^\^([0-9]+|[^\\_])/,
                                '^\\x{}{}': function (t) {
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(t, '_{', '', '', '}');
                                },
                                '_($...$)': function (t) {
                                    return o.patterns.findObserveGroups(t, '_', '$', '$', '');
                                },
                                _9: /^_([+\-]?[0-9]+|[^\\])/,
                                '_\\x{}{}': function (t) {
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(t, '', '{', '}', '');
                                },
                                '{(...)}': function (t) {
                                    return o.patterns.findObserveGroups(t, '{', '', '', '}');
                                },
                                '$...$': function (t) {
                                    return o.patterns.findObserveGroups(t, '', '$', '$', '');
                                },
                                '${(...)}$__$(...)$': function (t) {
                                    return (
                                        o.patterns.findObserveGroups(t, '${', '', '', '}$') ||
                                        o.patterns.findObserveGroups(t, '$', '', '', '$')
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
                                    return o.patterns.findObserveGroups(t, '\\bond{', '', '', '}');
                                },
                                '->': /^(?:<->|<-->|->|<-|<=>>|<<=>|<=>|[\u2192\u27F6\u21CC])/,
                                CMT: /^[CMT](?=\[)/,
                                '[(...)]': function (t) {
                                    return o.patterns.findObserveGroups(t, '[', '', '', ']');
                                },
                                '1st-level escape': /^(&|\\\\|\\hline)\s*/,
                                '\\,': /^(?:\\[,\ ;:])/,
                                '\\x{}{}': function (t) {
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(t, '\\color{', '', '', '}');
                                },
                                '\\color{(...)}{(...)}': function (t) {
                                    return (
                                        o.patterns.findObserveGroups(
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
                                        o.patterns.findObserveGroups(
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
                                    return o.patterns.findObserveGroups(t, '\\ce{', '', '', '}');
                                },
                                '\\pu{(...)}': function (t) {
                                    return o.patterns.findObserveGroups(t, '\\pu{', '', '', '}');
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
                                    var r = o.patterns.findObserveGroups(t, '', '$', '$', '');
                                    return r &&
                                        (e = r.match_.match(
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
                            findObserveGroups: function (t, e, r, n, o, a, i, s, l, c) {
                                var u = function (t, e) {
                                        if ('string' == typeof e)
                                            return 0 !== t.indexOf(e) ? null : e;
                                        var r = t.match(e);
                                        return r ? r[0] : null;
                                    },
                                    p = u(t, e);
                                if (null === p) return null;
                                if (((t = t.substr(p.length)), null === (p = u(t, r)))) return null;
                                var d = (function (t, e, r) {
                                    for (var n = 0; e < t.length; ) {
                                        var o = t.charAt(e),
                                            a = u(t.substr(e), r);
                                        if (null !== a && 0 === n)
                                            return { endMatchBegin: e, endMatchEnd: e + a.length };
                                        if ('{' === o) n++;
                                        else if ('}' === o) {
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
                                })(t, p.length, n || o);
                                if (null === d) return null;
                                var f = t.substring(0, n ? d.endMatchEnd : d.endMatchBegin);
                                if (a || i) {
                                    var h = this.findObserveGroups(
                                        t.substr(d.endMatchEnd),
                                        a,
                                        i,
                                        s,
                                        l,
                                    );
                                    if (null === h) return null;
                                    var m = [f, h.match_];
                                    return { match_: c ? m.join('') : m, remainder: h.remainder };
                                }
                                return { match_: f, remainder: t.substr(d.endMatchEnd) };
                            },
                            match_: function (t, e) {
                                var r = o.patterns.patterns[t];
                                if (void 0 === r)
                                    throw [
                                        'MhchemBugP',
                                        'mhchem bug P. Please report. (' + t + ')',
                                    ];
                                if ('function' == typeof r) return o.patterns.patterns[t](e);
                                var n = e.match(r);
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
                            insert: function (t, e, r) {
                                return { type_: r };
                            },
                            'insert+p1': function (t, e, r) {
                                return { type_: r, p1: e };
                            },
                            'insert+p1+p2': function (t, e, r) {
                                return { type_: r, p1: e[0], p2: e[1] };
                            },
                            copy: function (t, e) {
                                return e;
                            },
                            write: function (t, e, r) {
                                return r;
                            },
                            rm: function (t, e) {
                                return { type_: 'rm', p1: e };
                            },
                            text: function (t, e) {
                                return o.go(e, 'text');
                            },
                            'tex-math': function (t, e) {
                                return o.go(e, 'tex-math');
                            },
                            'tex-math tight': function (t, e) {
                                return o.go(e, 'tex-math tight');
                            },
                            bond: function (t, e, r) {
                                return { type_: 'bond', kind_: r || e };
                            },
                            'color0-output': function (t, e) {
                                return { type_: 'color0', color: e };
                            },
                            ce: function (t, e) {
                                return o.go(e, 'ce');
                            },
                            pu: function (t, e) {
                                return o.go(e, 'pu');
                            },
                            '1/2': function (t, e) {
                                var r = [];
                                e.match(/^[+\-]/) && (r.push(e.substr(0, 1)), (e = e.substr(1)));
                                var n = e.match(
                                    /^([0-9]+|\$[a-z]\$|[a-z])\/([0-9]+)(\$[a-z]\$|[a-z])?$/,
                                );
                                return (
                                    (n[1] = n[1].replace(/\$/g, '')),
                                    r.push({ type_: 'frac', p1: n[1], p2: n[2] }),
                                    n[3] &&
                                        ((n[3] = n[3].replace(/\$/g, '')),
                                        r.push({ type_: 'tex-math', p1: n[3] })),
                                    r
                                );
                            },
                            '9,9': function (t, e) {
                                return o.go(e, '9,9');
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
                                        var r;
                                        if ((t.d || '').match(/^[1-9][0-9]*$/)) {
                                            var n = t.d;
                                            (t.d = void 0),
                                                (r = this.output(t)).push({ type_: 'tinySkip' }),
                                                (t.b = n);
                                        } else r = this.output(t);
                                        return o.actions['o='](t, e), r;
                                    },
                                    'd= kv': function (t, e) {
                                        (t.d = e), (t.dType = 'kv');
                                    },
                                    'charge or bond': function (t, e) {
                                        if (t.beginsWithBond) {
                                            var r = [];
                                            return (
                                                o.concatArray(r, this.output(t)),
                                                o.concatArray(r, o.actions.bond(t, e, '-')),
                                                r
                                            );
                                        }
                                        t.d = e;
                                    },
                                    '- after o/d': function (t, e, r) {
                                        var n = o.patterns.match_('orbital', t.o || ''),
                                            a = o.patterns.match_(
                                                'one lowercase greek letter $',
                                                t.o || '',
                                            ),
                                            i = o.patterns.match_(
                                                'one lowercase latin letter $',
                                                t.o || '',
                                            ),
                                            s = o.patterns.match_(
                                                '$one lowercase latin letter$ $',
                                                t.o || '',
                                            ),
                                            l =
                                                '-' === e &&
                                                ((n && '' === n.remainder) || a || i || s);
                                        !l ||
                                            t.a ||
                                            t.b ||
                                            t.p ||
                                            t.d ||
                                            t.q ||
                                            n ||
                                            !i ||
                                            (t.o = '$' + t.o + '$');
                                        var c = [];
                                        return (
                                            l
                                                ? (o.concatArray(c, this.output(t)),
                                                  c.push({ type_: 'hyphen' }))
                                                : ((n = o.patterns.match_('digits', t.d || '')),
                                                  r && n && '' === n.remainder
                                                      ? (o.concatArray(c, o.actions['d='](t, e)),
                                                        o.concatArray(c, this.output(t)))
                                                      : (o.concatArray(c, this.output(t)),
                                                        o.concatArray(
                                                            c,
                                                            o.actions.bond(t, e, '-'),
                                                        ))),
                                            c
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
                                        return { type_: 'state of aggregation', p1: o.go(e, 'o') };
                                    },
                                    comma: function (t, e) {
                                        var r = e.replace(/\s*$/, '');
                                        return r !== e && 0 === t.parenthesisLevel
                                            ? { type_: 'comma enumeration L', p1: r }
                                            : { type_: 'comma enumeration M', p1: r };
                                    },
                                    output: function (t, e, r) {
                                        var n;
                                        if (t.r) {
                                            var a = void 0;
                                            a =
                                                'M' === t.rdt
                                                    ? o.go(t.rd, 'tex-math')
                                                    : 'T' === t.rdt
                                                      ? [{ type_: 'text', p1: t.rd || '' }]
                                                      : o.go(t.rd, 'ce');
                                            var i = void 0;
                                            (i =
                                                'M' === t.rqt
                                                    ? o.go(t.rq, 'tex-math')
                                                    : 'T' === t.rqt
                                                      ? [{ type_: 'text', p1: t.rq || '' }]
                                                      : o.go(t.rq, 'ce')),
                                                (n = { type_: 'arrow', r: t.r, rd: a, rq: i });
                                        } else
                                            (n = []),
                                                (t.a || t.b || t.p || t.o || t.q || t.d || r) &&
                                                    (t.sb && n.push({ type_: 'entitySkip' }),
                                                    t.o || t.q || t.d || t.b || t.p || 2 === r
                                                        ? t.o || t.q || t.d || (!t.b && !t.p)
                                                            ? t.o &&
                                                              'kv' === t.dType &&
                                                              o.patterns.match_(
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
                                                        a: o.go(t.a, 'a'),
                                                        b: o.go(t.b, 'bd'),
                                                        p: o.go(t.p, 'pq'),
                                                        o: o.go(t.o, 'o'),
                                                        q: o.go(t.q, 'pq'),
                                                        d: o.go(
                                                            t.d,
                                                            'oxidation' === t.dType
                                                                ? 'oxidation'
                                                                : 'bd',
                                                        ),
                                                        dType: t.dType,
                                                    }));
                                        for (var s in t)
                                            'parenthesisLevel' !== s &&
                                                'beginsWithBond' !== s &&
                                                delete t[s];
                                        return n;
                                    },
                                    'oxidation-output': function (t, e) {
                                        var r = ['{'];
                                        return (
                                            o.concatArray(r, o.go(e, 'oxidation')), r.push('}'), r
                                        );
                                    },
                                    'frac-output': function (t, e) {
                                        return {
                                            type_: 'frac-ce',
                                            p1: o.go(e[0], 'ce'),
                                            p2: o.go(e[1], 'ce'),
                                        };
                                    },
                                    'overset-output': function (t, e) {
                                        return {
                                            type_: 'overset',
                                            p1: o.go(e[0], 'ce'),
                                            p2: o.go(e[1], 'ce'),
                                        };
                                    },
                                    'underset-output': function (t, e) {
                                        return {
                                            type_: 'underset',
                                            p1: o.go(e[0], 'ce'),
                                            p2: o.go(e[1], 'ce'),
                                        };
                                    },
                                    'underbrace-output': function (t, e) {
                                        return {
                                            type_: 'underbrace',
                                            p1: o.go(e[0], 'ce'),
                                            p2: o.go(e[1], 'ce'),
                                        };
                                    },
                                    'color-output': function (t, e) {
                                        return {
                                            type_: 'color',
                                            color1: e[0],
                                            color2: o.go(e[1], 'ce'),
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
                                    operator: function (t, e, r) {
                                        return { type_: 'operator', kind_: r || e };
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
                                            for (var r in t) delete t[r];
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
                                            p1: o.go(e, 'o'),
                                        };
                                    },
                                    'color-output': function (t, e) {
                                        return {
                                            type_: 'color',
                                            color1: e[0],
                                            color2: o.go(e[1], 'pq'),
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
                                            color2: o.go(e[1], 'bd'),
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
                                            for (var r in t) delete t[r];
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
                                            for (var r in t) delete t[r];
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
                                        var r = [];
                                        return (
                                            '+-' === e[0] || '+/-' === e[0]
                                                ? r.push('\\pm ')
                                                : e[0] && r.push(e[0]),
                                            e[1] &&
                                                (o.concatArray(r, o.go(e[1], 'pu-9,9')),
                                                e[2] &&
                                                    (e[2].match(/[,.]/)
                                                        ? o.concatArray(r, o.go(e[2], 'pu-9,9'))
                                                        : r.push(e[2])),
                                                (e[3] || e[4]) &&
                                                    ('e' === e[3] || '*' === e[4]
                                                        ? r.push({ type_: 'cdot' })
                                                        : r.push({ type_: 'times' }))),
                                            e[5] && r.push('10^{' + e[5] + '}'),
                                            r
                                        );
                                    },
                                    'number^': function (t, e) {
                                        var r = [];
                                        return (
                                            '+-' === e[0] || '+/-' === e[0]
                                                ? r.push('\\pm ')
                                                : e[0] && r.push(e[0]),
                                            o.concatArray(r, o.go(e[1], 'pu-9,9')),
                                            r.push('^{' + e[2] + '}'),
                                            r
                                        );
                                    },
                                    operator: function (t, e, r) {
                                        return { type_: 'operator', kind_: r || e };
                                    },
                                    space: function () {
                                        return { type_: 'pu-space-1' };
                                    },
                                    output: function (t) {
                                        var e,
                                            r = o.patterns.match_('{(...)}', t.d || '');
                                        r && '' === r.remainder && (t.d = r.match_);
                                        var n = o.patterns.match_('{(...)}', t.q || '');
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
                                            var a = { d: o.go(t.d, 'pu'), q: o.go(t.q, 'pu') };
                                            '//' === t.o
                                                ? (e = { type_: 'pu-frac', p1: a.d, p2: a.q })
                                                : ((e = a.d),
                                                  a.d.length > 1 || a.q.length > 1
                                                      ? e.push({ type_: ' / ' })
                                                      : e.push({ type_: '/' }),
                                                  o.concatArray(e, a.q));
                                        } else e = o.go(t.d, 'pu-2');
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
                                            var r = o.patterns.match_('{(...)}', t.rm || '');
                                            e =
                                                r && '' === r.remainder
                                                    ? o.go(r.match_, 'pu')
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
                                            var r = t.text_.length % 3;
                                            0 === r && (r = 3);
                                            for (var n = t.text_.length - 3; n > 0; n -= 3)
                                                e.push(t.text_.substr(n, 3)),
                                                    e.push({ type_: '1000 separator' });
                                            e.push(t.text_.substr(0, r)), e.reverse();
                                        } else e.push(t.text_);
                                        for (var o in t) delete t[o];
                                        return e;
                                    },
                                    'output-o': function (t) {
                                        var e = [];
                                        if (((t.text_ = t.text_ || ''), t.text_.length > 4)) {
                                            var r = t.text_.length - 3,
                                                n = void 0;
                                            for (n = 0; n < r; n += 3)
                                                e.push(t.text_.substr(n, 3)),
                                                    e.push({ type_: '1000 separator' });
                                            e.push(t.text_.substr(n));
                                        } else e.push(t.text_);
                                        for (var o in t) delete t[o];
                                        return e;
                                    },
                                },
                            },
                        },
                    },
                    a = {
                        go: function (t, e) {
                            if (!t) return '';
                            for (var r = '', n = !1, o = 0; o < t.length; o++) {
                                var i = t[o];
                                'string' == typeof i
                                    ? (r += i)
                                    : ((r += a._go2(i)),
                                      '1st-level escape' === i.type_ && (n = !0));
                            }
                            return e && !n && r && (r = '{' + r + '}'), r;
                        },
                        _goInner: function (t) {
                            return a.go(t, !1);
                        },
                        _go2: function (t) {
                            var e;
                            switch (t.type_) {
                                case 'chemfive':
                                    e = '';
                                    var r = {
                                        a: a._goInner(t.a),
                                        b: a._goInner(t.b),
                                        p: a._goInner(t.p),
                                        o: a._goInner(t.o),
                                        q: a._goInner(t.q),
                                        d: a._goInner(t.d),
                                    };
                                    r.a &&
                                        (r.a.match(/^[+\-]/) && (r.a = '{' + r.a + '}'),
                                        (e += r.a + '\\,')),
                                        (r.b || r.p) &&
                                            ((e += '{\\vphantom{A}}'),
                                            (e +=
                                                '^{\\hphantom{' +
                                                (r.b || '') +
                                                '}}_{\\hphantom{' +
                                                (r.p || '') +
                                                '}}'),
                                            (e += '\\mkern-1.5mu'),
                                            (e += '{\\vphantom{A}}'),
                                            (e +=
                                                '^{\\smash[t]{\\vphantom{2}}\\llap{' +
                                                (r.b || '') +
                                                '}}'),
                                            (e +=
                                                '_{\\vphantom{2}\\llap{\\smash[t]{' +
                                                (r.p || '') +
                                                '}}}')),
                                        r.o &&
                                            (r.o.match(/^[+\-]/) && (r.o = '{' + r.o + '}'),
                                            (e += r.o)),
                                        'kv' === t.dType
                                            ? ((r.d || r.q) && (e += '{\\vphantom{A}}'),
                                              r.d && (e += '^{' + r.d + '}'),
                                              r.q && (e += '_{\\smash[t]{' + r.q + '}}'))
                                            : 'oxidation' === t.dType
                                              ? (r.d &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '^{' + r.d + '}')),
                                                r.q &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '_{\\smash[t]{' + r.q + '}}')))
                                              : (r.q &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '_{\\smash[t]{' + r.q + '}}')),
                                                r.d &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '^{' + r.d + '}')));
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
                                    e = '\\mskip2mu ' + a._goInner(t.p1);
                                    break;
                                case 'state of aggregation subscript':
                                    e = '\\mskip1mu ' + a._goInner(t.p1);
                                    break;
                                case 'bond':
                                    if (!(e = a._getBond(t.kind_)))
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
                                    var o =
                                        '\\frac{' +
                                        a._goInner(t.p1) +
                                        '}{' +
                                        a._goInner(t.p2) +
                                        '}';
                                    e =
                                        '\\mathchoice{\\textstyle' +
                                        o +
                                        '}{' +
                                        o +
                                        '}{' +
                                        o +
                                        '}{' +
                                        o +
                                        '}';
                                    break;
                                case 'tex-math':
                                case '1st-level escape':
                                    e = t.p1 + ' ';
                                    break;
                                case 'frac-ce':
                                    e =
                                        '\\frac{' +
                                        a._goInner(t.p1) +
                                        '}{' +
                                        a._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'overset':
                                    e =
                                        '\\overset{' +
                                        a._goInner(t.p1) +
                                        '}{' +
                                        a._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'underset':
                                    e =
                                        '\\underset{' +
                                        a._goInner(t.p1) +
                                        '}{' +
                                        a._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'underbrace':
                                    e =
                                        '\\underbrace{' +
                                        a._goInner(t.p1) +
                                        '}_{' +
                                        a._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'color':
                                    e = '{\\color{' + t.color1 + '}{' + a._goInner(t.color2) + '}}';
                                    break;
                                case 'color0':
                                    e = '\\color{' + t.color + '}';
                                    break;
                                case 'arrow':
                                    var i = { rd: a._goInner(t.rd), rq: a._goInner(t.rq) },
                                        s = a._getArrow(t.r);
                                    i.rd || i.rq
                                        ? '<=>' === t.r ||
                                          '<=>>' === t.r ||
                                          '<<=>' === t.r ||
                                          '<--\x3e' === t.r
                                            ? ((s = '\\long' + s),
                                              i.rd && (s = '\\overset{' + i.rd + '}{' + s + '}'),
                                              i.rq &&
                                                  (s =
                                                      '<--\x3e' === t.r
                                                          ? '\\underset{\\lower2mu{' +
                                                            i.rq +
                                                            '}}{' +
                                                            s +
                                                            '}'
                                                          : '\\underset{\\lower6mu{' +
                                                            i.rq +
                                                            '}}{' +
                                                            s +
                                                            '}'),
                                              (s = ' {}\\mathrel{' + s + '}{} '))
                                            : (i.rq && (s += '[{' + i.rq + '}]'),
                                              (s =
                                                  ' {}\\mathrel{\\x' +
                                                  (s += '{' + i.rd + '}') +
                                                  '}{} '))
                                        : (s = ' {}\\mathrel{\\long' + s + '}{} '),
                                        (e = s);
                                    break;
                                case 'operator':
                                    e = a._getOperator(t.kind_);
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
        e = {};
    function r(n) {
        var o = e[n];
        if (void 0 !== o) return o.exports;
        var a = (e[n] = { exports: {} });
        return t[n].call(a.exports, a, a.exports, r), a.exports;
    }
    !(function () {
        var t = r(8723),
            e = r(7306),
            n = r(7205),
            o = r(2160),
            a = r(6552),
            i = r(199),
            s = r(2982),
            l = r(2910),
            c = r(8644),
            u = r(8321),
            p = r(4708),
            d = r(6394),
            f = r(7702),
            h = r(9874),
            m = r(7044),
            g = r(3239),
            y = r(4237),
            v = r(7628),
            b = r(7251),
            x = r(7007),
            _ = r(3466),
            M = r(810),
            w = r(1313),
            A = r(6701),
            C = r(7215),
            P = r(3946),
            S = r(3632),
            O = r(2684),
            T = r(1451),
            k = r(3606),
            E = r(8389),
            I = r(724),
            N = r(3067),
            q = r(9267),
            L = r(1677),
            F = r(9365),
            D = r(1990),
            B = r(7404),
            j = r(2146),
            R = r(3583),
            G = r(3118),
            V = r(9489),
            U = r(2632),
            $ = r(322),
            X = r(9570),
            z = r(2298),
            H = r(4151),
            K = r(6961),
            J = r(9574),
            W = r(3997),
            Q = r(3274),
            Z = r(8430),
            Y = r(3904),
            tt = r(6755),
            et = r(5246),
            rt = r(1307),
            nt = r(153),
            ot = r(2565),
            at = r(856),
            it = r(9095),
            st = r(8155),
            lt = r(1331),
            ct = r(885),
            ut = r(1323),
            pt = r(2200),
            dt = r(6706),
            ft = r(8562),
            ht = r(5282),
            mt = r(9569),
            gt = r(8405),
            yt = r(9589),
            vt = r(4996),
            bt = r(1541),
            xt = r(4303),
            _t = r(955),
            Mt = r(7368),
            wt = r(643),
            At = r(82),
            Ct = r(440),
            Pt = r(4302),
            St = r(1158),
            Ot = r(3450),
            Tt = r(4325);
        MathJax.loader && MathJax.loader.checkVersion('input/tex-full', e.q, 'input'),
            (0, t.combineWithMathJax)({
                _: {
                    input: {
                        tex_ts: n,
                        tex: {
                            AllPackages: o,
                            Configuration: a,
                            FilterUtil: i,
                            FindTeX: s,
                            MapHandler: l,
                            NodeFactory: c,
                            NodeUtil: u,
                            ParseMethods: p,
                            ParseOptions: d,
                            ParseUtil: f,
                            Stack: h,
                            StackItem: m,
                            StackItemFactory: g,
                            Symbol: y,
                            SymbolMap: v,
                            Tags: b,
                            TexConstants: x,
                            TexError: _,
                            TexParser: M,
                            action: { ActionConfiguration: w },
                            amscd: { AmsCdConfiguration: A, AmsCdMethods: C },
                            ams: { AmsConfiguration: P, AmsItems: S, AmsMethods: O },
                            autoload: { AutoloadConfiguration: T },
                            base: { BaseConfiguration: k, BaseItems: E, BaseMethods: I },
                            bbox: { BboxConfiguration: N },
                            boldsymbol: { BoldsymbolConfiguration: q },
                            braket: { BraketConfiguration: L, BraketItems: F, BraketMethods: D },
                            bussproofs: {
                                BussproofsConfiguration: B,
                                BussproofsItems: j,
                                BussproofsMethods: R,
                                BussproofsUtil: G,
                            },
                            cancel: { CancelConfiguration: V },
                            cases: { CasesConfiguration: U },
                            centernot: { CenternotConfiguration: $ },
                            colortbl: { ColortblConfiguration: X },
                            colorv2: { ColorV2Configuration: z },
                            color: {
                                ColorConfiguration: H,
                                ColorConstants: K,
                                ColorMethods: J,
                                ColorUtil: W,
                            },
                            configmacros: { ConfigMacrosConfiguration: Q },
                            empheq: { EmpheqConfiguration: Z, EmpheqUtil: Y },
                            enclose: { EncloseConfiguration: tt },
                            extpfeil: { ExtpfeilConfiguration: et },
                            gensymb: { GensymbConfiguration: rt },
                            html: { HtmlConfiguration: nt, HtmlMethods: ot },
                            mathtools: {
                                MathtoolsConfiguration: at,
                                MathtoolsItems: it,
                                MathtoolsMethods: st,
                                MathtoolsTags: lt,
                                MathtoolsUtil: ct,
                            },
                            mhchem: { MhchemConfiguration: ut },
                            newcommand: {
                                NewcommandConfiguration: pt,
                                NewcommandItems: dt,
                                NewcommandMethods: ft,
                                NewcommandUtil: ht,
                            },
                            noerrors: { NoErrorsConfiguration: mt },
                            noundefined: { NoUndefinedConfiguration: gt },
                            physics: {
                                PhysicsConfiguration: yt,
                                PhysicsItems: vt,
                                PhysicsMethods: bt,
                            },
                            require: { RequireConfiguration: xt },
                            setoptions: { SetOptionsConfiguration: _t },
                            tagformat: { TagFormatConfiguration: Mt },
                            textcomp: { TextcompConfiguration: wt },
                            textmacros: {
                                TextMacrosConfiguration: At,
                                TextMacrosMethods: Ct,
                                TextParser: Pt,
                            },
                            unicode: { UnicodeConfiguration: St },
                            upgreek: { UpgreekConfiguration: Ot },
                            verb: { VerbConfiguration: Tt },
                        },
                    },
                },
            }),
            MathJax.loader &&
                MathJax.loader.checkVersion('[tex]/all-packages', e.q, 'tex-extension'),
            (0, t.combineWithMathJax)({
                _: {
                    input: {
                        tex: {
                            AllPackages: o,
                            autoload: { AutoloadConfiguration: T },
                            require: { RequireConfiguration: xt },
                        },
                    },
                },
            });
        var kt,
            Et = r(9077);
        function It() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [],
                e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
            if (MathJax.startup) {
                e &&
                    (MathJax.startup.registerConstructor('tex', MathJax._.input.tex_ts.TeX),
                    MathJax.startup.useInput('tex')),
                    MathJax.config.tex || (MathJax.config.tex = {});
                var r = MathJax.config.tex.packages;
                (MathJax.config.tex.packages = t),
                    r && (0, Et.insert)(MathJax.config.tex, { packages: r });
            }
        }
        function Nt(t, e) {
            (null == e || e > t.length) && (e = t.length);
            for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
            return n;
        }
        MathJax.loader && MathJax.loader.preLoad('[tex]/autoload', '[tex]/require'),
            It(
                ['require'].concat(
                    (function (t) {
                        if (Array.isArray(t)) return Nt(t);
                    })((kt = o.AllPackages)) ||
                        (function (t) {
                            if (
                                ('undefined' != typeof Symbol && null != t[Symbol.iterator]) ||
                                null != t['@@iterator']
                            )
                                return Array.from(t);
                        })(kt) ||
                        (function (t, e) {
                            if (t) {
                                if ('string' == typeof t) return Nt(t, e);
                                var r = Object.prototype.toString.call(t).slice(8, -1);
                                return (
                                    'Object' === r && t.constructor && (r = t.constructor.name),
                                    'Map' === r || 'Set' === r
                                        ? Array.from(t)
                                        : 'Arguments' === r ||
                                            /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
                                          ? Nt(t, e)
                                          : void 0
                                );
                            }
                        })(kt) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
                            );
                        })(),
                ),
                !1,
            ),
            MathJax.loader && MathJax.loader.preLoad('input/tex-base', '[tex]/all-packages'),
            It();
    })();
})();
