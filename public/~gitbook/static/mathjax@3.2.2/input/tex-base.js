!(function () {
    'use strict';
    var t = {
            306: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            205: function (t, e, r) {
                var n,
                    i =
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
                    o =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (o =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var i in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, i) &&
                                                    (t[i] = e[i]);
                                        return t;
                                    }),
                                o.apply(this, arguments)
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.TeX = void 0);
                var l = r(309),
                    u = r(77),
                    c = r(982),
                    f = s(r(199)),
                    p = s(r(321)),
                    h = s(r(810)),
                    d = s(r(466)),
                    m = s(r(394)),
                    y = r(251),
                    g = r(552);
                r(606);
                var v = (function (t) {
                    function e(r) {
                        void 0 === r && (r = {});
                        var n = this,
                            i = a((0, u.separateOptions)(r, e.OPTIONS, c.FindTeX.OPTIONS), 3),
                            o = i[0],
                            s = i[1],
                            l = i[2];
                        (n = t.call(this, s) || this).findTeX =
                            n.options.FindTeX || new c.FindTeX(l);
                        var p = n.options.packages,
                            h = (n.configuration = e.configure(p)),
                            d = (n._parseOptions = new m.default(h, [
                                n.options,
                                y.TagsFactory.OPTIONS,
                            ]));
                        return (
                            (0, u.userOptions)(d.options, o),
                            h.config(n),
                            e.tags(d, h),
                            n.postFilters.add(f.default.cleanSubSup, -6),
                            n.postFilters.add(f.default.setInherited, -5),
                            n.postFilters.add(f.default.moveLimits, -4),
                            n.postFilters.add(f.default.cleanStretchy, -3),
                            n.postFilters.add(f.default.cleanAttributes, -2),
                            n.postFilters.add(f.default.combineRelations, -1),
                            n
                        );
                    }
                    return (
                        i(e, t),
                        (e.configure = function (t) {
                            var e = new g.ParserConfiguration(t, ['tex']);
                            return e.init(), e;
                        }),
                        (e.tags = function (t, e) {
                            y.TagsFactory.addTags(e.tags),
                                y.TagsFactory.setDefault(t.options.tags),
                                (t.tags = y.TagsFactory.getDefault()),
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
                                i = t.display;
                            (this.latex = t.math), this.parseOptions.tags.startEquation(t);
                            try {
                                var o = new h.default(
                                    this.latex,
                                    { display: i, isInner: !1 },
                                    this.parseOptions,
                                );
                                (r = o.mml()), (n = o.stack.global);
                            } catch (t) {
                                if (!(t instanceof d.default)) throw t;
                                (this.parseOptions.error = !0),
                                    (r = this.options.formatError(this, t));
                            }
                            return (
                                (r = this.parseOptions.nodeFactory.create('node', 'math', [r])),
                                (null == n ? void 0 : n.indentalign) &&
                                    p.default.setAttribute(r, 'indentalign', n.indentalign),
                                i && p.default.setAttribute(r, 'display', 'block'),
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
                        (e.OPTIONS = o(o({}, l.AbstractInputJax.OPTIONS), {
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
            552: function (t, e, r) {
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
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ParserConfiguration = e.ConfigurationHandler = e.Configuration = void 0);
                var o,
                    a = r(77),
                    s = r(910),
                    l = r(898),
                    u = r(297),
                    c = r(251),
                    f = (function () {
                        function t(t, e, r, n, i, o, a, s, l, u, c, f, p) {
                            void 0 === e && (e = {}),
                                void 0 === r && (r = {}),
                                void 0 === n && (n = {}),
                                void 0 === i && (i = {}),
                                void 0 === o && (o = {}),
                                void 0 === a && (a = {}),
                                void 0 === s && (s = []),
                                void 0 === l && (l = []),
                                void 0 === u && (u = null),
                                void 0 === c && (c = null),
                                (this.name = t),
                                (this.handler = e),
                                (this.fallback = r),
                                (this.items = n),
                                (this.tags = i),
                                (this.options = o),
                                (this.nodes = a),
                                (this.preprocessors = s),
                                (this.postprocessors = l),
                                (this.initMethod = u),
                                (this.configMethod = c),
                                (this.priority = f),
                                (this.parser = p),
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
                                var i = r.priority || u.PrioritizedList.DEFAULTPRIORITY,
                                    o = r.init ? this.makeProcessor(r.init, i) : null,
                                    a = r.config ? this.makeProcessor(r.config, i) : null,
                                    s = (r.preprocessors || []).map(function (t) {
                                        return n.makeProcessor(t, i);
                                    }),
                                    l = (r.postprocessors || []).map(function (t) {
                                        return n.makeProcessor(t, i);
                                    }),
                                    c = r.parser || 'tex';
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
                                    o,
                                    a,
                                    i,
                                    c,
                                );
                            }),
                            (t.create = function (e, r) {
                                void 0 === r && (r = {});
                                var n = t._create(e, r);
                                return o.set(e, n), n;
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
                (e.Configuration = f),
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
                    })((o = e.ConfigurationHandler || (e.ConfigurationHandler = {})));
                var p = (function () {
                    function t(t, e) {
                        var r, i, o, a;
                        void 0 === e && (e = ['tex']),
                            (this.initMethod = new l.FunctionList()),
                            (this.configMethod = new l.FunctionList()),
                            (this.configurations = new u.PrioritizedList()),
                            (this.parsers = []),
                            (this.handlers = new s.SubHandlers()),
                            (this.items = {}),
                            (this.tags = {}),
                            (this.options = {}),
                            (this.nodes = {}),
                            (this.parsers = e);
                        try {
                            for (
                                var c = n(t.slice().reverse()), f = c.next();
                                !f.done;
                                f = c.next()
                            ) {
                                var p = f.value;
                                this.addPackage(p);
                            }
                        } catch (t) {
                            r = { error: t };
                        } finally {
                            try {
                                f && !f.done && (i = c.return) && i.call(c);
                            } finally {
                                if (r) throw r.error;
                            }
                        }
                        try {
                            for (
                                var h = n(this.configurations), d = h.next();
                                !d.done;
                                d = h.next()
                            ) {
                                var m = d.value,
                                    y = m.item,
                                    g = m.priority;
                                this.append(y, g);
                            }
                        } catch (t) {
                            o = { error: t };
                        } finally {
                            try {
                                d && !d.done && (a = h.return) && a.call(h);
                            } finally {
                                if (o) throw o.error;
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
                                    var i = n(this.configurations), o = i.next();
                                    !o.done;
                                    o = i.next()
                                ) {
                                    var a = o.value;
                                    this.addFilters(t, a.item);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
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
                            var i, o;
                            void 0 === r && (r = {});
                            var s = this.getPackage(t);
                            this.append(s), this.configurations.add(s, s.priority), this.init();
                            var l = e.parseOptions;
                            l.nodeFactory.setCreators(s.nodes);
                            try {
                                for (
                                    var u = n(Object.keys(s.items)), f = u.next();
                                    !f.done;
                                    f = u.next()
                                ) {
                                    var p = f.value;
                                    l.itemFactory.setNodeClass(p, s.items[p]);
                                }
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    f && !f.done && (o = u.return) && o.call(u);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            c.TagsFactory.addTags(s.tags),
                                (0, a.defaultOptions)(l.options, s.options),
                                (0, a.userOptions)(l.options, r),
                                this.addFilters(e, s),
                                s.config && s.config(this, e);
                        }),
                        (t.prototype.getPackage = function (t) {
                            var e = o.get(t);
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
                                (0, a.defaultOptions)(this.options, t.options),
                                Object.assign(this.nodes, t.nodes);
                        }),
                        (t.prototype.addFilters = function (t, e) {
                            var r, o, a, s;
                            try {
                                for (
                                    var l = n(e.preprocessors), u = l.next();
                                    !u.done;
                                    u = l.next()
                                ) {
                                    var c = i(u.value, 2),
                                        f = c[0],
                                        p = c[1];
                                    t.preFilters.add(f, p);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    u && !u.done && (o = l.return) && o.call(l);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            try {
                                for (
                                    var h = n(e.postprocessors), d = h.next();
                                    !d.done;
                                    d = h.next()
                                ) {
                                    var m = i(d.value, 2),
                                        y = m[0];
                                    p = m[1];
                                    t.postFilters.add(y, p);
                                }
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    d && !d.done && (s = h.return) && s.call(h);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                        }),
                        t
                    );
                })();
                e.ParserConfiguration = p;
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
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o,
                    a = r(921),
                    s = i(r(321));
                !(function (t) {
                    (t.cleanStretchy = function (t) {
                        var e,
                            r,
                            i = t.data;
                        try {
                            for (
                                var o = n(i.getList('fixStretchy')), a = o.next();
                                !a.done;
                                a = o.next()
                            ) {
                                var l = a.value;
                                if (s.default.getProperty(l, 'fixStretchy')) {
                                    var u = s.default.getForm(l);
                                    u &&
                                        u[3] &&
                                        u[3].stretchy &&
                                        s.default.setAttribute(l, 'stretchy', !1);
                                    var c = l.parent;
                                    if (!(s.default.getTexClass(l) || (u && u[2]))) {
                                        var f = i.nodeFactory.create('node', 'TeXAtom', [l]);
                                        c.replaceChild(f, l), f.inheritAttributesFrom(l);
                                    }
                                    s.default.removeProperties(l, 'fixStretchy');
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
                    }),
                        (t.cleanAttributes = function (t) {
                            t.data.root.walkTree(function (t, e) {
                                var r,
                                    i,
                                    o = t.attributes;
                                if (o) {
                                    var a = new Set((o.get('mjx-keep-attrs') || '').split(/ /));
                                    delete o.getAllAttributes()['mjx-keep-attrs'];
                                    try {
                                        for (
                                            var s = n(o.getExplicitNames()), l = s.next();
                                            !l.done;
                                            l = s.next()
                                        ) {
                                            var u = l.value;
                                            a.has(u) ||
                                                o.attributes[u] !== t.attributes.getInherited(u) ||
                                                delete o.attributes[u];
                                        }
                                    } catch (t) {
                                        r = { error: t };
                                    } finally {
                                        try {
                                            l && !l.done && (i = s.return) && i.call(s);
                                        } finally {
                                            if (r) throw r.error;
                                        }
                                    }
                                }
                            }, {});
                        }),
                        (t.combineRelations = function (t) {
                            var i,
                                o,
                                l,
                                u,
                                c = [];
                            try {
                                for (
                                    var f = n(t.data.getList('mo')), p = f.next();
                                    !p.done;
                                    p = f.next()
                                ) {
                                    var h = p.value;
                                    if (
                                        !h.getProperty('relationsCombined') &&
                                        h.parent &&
                                        (!h.parent || s.default.isType(h.parent, 'mrow')) &&
                                        s.default.getTexClass(h) === a.TEXCLASS.REL
                                    ) {
                                        for (
                                            var d = h.parent,
                                                m = void 0,
                                                y = d.childNodes,
                                                g = y.indexOf(h) + 1,
                                                v = s.default.getProperty(h, 'variantForm');
                                            g < y.length &&
                                            (m = y[g]) &&
                                            s.default.isType(m, 'mo') &&
                                            s.default.getTexClass(m) === a.TEXCLASS.REL;

                                        ) {
                                            if (
                                                v !== s.default.getProperty(m, 'variantForm') ||
                                                !r(h, m)
                                            ) {
                                                null == h.attributes.getExplicit('rspace') &&
                                                    s.default.setAttribute(h, 'rspace', '0pt'),
                                                    null == m.attributes.getExplicit('lspace') &&
                                                        s.default.setAttribute(m, 'lspace', '0pt');
                                                break;
                                            }
                                            s.default.appendChildren(h, s.default.getChildren(m)),
                                                e(['stretchy', 'rspace'], h, m);
                                            try {
                                                for (
                                                    var b = ((l = void 0), n(m.getPropertyNames())),
                                                        x = b.next();
                                                    !x.done;
                                                    x = b.next()
                                                ) {
                                                    var T = x.value;
                                                    h.setProperty(T, m.getProperty(T));
                                                }
                                            } catch (t) {
                                                l = { error: t };
                                            } finally {
                                                try {
                                                    x && !x.done && (u = b.return) && u.call(b);
                                                } finally {
                                                    if (l) throw l.error;
                                                }
                                            }
                                            y.splice(g, 1),
                                                c.push(m),
                                                (m.parent = null),
                                                m.setProperty('relationsCombined', !0);
                                        }
                                        h.attributes.setInherited('form', h.getForms()[0]);
                                    }
                                }
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    p && !p.done && (o = f.return) && o.call(f);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            t.data.removeFromList('mo', c);
                        });
                    var e = function (t, e, r) {
                            var n = e.attributes,
                                i = r.attributes;
                            t.forEach(function (t) {
                                var e = i.getExplicit(t);
                                null != e && n.set(t, e);
                            });
                        },
                        r = function (t, e) {
                            var r,
                                i,
                                o = function (t, e) {
                                    return t.getExplicitNames().filter(function (r) {
                                        return (
                                            r !== e &&
                                            ('stretchy' !== r || t.getExplicit('stretchy'))
                                        );
                                    });
                                },
                                a = t.attributes,
                                s = e.attributes,
                                l = o(a, 'lspace'),
                                u = o(s, 'rspace');
                            if (l.length !== u.length) return !1;
                            try {
                                for (var c = n(l), f = c.next(); !f.done; f = c.next()) {
                                    var p = f.value;
                                    if (a.getExplicit(p) !== s.getExplicit(p)) return !1;
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    f && !f.done && (i = c.return) && i.call(c);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            return !0;
                        },
                        i = function (t, e, r) {
                            var i,
                                o,
                                a = [];
                            try {
                                for (
                                    var l = n(t.getList('m' + e + r)), u = l.next();
                                    !u.done;
                                    u = l.next()
                                ) {
                                    var c = u.value,
                                        f = c.childNodes;
                                    if (!f[c[e]] || !f[c[r]]) {
                                        var p = c.parent,
                                            h = f[c[e]]
                                                ? t.nodeFactory.create('node', 'm' + e, [
                                                      f[c.base],
                                                      f[c[e]],
                                                  ])
                                                : t.nodeFactory.create('node', 'm' + r, [
                                                      f[c.base],
                                                      f[c[r]],
                                                  ]);
                                        s.default.copyAttributes(c, h),
                                            p ? p.replaceChild(h, c) : (t.root = h),
                                            a.push(c);
                                    }
                                }
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    u && !u.done && (o = l.return) && o.call(l);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            t.removeFromList('m' + e + r, a);
                        };
                    t.cleanSubSup = function (t) {
                        var e = t.data;
                        e.error || (i(e, 'sub', 'sup'), i(e, 'under', 'over'));
                    };
                    var o = function (t, e, r) {
                        var i,
                            o,
                            a = [];
                        try {
                            for (var l = n(t.getList(e)), u = l.next(); !u.done; u = l.next()) {
                                var c = u.value;
                                if (!c.attributes.get('displaystyle')) {
                                    var f = c.childNodes[c.base],
                                        p = f.coreMO();
                                    if (
                                        f.getProperty('movablelimits') &&
                                        !p.attributes.getExplicit('movablelimits')
                                    ) {
                                        var h = t.nodeFactory.create('node', r, c.childNodes);
                                        s.default.copyAttributes(c, h),
                                            c.parent ? c.parent.replaceChild(h, c) : (t.root = h),
                                            a.push(c);
                                    }
                                }
                            }
                        } catch (t) {
                            i = { error: t };
                        } finally {
                            try {
                                u && !u.done && (o = l.return) && o.call(l);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                        t.removeFromList(e, a);
                    };
                    (t.moveLimits = function (t) {
                        var e = t.data;
                        o(e, 'munderover', 'msubsup'),
                            o(e, 'munder', 'msub'),
                            o(e, 'mover', 'msup');
                    }),
                        (t.setInherited = function (t) {
                            t.data.root.setInheritedAttributes({}, t.math.display, 0, !1);
                        });
                })(o || (o = {})),
                    (e.default = o);
            },
            982: function (t, e, r) {
                var n,
                    i =
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
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.FindTeX = void 0);
                var a = r(649),
                    s = r(720),
                    l = r(769),
                    u = (function (t) {
                        function e(e) {
                            var r = t.call(this, e) || this;
                            return r.getPatterns(), r;
                        }
                        return (
                            i(e, t),
                            (e.prototype.getPatterns = function () {
                                var t = this,
                                    e = this.options,
                                    r = [],
                                    n = [],
                                    i = [];
                                (this.end = {}), (this.env = this.sub = 0);
                                var o = 1;
                                e.inlineMath.forEach(function (e) {
                                    return t.addPattern(r, e, !1);
                                }),
                                    e.displayMath.forEach(function (e) {
                                        return t.addPattern(r, e, !0);
                                    }),
                                    r.length && n.push(r.sort(s.sortLength).join('|')),
                                    e.processEnvironments &&
                                        (n.push('\\\\begin\\s*\\{([^}]*)\\}'), (this.env = o), o++),
                                    e.processEscapes && i.push('\\\\([\\\\$])'),
                                    e.processRefs && i.push('(\\\\(?:eq)?ref\\s*\\{[^}]*\\})'),
                                    i.length && (n.push('(' + i.join('|') + ')'), (this.sub = o)),
                                    (this.start = new RegExp(n.join('|'), 'g')),
                                    (this.hasPatterns = n.length > 0);
                            }),
                            (e.prototype.addPattern = function (t, e, r) {
                                var n = o(e, 2),
                                    i = n[0],
                                    a = n[1];
                                t.push((0, s.quotePattern)(i)),
                                    (this.end[i] = [a, r, this.endPattern(a)]);
                            }),
                            (e.prototype.endPattern = function (t, e) {
                                return new RegExp(
                                    (e || (0, s.quotePattern)(t)) + '|\\\\(?:[a-zA-Z]|.)|[{}]',
                                    'g',
                                );
                            }),
                            (e.prototype.findEnd = function (t, e, r, n) {
                                for (
                                    var i,
                                        a = o(n, 3),
                                        s = a[0],
                                        u = a[1],
                                        c = a[2],
                                        f = (c.lastIndex = r.index + r[0].length),
                                        p = 0;
                                    (i = c.exec(t));

                                ) {
                                    if ((i[1] || i[0]) === s && 0 === p)
                                        return (0, l.protoItem)(
                                            r[0],
                                            t.substr(f, i.index - f),
                                            i[0],
                                            e,
                                            r.index,
                                            i.index + i[0].length,
                                            u,
                                        );
                                    '{' === i[0] ? p++ : '}' === i[0] && p && p--;
                                }
                                return null;
                            }),
                            (e.prototype.findMathInString = function (t, e, r) {
                                var n, i;
                                for (this.start.lastIndex = 0; (n = this.start.exec(r)); ) {
                                    if (void 0 !== n[this.env] && this.env) {
                                        var o =
                                            '\\\\end\\s*(\\{' +
                                            (0, s.quotePattern)(n[this.env]) +
                                            '\\})';
                                        (i = this.findEnd(r, e, n, [
                                            '{' + n[this.env] + '}',
                                            !0,
                                            this.endPattern(null, o),
                                        ])) &&
                                            ((i.math = i.open + i.math + i.close),
                                            (i.open = i.close = ''));
                                    } else if (void 0 !== n[this.sub] && this.sub) {
                                        var a = n[this.sub];
                                        o = n.index + n[this.sub].length;
                                        i =
                                            2 === a.length
                                                ? (0, l.protoItem)(
                                                      '',
                                                      a.substr(1),
                                                      '',
                                                      e,
                                                      n.index,
                                                      o,
                                                  )
                                                : (0, l.protoItem)('', a, '', e, n.index, o, !1);
                                    } else i = this.findEnd(r, e, n, this.end[n[0]]);
                                    i && (t.push(i), (this.start.lastIndex = i.end.n));
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
                    })(a.AbstractFindMath);
                e.FindTeX = u;
            },
            910: function (t, e, r) {
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
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SubHandlers = e.SubHandler = e.MapHandler = void 0);
                var o,
                    a = r(297),
                    s = r(898);
                !(function (t) {
                    var e = new Map();
                    (t.register = function (t) {
                        e.set(t.name, t);
                    }),
                        (t.getMap = function (t) {
                            return e.get(t);
                        });
                })((o = e.MapHandler || (e.MapHandler = {})));
                var l = (function () {
                    function t() {
                        (this._configuration = new a.PrioritizedList()),
                            (this._fallback = new s.FunctionList());
                    }
                    return (
                        (t.prototype.add = function (t, e, r) {
                            var i, s;
                            void 0 === r && (r = a.PrioritizedList.DEFAULTPRIORITY);
                            try {
                                for (
                                    var l = n(t.slice().reverse()), u = l.next();
                                    !u.done;
                                    u = l.next()
                                ) {
                                    var c = u.value,
                                        f = o.getMap(c);
                                    if (!f)
                                        return void this.warn(
                                            'Configuration ' + c + ' not found! Omitted.',
                                        );
                                    this._configuration.add(f, r);
                                }
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    u && !u.done && (s = l.return) && s.call(l);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            e && this._fallback.add(e, r);
                        }),
                        (t.prototype.parse = function (t) {
                            var e, r;
                            try {
                                for (
                                    var o = n(this._configuration), a = o.next();
                                    !a.done;
                                    a = o.next()
                                ) {
                                    var s = a.value.item.parse(t);
                                    if (s) return s;
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
                            var l = i(t, 2),
                                u = l[0],
                                c = l[1];
                            Array.from(this._fallback)[0].item(u, c);
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
                                    var i = n(this._configuration), o = i.next();
                                    !o.done;
                                    o = i.next()
                                ) {
                                    var a = o.value.item;
                                    r.push(a.name);
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    o && !o.done && (e = i.return) && e.call(i);
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
                                    var i = n(this._configuration), o = i.next();
                                    !o.done;
                                    o = i.next()
                                ) {
                                    var a = o.value.item;
                                    if (a.contains(t)) return a;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
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
                                    var i = n(this._configuration), o = i.next();
                                    !o.done;
                                    o = i.next()
                                ) {
                                    var a = o.value.item;
                                    if (a.name === t) return a;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
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
                var u = (function () {
                    function t() {
                        this.map = new Map();
                    }
                    return (
                        (t.prototype.add = function (t, e, r) {
                            var i, o;
                            void 0 === r && (r = a.PrioritizedList.DEFAULTPRIORITY);
                            try {
                                for (
                                    var s = n(Object.keys(t)), u = s.next();
                                    !u.done;
                                    u = s.next()
                                ) {
                                    var c = u.value,
                                        f = this.get(c);
                                    f || ((f = new l()), this.set(c, f)), f.add(t[c], e[c], r);
                                }
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    u && !u.done && (o = s.return) && o.call(s);
                                } finally {
                                    if (i) throw i.error;
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
                                    var i = n(this.map.values()), o = i.next();
                                    !o.done;
                                    o = i.next()
                                ) {
                                    var a = o.value.retrieve(t);
                                    if (a) return a;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = i.return) && r.call(i);
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
                e.SubHandlers = u;
            },
            644: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, i = 0, o = e.length; i < o; i++)
                                    (!n && i in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, i)),
                                        (n[i] = e[i]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.NodeFactory = void 0);
                var a = o(r(321)),
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
                            (t.createNode = function (t, e, r, n, i) {
                                void 0 === r && (r = []), void 0 === n && (n = {});
                                var o = t.mmlFactory.create(e);
                                return (
                                    o.setChildren(r),
                                    i && o.appendChild(i),
                                    a.default.setProperties(o, n),
                                    o
                                );
                            }),
                            (t.createToken = function (t, e, r, n) {
                                void 0 === r && (r = {}), void 0 === n && (n = '');
                                var i = t.create('text', n);
                                return t.create('node', e, [], r, i);
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
                                var o = this.factory[t] || this.factory.node,
                                    a = o.apply(void 0, i([this, e[0]], n(e.slice(1)), !1));
                                return 'node' === t && this.configuration.addNode(e[0], a), a;
                            }),
                            (t.prototype.get = function (t) {
                                return this.factory[t];
                            }),
                            t
                        );
                    })();
                e.NodeFactory = s;
            },
            321: function (t, e, r) {
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
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, i = 0, o = e.length; i < o; i++)
                                    (!n && i in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, i)),
                                        (n[i] = e[i]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a,
                    s = r(921),
                    l = r(946);
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
                        var i, o;
                        try {
                            for (var a = n(Object.keys(r)), s = a.next(); !s.done; s = a.next()) {
                                var l = s.value,
                                    u = r[l];
                                'texClass' === l
                                    ? ((t.texClass = u), t.setProperty(l, u))
                                    : 'movablelimits' === l
                                      ? (t.setProperty('movablelimits', u),
                                        (t.isKind('mo') || t.isKind('mstyle')) &&
                                            t.attributes.set('movablelimits', u))
                                      : 'inferred' === l ||
                                        (e.has(l) ? t.setProperty(l, u) : t.attributes.set(l, u));
                            }
                        } catch (t) {
                            i = { error: t };
                        } finally {
                            try {
                                s && !s.done && (o = a.return) && o.call(a);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                    }
                    function a(t, e, r) {
                        (t.childNodes[e] = r), r && (r.parent = t);
                    }
                    function u(t, e) {
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
                            var r, i;
                            try {
                                for (var o = n(e), a = o.next(); !a.done; a = o.next()) {
                                    var s = a.value;
                                    t.appendChild(s);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (i = o.return) && i.call(o);
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
                            t.removeProperty.apply(t, o([], i(e), !1));
                        }),
                        (t.getChildAt = function (t, e) {
                            return t.childNodes[e];
                        }),
                        (t.setChild = a),
                        (t.copyChildren = function (t, e) {
                            for (var r = t.childNodes, n = 0; n < r.length; n++) a(e, n, r[n]);
                        }),
                        (t.copyAttributes = function (t, e) {
                            (e.attributes = t.attributes), r(e, t.getAllProperties());
                        }),
                        (t.isType = u),
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
                            if (!u(t, 'mo')) return null;
                            var i = t,
                                o = i.getForms();
                            try {
                                for (var a = n(o), s = a.next(); !s.done; s = a.next()) {
                                    var c = s.value,
                                        f = l.MmlMo.OPTABLE[c][i.getText()];
                                    if (f) return f;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return null;
                        });
                })(a || (a = {})),
                    (e.default = a);
            },
            708: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, i = 0, o = e.length; i < o; i++)
                                    (!n && i in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, i)),
                                        (n[i] = e[i]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a,
                    s = o(r(321)),
                    l = r(7),
                    u = o(r(702));
                !(function (t) {
                    (t.variable = function (t, e) {
                        var r = u.default.getFontDef(t),
                            n = t.stack.env;
                        n.multiLetterIdentifiers &&
                            '' !== n.font &&
                            ((e = t.string.substr(t.i - 1).match(n.multiLetterIdentifiers)[0]),
                            (t.i += e.length - 1),
                            r.mathvariant === l.TexConstant.Variant.NORMAL &&
                                n.noAutoOP &&
                                e.length > 1 &&
                                (r.autoOP = !1));
                        var i = t.create('token', 'mi', r, e);
                        t.Push(i);
                    }),
                        (t.digit = function (t, e) {
                            var r,
                                n = t.configuration.options.digits,
                                i = t.string.slice(t.i - 1).match(n),
                                o = u.default.getFontDef(t);
                            i
                                ? ((r = t.create('token', 'mn', o, i[0].replace(/[{}]/g, ''))),
                                  (t.i += i[0].length - 1))
                                : (r = t.create('token', 'mo', o, e)),
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
                        (t.environment = function (t, e, r, o) {
                            var a = o[0],
                                s = t.itemFactory
                                    .create('begin')
                                    .setProperties({ name: e, end: a });
                            (s = r.apply(void 0, i([t, s], n(o.slice(1)), !1))), t.Push(s);
                        });
                })(a || (a = {})),
                    (e.default = a);
            },
            394: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, i = 0, o = e.length; i < o; i++)
                                    (!n && i in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, i)),
                                        (n[i] = e[i]));
                            return t.concat(n || Array.prototype.slice.call(e));
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
                var s = a(r(239)),
                    l = r(644),
                    u = a(r(321)),
                    c = r(77),
                    f = (function () {
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
                                c.defaultOptions.apply(void 0, i([this.options], n(e), !1)),
                                (0, c.defaultOptions)(this.options, t.options);
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
                                    var n = u.default.getProperty(e, 'in-lists') || '',
                                        i = (n ? n.split(/,/) : []).concat(t).join(',');
                                    u.default.setProperty(e, 'in-lists', i);
                                }
                            }),
                            (t.prototype.getList = function (t) {
                                var e,
                                    r,
                                    n = this.nodeLists[t] || [],
                                    i = [];
                                try {
                                    for (var a = o(n), s = a.next(); !s.done; s = a.next()) {
                                        var l = s.value;
                                        this.inTree(l) && i.push(l);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (r = a.return) && r.call(a);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return (this.nodeLists[t] = i), i;
                            }),
                            (t.prototype.removeFromList = function (t, e) {
                                var r,
                                    n,
                                    i = this.nodeLists[t] || [];
                                try {
                                    for (var a = o(e), s = a.next(); !s.done; s = a.next()) {
                                        var l = s.value,
                                            u = i.indexOf(l);
                                        u >= 0 && i.splice(u, 1);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (n = a.return) && n.call(a);
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
                e.default = f;
            },
            702: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
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
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a,
                    s = r(921),
                    l = o(r(321)),
                    u = o(r(810)),
                    c = o(r(466)),
                    f = r(29);
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
                        o = '([-+]?([.,]\\d+|\\d+([.,]\\d*)?))',
                        a = '(pt|em|ex|mu|px|mm|cm|in|pc)',
                        p = RegExp('^\\s*' + o + '\\s*' + a + '\\s*$'),
                        h = RegExp('^\\s*' + o + '\\s*' + a + ' ?');
                    function d(t, e) {
                        void 0 === e && (e = !1);
                        var i = t.match(e ? h : p);
                        return i
                            ? (function (t) {
                                  var e = n(t, 3),
                                      i = e[0],
                                      o = e[1],
                                      a = e[2];
                                  if ('mu' !== o) return [i, o, a];
                                  return [m(r[o](parseFloat(i || '1'))).slice(0, -2), 'em', a];
                              })([i[1].replace(/,/, '.'), i[4], i[0].length])
                            : [null, null, 0];
                    }
                    function m(t) {
                        return Math.abs(t) < 6e-4
                            ? '0em'
                            : t.toFixed(3).replace(/\.?0+$/, '') + 'em';
                    }
                    function y(t, e, r) {
                        ('{' !== e && '}' !== e) || (e = '\\' + e);
                        var n = '{\\bigg' + r + ' ' + e + '}',
                            i = '{\\big' + r + ' ' + e + '}';
                        return new u.default('\\mathchoice' + n + i + i + i, {}, t).mml();
                    }
                    function g(t, e, r) {
                        e = e.replace(/^\s+/, f.entities.nbsp).replace(/\s+$/, f.entities.nbsp);
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
                            throw new c.default(
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
                            var r = t.length, n = 0, i = '', o = 0, a = 0, s = !0, l = !1;
                            o < r;

                        ) {
                            var u = t[o++];
                            switch (u) {
                                case ' ':
                                    break;
                                case '{':
                                    s ? a++ : ((l = !1), a > n && (a = n)), n++;
                                    break;
                                case '}':
                                    n && n--, (s || l) && (a--, (l = !0)), (s = !1);
                                    break;
                                default:
                                    if (!n && -1 !== e.indexOf(u))
                                        return [l ? 'true' : b(i, a), u, t.slice(o)];
                                    (s = !1), (l = !1);
                            }
                            i += u;
                        }
                        if (n)
                            throw new c.default(
                                'ExtraOpenMissingClose',
                                'Extra open brace or missing close brace',
                            );
                        return [l ? 'true' : b(i, a), '', t.slice(o)];
                    }
                    (t.matchDimen = d),
                        (t.dimen2em = function (t) {
                            var e = n(d(t), 2),
                                i = e[0],
                                o = e[1],
                                a = parseFloat(i || '1'),
                                s = r[o];
                            return s ? s(a) : 0;
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
                        (t.fenced = function (t, e, r, n, i, o) {
                            void 0 === i && (i = ''), void 0 === o && (o = '');
                            var a,
                                c = t.nodeFactory,
                                f = c.create('node', 'mrow', [], {
                                    open: e,
                                    close: n,
                                    texClass: s.TEXCLASS.INNER,
                                });
                            if (i)
                                a = new u.default('\\' + i + 'l' + e, t.parser.stack.env, t).mml();
                            else {
                                var p = c.create('text', e);
                                a = c.create(
                                    'node',
                                    'mo',
                                    [],
                                    {
                                        fence: !0,
                                        stretchy: !0,
                                        symmetric: !0,
                                        texClass: s.TEXCLASS.OPEN,
                                    },
                                    p,
                                );
                            }
                            if ((l.default.appendChildren(f, [a, r]), i))
                                a = new u.default('\\' + i + 'r' + n, t.parser.stack.env, t).mml();
                            else {
                                var h = c.create('text', n);
                                a = c.create(
                                    'node',
                                    'mo',
                                    [],
                                    {
                                        fence: !0,
                                        stretchy: !0,
                                        symmetric: !0,
                                        texClass: s.TEXCLASS.CLOSE,
                                    },
                                    h,
                                );
                            }
                            return (
                                o && a.attributes.set('mathcolor', o),
                                l.default.appendChildren(f, [a]),
                                f
                            );
                        }),
                        (t.fixedFence = function (t, e, r, n) {
                            var i = t.nodeFactory.create('node', 'mrow', [], {
                                open: e,
                                close: n,
                                texClass: s.TEXCLASS.ORD,
                            });
                            return (
                                e && l.default.appendChildren(i, [y(t, e, 'l')]),
                                l.default.isType(r, 'mrow')
                                    ? l.default.appendChildren(i, l.default.getChildren(r))
                                    : l.default.appendChildren(i, [r]),
                                n && l.default.appendChildren(i, [y(t, n, 'r')]),
                                i
                            );
                        }),
                        (t.mathPalette = y),
                        (t.fixInitialMO = function (t, e) {
                            for (var r = 0, n = e.length; r < n; r++) {
                                var i = e[r];
                                if (
                                    i &&
                                    !l.default.isType(i, 'mspace') &&
                                    (!l.default.isType(i, 'TeXAtom') ||
                                        (l.default.getChildren(i)[0] &&
                                            l.default.getChildren(l.default.getChildren(i)[0])
                                                .length))
                                ) {
                                    if (
                                        l.default.isEmbellished(i) ||
                                        (l.default.isType(i, 'TeXAtom') &&
                                            l.default.getTexClass(i) === s.TEXCLASS.REL)
                                    ) {
                                        var o = t.nodeFactory.create('node', 'mi');
                                        e.unshift(o);
                                    }
                                    break;
                                }
                            }
                        }),
                        (t.internalMath = function (t, e, r, n) {
                            if (t.configuration.options.internalMath)
                                return t.configuration.options.internalMath(t, e, r, n);
                            var i,
                                o,
                                a = n || t.stack.env.font,
                                s = a ? { mathvariant: a } : {},
                                l = [],
                                f = 0,
                                p = 0,
                                h = '',
                                d = 0;
                            if (e.match(/\\?[${}\\]|\\\(|\\(eq)?ref\s*\{/)) {
                                for (; f < e.length; )
                                    if ('$' === (i = e.charAt(f++)))
                                        '$' === h && 0 === d
                                            ? ((o = t.create('node', 'TeXAtom', [
                                                  new u.default(
                                                      e.slice(p, f - 1),
                                                      {},
                                                      t.configuration,
                                                  ).mml(),
                                              ])),
                                              l.push(o),
                                              (h = ''),
                                              (p = f))
                                            : '' === h &&
                                              (p < f - 1 && l.push(g(t, e.slice(p, f - 1), s)),
                                              (h = '$'),
                                              (p = f));
                                    else if ('{' === i && '' !== h) d++;
                                    else if ('}' === i)
                                        if ('}' === h && 0 === d) {
                                            var m = new u.default(
                                                e.slice(p, f),
                                                {},
                                                t.configuration,
                                            ).mml();
                                            (o = t.create('node', 'TeXAtom', [m], s)),
                                                l.push(o),
                                                (h = ''),
                                                (p = f);
                                        } else '' !== h && d && d--;
                                    else if ('\\' === i)
                                        if ('' === h && e.substr(f).match(/^(eq)?ref\s*\{/)) {
                                            var y = RegExp['$&'].length;
                                            p < f - 1 && l.push(g(t, e.slice(p, f - 1), s)),
                                                (h = '}'),
                                                (p = f - 1),
                                                (f += y);
                                        } else
                                            '(' === (i = e.charAt(f++)) && '' === h
                                                ? (p < f - 2 && l.push(g(t, e.slice(p, f - 2), s)),
                                                  (h = ')'),
                                                  (p = f))
                                                : ')' === i && ')' === h && 0 === d
                                                  ? ((o = t.create('node', 'TeXAtom', [
                                                        new u.default(
                                                            e.slice(p, f - 2),
                                                            {},
                                                            t.configuration,
                                                        ).mml(),
                                                    ])),
                                                    l.push(o),
                                                    (h = ''),
                                                    (p = f))
                                                  : i.match(/[${}\\]/) &&
                                                    '' === h &&
                                                    (f--, (e = e.substr(0, f - 1) + e.substr(f)));
                                if ('' !== h)
                                    throw new c.default(
                                        'MathNotTerminated',
                                        'Math not terminated in text box',
                                    );
                            }
                            return (
                                p < e.length && l.push(g(t, e.slice(p), s)),
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
                        (t.internalText = g),
                        (t.underOver = function (e, r, n, i, o) {
                            if (
                                (t.checkMovableLimits(r),
                                l.default.isType(r, 'munderover') && l.default.isEmbellished(r))
                            ) {
                                l.default.setProperties(l.default.getCoreMO(r), {
                                    lspace: 0,
                                    rspace: 0,
                                });
                                var a = e.create('node', 'mo', [], { rspace: 0 });
                                r = e.create('node', 'mrow', [a, r]);
                            }
                            var u = e.create('node', 'munderover', [r]);
                            l.default.setChild(u, 'over' === i ? u.over : u.under, n);
                            var c = u;
                            return (
                                o &&
                                    (c = e.create('node', 'TeXAtom', [u], {
                                        texClass: s.TEXCLASS.OP,
                                        movesupsub: !0,
                                    })),
                                l.default.setProperty(c, 'subsupOK', !0),
                                c
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
                            for (var n = '', i = '', o = 0; o < r.length; ) {
                                var a = r.charAt(o++);
                                if ('\\' === a) n += a + r.charAt(o++);
                                else if ('#' === a)
                                    if ('#' === (a = r.charAt(o++))) n += a;
                                    else {
                                        if (!a.match(/[1-9]/) || parseInt(a, 10) > e.length)
                                            throw new c.default(
                                                'IllegalMacroParam',
                                                'Illegal macro parameter reference',
                                            );
                                        (i = v(t, v(t, i, n), e[parseInt(a, 10) - 1])), (n = '');
                                    }
                                else n += a;
                            }
                            return v(t, i, n);
                        }),
                        (t.addArgs = v),
                        (t.checkMaxMacros = function (t, e) {
                            if (
                                (void 0 === e && (e = !0),
                                !(++t.macroCount <= t.configuration.options.maxMacros))
                            )
                                throw e
                                    ? new c.default(
                                          'MaxMacroSub1',
                                          'MathJax maximum macro substitution count exceeded; is here a recursive macro call?',
                                      )
                                    : new c.default(
                                          'MaxMacroSub2',
                                          'MathJax maximum substitution count exceeded; is there a recursive latex environment?',
                                      );
                        }),
                        (t.checkEqnEnv = function (t) {
                            if (t.stack.global.eqnenv)
                                throw new c.default(
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
                                    var o = (t.getProperty('in-lists') || '').split(/,/);
                                    try {
                                        for (var a = i(o), s = a.next(); !s.done; s = a.next()) {
                                            var l = s.value;
                                            l && n.addNode(l, t);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            s && !s.done && (r = a.return) && r.call(a);
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
                            var o, a;
                            void 0 === e && (e = null), void 0 === r && (r = !1);
                            var s = (function (t) {
                                var e,
                                    r,
                                    i,
                                    o,
                                    a,
                                    s = {},
                                    l = t;
                                for (; l; )
                                    (o = (e = n(x(l, ['=', ',']), 3))[0]),
                                        (i = e[1]),
                                        (l = e[2]),
                                        '=' === i
                                            ? ((a = (r = n(x(l, [',']), 3))[0]),
                                              (i = r[1]),
                                              (l = r[2]),
                                              (a =
                                                  'false' === a || 'true' === a
                                                      ? JSON.parse(a)
                                                      : a),
                                              (s[o] = a))
                                            : o && (s[o] = !0);
                                return s;
                            })(t);
                            if (e)
                                try {
                                    for (
                                        var l = i(Object.keys(s)), u = l.next();
                                        !u.done;
                                        u = l.next()
                                    ) {
                                        var f = u.value;
                                        if (!e.hasOwnProperty(f)) {
                                            if (r)
                                                throw new c.default(
                                                    'InvalidOption',
                                                    'Invalid option: %1',
                                                    f,
                                                );
                                            delete s[f];
                                        }
                                    }
                                } catch (t) {
                                    o = { error: t };
                                } finally {
                                    try {
                                        u && !u.done && (a = l.return) && a.call(l);
                                    } finally {
                                        if (o) throw o.error;
                                    }
                                }
                            return s;
                        });
                })(a || (a = {})),
                    (e.default = a);
            },
            874: function (t, e, r) {
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
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, i = 0, o = e.length; i < o; i++)
                                    (!n && i in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, i)),
                                        (n[i] = e[i]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = a(r(321)),
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
                                for (var t, e, r = [], a = 0; a < arguments.length; a++)
                                    r[a] = arguments[a];
                                try {
                                    for (var l = n(r), u = l.next(); !u.done; u = l.next()) {
                                        var c = u.value;
                                        if (c) {
                                            var f = s.default.isNode(c)
                                                ? this._factory.create('mml', c)
                                                : c;
                                            f.global = this.global;
                                            var p = i(
                                                    this.stack.length
                                                        ? this.Top().checkItem(f)
                                                        : [null, !0],
                                                    2,
                                                ),
                                                h = p[0],
                                                d = p[1];
                                            d &&
                                                (h
                                                    ? (this.Pop(),
                                                      this.Push.apply(this, o([], i(h), !1)))
                                                    : (this.stack.push(f),
                                                      f.env
                                                          ? (f.copyEnv &&
                                                                Object.assign(f.env, this.env),
                                                            (this.env = f.env))
                                                          : (f.env = this.env)));
                                        }
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        u && !u.done && (e = l.return) && e.call(l);
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
            44: function (t, e, r) {
                var n,
                    i =
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
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, i = 0, o = e.length; i < o; i++)
                                    (!n && i in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, i)),
                                        (n[i] = e[i]));
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
                var u = l(r(466)),
                    c = (function () {
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
                                (t = this._nodes).push.apply(t, a([], o(e), !1));
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
                                    a([t], o(r), !1),
                                );
                            }),
                            t
                        );
                    })();
                e.MmlStack = c;
                var f = (function (t) {
                    function e(e) {
                        for (var r = [], n = 1; n < arguments.length; n++) r[n - 1] = arguments[n];
                        var i = t.call(this, r) || this;
                        return (
                            (i.factory = e),
                            (i.global = {}),
                            (i._properties = {}),
                            i.isOpen && (i._env = {}),
                            i
                        );
                    }
                    return (
                        i(e, t),
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
                                throw new u.default('Misplaced', 'Misplaced %1', t.getName());
                            }
                            if (t.isClose && this.getErrors(t.kind)) {
                                var r = o(this.getErrors(t.kind), 2),
                                    n = r[0],
                                    i = r[1];
                                throw new u.default(n, i, t.getName());
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
                                    var i = n.value;
                                    delete this.env[i];
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
                })(c);
                e.BaseItem = f;
            },
            239: function (t, e, r) {
                var n,
                    i,
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
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = r(44),
                    s = r(752),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return o(e, t), e;
                    })(a.BaseItem),
                    u = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.defaultKind = 'dummy'), (e.configuration = null), e;
                        }
                        return (
                            o(e, t),
                            (e.DefaultStackItems = (((i = {})[l.prototype.kind] = l), i)),
                            e
                        );
                    })(s.AbstractFactory);
                e.default = u;
            },
            237: function (t, e) {
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
            628: function (t, e, r) {
                var n,
                    i =
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
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
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
                    s =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, i = 0, o = e.length; i < o; i++)
                                    (!n && i in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, i)),
                                        (n[i] = e[i]));
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
                var l = r(237),
                    u = r(910);
                function c(t) {
                    return void 0 === t || t;
                }
                e.parseResult = c;
                var f = (function () {
                    function t(t, e) {
                        (this._name = t), (this._parser = e), u.MapHandler.register(this);
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
                            var e = o(t, 2),
                                r = e[0],
                                n = e[1],
                                i = this.parserFor(n),
                                a = this.lookup(n);
                            return i && a ? c(i(r, a)) : null;
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
                e.AbstractSymbolMap = f;
                var p = (function (t) {
                    function e(e, r, n) {
                        var i = t.call(this, e, r) || this;
                        return (i._regExp = n), i;
                    }
                    return (
                        i(e, t),
                        (e.prototype.contains = function (t) {
                            return this._regExp.test(t);
                        }),
                        (e.prototype.lookup = function (t) {
                            return this.contains(t) ? t : null;
                        }),
                        e
                    );
                })(f);
                e.RegExpMap = p;
                var h = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.map = new Map()), e;
                    }
                    return (
                        i(e, t),
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
                })(f);
                e.AbstractParseMap = h;
                var d = (function (t) {
                    function e(e, r, n) {
                        var i,
                            s,
                            u = t.call(this, e, r) || this;
                        try {
                            for (var c = a(Object.keys(n)), f = c.next(); !f.done; f = c.next()) {
                                var p = f.value,
                                    h = n[p],
                                    d = o('string' == typeof h ? [h, null] : h, 2),
                                    m = d[0],
                                    y = d[1],
                                    g = new l.Symbol(p, m, y);
                                u.add(p, g);
                            }
                        } catch (t) {
                            i = { error: t };
                        } finally {
                            try {
                                f && !f.done && (s = c.return) && s.call(c);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                        return u;
                    }
                    return i(e, t), e;
                })(h);
                e.CharacterMap = d;
                var m = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
                        (e.prototype.parse = function (e) {
                            var r = o(e, 2),
                                n = r[0],
                                i = r[1];
                            return t.prototype.parse.call(this, [n, '\\' + i]);
                        }),
                        e
                    );
                })(d);
                e.DelimiterMap = m;
                var y = (function (t) {
                    function e(e, r, n) {
                        var i,
                            s,
                            u = t.call(this, e, null) || this;
                        try {
                            for (var c = a(Object.keys(r)), f = c.next(); !f.done; f = c.next()) {
                                var p = f.value,
                                    h = r[p],
                                    d = o('string' == typeof h ? [h] : h),
                                    m = d[0],
                                    y = d.slice(1),
                                    g = new l.Macro(p, n[m], y);
                                u.add(p, g);
                            }
                        } catch (t) {
                            i = { error: t };
                        } finally {
                            try {
                                f && !f.done && (s = c.return) && s.call(c);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                        return u;
                    }
                    return (
                        i(e, t),
                        (e.prototype.parserFor = function (t) {
                            var e = this.lookup(t);
                            return e ? e.func : null;
                        }),
                        (e.prototype.parse = function (t) {
                            var e = o(t, 2),
                                r = e[0],
                                n = e[1],
                                i = this.lookup(n),
                                a = this.parserFor(n);
                            return i && a
                                ? c(a.apply(void 0, s([r, i.symbol], o(i.args), !1)))
                                : null;
                        }),
                        e
                    );
                })(h);
                e.MacroMap = y;
                var g = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
                        (e.prototype.parse = function (t) {
                            var e = o(t, 2),
                                r = e[0],
                                n = e[1],
                                i = this.lookup(n),
                                a = this.parserFor(n);
                            if (!i || !a) return null;
                            var l = r.currentCS;
                            r.currentCS = '\\' + n;
                            var u = a.apply(void 0, s([r, '\\' + i.symbol], o(i.args), !1));
                            return (r.currentCS = l), c(u);
                        }),
                        e
                    );
                })(y);
                e.CommandMap = g;
                var v = (function (t) {
                    function e(e, r, n, i) {
                        var o = t.call(this, e, n, i) || this;
                        return (o.parser = r), o;
                    }
                    return (
                        i(e, t),
                        (e.prototype.parse = function (t) {
                            var e = o(t, 2),
                                r = e[0],
                                n = e[1],
                                i = this.lookup(n),
                                a = this.parserFor(n);
                            return i && a ? c(this.parser(r, i.symbol, a, i.args)) : null;
                        }),
                        e
                    );
                })(y);
                e.EnvironmentMap = v;
            },
            251: function (t, e, r) {
                var n,
                    i =
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
                    (e.TagsFactory =
                        e.AllTags =
                        e.NoTags =
                        e.AbstractTags =
                        e.TagInfo =
                        e.Label =
                            void 0);
                var s = a(r(810)),
                    l = function (t, e) {
                        void 0 === t && (t = '???'),
                            void 0 === e && (e = ''),
                            (this.tag = t),
                            (this.id = e);
                    };
                e.Label = l;
                var u = function (t, e, r, n, i, o, a, s) {
                    void 0 === t && (t = ''),
                        void 0 === e && (e = !1),
                        void 0 === r && (r = !1),
                        void 0 === n && (n = null),
                        void 0 === i && (i = ''),
                        void 0 === o && (o = ''),
                        void 0 === a && (a = !1),
                        void 0 === s && (s = ''),
                        (this.env = t),
                        (this.taggable = e),
                        (this.defaultTags = r),
                        (this.tag = n),
                        (this.tagId = i),
                        (this.tagFormat = o),
                        (this.noTag = a),
                        (this.labelId = s);
                };
                e.TagInfo = u;
                var c = (function () {
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
                            (this.currentTag = new u()),
                            (this.history = []),
                            (this.stack = []),
                            (this.enTag = function (t, e) {
                                var r = this.configuration.nodeFactory,
                                    n = r.create('node', 'mtd', [t]),
                                    i = r.create('node', 'mlabeledtr', [e, n]);
                                return r.create('node', 'mtable', [i], {
                                    side: this.configuration.options.tagSide,
                                    minlabelspacing: this.configuration.options.tagIndent,
                                    displaystyle: !0,
                                });
                            });
                    }
                    return (
                        (t.prototype.start = function (t, e, r) {
                            this.currentTag && this.stack.push(this.currentTag),
                                (this.currentTag = new u(t, e, r));
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
                                (this.currentTag = new u('', void 0, void 0)),
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
                e.AbstractTags = c;
                var f = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
                        (e.prototype.autoTag = function () {}),
                        (e.prototype.getTag = function () {
                            return this.currentTag.tag ? t.prototype.getTag.call(this) : null;
                        }),
                        e
                    );
                })(c);
                e.NoTags = f;
                var p = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                })(c);
                (e.AllTags = p),
                    (function (t) {
                        var e = new Map([
                                ['none', f],
                                ['all', p],
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
                                        var i = o(Object.keys(e)), a = i.next();
                                        !a.done;
                                        a = i.next()
                                    ) {
                                        var s = a.value;
                                        t.add(s, e[s]);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        a && !a.done && (n = i.return) && n.call(i);
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
            7: function (t, e) {
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
            466: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 });
                var r = (function () {
                    function t(e, r) {
                        for (var n = [], i = 2; i < arguments.length; i++) n[i - 2] = arguments[i];
                        (this.id = e), (this.message = t.processString(r, n));
                    }
                    return (
                        (t.processString = function (e, r) {
                            for (var n = e.split(t.pattern), i = 1, o = n.length; i < o; i += 2) {
                                var a = n[i].charAt(0);
                                if (a >= '0' && a <= '9')
                                    (n[i] = r[parseInt(n[i], 10) - 1]),
                                        'number' == typeof n[i] && (n[i] = n[i].toString());
                                else if ('{' === a) {
                                    if ((a = n[i].substr(1)) >= '0' && a <= '9')
                                        (n[i] =
                                            r[parseInt(n[i].substr(1, n[i].length - 2), 10) - 1]),
                                            'number' == typeof n[i] && (n[i] = n[i].toString());
                                    else
                                        n[i].match(/^\{([a-z]+):%(\d+)\|(.*)\}$/) &&
                                            (n[i] = '%' + n[i]);
                                }
                                null == n[i] && (n[i] = '???');
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
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, i = 0, o = e.length; i < o; i++)
                                    (!n && i in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, i)),
                                        (n[i] = e[i]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = a(r(702)),
                    l = a(r(874)),
                    u = a(r(466)),
                    c = r(921),
                    f = (function () {
                        function t(t, e, r) {
                            var i, o;
                            (this._string = t),
                                (this.configuration = r),
                                (this.macroCount = 0),
                                (this.i = 0),
                                (this.currentCS = '');
                            var a,
                                s = e.hasOwnProperty('isInner'),
                                u = e.isInner;
                            if ((delete e.isInner, e)) {
                                a = {};
                                try {
                                    for (
                                        var c = n(Object.keys(e)), f = c.next();
                                        !f.done;
                                        f = c.next()
                                    ) {
                                        var p = f.value;
                                        a[p] = e[p];
                                    }
                                } catch (t) {
                                    i = { error: t };
                                } finally {
                                    try {
                                        f && !f.done && (o = c.return) && o.call(c);
                                    } finally {
                                        if (i) throw i.error;
                                    }
                                }
                            }
                            this.configuration.pushParser(this),
                                (this.stack = new l.default(this.itemFactory, a, !s || u)),
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
                                        var i = n(Array.from(this.configuration.handlers.keys())),
                                            o = i.next();
                                        !o.done;
                                        o = i.next()
                                    ) {
                                        var a = o.value;
                                        r += a + ': ' + this.configuration.handlers.get(a) + '\n';
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        o && !o.done && (e = i.return) && e.call(i);
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
                                t instanceof c.AbstractMmlNode && t.isInferred
                                    ? this.PushAll(t.childNodes)
                                    : this.stack.Push(t);
                            }),
                            (t.prototype.PushAll = function (t) {
                                var e, r;
                                try {
                                    for (var i = n(t), o = i.next(); !o.done; o = i.next()) {
                                        var a = o.value;
                                        this.stack.Push(a);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        o && !o.done && (r = i.return) && r.call(i);
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
                                            throw new u.default(
                                                'MissingArgFor',
                                                'Missing argument for %1',
                                                this.currentCS,
                                            );
                                        return null;
                                    case '}':
                                        if (!e)
                                            throw new u.default(
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
                                        throw new u.default(
                                            'MissingCloseBrace',
                                            'Missing close brace',
                                        );
                                }
                                var i = this.getCodePoint();
                                return (this.i += i.length), i;
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
                                                throw new u.default(
                                                    'ExtraCloseLooking',
                                                    'Extra close brace while looking for %1',
                                                    "']'",
                                                );
                                            break;
                                        case ']':
                                            if (0 === n) return this.string.slice(r, this.i - 1);
                                    }
                                throw new u.default(
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
                                throw new u.default(
                                    'MissingOrUnrecognizedDelim',
                                    'Missing or unrecognized delimiter for %1',
                                    this.currentCS,
                                );
                            }),
                            (t.prototype.GetDimen = function (t) {
                                if ('{' === this.GetNext()) {
                                    var e = this.GetArgument(t),
                                        r = i(s.default.matchDimen(e), 2),
                                        n = r[0],
                                        o = r[1];
                                    if (n) return n + o;
                                } else {
                                    e = this.string.slice(this.i);
                                    var a = i(s.default.matchDimen(e, !0), 3),
                                        l = ((n = a[0]), (o = a[1]), a[2]);
                                    if (n) return (this.i += l), n + o;
                                }
                                throw new u.default(
                                    'MissingDimOrUnits',
                                    'Missing dimension or its units for %1',
                                    this.currentCS,
                                );
                            }),
                            (t.prototype.GetUpTo = function (t, e) {
                                for (; this.nextIsSpace(); ) this.i++;
                                for (var r = this.i, n = 0; this.i < this.string.length; ) {
                                    var i = this.i,
                                        o = this.GetNext();
                                    switch (((this.i += o.length), o)) {
                                        case '\\':
                                            o += this.GetCS();
                                            break;
                                        case '{':
                                            n++;
                                            break;
                                        case '}':
                                            if (0 === n)
                                                throw new u.default(
                                                    'ExtraCloseLooking',
                                                    'Extra close brace while looking for %1',
                                                    e,
                                                );
                                            n--;
                                    }
                                    if (0 === n && o === e) return this.string.slice(r, i);
                                }
                                throw new u.default(
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
                                throw new u.default(
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
                                    o([t], i(r), !1),
                                );
                            }),
                            t
                        );
                    })();
                e.default = f;
            },
            606: function (t, e, r) {
                var n,
                    i,
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
                                  var i = Object.getOwnPropertyDescriptor(e, r);
                                  (i &&
                                      !('get' in i
                                          ? !e.__esModule
                                          : i.writable || i.configurable)) ||
                                      (i = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, i);
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
                                        a(e, t, r);
                            return s(e, t), e;
                        },
                    u =
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
                    c =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BaseConfiguration = e.BaseTags = e.Other = void 0);
                var f = r(552),
                    p = r(910),
                    h = c(r(466)),
                    d = c(r(321)),
                    m = r(628),
                    y = l(r(389)),
                    g = r(251);
                r(962);
                var v = r(857);
                function b(t, e) {
                    var r = t.stack.env.font ? { mathvariant: t.stack.env.font } : {},
                        n = p.MapHandler.getMap('remap').lookup(e),
                        i = (0, v.getRange)(e),
                        o = i ? i[3] : 'mo',
                        a = t.create('token', o, r, n ? n.char : e);
                    i[4] && a.attributes.set('mathvariant', i[4]),
                        'mo' === o &&
                            (d.default.setProperty(a, 'fixStretchy', !0),
                            t.configuration.addNode('fixStretchy', a)),
                        t.Push(a);
                }
                new m.CharacterMap('remap', null, { '-': '\u2212', '*': '\u2217', '`': '\u2018' }),
                    (e.Other = b);
                var x = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return o(e, t), e;
                })(g.AbstractTags);
                (e.BaseTags = x),
                    (e.BaseConfiguration = f.Configuration.create('base', {
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
                                throw new h.default(
                                    'UndefinedControlSequence',
                                    'Undefined control sequence %1',
                                    '\\' + e,
                                );
                            },
                            environment: function (t, e) {
                                throw new h.default('UnknownEnv', "Unknown environment '%1'", e);
                            },
                        },
                        items:
                            ((i = {}),
                            (i[y.StartItem.prototype.kind] = y.StartItem),
                            (i[y.StopItem.prototype.kind] = y.StopItem),
                            (i[y.OpenItem.prototype.kind] = y.OpenItem),
                            (i[y.CloseItem.prototype.kind] = y.CloseItem),
                            (i[y.PrimeItem.prototype.kind] = y.PrimeItem),
                            (i[y.SubsupItem.prototype.kind] = y.SubsupItem),
                            (i[y.OverItem.prototype.kind] = y.OverItem),
                            (i[y.LeftItem.prototype.kind] = y.LeftItem),
                            (i[y.Middle.prototype.kind] = y.Middle),
                            (i[y.RightItem.prototype.kind] = y.RightItem),
                            (i[y.BeginItem.prototype.kind] = y.BeginItem),
                            (i[y.EndItem.prototype.kind] = y.EndItem),
                            (i[y.StyleItem.prototype.kind] = y.StyleItem),
                            (i[y.PositionItem.prototype.kind] = y.PositionItem),
                            (i[y.CellItem.prototype.kind] = y.CellItem),
                            (i[y.MmlItem.prototype.kind] = y.MmlItem),
                            (i[y.FnItem.prototype.kind] = y.FnItem),
                            (i[y.NotItem.prototype.kind] = y.NotItem),
                            (i[y.NonscriptItem.prototype.kind] = y.NonscriptItem),
                            (i[y.DotsItem.prototype.kind] = y.DotsItem),
                            (i[y.ArrayItem.prototype.kind] = y.ArrayItem),
                            (i[y.EqnArrayItem.prototype.kind] = y.EqnArrayItem),
                            (i[y.EquationItem.prototype.kind] = y.EquationItem),
                            i),
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
                                            var i = u(n.getList('nonscript')), o = i.next();
                                            !o.done;
                                            o = i.next()
                                        ) {
                                            var a = o.value;
                                            if (a.attributes.get('scriptlevel') > 0) {
                                                var s = a.parent;
                                                if (
                                                    (s.childNodes.splice(s.childIndex(a), 1),
                                                    n.removeFromList(a.kind, [a]),
                                                    a.isKind('mrow'))
                                                ) {
                                                    var l = a.childNodes[0];
                                                    n.removeFromList('mstyle', [l]),
                                                        n.removeFromList(
                                                            'mspace',
                                                            l.childNodes[0].childNodes,
                                                        );
                                                }
                                            } else
                                                a.isKind('mrow') &&
                                                    (a.parent.replaceChild(a.childNodes[0], a),
                                                    n.removeFromList('mrow', [a]));
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            o && !o.done && (r = i.return) && r.call(i);
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
            389: function (t, e, r) {
                var n,
                    i =
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
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, i = 0, o = e.length; i < o; i++)
                                    (!n && i in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, i)),
                                        (n[i] = e[i]));
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
                var l = r(910),
                    u = r(29),
                    c = r(921),
                    f = s(r(466)),
                    p = s(r(702)),
                    h = s(r(321)),
                    d = r(44),
                    m = (function (t) {
                        function e(e, r) {
                            var n = t.call(this, e) || this;
                            return (n.global = r), n;
                        }
                        return (
                            i(e, t),
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
                    })(d.BaseItem);
                e.StartItem = m;
                var y = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                })(d.BaseItem);
                e.StopItem = y;
                var g = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                        (e.errors = Object.assign(Object.create(d.BaseItem.errors), {
                            stop: [
                                'ExtraOpenMissingClose',
                                'Extra open brace or missing close brace',
                            ],
                        })),
                        e
                    );
                })(d.BaseItem);
                e.OpenItem = g;
                var v = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                })(d.BaseItem);
                e.CloseItem = v;
                var b = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'prime';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (t) {
                            var e = o(this.Peek(2), 2),
                                r = e[0],
                                n = e[1];
                            return !h.default.isType(r, 'msubsup') || h.default.isType(r, 'msup')
                                ? [[this.create('node', 'msup', [r, n]), t], !0]
                                : (h.default.setChild(r, r.sup, n), [[r, t], !0]);
                        }),
                        e
                    );
                })(d.BaseItem);
                e.PrimeItem = b;
                var x = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'subsup';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isKind('open') || e.isKind('left')) return d.BaseItem.success;
                            var r = this.First,
                                n = this.getProperty('position');
                            if (e.isKind('mml')) {
                                if (this.getProperty('primes'))
                                    if (2 !== n)
                                        h.default.setChild(r, 2, this.getProperty('primes'));
                                    else {
                                        h.default.setProperty(
                                            this.getProperty('primes'),
                                            'variantForm',
                                            !0,
                                        );
                                        var i = this.create('node', 'mrow', [
                                            this.getProperty('primes'),
                                            e.First,
                                        ]);
                                        e.First = i;
                                    }
                                return (
                                    h.default.setChild(r, n, e.First),
                                    null != this.getProperty('movesupsub') &&
                                        h.default.setProperty(
                                            r,
                                            'movesupsub',
                                            this.getProperty('movesupsub'),
                                        ),
                                    [[this.factory.create('mml', r)], !0]
                                );
                            }
                            if (t.prototype.checkItem.call(this, e)[1]) {
                                var s = this.getErrors(['', 'sub', 'sup'][n]);
                                throw new (f.default.bind.apply(
                                    f.default,
                                    a([void 0, s[0], s[1]], o(s.splice(2)), !1),
                                ))();
                            }
                            return null;
                        }),
                        (e.errors = Object.assign(Object.create(d.BaseItem.errors), {
                            stop: ['MissingScript', 'Missing superscript or subscript argument'],
                            sup: ['MissingOpenForSup', 'Missing open brace for superscript'],
                            sub: ['MissingOpenForSub', 'Missing open brace for subscript'],
                        })),
                        e
                    );
                })(d.BaseItem);
                e.SubsupItem = x;
                var T = (function (t) {
                    function e(e) {
                        var r = t.call(this, e) || this;
                        return r.setProperty('name', '\\over'), r;
                    }
                    return (
                        i(e, t),
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
                                throw new f.default(
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
                                        h.default.setAttribute(
                                            r,
                                            'linethickness',
                                            this.getProperty('thickness'),
                                        ),
                                    (this.getProperty('open') || this.getProperty('close')) &&
                                        (h.default.setProperty(r, 'withDelims', !0),
                                        (r = p.default.fixedFence(
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
                })(d.BaseItem);
                e.OverItem = T;
                var M = (function (t) {
                    function e(e, r) {
                        var n = t.call(this, e) || this;
                        return n.setProperty('delim', r), n;
                    }
                    return (
                        i(e, t),
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
                                            p.default.fenced(
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
                                            texClass: c.TEXCLASS.CLOSE,
                                        }),
                                        this.create('token', 'mo', r, e.getProperty('delim')),
                                        this.create('node', 'TeXAtom', [], {
                                            texClass: c.TEXCLASS.OPEN,
                                        }),
                                    ),
                                    (this.env = {}),
                                    [[this], !0]
                                );
                            }
                            return t.prototype.checkItem.call(this, e);
                        }),
                        (e.errors = Object.assign(Object.create(d.BaseItem.errors), {
                            stop: ['ExtraLeftMissingRight', 'Extra \\left or missing \\right'],
                        })),
                        e
                    );
                })(d.BaseItem);
                e.LeftItem = M;
                var P = (function (t) {
                    function e(e, r, n) {
                        var i = t.call(this, e) || this;
                        return i.setProperty('delim', r), n && i.setProperty('color', n), i;
                    }
                    return (
                        i(e, t),
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
                })(d.BaseItem);
                e.Middle = P;
                var O = (function (t) {
                    function e(e, r, n) {
                        var i = t.call(this, e) || this;
                        return i.setProperty('delim', r), n && i.setProperty('color', n), i;
                    }
                    return (
                        i(e, t),
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
                })(d.BaseItem);
                e.RightItem = O;
                var S = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                                    throw new f.default(
                                        'EnvBadEnd',
                                        '\\begin{%1} ended with \\end{%2}',
                                        this.getName(),
                                        e.getName(),
                                    );
                                return this.getProperty('end')
                                    ? d.BaseItem.fail
                                    : [[this.factory.create('mml', this.toMml())], !0];
                            }
                            if (e.isKind('stop'))
                                throw new f.default(
                                    'EnvMissingEnd',
                                    'Missing \\end{%1}',
                                    this.getName(),
                                );
                            return t.prototype.checkItem.call(this, e);
                        }),
                        e
                    );
                })(d.BaseItem);
                e.BeginItem = S;
                var A = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                })(d.BaseItem);
                e.EndItem = A;
                var C = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                })(d.BaseItem);
                e.StyleItem = C;
                var w = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'position';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (e) {
                            if (e.isClose)
                                throw new f.default(
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
                })(d.BaseItem);
                e.PositionItem = w;
                var _ = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                })(d.BaseItem);
                e.CellItem = _;
                var E = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                })(d.BaseItem);
                e.MmlItem = E;
                var k = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                                if (e.isOpen) return d.BaseItem.success;
                                if (!e.isKind('fn')) {
                                    var n = e.First;
                                    if (!e.isKind('mml') || !n) return [[r, e], !0];
                                    if (
                                        (h.default.isType(n, 'mstyle') &&
                                            n.childNodes.length &&
                                            h.default.isType(
                                                n.childNodes[0].childNodes[0],
                                                'mspace',
                                            )) ||
                                        h.default.isType(n, 'mspace')
                                    )
                                        return [[r, e], !0];
                                    h.default.isEmbellished(n) && (n = h.default.getCoreMO(n));
                                    var i = h.default.getForm(n);
                                    if (null != i && [0, 0, 1, 1, 0, 1, 1, 0, 0, 0][i[2]])
                                        return [[r, e], !0];
                                }
                                var o = this.create(
                                    'token',
                                    'mo',
                                    { texClass: c.TEXCLASS.NONE },
                                    u.entities.ApplyFunction,
                                );
                                return [[r, o, e], !0];
                            }
                            return t.prototype.checkItem.apply(this, arguments);
                        }),
                        e
                    );
                })(d.BaseItem);
                e.FnItem = k;
                var I = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.remap = l.MapHandler.getMap('not_remap')), e;
                    }
                    return (
                        i(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'not';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (t) {
                            var e, r, n;
                            if (t.isKind('open') || t.isKind('left')) return d.BaseItem.success;
                            if (
                                t.isKind('mml') &&
                                (h.default.isType(t.First, 'mo') ||
                                    h.default.isType(t.First, 'mi') ||
                                    h.default.isType(t.First, 'mtext')) &&
                                ((e = t.First),
                                1 === (r = h.default.getText(e)).length &&
                                    !h.default.getProperty(e, 'movesupsub') &&
                                    1 === h.default.getChildren(e).length)
                            )
                                return (
                                    this.remap.contains(r)
                                        ? ((n = this.create('text', this.remap.lookup(r).char)),
                                          h.default.setChild(e, 0, n))
                                        : ((n = this.create('text', '\u0338')),
                                          h.default.appendChildren(e, [n])),
                                    [[t], !0]
                                );
                            n = this.create('text', '\u29f8');
                            var i = this.create('node', 'mtext', [], {}, n),
                                o = this.create('node', 'mpadded', [i], { width: 0 });
                            return [
                                [
                                    (e = this.create('node', 'TeXAtom', [o], {
                                        texClass: c.TEXCLASS.REL,
                                    })),
                                    t,
                                ],
                                !0,
                            ];
                        }),
                        e
                    );
                })(d.BaseItem);
                e.NotItem = I;
                var L = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
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
                                        (e = h.default.getChildren(h.default.getChildren(e)[0])[0]),
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
                })(d.BaseItem);
                e.NonscriptItem = L;
                var F = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        i(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'dots';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.checkItem = function (t) {
                            if (t.isKind('open') || t.isKind('left')) return d.BaseItem.success;
                            var e = this.getProperty('ldots'),
                                r = t.First;
                            if (t.isKind('mml') && h.default.isEmbellished(r)) {
                                var n = h.default.getTexClass(h.default.getCoreMO(r));
                                (n !== c.TEXCLASS.BIN && n !== c.TEXCLASS.REL) ||
                                    (e = this.getProperty('cdots'));
                            }
                            return [[e, t], !0];
                        }),
                        e
                    );
                })(d.BaseItem);
                e.DotsItem = F;
                var N = (function (t) {
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
                        i(e, t),
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
                                    return this.EndEntry(), this.clearEnv(), d.BaseItem.fail;
                                if (e.getProperty('isCR'))
                                    return (
                                        this.EndEntry(),
                                        this.EndRow(),
                                        this.clearEnv(),
                                        d.BaseItem.fail
                                    );
                                this.EndTable(), this.clearEnv();
                                var r = this.factory.create('mml', this.createMml());
                                if (this.getProperty('requireClose')) {
                                    if (e.isKind('close')) return [[r], !0];
                                    throw new f.default('MissingCloseBrace', 'Missing close brace');
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
                                    ? h.default.setAttribute(
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
                                      h.default.setAttribute(e, 'frame', ''),
                                      (e = this.create('node', 'menclose', [e], {
                                          notation: this.frame.join(' '),
                                      })),
                                      ('none' === (this.arraydef.columnlines || 'none') &&
                                          'none' === (this.arraydef.rowlines || 'none')) ||
                                          h.default.setAttribute(e, 'data-padding', 0)),
                                (this.getProperty('open') || this.getProperty('close')) &&
                                    (e = p.default.fenced(
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
                                    h.default.setAttribute(t, 'columnalign', 'right'),
                                this.hfill[this.hfill.length - 1] === this.Size() &&
                                    h.default.setAttribute(
                                        t,
                                        'columnalign',
                                        h.default.getAttribute(t, 'columnalign')
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
                                    var r = p.default.dimen2em(e[0]);
                                    this.setProperty('rowspacing', r);
                                }
                                for (
                                    var n = this.getProperty('rowspacing');
                                    e.length < this.table.length;

                                )
                                    e.push(p.default.Em(n));
                                (e[this.table.length - 1] = p.default.Em(
                                    Math.max(0, n + p.default.dimen2em(t)),
                                )),
                                    (this.arraydef.rowspacing = e.join(' '));
                            }
                        }),
                        e
                    );
                })(d.BaseItem);
                e.ArrayItem = N;
                var R = (function (t) {
                    function e(e) {
                        for (var r = [], n = 1; n < arguments.length; n++) r[n - 1] = arguments[n];
                        var i = t.call(this, e) || this;
                        return (
                            (i.maxrow = 0), i.factory.configuration.tags.start(r[0], r[2], r[1]), i
                        );
                    }
                    return (
                        i(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'eqnarray';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.EndEntry = function () {
                            this.row.length &&
                                p.default.fixInitialMO(this.factory.configuration, this.nodes);
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
                                    n = a([], o(r), !1);
                                if (n.length > 1) {
                                    for (; n.length < e; ) n.push.apply(n, a([], o(r), !1));
                                    this.arraydef[t] = n.slice(0, e).join(' ');
                                }
                            }
                        }),
                        e
                    );
                })(N);
                e.EqnArrayItem = R;
                var j = (function (t) {
                    function e(e) {
                        for (var r = [], n = 1; n < arguments.length; n++) r[n - 1] = arguments[n];
                        var i = t.call(this, e) || this;
                        return i.factory.configuration.tags.start('equation', !0, r[0]), i;
                    }
                    return (
                        i(e, t),
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
                                throw new f.default(
                                    'EnvMissingEnd',
                                    'Missing \\end{%1}',
                                    this.getName(),
                                );
                            return t.prototype.checkItem.call(this, e);
                        }),
                        e
                    );
                })(d.BaseItem);
                e.EquationItem = j;
            },
            962: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var i = Object.getOwnPropertyDescriptor(e, r);
                                  (i &&
                                      !('get' in i
                                          ? !e.__esModule
                                          : i.writable || i.configurable)) ||
                                      (i = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, i);
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
                    o =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return i(e, t), e;
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = o(r(628)),
                    l = r(7),
                    u = a(r(724)),
                    c = a(r(708)),
                    f = a(r(702)),
                    p = r(921),
                    h = r(914);
                new s.RegExpMap('letter', c.default.variable, /[a-z]/i),
                    new s.RegExpMap('digit', c.default.digit, /[0-9.,]/),
                    new s.RegExpMap('command', c.default.controlSequence, /^\\/),
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
                        u.default,
                    ),
                    new s.CharacterMap('mathchar0mi', c.default.mathchar0mi, {
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
                    new s.CharacterMap('mathchar0mo', c.default.mathchar0mo, {
                        surd: '\u221a',
                        coprod: ['\u2210', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        bigvee: ['\u22c1', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        bigwedge: ['\u22c0', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        biguplus: ['\u2a04', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        bigcap: ['\u22c2', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        bigcup: ['\u22c3', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        int: ['\u222b', { texClass: p.TEXCLASS.OP }],
                        intop: [
                            '\u222b',
                            { texClass: p.TEXCLASS.OP, movesupsub: !0, movablelimits: !0 },
                        ],
                        iint: ['\u222c', { texClass: p.TEXCLASS.OP }],
                        iiint: ['\u222d', { texClass: p.TEXCLASS.OP }],
                        prod: ['\u220f', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        sum: ['\u2211', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        bigotimes: ['\u2a02', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        bigoplus: ['\u2a01', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        bigodot: ['\u2a00', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
                        oint: ['\u222e', { texClass: p.TEXCLASS.OP }],
                        bigsqcup: ['\u2a06', { texClass: p.TEXCLASS.OP, movesupsub: !0 }],
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
                        ldotp: ['.', { texClass: p.TEXCLASS.PUNCT }],
                        cdotp: ['\u22c5', { texClass: p.TEXCLASS.PUNCT }],
                        colon: [':', { texClass: p.TEXCLASS.PUNCT }],
                    }),
                    new s.CharacterMap('mathchar7', c.default.mathchar7, {
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
                    new s.DelimiterMap('delimiter', c.default.delimiter, {
                        '(': '(',
                        ')': ')',
                        '[': '[',
                        ']': ']',
                        '<': '\u27e8',
                        '>': '\u27e9',
                        '\\lt': '\u27e8',
                        '\\gt': '\u27e9',
                        '/': '/',
                        '|': ['|', { texClass: p.TEXCLASS.ORD }],
                        '.': '',
                        '\\\\': '\\',
                        '\\lmoustache': '\u23b0',
                        '\\rmoustache': '\u23b1',
                        '\\lgroup': '\u27ee',
                        '\\rgroup': '\u27ef',
                        '\\arrowvert': '\u23d0',
                        '\\Arrowvert': '\u2016',
                        '\\bracevert': '\u23aa',
                        '\\Vert': ['\u2016', { texClass: p.TEXCLASS.ORD }],
                        '\\|': ['\u2016', { texClass: p.TEXCLASS.ORD }],
                        '\\vert': ['|', { texClass: p.TEXCLASS.ORD }],
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
                            ',': ['Spacer', h.MATHSPACE.thinmathspace],
                            ':': ['Spacer', h.MATHSPACE.mediummathspace],
                            '>': ['Spacer', h.MATHSPACE.mediummathspace],
                            ';': ['Spacer', h.MATHSPACE.thickmathspace],
                            '!': ['Spacer', h.MATHSPACE.negativethinmathspace],
                            enspace: ['Spacer', 0.5],
                            quad: ['Spacer', 1],
                            qquad: ['Spacer', 2],
                            thinspace: ['Spacer', h.MATHSPACE.thinmathspace],
                            negthinspace: ['Spacer', h.MATHSPACE.negativethinmathspace],
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
                            big: ['MakeBig', p.TEXCLASS.ORD, 0.85],
                            Big: ['MakeBig', p.TEXCLASS.ORD, 1.15],
                            bigg: ['MakeBig', p.TEXCLASS.ORD, 1.45],
                            Bigg: ['MakeBig', p.TEXCLASS.ORD, 1.75],
                            bigl: ['MakeBig', p.TEXCLASS.OPEN, 0.85],
                            Bigl: ['MakeBig', p.TEXCLASS.OPEN, 1.15],
                            biggl: ['MakeBig', p.TEXCLASS.OPEN, 1.45],
                            Biggl: ['MakeBig', p.TEXCLASS.OPEN, 1.75],
                            bigr: ['MakeBig', p.TEXCLASS.CLOSE, 0.85],
                            Bigr: ['MakeBig', p.TEXCLASS.CLOSE, 1.15],
                            biggr: ['MakeBig', p.TEXCLASS.CLOSE, 1.45],
                            Biggr: ['MakeBig', p.TEXCLASS.CLOSE, 1.75],
                            bigm: ['MakeBig', p.TEXCLASS.REL, 0.85],
                            Bigm: ['MakeBig', p.TEXCLASS.REL, 1.15],
                            biggm: ['MakeBig', p.TEXCLASS.REL, 1.45],
                            Biggm: ['MakeBig', p.TEXCLASS.REL, 1.75],
                            mathord: ['TeXAtom', p.TEXCLASS.ORD],
                            mathop: ['TeXAtom', p.TEXCLASS.OP],
                            mathopen: ['TeXAtom', p.TEXCLASS.OPEN],
                            mathclose: ['TeXAtom', p.TEXCLASS.CLOSE],
                            mathbin: ['TeXAtom', p.TEXCLASS.BIN],
                            mathrel: ['TeXAtom', p.TEXCLASS.REL],
                            mathpunct: ['TeXAtom', p.TEXCLASS.PUNCT],
                            mathinner: ['TeXAtom', p.TEXCLASS.INNER],
                            vcenter: ['TeXAtom', p.TEXCLASS.VCENTER],
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
                                (0, h.em)(h.MATHSPACE.thickmathspace),
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
                                (0, h.em)(h.MATHSPACE.thickmathspace),
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
                                (0, h.em)(h.MATHSPACE.thickmathspace),
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
                        u.default,
                    ),
                    new s.EnvironmentMap(
                        'environment',
                        c.default.environment,
                        {
                            array: ['AlignedArray'],
                            equation: ['Equation', null, !0],
                            eqnarray: [
                                'EqnArray',
                                null,
                                !0,
                                !0,
                                'rcl',
                                f.default.cols(0, h.MATHSPACE.thickmathspace),
                                '.5em',
                            ],
                        },
                        u.default,
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
                                            for (var i in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, i) &&
                                                    (t[i] = e[i]);
                                        return t;
                                    }),
                                n.apply(this, arguments)
                            );
                        },
                    i =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var i = Object.getOwnPropertyDescriptor(e, r);
                                  (i &&
                                      !('get' in i
                                          ? !e.__esModule
                                          : i.writable || i.configurable)) ||
                                      (i = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, i);
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
                                        i(e, t, r);
                            return o(e, t), e;
                        },
                    s =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                i,
                                o = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return a;
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var u = a(r(389)),
                    c = l(r(321)),
                    f = l(r(466)),
                    p = l(r(810)),
                    h = r(7),
                    d = l(r(702)),
                    m = r(921),
                    y = r(251),
                    g = r(914),
                    v = r(29),
                    b = r(77),
                    x = {},
                    T = {
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
                    var i = new p.default(e, r, t.configuration),
                        o = i.mml(),
                        a = i.stack.global;
                    if (a.leftRoot || a.upRoot) {
                        var s = {};
                        a.leftRoot && (s.width = a.leftRoot),
                            a.upRoot && ((s.voffset = a.upRoot), (s.height = a.upRoot)),
                            (o = t.create('node', 'mpadded', [o], s));
                    }
                    return (r.inRoot = n), o;
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
                        var r, n, i;
                        t.GetNext().match(/\d/) &&
                            (t.string =
                                t.string.substr(0, t.i + 1) + ' ' + t.string.substr(t.i + 1));
                        var o = t.stack.Top();
                        o.isKind('prime')
                            ? ((i = (r = s(o.Peek(2), 2))[0]), (n = r[1]), t.stack.Pop())
                            : (i = t.stack.Prev()) || (i = t.create('token', 'mi', {}, ''));
                        var a = c.default.getProperty(i, 'movesupsub'),
                            l = c.default.isType(i, 'msubsup') ? i.sup : i.over;
                        if (
                            (c.default.isType(i, 'msubsup') &&
                                !c.default.isType(i, 'msup') &&
                                c.default.getChildAt(i, i.sup)) ||
                            (c.default.isType(i, 'munderover') &&
                                !c.default.isType(i, 'mover') &&
                                c.default.getChildAt(i, i.over) &&
                                !c.default.getProperty(i, 'subsupOK'))
                        )
                            throw new f.default(
                                'DoubleExponent',
                                'Double exponent: use braces to clarify',
                            );
                        (c.default.isType(i, 'msubsup') && !c.default.isType(i, 'msup')) ||
                            (a
                                ? ((!c.default.isType(i, 'munderover') ||
                                      c.default.isType(i, 'mover') ||
                                      c.default.getChildAt(i, i.over)) &&
                                      (i = t.create('node', 'munderover', [i], { movesupsub: !0 })),
                                  (l = i.over))
                                : (l = (i = t.create('node', 'msubsup', [i])).sup)),
                            t.Push(
                                t.itemFactory
                                    .create('subsup', i)
                                    .setProperties({ position: l, primes: n, movesupsub: a }),
                            );
                    }),
                    (x.Subscript = function (t, e) {
                        var r, n, i;
                        t.GetNext().match(/\d/) &&
                            (t.string =
                                t.string.substr(0, t.i + 1) + ' ' + t.string.substr(t.i + 1));
                        var o = t.stack.Top();
                        o.isKind('prime')
                            ? ((i = (r = s(o.Peek(2), 2))[0]), (n = r[1]), t.stack.Pop())
                            : (i = t.stack.Prev()) || (i = t.create('token', 'mi', {}, ''));
                        var a = c.default.getProperty(i, 'movesupsub'),
                            l = c.default.isType(i, 'msubsup') ? i.sub : i.under;
                        if (
                            (c.default.isType(i, 'msubsup') &&
                                !c.default.isType(i, 'msup') &&
                                c.default.getChildAt(i, i.sub)) ||
                            (c.default.isType(i, 'munderover') &&
                                !c.default.isType(i, 'mover') &&
                                c.default.getChildAt(i, i.under) &&
                                !c.default.getProperty(i, 'subsupOK'))
                        )
                            throw new f.default(
                                'DoubleSubscripts',
                                'Double subscripts: use braces to clarify',
                            );
                        (c.default.isType(i, 'msubsup') && !c.default.isType(i, 'msup')) ||
                            (a
                                ? ((!c.default.isType(i, 'munderover') ||
                                      c.default.isType(i, 'mover') ||
                                      c.default.getChildAt(i, i.under)) &&
                                      (i = t.create('node', 'munderover', [i], { movesupsub: !0 })),
                                  (l = i.under))
                                : (l = (i = t.create('node', 'msubsup', [i])).sub)),
                            t.Push(
                                t.itemFactory
                                    .create('subsup', i)
                                    .setProperties({ position: l, primes: n, movesupsub: a }),
                            );
                    }),
                    (x.Prime = function (t, e) {
                        var r = t.stack.Prev();
                        if (
                            (r || (r = t.create('node', 'mi')),
                            c.default.isType(r, 'msubsup') &&
                                !c.default.isType(r, 'msup') &&
                                c.default.getChildAt(r, r.sup))
                        )
                            throw new f.default(
                                'DoubleExponentPrime',
                                'Prime causes double exponent: use braces to clarify',
                            );
                        var n = '';
                        t.i--;
                        do {
                            (n += v.entities.prime), t.i++, (e = t.GetNext());
                        } while ("'" === e || e === v.entities.rsquo);
                        n = ['', '\u2032', '\u2033', '\u2034', '\u2057'][n.length] || n;
                        var i = t.create('token', 'mo', { variantForm: !0 }, n);
                        t.Push(t.itemFactory.create('prime', r, i));
                    }),
                    (x.Comment = function (t, e) {
                        for (; t.i < t.string.length && '\n' !== t.string.charAt(t.i); ) t.i++;
                    }),
                    (x.Hash = function (t, e) {
                        throw new f.default(
                            'CantUseHash1',
                            "You can't use 'macro parameter character #' in math mode",
                        );
                    }),
                    (x.MathFont = function (t, e, r) {
                        var i = t.GetArgument(e),
                            o = new p.default(
                                i,
                                n(n({}, t.stack.env), {
                                    font: r,
                                    multiLetterIdentifiers: /^[a-zA-Z]+/,
                                    noAutoOP: !0,
                                }),
                                t.configuration,
                            ).mml();
                        t.Push(t.create('node', 'TeXAtom', [o]));
                    }),
                    (x.SetFont = function (t, e, r) {
                        t.stack.env.font = r;
                    }),
                    (x.SetStyle = function (t, e, r, n, i) {
                        (t.stack.env.style = r),
                            (t.stack.env.level = i),
                            t.Push(
                                t.itemFactory
                                    .create('style')
                                    .setProperty('styles', { displaystyle: n, scriptlevel: i }),
                            );
                    }),
                    (x.SetSize = function (t, e, r) {
                        (t.stack.env.size = r),
                            t.Push(
                                t.itemFactory
                                    .create('style')
                                    .setProperty('styles', { mathsize: (0, g.em)(r) }),
                            );
                    }),
                    (x.Spacer = function (t, e, r) {
                        var n = t.create('node', 'mspace', [], { width: (0, g.em)(r) }),
                            i = t.create('node', 'mstyle', [n], { scriptlevel: 0 });
                        t.Push(i);
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
                                form: h.TexConstant.Form.PREFIX,
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
                            (c.default.getTexClass(c.default.getCoreMO(n)) !== m.TEXCLASS.OP &&
                                null == c.default.getProperty(n, 'movesupsub'))
                        )
                            throw new f.default(
                                'MisplacedLimits',
                                '%1 is allowed only on operators',
                                t.currentCS,
                            );
                        var i,
                            o = t.stack.Top();
                        c.default.isType(n, 'munderover') && !r
                            ? ((i = t.create('node', 'msubsup')),
                              c.default.copyChildren(n, i),
                              (n = o.Last = i))
                            : c.default.isType(n, 'msubsup') &&
                              r &&
                              ((i = t.create('node', 'munderover')),
                              c.default.copyChildren(n, i),
                              (n = o.Last = i)),
                            c.default.setProperty(n, 'movesupsub', !!r),
                            c.default.setProperties(c.default.getCoreMO(n), { movablelimits: !1 }),
                            (c.default.getAttribute(n, 'movablelimits') ||
                                c.default.getProperty(n, 'movablelimits')) &&
                                c.default.setProperties(n, { movablelimits: !1 });
                    }),
                    (x.Over = function (t, e, r, n) {
                        var i = t.itemFactory.create('over').setProperty('name', t.currentCS);
                        r || n
                            ? (i.setProperty('open', r), i.setProperty('close', n))
                            : e.match(/withdelims$/) &&
                              (i.setProperty('open', t.GetDelimiter(e)),
                              i.setProperty('close', t.GetDelimiter(e))),
                            e.match(/^\\above/)
                                ? i.setProperty('thickness', t.GetDimen(e))
                                : (e.match(/^\\atop/) || r || n) && i.setProperty('thickness', 0),
                            t.Push(i);
                    }),
                    (x.Frac = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e),
                            i = t.create('node', 'mfrac', [r, n]);
                        t.Push(i);
                    }),
                    (x.Sqrt = function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetArgument(e);
                        '\\frac' === n &&
                            (n += '{' + t.GetArgument(n) + '}{' + t.GetArgument(n) + '}');
                        var i = new p.default(n, t.stack.env, t.configuration).mml();
                        (i = r
                            ? t.create('node', 'mroot', [i, M(t, r)])
                            : t.create('node', 'msqrt', [i])),
                            t.Push(i);
                    }),
                    (x.Root = function (t, e) {
                        var r = t.GetUpTo(e, '\\of'),
                            n = t.ParseArg(e),
                            i = t.create('node', 'mroot', [n, M(t, r)]);
                        t.Push(i);
                    }),
                    (x.MoveRoot = function (t, e, r) {
                        if (!t.stack.env.inRoot)
                            throw new f.default(
                                'MisplacedMoveRoot',
                                '%1 can appear only within a root',
                                t.currentCS,
                            );
                        if (t.stack.global[r])
                            throw new f.default(
                                'MultipleMoveRoot',
                                'Multiple use of %1',
                                t.currentCS,
                            );
                        var n = t.GetArgument(e);
                        if (!n.match(/-?[0-9]+/))
                            throw new f.default(
                                'IntegerArg',
                                'The argument to %1 must be an integer',
                                t.currentCS,
                            );
                        '-' !== (n = parseInt(n, 10) / 15 + 'em').substr(0, 1) && (n = '+' + n),
                            (t.stack.global[r] = n);
                    }),
                    (x.Accent = function (t, e, r, i) {
                        var o = t.ParseArg(e),
                            a = n(n({}, d.default.getFontDef(t)), { accent: !0, mathaccent: !0 }),
                            s = c.default.createEntity(r),
                            l = t.create('token', 'mo', a, s);
                        c.default.setAttribute(l, 'stretchy', !!i);
                        var u = c.default.isEmbellished(o) ? c.default.getCoreMO(o) : o;
                        (c.default.isType(u, 'mo') || c.default.getProperty(u, 'movablelimits')) &&
                            c.default.setProperties(u, { movablelimits: !1 });
                        var f = t.create('node', 'munderover');
                        c.default.setChild(f, 0, o),
                            c.default.setChild(f, 1, null),
                            c.default.setChild(f, 2, l);
                        var p = t.create('node', 'TeXAtom', [f]);
                        t.Push(p);
                    }),
                    (x.UnderOver = function (t, e, r, n) {
                        var i = c.default.createEntity(r),
                            o = t.create('token', 'mo', { stretchy: !0, accent: !0 }, i),
                            a = 'o' === e.charAt(1) ? 'over' : 'under',
                            s = t.ParseArg(e);
                        t.Push(d.default.underOver(t, s, o, a, n));
                    }),
                    (x.Overset = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e);
                        d.default.checkMovableLimits(n),
                            r.isKind('mo') && c.default.setAttribute(r, 'accent', !1);
                        var i = t.create('node', 'mover', [n, r]);
                        t.Push(i);
                    }),
                    (x.Underset = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e);
                        d.default.checkMovableLimits(n),
                            r.isKind('mo') && c.default.setAttribute(r, 'accent', !1);
                        var i = t.create('node', 'munder', [n, r], { accentunder: !1 });
                        t.Push(i);
                    }),
                    (x.Overunderset = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e),
                            i = t.ParseArg(e);
                        d.default.checkMovableLimits(i),
                            r.isKind('mo') && c.default.setAttribute(r, 'accent', !1),
                            n.isKind('mo') && c.default.setAttribute(n, 'accent', !1);
                        var o = t.create('node', 'munderover', [i, n, r], {
                            accent: !1,
                            accentunder: !1,
                        });
                        t.Push(o);
                    }),
                    (x.TeXAtom = function (t, e, r) {
                        var n,
                            i,
                            o,
                            a = { texClass: r };
                        if (r === m.TEXCLASS.OP) {
                            a.movesupsub = a.movablelimits = !0;
                            var s = t.GetArgument(e),
                                l = s.match(/^\s*\\rm\s+([a-zA-Z0-9 ]+)$/);
                            l
                                ? ((a.mathvariant = h.TexConstant.Variant.NORMAL),
                                  (i = t.create('token', 'mi', a, l[1])))
                                : ((o = new p.default(s, t.stack.env, t.configuration).mml()),
                                  (i = t.create('node', 'TeXAtom', [o], a))),
                                (n = t.itemFactory.create('fn', i));
                        } else (o = t.ParseArg(e)), (n = t.create('node', 'TeXAtom', [o], a));
                        t.Push(n);
                    }),
                    (x.MmlToken = function (t, e) {
                        var r,
                            n = t.GetArgument(e),
                            i = t.GetBrackets(e, '').replace(/^\s+/, ''),
                            o = t.GetArgument(e),
                            a = {},
                            s = [];
                        try {
                            r = t.create('node', n);
                        } catch (t) {
                            r = null;
                        }
                        if (!r || !r.isToken)
                            throw new f.default('NotMathMLToken', '%1 is not a token element', n);
                        for (; '' !== i; ) {
                            var l = i.match(/^([a-z]+)\s*=\s*('[^']*'|"[^"]*"|[^ ,]*)\s*,?\s*/i);
                            if (!l)
                                throw new f.default(
                                    'InvalidMathMLAttr',
                                    'Invalid MathML attribute: %1',
                                    i,
                                );
                            if (!r.attributes.hasDefault(l[1]) && !T[l[1]])
                                throw new f.default(
                                    'UnknownAttrForElement',
                                    '%1 is not a recognized attribute for %2',
                                    l[1],
                                    n,
                                );
                            var u = d.default.MmlFilterAttribute(
                                t,
                                l[1],
                                l[2].replace(/^(['"])(.*)\1$/, '$2'),
                            );
                            u &&
                                ('true' === u.toLowerCase()
                                    ? (u = !0)
                                    : 'false' === u.toLowerCase() && (u = !1),
                                (a[l[1]] = u),
                                s.push(l[1])),
                                (i = i.substr(l[0].length));
                        }
                        s.length && (a['mjx-keep-attrs'] = s.join(' '));
                        var p = t.create('text', o);
                        r.appendChild(p), c.default.setProperties(r, a), t.Push(r);
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
                        var i = t.create('node', 'mphantom', [t.ParseArg(e)]);
                        (r || n) &&
                            ((i = t.create('node', 'mpadded', [i])),
                            n &&
                                (c.default.setAttribute(i, 'height', 0),
                                c.default.setAttribute(i, 'depth', 0)),
                            r && c.default.setAttribute(i, 'width', 0));
                        var o = t.create('node', 'TeXAtom', [i]);
                        t.Push(o);
                    }),
                    (x.Smash = function (t, e) {
                        var r = d.default.trimSpaces(t.GetBrackets(e, '')),
                            n = t.create('node', 'mpadded', [t.ParseArg(e)]);
                        switch (r) {
                            case 'b':
                                c.default.setAttribute(n, 'depth', 0);
                                break;
                            case 't':
                                c.default.setAttribute(n, 'height', 0);
                                break;
                            default:
                                c.default.setAttribute(n, 'height', 0),
                                    c.default.setAttribute(n, 'depth', 0);
                        }
                        var i = t.create('node', 'TeXAtom', [n]);
                        t.Push(i);
                    }),
                    (x.Lap = function (t, e) {
                        var r = t.create('node', 'mpadded', [t.ParseArg(e)], { width: 0 });
                        '\\llap' === e && c.default.setAttribute(r, 'lspace', '-1width');
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
                            var i = r;
                            (r = n), (n = i);
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
                        var i = t.create('node', 'mspace', [], n);
                        t.Push(i);
                    }),
                    (x.rule = function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetDimen(e),
                            i = t.GetDimen(e),
                            o = t.create('node', 'mspace', [], {
                                width: n,
                                height: i,
                                mathbackground: t.stack.env.color || 'black',
                            });
                        r &&
                            ((o = t.create('node', 'mpadded', [o], { voffset: r })),
                            r.match(/^\-/)
                                ? (c.default.setAttribute(o, 'height', r),
                                  c.default.setAttribute(o, 'depth', '+' + r.substr(1)))
                                : c.default.setAttribute(o, 'height', '+' + r)),
                            t.Push(o);
                    }),
                    (x.MakeBig = function (t, e, r, n) {
                        var i =
                                String((n *= 1.411764705882353)).replace(/(\.\d\d\d).+/, '$1') +
                                'em',
                            o = t.GetDelimiter(e, !0),
                            a = t.create(
                                'token',
                                'mo',
                                { minsize: i, maxsize: i, fence: !0, stretchy: !0, symmetric: !0 },
                                o,
                            ),
                            s = t.create('node', 'TeXAtom', [a], { texClass: r });
                        t.Push(s);
                    }),
                    (x.BuildRel = function (t, e) {
                        var r = t.ParseUpTo(e, '\\over'),
                            n = t.ParseArg(e),
                            i = t.create('node', 'munderover');
                        c.default.setChild(i, 0, n),
                            c.default.setChild(i, 1, null),
                            c.default.setChild(i, 2, r);
                        var o = t.create('node', 'TeXAtom', [i], { texClass: m.TEXCLASS.REL });
                        t.Push(o);
                    }),
                    (x.HBox = function (t, e, r, n) {
                        t.PushAll(d.default.internalMath(t, t.GetArgument(e), r, n));
                    }),
                    (x.FBox = function (t, e) {
                        var r = d.default.internalMath(t, t.GetArgument(e)),
                            n = t.create('node', 'menclose', r, { notation: 'box' });
                        t.Push(n);
                    }),
                    (x.FrameBox = function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetBrackets(e) || 'c',
                            i = d.default.internalMath(t, t.GetArgument(e));
                        r &&
                            (i = [
                                t.create('node', 'mpadded', i, {
                                    width: r,
                                    'data-align': (0, b.lookup)(
                                        n,
                                        { l: 'left', r: 'right' },
                                        'center',
                                    ),
                                }),
                            ]);
                        var o = t.create(
                            'node',
                            'TeXAtom',
                            [t.create('node', 'menclose', i, { notation: 'box' })],
                            { texClass: m.TEXCLASS.ORD },
                        );
                        t.Push(o);
                    }),
                    (x.Not = function (t, e) {
                        t.Push(t.itemFactory.create('not'));
                    }),
                    (x.Dots = function (t, e) {
                        var r = c.default.createEntity('2026'),
                            n = c.default.createEntity('22EF'),
                            i = t.create('token', 'mo', { stretchy: !1 }, r),
                            o = t.create('token', 'mo', { stretchy: !1 }, n);
                        t.Push(t.itemFactory.create('dots').setProperties({ ldots: i, cdots: o }));
                    }),
                    (x.Matrix = function (t, e, r, n, i, o, a, s, l, u) {
                        var c = t.GetNext();
                        if ('' === c)
                            throw new f.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        '{' === c
                            ? t.i++
                            : ((t.string = c + '}' + t.string.slice(t.i + 1)), (t.i = 0));
                        var p = t.itemFactory.create('array').setProperty('requireClose', !0);
                        (p.arraydef = { rowspacing: a || '4pt', columnspacing: o || '1em' }),
                            l && p.setProperty('isCases', !0),
                            u && (p.setProperty('isNumbered', !0), (p.arraydef.side = u)),
                            (r || n) && (p.setProperty('open', r), p.setProperty('close', n)),
                            'D' === s && (p.arraydef.displaystyle = !0),
                            null != i && (p.arraydef.columnalign = i),
                            t.Push(p);
                    }),
                    (x.Entry = function (t, e) {
                        t.Push(
                            t.itemFactory.create('cell').setProperties({ isEntry: !0, name: e }),
                        );
                        var r = t.stack.Top(),
                            n = r.getProperty('casesEnv');
                        if (r.getProperty('isCases') || n) {
                            for (
                                var i = t.string,
                                    o = 0,
                                    a = -1,
                                    s = t.i,
                                    l = i.length,
                                    u = n
                                        ? new RegExp(
                                              '^\\\\end\\s*\\{'.concat(
                                                  n.replace(/\*/, '\\*'),
                                                  '\\}',
                                              ),
                                          )
                                        : null;
                                s < l;

                            ) {
                                var c = i.charAt(s);
                                if ('{' === c) o++, s++;
                                else if ('}' === c)
                                    0 === o ? (l = 0) : (0 === --o && a < 0 && (a = s - t.i), s++);
                                else {
                                    if ('&' === c && 0 === o)
                                        throw new f.default(
                                            'ExtraAlignTab',
                                            'Extra alignment tab in \\cases text',
                                        );
                                    if ('\\' === c) {
                                        var p = i.substr(s);
                                        p.match(/^((\\cr)[^a-zA-Z]|\\\\)/) || (u && p.match(u))
                                            ? (l = 0)
                                            : (s += 2);
                                    } else s++;
                                }
                            }
                            var h = i.substr(t.i, s - t.i);
                            if (
                                !h.match(/^\s*\\text[^a-zA-Z]/) ||
                                a !== h.replace(/\s+$/, '').length - 1
                            ) {
                                var m = d.default.internalMath(t, d.default.trimSpaces(h), 0);
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
                            var i = t.GetBrackets(e, ''),
                                o = s(d.default.matchDimen(i), 2),
                                a = o[0],
                                l = o[1];
                            if (i && !a)
                                throw new f.default(
                                    'BracketMustBeDimension',
                                    'Bracket argument to %1 must be a dimension',
                                    t.currentCS,
                                );
                            n = a + l;
                        }
                        t.Push(
                            t.itemFactory
                                .create('cell')
                                .setProperties({ isCR: !0, name: e, linebreak: !0 }),
                        );
                        var c,
                            p = t.stack.Top();
                        p instanceof u.ArrayItem
                            ? n && p.addRowSpacing(n)
                            : (n && ((c = t.create('node', 'mspace', [], { depth: n })), t.Push(c)),
                              (c = t.create('node', 'mspace', [], {
                                  linebreak: h.TexConstant.LineBreak.NEWLINE,
                              })),
                              t.Push(c));
                    }),
                    (x.HLine = function (t, e, r) {
                        null == r && (r = 'solid');
                        var n = t.stack.Top();
                        if (!(n instanceof u.ArrayItem) || n.Size())
                            throw new f.default('Misplaced', 'Misplaced %1', t.currentCS);
                        if (n.table.length) {
                            for (
                                var i = n.arraydef.rowlines ? n.arraydef.rowlines.split(/ /) : [];
                                i.length < n.table.length;

                            )
                                i.push('none');
                            (i[n.table.length - 1] = r), (n.arraydef.rowlines = i.join(' '));
                        } else n.frame.push('top');
                    }),
                    (x.HFill = function (t, e) {
                        var r = t.stack.Top();
                        if (!(r instanceof u.ArrayItem))
                            throw new f.default(
                                'UnsupportedHFill',
                                'Unsupported use of %1',
                                t.currentCS,
                            );
                        r.hfill.push(r.Size());
                    }),
                    (x.BeginEnd = function (t, e) {
                        var r = t.GetArgument(e);
                        if (r.match(/\\/i))
                            throw new f.default('InvalidEnv', "Invalid environment name '%1'", r);
                        var n = t.configuration.handlers.get('environment').lookup(r);
                        if (n && '\\end' === e) {
                            if (!n.args[0]) {
                                var i = t.itemFactory.create('end').setProperty('name', r);
                                return void t.Push(i);
                            }
                            t.stack.env.closing = r;
                        }
                        d.default.checkMaxMacros(t, !1), t.parse('environment', [t, r]);
                    }),
                    (x.Array = function (t, e, r, n, i, o, a, s, l) {
                        i || (i = t.GetArgument('\\begin{' + e.getName() + '}'));
                        var u = ('c' + i).replace(/[^clr|:]/g, '').replace(/[^|:]([|:])+/g, '$1');
                        i = (i = i
                            .replace(/[^clr]/g, '')
                            .split('')
                            .join(' '))
                            .replace(/l/g, 'left')
                            .replace(/r/g, 'right')
                            .replace(/c/g, 'center');
                        var c = t.itemFactory.create('array');
                        return (
                            (c.arraydef = {
                                columnalign: i,
                                columnspacing: o || '1em',
                                rowspacing: a || '4pt',
                            }),
                            u.match(/[|:]/) &&
                                (u.charAt(0).match(/[|:]/) &&
                                    (c.frame.push('left'), (c.dashed = ':' === u.charAt(0))),
                                u.charAt(u.length - 1).match(/[|:]/) && c.frame.push('right'),
                                (u = u.substr(1, u.length - 2)),
                                (c.arraydef.columnlines = u
                                    .split('')
                                    .join(' ')
                                    .replace(/[^|: ]/g, 'none')
                                    .replace(/\|/g, 'solid')
                                    .replace(/:/g, 'dashed'))),
                            r && c.setProperty('open', t.convertDelimiter(r)),
                            n && c.setProperty('close', t.convertDelimiter(n)),
                            "'" === (s || '').charAt(1) &&
                                ((c.arraydef['data-cramped'] = !0), (s = s.charAt(0))),
                            'D' === s
                                ? (c.arraydef.displaystyle = !0)
                                : s && (c.arraydef.displaystyle = !1),
                            'S' === s && (c.arraydef.scriptlevel = 1),
                            l && (c.arraydef.useHeight = !1),
                            t.Push(e),
                            c
                        );
                    }),
                    (x.AlignedArray = function (t, e) {
                        var r = t.GetBrackets('\\begin{' + e.getName() + '}'),
                            n = x.Array(t, e);
                        return d.default.setArrayAlign(n, r);
                    }),
                    (x.Equation = function (t, e, r) {
                        return (
                            t.Push(e),
                            d.default.checkEqnEnv(t),
                            t.itemFactory.create('equation', r).setProperty('name', e.getName())
                        );
                    }),
                    (x.EqnArray = function (t, e, r, n, i, o) {
                        t.Push(e),
                            n && d.default.checkEqnEnv(t),
                            (i = (i = i
                                .replace(/[^clr]/g, '')
                                .split('')
                                .join(' '))
                                .replace(/l/g, 'left')
                                .replace(/r/g, 'right')
                                .replace(/c/g, 'center'));
                        var a = t.itemFactory.create('eqnarray', e.getName(), r, n, t.stack.global);
                        return (
                            (a.arraydef = {
                                displaystyle: !0,
                                columnalign: i,
                                columnspacing: o || '1em',
                                rowspacing: '3pt',
                                side: t.options.tagSide,
                                minlabelspacing: t.options.tagIndent,
                            }),
                            a
                        );
                    }),
                    (x.HandleNoTag = function (t, e) {
                        t.tags.notag();
                    }),
                    (x.HandleLabel = function (t, e) {
                        var r = t.GetArgument(e);
                        if ('' !== r && !t.tags.refUpdate) {
                            if (t.tags.label)
                                throw new f.default('MultipleCommand', 'Multiple %1', t.currentCS);
                            if (
                                ((t.tags.label = r),
                                (t.tags.allLabels[r] || t.tags.labels[r]) &&
                                    !t.options.ignoreDuplicateLabels)
                            )
                                throw new f.default(
                                    'MultipleLabel',
                                    "Label '%1' multiply defined",
                                    r,
                                );
                            t.tags.labels[r] = new y.Label();
                        }
                    }),
                    (x.HandleRef = function (t, e, r) {
                        var n = t.GetArgument(e),
                            i = t.tags.allLabels[n] || t.tags.labels[n];
                        i || (t.tags.refUpdate || (t.tags.redo = !0), (i = new y.Label()));
                        var o = i.tag;
                        r && (o = t.tags.formatTag(o));
                        var a = t.create('node', 'mrow', d.default.internalMath(t, o), {
                            href: t.tags.formatUrl(i.id, t.options.baseURL),
                            class: 'MathJax_ref',
                        });
                        t.Push(a);
                    }),
                    (x.Macro = function (t, e, r, n, i) {
                        if (n) {
                            var o = [];
                            if (null != i) {
                                var a = t.GetBrackets(e);
                                o.push(null == a ? i : a);
                            }
                            for (var s = o.length; s < n; s++) o.push(t.GetArgument(e));
                            r = d.default.substituteArgs(t, o, r);
                        }
                        (t.string = d.default.addArgs(t, r, t.string.slice(t.i))),
                            (t.i = 0),
                            d.default.checkMaxMacros(t);
                    }),
                    (x.MathChoice = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e),
                            i = t.ParseArg(e),
                            o = t.ParseArg(e);
                        t.Push(t.create('node', 'MathChoice', [r, n, i, o]));
                    }),
                    (e.default = x);
            },
            723: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            649: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractFindMath = MathJax._.core.FindMath.AbstractFindMath);
            },
            309: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractInputJax = MathJax._.core.InputJax.AbstractInputJax);
            },
            769: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.protoItem = MathJax._.core.MathItem.protoItem),
                    (e.AbstractMathItem = MathJax._.core.MathItem.AbstractMathItem),
                    (e.STATE = MathJax._.core.MathItem.STATE),
                    (e.newState = MathJax._.core.MathItem.newState);
            },
            921: function (t, e) {
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
            946: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMo = MathJax._.core.MmlTree.MmlNodes.mo.MmlMo);
            },
            857: function (t, e) {
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
            29: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.options = MathJax._.util.Entities.options),
                    (e.entities = MathJax._.util.Entities.entities),
                    (e.add = MathJax._.util.Entities.add),
                    (e.remove = MathJax._.util.Entities.remove),
                    (e.translate = MathJax._.util.Entities.translate),
                    (e.numeric = MathJax._.util.Entities.numeric);
            },
            898: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.FunctionList = MathJax._.util.FunctionList.FunctionList);
            },
            77: function (t, e) {
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
            297: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.PrioritizedList = MathJax._.util.PrioritizedList.PrioritizedList);
            },
            914: function (t, e) {
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
            720: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.sortLength = MathJax._.util.string.sortLength),
                    (e.quotePattern = MathJax._.util.string.quotePattern),
                    (e.unicodeChars = MathJax._.util.string.unicodeChars),
                    (e.unicodeString = MathJax._.util.string.unicodeString),
                    (e.isPercent = MathJax._.util.string.isPercent),
                    (e.split = MathJax._.util.string.split);
            },
        },
        e = {};
    function r(n) {
        var i = e[n];
        if (void 0 !== i) return i.exports;
        var o = (e[n] = { exports: {} });
        return t[n].call(o.exports, o, o.exports, r), o.exports;
    }
    !(function () {
        var t = r(723),
            e = r(306),
            n = r(205),
            i = r(552),
            o = r(199),
            a = r(982),
            s = r(910),
            l = r(644),
            u = r(321),
            c = r(708),
            f = r(394),
            p = r(702),
            h = r(874),
            d = r(44),
            m = r(239),
            y = r(237),
            g = r(628),
            v = r(251),
            b = r(7),
            x = r(466),
            T = r(810),
            M = r(606),
            P = r(389),
            O = r(724);
        MathJax.loader && MathJax.loader.checkVersion('input/tex-base', e.q, 'input'),
            (0, t.r8)({
                _: {
                    input: {
                        tex_ts: n,
                        tex: {
                            Configuration: i,
                            FilterUtil: o,
                            FindTeX: a,
                            MapHandler: s,
                            NodeFactory: l,
                            NodeUtil: u,
                            ParseMethods: c,
                            ParseOptions: f,
                            ParseUtil: p,
                            Stack: h,
                            StackItem: d,
                            StackItemFactory: m,
                            Symbol: y,
                            SymbolMap: g,
                            Tags: v,
                            TexConstants: b,
                            TexError: x,
                            TexParser: T,
                            base: { BaseConfiguration: M, BaseItems: P, BaseMethods: O },
                        },
                    },
                },
            });
        var S = r(77);
        !(function () {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [],
                e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
            if (MathJax.startup) {
                e &&
                    (MathJax.startup.registerConstructor('tex', MathJax._.input.tex_ts.TeX),
                    MathJax.startup.useInput('tex')),
                    MathJax.config.tex || (MathJax.config.tex = {});
                var r = MathJax.config.tex.packages;
                (MathJax.config.tex.packages = t),
                    r && (0, S.insert)(MathJax.config.tex, { packages: r });
            }
        })(['base']);
    })();
})();
