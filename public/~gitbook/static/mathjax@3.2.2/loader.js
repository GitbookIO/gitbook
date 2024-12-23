!(function () {
    'use strict';
    var e = {
            515: function (e, t, r) {
                var n =
                    (this && this.__values) ||
                    function (e) {
                        var t = 'function' == typeof Symbol && Symbol.iterator,
                            r = t && e[t],
                            n = 0;
                        if (r) return r.call(e);
                        if (e && 'number' == typeof e.length)
                            return {
                                next: function () {
                                    return (
                                        e && n >= e.length && (e = void 0),
                                        { value: e && e[n++], done: !e }
                                    );
                                },
                            };
                        throw new TypeError(
                            t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                        );
                    };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.MathJax =
                        t.combineWithMathJax =
                        t.combineDefaults =
                        t.combineConfig =
                        t.isObject =
                            void 0);
                var o = r(282);
                function a(e) {
                    return 'object' == typeof e && null !== e;
                }
                function i(e, t) {
                    var r, o;
                    try {
                        for (var c = n(Object.keys(t)), s = c.next(); !s.done; s = c.next()) {
                            var l = s.value;
                            '__esModule' !== l &&
                                (!a(e[l]) || !a(t[l]) || t[l] instanceof Promise
                                    ? null !== t[l] && void 0 !== t[l] && (e[l] = t[l])
                                    : i(e[l], t[l]));
                        }
                    } catch (e) {
                        r = { error: e };
                    } finally {
                        try {
                            s && !s.done && (o = c.return) && o.call(c);
                        } finally {
                            if (r) throw r.error;
                        }
                    }
                    return e;
                }
                (t.isObject = a),
                    (t.combineConfig = i),
                    (t.combineDefaults = function e(t, r, o) {
                        var i, c;
                        t[r] || (t[r] = {}), (t = t[r]);
                        try {
                            for (var s = n(Object.keys(o)), l = s.next(); !l.done; l = s.next()) {
                                var u = l.value;
                                a(t[u]) && a(o[u])
                                    ? e(t, u, o[u])
                                    : null == t[u] && null != o[u] && (t[u] = o[u]);
                            }
                        } catch (e) {
                            i = { error: e };
                        } finally {
                            try {
                                l && !l.done && (c = s.return) && c.call(s);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                        return t;
                    }),
                    (t.combineWithMathJax = function (e) {
                        return i(t.MathJax, e);
                    }),
                    void 0 === r.g.MathJax && (r.g.MathJax = {}),
                    r.g.MathJax.version ||
                        (r.g.MathJax = { version: o.VERSION, _: {}, config: r.g.MathJax }),
                    (t.MathJax = r.g.MathJax);
            },
            235: function (e, t, r) {
                var n,
                    o,
                    a =
                        (this && this.__values) ||
                        function (e) {
                            var t = 'function' == typeof Symbol && Symbol.iterator,
                                r = t && e[t],
                                n = 0;
                            if (r) return r.call(e);
                            if (e && 'number' == typeof e.length)
                                return {
                                    next: function () {
                                        return (
                                            e && n >= e.length && (e = void 0),
                                            { value: e && e[n++], done: !e }
                                        );
                                    },
                                };
                            throw new TypeError(
                                t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.CONFIG =
                        t.MathJax =
                        t.Loader =
                        t.PathFilters =
                        t.PackageError =
                        t.Package =
                            void 0);
                var i = r(515),
                    c = r(265),
                    s = r(265);
                Object.defineProperty(t, 'Package', {
                    enumerable: !0,
                    get: function () {
                        return s.Package;
                    },
                }),
                    Object.defineProperty(t, 'PackageError', {
                        enumerable: !0,
                        get: function () {
                            return s.PackageError;
                        },
                    });
                var l,
                    u = r(525);
                if (
                    ((t.PathFilters = {
                        source: function (e) {
                            return (
                                t.CONFIG.source.hasOwnProperty(e.name) &&
                                    (e.name = t.CONFIG.source[e.name]),
                                !0
                            );
                        },
                        normalize: function (e) {
                            var t = e.name;
                            return (
                                t.match(/^(?:[a-z]+:\/)?\/|[a-z]:\\|\[/i) ||
                                    (e.name = '[mathjax]/' + t.replace(/^\.\//, '')),
                                e.addExtension && !t.match(/\.[^\/]+$/) && (e.name += '.js'),
                                !0
                            );
                        },
                        prefix: function (e) {
                            for (
                                var r;
                                (r = e.name.match(/^\[([^\]]*)\]/)) &&
                                t.CONFIG.paths.hasOwnProperty(r[1]);

                            )
                                e.name = t.CONFIG.paths[r[1]] + e.name.substr(r[0].length);
                            return !0;
                        },
                    }),
                    (function (e) {
                        var r = i.MathJax.version;
                        (e.versions = new Map()),
                            (e.ready = function () {
                                for (var e, t, r = [], n = 0; n < arguments.length; n++)
                                    r[n] = arguments[n];
                                0 === r.length && (r = Array.from(c.Package.packages.keys()));
                                var o = [];
                                try {
                                    for (var i = a(r), s = i.next(); !s.done; s = i.next()) {
                                        var l = s.value,
                                            u = c.Package.packages.get(l) || new c.Package(l, !0);
                                        o.push(u.promise);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (t = i.return) && t.call(i);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return Promise.all(o);
                            }),
                            (e.load = function () {
                                for (var r, n, o = [], i = 0; i < arguments.length; i++)
                                    o[i] = arguments[i];
                                if (0 === o.length) return Promise.resolve();
                                var s = [],
                                    l = function (r) {
                                        var n = c.Package.packages.get(r);
                                        n || (n = new c.Package(r)).provides(t.CONFIG.provides[r]),
                                            n.checkNoLoad(),
                                            s.push(
                                                n.promise.then(function () {
                                                    t.CONFIG.versionWarnings &&
                                                        n.isLoaded &&
                                                        !e.versions.has(c.Package.resolvePath(r)) &&
                                                        console.warn(
                                                            'No version information available for component '.concat(
                                                                r,
                                                            ),
                                                        );
                                                }),
                                            );
                                    };
                                try {
                                    for (var u = a(o), d = u.next(); !d.done; d = u.next()) {
                                        var f = d.value;
                                        l(f);
                                    }
                                } catch (e) {
                                    r = { error: e };
                                } finally {
                                    try {
                                        d && !d.done && (n = u.return) && n.call(u);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                                return c.Package.loadAll(), Promise.all(s);
                            }),
                            (e.preLoad = function () {
                                for (var e, r, n = [], o = 0; o < arguments.length; o++)
                                    n[o] = arguments[o];
                                try {
                                    for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
                                        var l = s.value,
                                            u = c.Package.packages.get(l);
                                        u ||
                                            (u = new c.Package(l, !0)).provides(
                                                t.CONFIG.provides[l],
                                            ),
                                            u.loaded();
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
                            (e.defaultReady = function () {
                                void 0 !== t.MathJax.startup && t.MathJax.config.startup.ready();
                            }),
                            (e.getRoot = function () {
                                var e = '//../../es5';
                                if ('undefined' != typeof document) {
                                    var t =
                                        document.currentScript ||
                                        document.getElementById('MathJax-script');
                                    t && (e = t.src.replace(/\/[^\/]*$/, ''));
                                }
                                return e;
                            }),
                            (e.checkVersion = function (n, o, a) {
                                return (
                                    e.versions.set(c.Package.resolvePath(n), r),
                                    !(!t.CONFIG.versionWarnings || o === r) &&
                                        (console.warn(
                                            'Component '
                                                .concat(n, ' uses ')
                                                .concat(o, ' of MathJax; version in use is ')
                                                .concat(r),
                                        ),
                                        !0)
                                );
                            }),
                            (e.pathFilters = new u.FunctionList()),
                            e.pathFilters.add(t.PathFilters.source, 0),
                            e.pathFilters.add(t.PathFilters.normalize, 10),
                            e.pathFilters.add(t.PathFilters.prefix, 20);
                    })((l = t.Loader || (t.Loader = {}))),
                    (t.MathJax = i.MathJax),
                    void 0 === t.MathJax.loader)
                ) {
                    (0, i.combineDefaults)(t.MathJax.config, 'loader', {
                        paths: { mathjax: l.getRoot() },
                        source: {},
                        dependencies: {},
                        provides: {},
                        load: [],
                        ready: l.defaultReady.bind(l),
                        failed: function (e) {
                            return console.log(
                                'MathJax('.concat(e.package || '?', '): ').concat(e.message),
                            );
                        },
                        require: null,
                        pathFilters: [],
                        versionWarnings: !0,
                    }),
                        (0, i.combineWithMathJax)({ loader: l });
                    try {
                        for (
                            var d = a(t.MathJax.config.loader.pathFilters), f = d.next();
                            !f.done;
                            f = d.next()
                        ) {
                            var h = f.value;
                            Array.isArray(h) ? l.pathFilters.add(h[0], h[1]) : l.pathFilters.add(h);
                        }
                    } catch (e) {
                        n = { error: e };
                    } finally {
                        try {
                            f && !f.done && (o = d.return) && o.call(d);
                        } finally {
                            if (n) throw n.error;
                        }
                    }
                }
                t.CONFIG = t.MathJax.config.loader;
            },
            265: function (e, t, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (e, t) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (e, t) {
                                            e.__proto__ = t;
                                        }) ||
                                    function (e, t) {
                                        for (var r in t)
                                            Object.prototype.hasOwnProperty.call(t, r) &&
                                                (e[r] = t[r]);
                                    }),
                                n(e, t)
                            );
                        }),
                        function (e, t) {
                            if ('function' != typeof t && null !== t)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(t) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = e;
                            }
                            n(e, t),
                                (e.prototype =
                                    null === t
                                        ? Object.create(t)
                                        : ((r.prototype = t.prototype), new r()));
                        }),
                    a =
                        (this && this.__values) ||
                        function (e) {
                            var t = 'function' == typeof Symbol && Symbol.iterator,
                                r = t && e[t],
                                n = 0;
                            if (r) return r.call(e);
                            if (e && 'number' == typeof e.length)
                                return {
                                    next: function () {
                                        return (
                                            e && n >= e.length && (e = void 0),
                                            { value: e && e[n++], done: !e }
                                        );
                                    },
                                };
                            throw new TypeError(
                                t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__read) ||
                        function (e, t) {
                            var r = 'function' == typeof Symbol && e[Symbol.iterator];
                            if (!r) return e;
                            var n,
                                o,
                                a = r.call(e),
                                i = [];
                            try {
                                for (; (void 0 === t || t-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (e) {
                                o = { error: e };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    c =
                        (this && this.__spreadArray) ||
                        function (e, t, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = t.length; o < a; o++)
                                    (!n && o in t) ||
                                        (n || (n = Array.prototype.slice.call(t, 0, o)),
                                        (n[o] = t[o]));
                            return e.concat(n || Array.prototype.slice.call(t));
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.Package = t.PackageError = void 0);
                var s = r(235),
                    l = (function (e) {
                        function t(t, r) {
                            var n = e.call(this, t) || this;
                            return (n.package = r), n;
                        }
                        return o(t, e), t;
                    })(Error);
                t.PackageError = l;
                var u = (function () {
                    function e(t, r) {
                        void 0 === r && (r = !1),
                            (this.isLoaded = !1),
                            (this.isLoading = !1),
                            (this.hasFailed = !1),
                            (this.dependents = []),
                            (this.dependencies = []),
                            (this.dependencyCount = 0),
                            (this.provided = []),
                            (this.name = t),
                            (this.noLoad = r),
                            e.packages.set(t, this),
                            (this.promise = this.makePromise(this.makeDependencies()));
                    }
                    return (
                        Object.defineProperty(e.prototype, 'canLoad', {
                            get: function () {
                                return (
                                    0 === this.dependencyCount &&
                                    !this.noLoad &&
                                    !this.isLoading &&
                                    !this.hasFailed
                                );
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.resolvePath = function (e, t) {
                            void 0 === t && (t = !0);
                            var r = { name: e, original: e, addExtension: t };
                            return s.Loader.pathFilters.execute(r), r.name;
                        }),
                        (e.loadAll = function () {
                            var e, t;
                            try {
                                for (
                                    var r = a(this.packages.values()), n = r.next();
                                    !n.done;
                                    n = r.next()
                                ) {
                                    var o = n.value;
                                    o.canLoad && o.load();
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (t = r.return) && t.call(r);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                        }),
                        (e.prototype.makeDependencies = function () {
                            var t,
                                r,
                                n = [],
                                o = e.packages,
                                l = this.noLoad,
                                u = this.name,
                                d = [];
                            s.CONFIG.dependencies.hasOwnProperty(u)
                                ? d.push.apply(d, c([], i(s.CONFIG.dependencies[u]), !1))
                                : 'core' !== u && d.push('core');
                            try {
                                for (var f = a(d), h = f.next(); !h.done; h = f.next()) {
                                    var p = h.value,
                                        y = o.get(p) || new e(p, l);
                                    this.dependencies.indexOf(y) < 0 &&
                                        (y.addDependent(this, l),
                                        this.dependencies.push(y),
                                        y.isLoaded || (this.dependencyCount++, n.push(y.promise)));
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    h && !h.done && (r = f.return) && r.call(f);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return n;
                        }),
                        (e.prototype.makePromise = function (e) {
                            var t = this,
                                r = new Promise(function (e, r) {
                                    (t.resolve = e), (t.reject = r);
                                }),
                                n = s.CONFIG[this.name] || {};
                            return (
                                n.ready &&
                                    (r = r.then(function (e) {
                                        return n.ready(t.name);
                                    })),
                                e.length &&
                                    (e.push(r),
                                    (r = Promise.all(e).then(function (e) {
                                        return e.join(', ');
                                    }))),
                                n.failed &&
                                    r.catch(function (e) {
                                        return n.failed(new l(e, t.name));
                                    }),
                                r
                            );
                        }),
                        (e.prototype.load = function () {
                            if (!this.isLoaded && !this.isLoading && !this.noLoad) {
                                this.isLoading = !0;
                                var t = e.resolvePath(this.name);
                                s.CONFIG.require ? this.loadCustom(t) : this.loadScript(t);
                            }
                        }),
                        (e.prototype.loadCustom = function (e) {
                            var t = this;
                            try {
                                var r = s.CONFIG.require(e);
                                r instanceof Promise
                                    ? r
                                          .then(function () {
                                              return t.checkLoad();
                                          })
                                          .catch(function (r) {
                                              return t.failed(
                                                  'Can\'t load "' + e + '"\n' + r.message.trim(),
                                              );
                                          })
                                    : this.checkLoad();
                            } catch (e) {
                                this.failed(e.message);
                            }
                        }),
                        (e.prototype.loadScript = function (e) {
                            var t = this,
                                r = document.createElement('script');
                            (r.src = e),
                                (r.charset = 'UTF-8'),
                                (r.onload = function (e) {
                                    return t.checkLoad();
                                }),
                                (r.onerror = function (r) {
                                    return t.failed('Can\'t load "' + e + '"');
                                }),
                                document.head.appendChild(r);
                        }),
                        (e.prototype.loaded = function () {
                            var e, t, r, n;
                            (this.isLoaded = !0), (this.isLoading = !1);
                            try {
                                for (
                                    var o = a(this.dependents), i = o.next();
                                    !i.done;
                                    i = o.next()
                                ) {
                                    i.value.requirementSatisfied();
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    i && !i.done && (t = o.return) && t.call(o);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            try {
                                for (
                                    var c = a(this.provided), s = c.next();
                                    !s.done;
                                    s = c.next()
                                ) {
                                    s.value.loaded();
                                }
                            } catch (e) {
                                r = { error: e };
                            } finally {
                                try {
                                    s && !s.done && (n = c.return) && n.call(c);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            this.resolve(this.name);
                        }),
                        (e.prototype.failed = function (e) {
                            (this.hasFailed = !0),
                                (this.isLoading = !1),
                                this.reject(new l(e, this.name));
                        }),
                        (e.prototype.checkLoad = function () {
                            var e = this;
                            (
                                (s.CONFIG[this.name] || {}).checkReady ||
                                function () {
                                    return Promise.resolve();
                                }
                            )()
                                .then(function () {
                                    return e.loaded();
                                })
                                .catch(function (t) {
                                    return e.failed(t);
                                });
                        }),
                        (e.prototype.requirementSatisfied = function () {
                            this.dependencyCount &&
                                (this.dependencyCount--, this.canLoad && this.load());
                        }),
                        (e.prototype.provides = function (t) {
                            var r, n;
                            void 0 === t && (t = []);
                            try {
                                for (var o = a(t), i = o.next(); !i.done; i = o.next()) {
                                    var c = i.value,
                                        l = e.packages.get(c);
                                    l ||
                                        (s.CONFIG.dependencies[c] ||
                                            (s.CONFIG.dependencies[c] = []),
                                        s.CONFIG.dependencies[c].push(c),
                                        ((l = new e(c, !0)).isLoading = !0)),
                                        this.provided.push(l);
                                }
                            } catch (e) {
                                r = { error: e };
                            } finally {
                                try {
                                    i && !i.done && (n = o.return) && n.call(o);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                        }),
                        (e.prototype.addDependent = function (e, t) {
                            this.dependents.push(e), t || this.checkNoLoad();
                        }),
                        (e.prototype.checkNoLoad = function () {
                            var e, t;
                            if (this.noLoad) {
                                this.noLoad = !1;
                                try {
                                    for (
                                        var r = a(this.dependencies), n = r.next();
                                        !n.done;
                                        n = r.next()
                                    ) {
                                        n.value.checkNoLoad();
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        n && !n.done && (t = r.return) && t.call(r);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            }
                        }),
                        (e.packages = new Map()),
                        e
                    );
                })();
                t.Package = u;
            },
            282: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.VERSION = void 0),
                    (t.VERSION = '3.2.2');
            },
            525: function (e, t, r) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (e, t) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (e, t) {
                                            e.__proto__ = t;
                                        }) ||
                                    function (e, t) {
                                        for (var r in t)
                                            Object.prototype.hasOwnProperty.call(t, r) &&
                                                (e[r] = t[r]);
                                    }),
                                n(e, t)
                            );
                        }),
                        function (e, t) {
                            if ('function' != typeof t && null !== t)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(t) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = e;
                            }
                            n(e, t),
                                (e.prototype =
                                    null === t
                                        ? Object.create(t)
                                        : ((r.prototype = t.prototype), new r()));
                        }),
                    a =
                        (this && this.__values) ||
                        function (e) {
                            var t = 'function' == typeof Symbol && Symbol.iterator,
                                r = t && e[t],
                                n = 0;
                            if (r) return r.call(e);
                            if (e && 'number' == typeof e.length)
                                return {
                                    next: function () {
                                        return (
                                            e && n >= e.length && (e = void 0),
                                            { value: e && e[n++], done: !e }
                                        );
                                    },
                                };
                            throw new TypeError(
                                t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__read) ||
                        function (e, t) {
                            var r = 'function' == typeof Symbol && e[Symbol.iterator];
                            if (!r) return e;
                            var n,
                                o,
                                a = r.call(e),
                                i = [];
                            try {
                                for (; (void 0 === t || t-- > 0) && !(n = a.next()).done; )
                                    i.push(n.value);
                            } catch (e) {
                                o = { error: e };
                            } finally {
                                try {
                                    n && !n.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return i;
                        },
                    c =
                        (this && this.__spreadArray) ||
                        function (e, t, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, a = t.length; o < a; o++)
                                    (!n && o in t) ||
                                        (n || (n = Array.prototype.slice.call(t, 0, o)),
                                        (n[o] = t[o]));
                            return e.concat(n || Array.prototype.slice.call(t));
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }), (t.FunctionList = void 0);
                var s = (function (e) {
                    function t() {
                        return (null !== e && e.apply(this, arguments)) || this;
                    }
                    return (
                        o(t, e),
                        (t.prototype.execute = function () {
                            for (var e, t, r = [], n = 0; n < arguments.length; n++)
                                r[n] = arguments[n];
                            try {
                                for (var o = a(this), s = o.next(); !s.done; s = o.next()) {
                                    var l = s.value,
                                        u = l.item.apply(l, c([], i(r), !1));
                                    if (!1 === u) return !1;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (t = o.return) && t.call(o);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return !0;
                        }),
                        (t.prototype.asyncExecute = function () {
                            for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
                            var r = -1,
                                n = this.items;
                            return new Promise(function (t, o) {
                                !(function a() {
                                    for (var s; ++r < n.length; ) {
                                        var l = (s = n[r]).item.apply(s, c([], i(e), !1));
                                        if (l instanceof Promise)
                                            return void l.then(a).catch(function (e) {
                                                return o(e);
                                            });
                                        if (!1 === l) return void t(!1);
                                    }
                                    t(!0);
                                })();
                            });
                        }),
                        t
                    );
                })(r(666).PrioritizedList);
                t.FunctionList = s;
            },
            666: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }), (t.PrioritizedList = void 0);
                var r = (function () {
                    function e() {
                        (this.items = []), (this.items = []);
                    }
                    return (
                        (e.prototype[Symbol.iterator] = function () {
                            var e = 0,
                                t = this.items;
                            return {
                                next: function () {
                                    return { value: t[e++], done: e > t.length };
                                },
                            };
                        }),
                        (e.prototype.add = function (t, r) {
                            void 0 === r && (r = e.DEFAULTPRIORITY);
                            var n = this.items.length;
                            do {
                                n--;
                            } while (n >= 0 && r < this.items[n].priority);
                            return this.items.splice(n + 1, 0, { item: t, priority: r }), t;
                        }),
                        (e.prototype.remove = function (e) {
                            var t = this.items.length;
                            do {
                                t--;
                            } while (t >= 0 && this.items[t].item !== e);
                            t >= 0 && this.items.splice(t, 1);
                        }),
                        (e.DEFAULTPRIORITY = 5),
                        e
                    );
                })();
                t.PrioritizedList = r;
            },
        },
        t = {};
    function r(n) {
        var o = t[n];
        if (void 0 !== o) return o.exports;
        var a = (t[n] = { exports: {} });
        return e[n].call(a.exports, a, a.exports, r), a.exports;
    }
    (r.g = (function () {
        if ('object' == typeof globalThis) return globalThis;
        try {
            return this || new Function('return this')();
        } catch (e) {
            if ('object' == typeof window) return window;
        }
    })()),
        (function () {
            var e = r(515),
                t = r(282),
                n = r(235),
                o = r(265);
            function a(e, t) {
                (null == t || t > e.length) && (t = e.length);
                for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
                return n;
            }
            MathJax.loader && MathJax.loader.checkVersion('loader', t.VERSION, 'loader'),
                (0, e.combineWithMathJax)({ _: { components: { loader: n, package: o } } });
            var i,
                c = {
                    'a11y/semantic-enrich': ['input/mml', 'a11y/sre'],
                    'a11y/complexity': ['a11y/semantic-enrich'],
                    'a11y/explorer': ['a11y/semantic-enrich', 'ui/menu'],
                    '[mml]/mml3': ['input/mml'],
                    '[tex]/all-packages': ['input/tex-base'],
                    '[tex]/action': ['input/tex-base', '[tex]/newcommand'],
                    '[tex]/autoload': ['input/tex-base', '[tex]/require'],
                    '[tex]/ams': ['input/tex-base'],
                    '[tex]/amscd': ['input/tex-base'],
                    '[tex]/bbox': ['input/tex-base', '[tex]/ams', '[tex]/newcommand'],
                    '[tex]/boldsymbol': ['input/tex-base'],
                    '[tex]/braket': ['input/tex-base'],
                    '[tex]/bussproofs': ['input/tex-base'],
                    '[tex]/cancel': ['input/tex-base', '[tex]/enclose'],
                    '[tex]/centernot': ['input/tex-base'],
                    '[tex]/color': ['input/tex-base'],
                    '[tex]/colorv2': ['input/tex-base'],
                    '[tex]/colortbl': ['input/tex-base', '[tex]/color'],
                    '[tex]/configmacros': ['input/tex-base', '[tex]/newcommand'],
                    '[tex]/enclose': ['input/tex-base'],
                    '[tex]/extpfeil': ['input/tex-base', '[tex]/newcommand', '[tex]/ams'],
                    '[tex]/html': ['input/tex-base'],
                    '[tex]/mathtools': ['input/tex-base', '[tex]/newcommand', '[tex]/ams'],
                    '[tex]/mhchem': ['input/tex-base', '[tex]/ams'],
                    '[tex]/newcommand': ['input/tex-base'],
                    '[tex]/noerrors': ['input/tex-base'],
                    '[tex]/noundefined': ['input/tex-base'],
                    '[tex]/physics': ['input/tex-base'],
                    '[tex]/require': ['input/tex-base'],
                    '[tex]/setoptions': ['input/tex-base'],
                    '[tex]/tagformat': ['input/tex-base'],
                    '[tex]/textcomp': ['input/tex-base', '[tex]/textmacros'],
                    '[tex]/textmacros': ['input/tex-base'],
                    '[tex]/unicode': ['input/tex-base'],
                    '[tex]/verb': ['input/tex-base'],
                    '[tex]/cases': ['[tex]/empheq'],
                    '[tex]/empheq': ['input/tex-base', '[tex]/ams'],
                },
                s = Array.from(Object.keys(c)).filter(function (e) {
                    return (
                        '[tex]' === e.substr(0, 5) &&
                        '[tex]/autoload' !== e &&
                        '[tex]/colorv2' !== e &&
                        '[tex]/all-packages' !== e
                    );
                }),
                l = {
                    startup: ['loader'],
                    'input/tex': [
                        'input/tex-base',
                        '[tex]/ams',
                        '[tex]/newcommand',
                        '[tex]/noundefined',
                        '[tex]/require',
                        '[tex]/autoload',
                        '[tex]/configmacros',
                    ],
                    'input/tex-full': ['input/tex-base', '[tex]/all-packages'].concat(
                        ((i = s),
                        (function (e) {
                            if (Array.isArray(e)) return a(e);
                        })(i) ||
                            (function (e) {
                                if (
                                    ('undefined' != typeof Symbol && null != e[Symbol.iterator]) ||
                                    null != e['@@iterator']
                                )
                                    return Array.from(e);
                            })(i) ||
                            (function (e, t) {
                                if (e) {
                                    if ('string' == typeof e) return a(e, t);
                                    var r = Object.prototype.toString.call(e).slice(8, -1);
                                    return (
                                        'Object' === r && e.constructor && (r = e.constructor.name),
                                        'Map' === r || 'Set' === r
                                            ? Array.from(e)
                                            : 'Arguments' === r ||
                                                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
                                              ? a(e, t)
                                              : void 0
                                    );
                                }
                            })(i) ||
                            (function () {
                                throw new TypeError(
                                    'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
                                );
                            })()),
                    ),
                    '[tex]/all-packages': s,
                };
            function u(e, t) {
                (null == t || t > e.length) && (t = e.length);
                for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
                return n;
            }
            (0, e.combineDefaults)(MathJax.config.loader, 'dependencies', c),
                (0, e.combineDefaults)(MathJax.config.loader, 'paths', {
                    tex: '[mathjax]/input/tex/extensions',
                    mml: '[mathjax]/input/mml/extensions',
                    sre: '[mathjax]/sre/mathmaps',
                }),
                (0, e.combineDefaults)(MathJax.config.loader, 'provides', l),
                n.Loader.load
                    .apply(
                        n.Loader,
                        (function (e) {
                            return (
                                (function (e) {
                                    if (Array.isArray(e)) return u(e);
                                })(e) ||
                                (function (e) {
                                    if (
                                        ('undefined' != typeof Symbol &&
                                            null != e[Symbol.iterator]) ||
                                        null != e['@@iterator']
                                    )
                                        return Array.from(e);
                                })(e) ||
                                (function (e, t) {
                                    if (!e) return;
                                    if ('string' == typeof e) return u(e, t);
                                    var r = Object.prototype.toString.call(e).slice(8, -1);
                                    'Object' === r && e.constructor && (r = e.constructor.name);
                                    if ('Map' === r || 'Set' === r) return Array.from(e);
                                    if (
                                        'Arguments' === r ||
                                        /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
                                    )
                                        return u(e, t);
                                })(e) ||
                                (function () {
                                    throw new TypeError(
                                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
                                    );
                                })()
                            );
                        })(n.CONFIG.load),
                    )
                    .then(function () {
                        return n.CONFIG.ready();
                    })
                    .catch(function (e, t) {
                        return n.CONFIG.failed(e, t);
                    });
        })();
})();
