!(function () {
    var t = {
            306: function (t, e) {
                'use strict';
                (e.q = void 0), (e.q = '3.2.2');
            },
            884: function (t, e, i) {
                'use strict';
                var n,
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
                                        for (var i in e)
                                            Object.prototype.hasOwnProperty.call(e, i) &&
                                                (t[i] = e[i]);
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
                            function i() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((i.prototype = e.prototype), new i()));
                        }),
                    s =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (s =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, i = 1, n = arguments.length; i < n; i++)
                                            for (var a in (e = arguments[i]))
                                                Object.prototype.hasOwnProperty.call(e, a) &&
                                                    (t[a] = e[a]);
                                        return t;
                                    }),
                                s.apply(this, arguments)
                            );
                        },
                    r =
                        (this && this.__read) ||
                        function (t, e) {
                            var i = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!i) return t;
                            var n,
                                a,
                                s = i.call(t),
                                r = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = s.next()).done; )
                                    r.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (i = s.return) && i.call(s);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return r;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.AsciiMath = void 0);
                var o = i(309),
                    l = i(406),
                    u = i(77),
                    h = i(577),
                    p = (function (t) {
                        function e(i) {
                            var n = this,
                                a = r(
                                    (0, u.separateOptions)(i, h.FindAsciiMath.OPTIONS, e.OPTIONS),
                                    3,
                                ),
                                s = a[1],
                                o = a[2];
                            return (
                                ((n = t.call(this, o) || this).findAsciiMath =
                                    n.options.FindAsciiMath || new h.FindAsciiMath(s)),
                                n
                            );
                        }
                        return (
                            a(e, t),
                            (e.prototype.compile = function (t, e) {
                                return l.LegacyAsciiMath.Compile(t.math, t.display);
                            }),
                            (e.prototype.findMath = function (t) {
                                return this.findAsciiMath.findMath(t);
                            }),
                            (e.NAME = 'AsciiMath'),
                            (e.OPTIONS = s(s({}, o.AbstractInputJax.OPTIONS), {
                                FindAsciiMath: null,
                            })),
                            e
                        );
                    })(o.AbstractInputJax);
                e.AsciiMath = p;
            },
            577: function (t, e, i) {
                'use strict';
                var n,
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
                                        for (var i in e)
                                            Object.prototype.hasOwnProperty.call(e, i) &&
                                                (t[i] = e[i]);
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
                            function i() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((i.prototype = e.prototype), new i()));
                        }),
                    s =
                        (this && this.__read) ||
                        function (t, e) {
                            var i = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!i) return t;
                            var n,
                                a,
                                s = i.call(t),
                                r = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = s.next()).done; )
                                    r.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (i = s.return) && i.call(s);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return r;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.FindAsciiMath = void 0);
                var r = i(649),
                    o = i(720),
                    l = i(769),
                    u = (function (t) {
                        function e(e) {
                            var i = t.call(this, e) || this;
                            return i.getPatterns(), i;
                        }
                        return (
                            a(e, t),
                            (e.prototype.getPatterns = function () {
                                var t = this,
                                    e = this.options,
                                    i = [];
                                (this.end = {}),
                                    e.delimiters.forEach(function (e) {
                                        return t.addPattern(i, e, !1);
                                    }),
                                    (this.start = new RegExp(i.join('|'), 'g')),
                                    (this.hasPatterns = i.length > 0);
                            }),
                            (e.prototype.addPattern = function (t, e, i) {
                                var n = s(e, 2),
                                    a = n[0],
                                    r = n[1];
                                t.push((0, o.quotePattern)(a)),
                                    (this.end[a] = [r, i, new RegExp((0, o.quotePattern)(r), 'g')]);
                            }),
                            (e.prototype.findEnd = function (t, e, i, n) {
                                var a = s(n, 3),
                                    r = a[1],
                                    o = a[2],
                                    u = (o.lastIndex = i.index + i[0].length),
                                    h = o.exec(t);
                                return h
                                    ? (0, l.protoItem)(
                                          i[0],
                                          t.substr(u, h.index - u),
                                          h[0],
                                          e,
                                          i.index,
                                          h.index + h[0].length,
                                          r,
                                      )
                                    : null;
                            }),
                            (e.prototype.findMathInString = function (t, e, i) {
                                var n, a;
                                for (this.start.lastIndex = 0; (n = this.start.exec(i)); )
                                    (a = this.findEnd(i, e, n, this.end[n[0]])) &&
                                        (t.push(a), (this.start.lastIndex = a.end.n));
                            }),
                            (e.prototype.findMath = function (t) {
                                var e = [];
                                if (this.hasPatterns)
                                    for (var i = 0, n = t.length; i < n; i++)
                                        this.findMathInString(e, i, t[i]);
                                return e;
                            }),
                            (e.OPTIONS = { delimiters: [['`', '`']] }),
                            e
                        );
                    })(r.AbstractFindMath);
                e.FindAsciiMath = u;
            },
            406: function (t, e, i) {
                (MathJax = Object.assign(i.g.MathJax || {}, i(24).N)),
                    MathJax.config &&
                        MathJax.config.asciimath &&
                        MathJax.Hub.Config({ AsciiMath: MathJax.config.asciimath }),
                    MathJax.Ajax.Preloading(
                        '[MathJax]/jax/input/AsciiMath/config.js',
                        '[MathJax]/jax/input/AsciiMath/jax.js',
                        '[MathJax]/jax/element/mml/jax.js',
                    ),
                    i(404),
                    i(315),
                    i(247),
                    i(477);
                var n = new (0, i(806).g)();
                e.LegacyAsciiMath = {
                    Compile: function (t, e) {
                        var i = { type: 'math/asciimath', innerText: t, MathJax: {} },
                            a = MathJax.InputJax.AsciiMath.Translate(i).root.toMmlNode(n);
                        return a.setInheritedAttributes({}, e, 0, !1), a;
                    },
                    Translate: function (t, e) {
                        return this.Compile(t, e);
                    },
                };
            },
            24: function (t, e) {
                var i,
                    n,
                    a,
                    s,
                    r,
                    o,
                    l = { debug: !0 },
                    u = { MathJax: l },
                    h = {},
                    p = null;
                (e.N = l),
                    (function (t) {
                        var e = u.MathJax;
                        e || (e = u.MathJax = {});
                        var i = [],
                            n = function (t) {
                                var e = t.constructor;
                                for (var i in (e || (e = function () {}), t))
                                    'constructor' !== i && t.hasOwnProperty(i) && (e[i] = t[i]);
                                return e;
                            };
                        (e.Object = n({
                            constructor: function () {
                                return arguments.callee.Init.call(this, arguments);
                            },
                            Subclass: function (t, e) {
                                var n = function () {
                                    return arguments.callee.Init.call(this, arguments);
                                };
                                return (
                                    (n.SUPER = this),
                                    (n.Init = this.Init),
                                    (n.Subclass = this.Subclass),
                                    (n.Augment = this.Augment),
                                    (n.protoFunction = this.protoFunction),
                                    (n.can = this.can),
                                    (n.has = this.has),
                                    (n.isa = this.isa),
                                    (n.prototype = new this(i)),
                                    (n.prototype.constructor = n),
                                    n.Augment(t, e),
                                    n
                                );
                            },
                            Init: function (t) {
                                var e = this;
                                return 1 === t.length && t[0] === i
                                    ? e
                                    : (e instanceof t.callee || (e = new t.callee(i)),
                                      e.Init.apply(e, t) || e);
                            },
                            Augment: function (t, e) {
                                var i;
                                if (null != t) {
                                    for (i in t) t.hasOwnProperty(i) && this.protoFunction(i, t[i]);
                                    t.toString !== this.prototype.toString &&
                                        t.toString !== {}.toString &&
                                        this.protoFunction('toString', t.toString);
                                }
                                if (null != e) for (i in e) e.hasOwnProperty(i) && (this[i] = e[i]);
                                return this;
                            },
                            protoFunction: function (t, e) {
                                (this.prototype[t] = e),
                                    'function' == typeof e && (e.SUPER = this.SUPER.prototype);
                            },
                            prototype: {
                                Init: function () {},
                                SUPER: function (t) {
                                    return t.callee.SUPER;
                                },
                                can: function (t) {
                                    return 'function' == typeof this[t];
                                },
                                has: function (t) {
                                    return void 0 !== this[t];
                                },
                                isa: function (t) {
                                    return t instanceof Object && this instanceof t;
                                },
                            },
                            can: function (t) {
                                return this.prototype.can.call(this, t);
                            },
                            has: function (t) {
                                return this.prototype.has.call(this, t);
                            },
                            isa: function (t) {
                                for (var e = this; e; ) {
                                    if (e === t) return !0;
                                    e = e.SUPER;
                                }
                                return !1;
                            },
                            SimpleSUPER: n({
                                constructor: function (t) {
                                    return this.SimpleSUPER.define(t);
                                },
                                define: function (t) {
                                    var e = {};
                                    if (null != t) {
                                        for (var i in t)
                                            t.hasOwnProperty(i) && (e[i] = this.wrap(i, t[i]));
                                        t.toString !== this.prototype.toString &&
                                            t.toString !== {}.toString &&
                                            (e.toString = this.wrap('toString', t.toString));
                                    }
                                    return e;
                                },
                                wrap: function (t, e) {
                                    if (
                                        'function' != typeof e ||
                                        !e.toString().match(/\.\s*SUPER\s*\(/)
                                    )
                                        return e;
                                    var i = function () {
                                        this.SUPER = i.SUPER[t];
                                        try {
                                            var n = e.apply(this, arguments);
                                        } catch (t) {
                                            throw (delete this.SUPER, t);
                                        }
                                        return delete this.SUPER, n;
                                    };
                                    return (
                                        (i.toString = function () {
                                            return e.toString.apply(e, arguments);
                                        }),
                                        i
                                    );
                                },
                            }),
                        })),
                            (e.Object.isArray =
                                Array.isArray ||
                                function (t) {
                                    return '[object Array]' === Object.prototype.toString.call(t);
                                }),
                            (e.Object.Array = Array);
                    })(),
                    (function (t) {
                        var e = u.MathJax;
                        e || (e = u.MathJax = {});
                        var i = function (t) {
                            var e = function () {
                                return arguments.callee.execute.apply(arguments.callee, arguments);
                            };
                            for (var n in i.prototype)
                                i.prototype.hasOwnProperty(n) &&
                                    (e[n] = void 0 !== t[n] ? t[n] : i.prototype[n]);
                            return (e.toString = i.prototype.toString), e;
                        };
                        i.prototype = {
                            isCallback: !0,
                            hook: function () {},
                            data: [],
                            object: u,
                            execute: function () {
                                if (!this.called || this.autoReset)
                                    return (
                                        (this.called = !this.autoReset),
                                        this.hook.apply(
                                            this.object,
                                            this.data.concat([].slice.call(arguments, 0)),
                                        )
                                    );
                            },
                            reset: function () {
                                delete this.called;
                            },
                            toString: function () {
                                return this.hook.toString.apply(this.hook, arguments);
                            },
                        };
                        var n = function (t) {
                                return 'function' == typeof t && t.isCallback;
                            },
                            a = function (t) {
                                return eval.call(u, t);
                            },
                            s = function () {
                                if ((a('var __TeSt_VaR__ = 1'), u.__TeSt_VaR__))
                                    try {
                                        delete u.__TeSt_VaR__;
                                    } catch (t) {
                                        u.__TeSt_VaR__ = null;
                                    }
                                else
                                    a = u.execScript
                                        ? function (t) {
                                              (e.__code = t),
                                                  (t =
                                                      'try {MathJax.__result = eval(MathJax.__code)} catch(err) {MathJax.__result = err}'),
                                                  u.execScript(t);
                                              var i = e.__result;
                                              if (
                                                  (delete e.__result,
                                                  delete e.__code,
                                                  i instanceof Error)
                                              )
                                                  throw i;
                                              return i;
                                          }
                                        : function (t) {
                                              (e.__code = t),
                                                  (t =
                                                      'try {MathJax.__result = eval(MathJax.__code)} catch(err) {MathJax.__result = err}');
                                              var i = p.getElementsByTagName('head')[0];
                                              i || (i = p.body);
                                              var n = p.createElement('script');
                                              n.appendChild(p.createTextNode(t)),
                                                  i.appendChild(n),
                                                  i.removeChild(n);
                                              var a = e.__result;
                                              if (
                                                  (delete e.__result,
                                                  delete e.__code,
                                                  a instanceof Error)
                                              )
                                                  throw a;
                                              return a;
                                          };
                                s = null;
                            },
                            r = function (t, e) {
                                if (
                                    (arguments.length > 1 &&
                                        (t =
                                            2 === arguments.length &&
                                            'function' != typeof arguments[0] &&
                                            arguments[0] instanceof Object &&
                                            'number' == typeof arguments[1]
                                                ? [].slice.call(t, e)
                                                : [].slice.call(arguments, 0)),
                                    t instanceof Array && 1 === t.length && (t = t[0]),
                                    'function' == typeof t)
                                )
                                    return t.execute === i.prototype.execute ? t : i({ hook: t });
                                if (t instanceof Array) {
                                    if (
                                        'string' == typeof t[0] &&
                                        t[1] instanceof Object &&
                                        'function' == typeof t[1][t[0]]
                                    )
                                        return i({
                                            hook: t[1][t[0]],
                                            object: t[1],
                                            data: t.slice(2),
                                        });
                                    if ('function' == typeof t[0])
                                        return i({ hook: t[0], data: t.slice(1) });
                                    if ('function' == typeof t[1])
                                        return i({ hook: t[1], object: t[0], data: t.slice(2) });
                                } else {
                                    if ('string' == typeof t)
                                        return s && s(), i({ hook: a, data: [t] });
                                    if (t instanceof Object) return i(t);
                                    if (void 0 === t) return i({});
                                }
                                throw Error("Can't make callback from given data");
                            },
                            o = function (t, e) {
                                (t = r(t)).called || (c(t, e), e.pending++);
                            },
                            h = function () {
                                var t = this.signal;
                                delete this.signal,
                                    (this.execute = this.oldExecute),
                                    delete this.oldExecute;
                                var e = this.execute.apply(this, arguments);
                                if (n(e) && !e.called) c(e, t);
                                else
                                    for (var i = 0, a = t.length; i < a; i++)
                                        t[i].pending--, t[i].pending <= 0 && t[i].call();
                            },
                            c = function (t, e) {
                                e instanceof Array || (e = [e]),
                                    t.signal
                                        ? 1 === e.length
                                            ? t.signal.push(e[0])
                                            : (t.signal = t.signal.concat(e))
                                        : ((t.oldExecute = t.execute),
                                          (t.execute = h),
                                          (t.signal = e));
                            },
                            d = function (t) {
                                (t = r(t)).pending = 0;
                                for (var e = 1, i = arguments.length; e < i; e++)
                                    arguments[e] && o(arguments[e], t);
                                if (0 === t.pending) {
                                    var a = t();
                                    n(a) && (t = a);
                                }
                                return t;
                            },
                            m = l.Object.Subclass({
                                Init: function (t) {
                                    (this.hooks = []),
                                        (this.remove = []),
                                        (this.reset = t),
                                        (this.running = !1);
                                },
                                Add: function (t, e) {
                                    null == e && (e = 10), n(t) || (t = r(t)), (t.priority = e);
                                    for (
                                        var i = this.hooks.length;
                                        i > 0 && e < this.hooks[i - 1].priority;

                                    )
                                        i--;
                                    return this.hooks.splice(i, 0, t), t;
                                },
                                Remove: function (t) {
                                    for (var e = 0, i = this.hooks.length; e < i; e++)
                                        if (this.hooks[e] === t)
                                            return void (this.running
                                                ? this.remove.push(e)
                                                : this.hooks.splice(e, 1));
                                },
                                Execute: function () {
                                    var t = [{}];
                                    this.running = !0;
                                    for (var e = 0, i = this.hooks.length; e < i; e++) {
                                        this.reset && this.hooks[e].reset();
                                        var a = this.hooks[e].apply(u, arguments);
                                        n(a) && !a.called && t.push(a);
                                    }
                                    return (
                                        (this.running = !1),
                                        this.remove.length && this.RemovePending(),
                                        1 === t.length
                                            ? null
                                            : 2 === t.length
                                              ? t[1]
                                              : d.apply({}, t)
                                    );
                                },
                                RemovePending: function () {
                                    this.remove = this.remove.sort();
                                    for (var t = this.remove.length - 1; t >= 0; t--)
                                        this.hooks.splice(t, 1);
                                    this.remove = [];
                                },
                            }),
                            f = e.Object.Subclass({
                                Init: function () {
                                    (this.pending = this.running = 0),
                                        (this.queue = []),
                                        this.Push.apply(this, arguments);
                                },
                                Push: function () {
                                    for (var t, e = 0, i = arguments.length; e < i; e++)
                                        (t = r(arguments[e])) !== arguments[e] ||
                                            t.called ||
                                            (t = r(['wait', this, t])),
                                            this.queue.push(t);
                                    return this.running || this.pending || this.Process(), t;
                                },
                                Process: function (t) {
                                    for (; !this.running && !this.pending && this.queue.length; ) {
                                        var e = this.queue[0];
                                        (t = this.queue.slice(1)),
                                            (this.queue = []),
                                            this.Suspend();
                                        var i = e();
                                        this.Resume(),
                                            t.length && (this.queue = t.concat(this.queue)),
                                            n(i) && !i.called && o(i, this);
                                    }
                                },
                                Suspend: function () {
                                    this.running++;
                                },
                                Resume: function () {
                                    this.running && this.running--;
                                },
                                call: function () {
                                    this.Process.apply(this, arguments);
                                },
                                wait: function (t) {
                                    return t;
                                },
                            }),
                            g = f.Subclass(
                                {
                                    Init: function (t) {
                                        f.prototype.Init.call(this),
                                            (this.name = t),
                                            (this.posted = []),
                                            (this.listeners = m(!0)),
                                            (this.posting = !1),
                                            (this.callback = null);
                                    },
                                    Post: function (t, e, i) {
                                        if (((e = r(e)), this.posting || this.pending))
                                            this.Push(['Post', this, t, e, i]);
                                        else {
                                            (this.callback = e),
                                                e.reset(),
                                                i || this.posted.push(t),
                                                this.Suspend(),
                                                (this.posting = !0);
                                            var a = this.listeners.Execute(t);
                                            n(a) && !a.called && o(a, this),
                                                this.Resume(),
                                                (this.posting = !1),
                                                this.pending || this.call();
                                        }
                                        return e;
                                    },
                                    Clear: function (t) {
                                        return (
                                            (t = r(t)),
                                            this.posting || this.pending
                                                ? (t = this.Push(['Clear', this, t]))
                                                : ((this.posted = []), t()),
                                            t
                                        );
                                    },
                                    call: function () {
                                        this.callback(this), this.Process();
                                    },
                                    Interest: function (t, e, i) {
                                        if (((t = r(t)), this.listeners.Add(t, i), !e))
                                            for (var a = 0, s = this.posted.length; a < s; a++) {
                                                t.reset();
                                                var l = t(this.posted[a]);
                                                n(l) && a === this.posted.length - 1 && o(l, this);
                                            }
                                        return t;
                                    },
                                    NoInterest: function (t) {
                                        this.listeners.Remove(t);
                                    },
                                    MessageHook: function (t, e, i) {
                                        (e = r(e)),
                                            this.hooks ||
                                                ((this.hooks = {}),
                                                this.Interest(['ExecuteHooks', this])),
                                            this.hooks[t] || (this.hooks[t] = m(!0)),
                                            this.hooks[t].Add(e, i);
                                        for (var n = 0, a = this.posted.length; n < a; n++)
                                            this.posted[n] == t && (e.reset(), e(this.posted[n]));
                                        return (e.msg = t), e;
                                    },
                                    ExecuteHooks: function (t) {
                                        var e = t instanceof Array ? t[0] : t;
                                        return this.hooks[e] ? this.hooks[e].Execute(t) : null;
                                    },
                                    RemoveHook: function (t) {
                                        this.hooks[t.msg].Remove(t);
                                    },
                                },
                                {
                                    signals: {},
                                    find: function (t) {
                                        return (
                                            g.signals[t] || (g.signals[t] = new g(t)), g.signals[t]
                                        );
                                    },
                                },
                            );
                        (e.Callback = e.CallBack = r),
                            (e.Callback.Delay = function (t, e) {
                                return ((e = r(e)).timeout = setTimeout(e, t)), e;
                            }),
                            (e.Callback.After = d),
                            (e.Callback.Queue = f),
                            (e.Callback.Signal = g.find),
                            (e.Callback.Hooks = m),
                            (e.Callback.ExecuteHooks = function (t, e, i) {
                                if (!t) return null;
                                t instanceof Array || (t = [t]),
                                    e instanceof Array || (e = null == e ? [] : [e]);
                                for (var n = m(i), a = 0, s = t.length; a < s; a++) n.Add(t[a]);
                                return n.Execute.apply(n, e);
                            });
                    })(),
                    (function (t) {
                        var e = u.MathJax;
                        e || (e = u.MathJax = {});
                        var i = 'Apple Computer, Inc.' === h.vendor && void 0 === h.vendorSub,
                            n = 0,
                            a = [],
                            s = function () {
                                for (var t = 0, i = a.length; t < i; t++)
                                    e.Ajax.head.removeChild(a[t]);
                                a = [];
                            },
                            r = { MathJax: '' };
                        e.Ajax = {
                            loaded: {},
                            loading: {},
                            loadHooks: {},
                            timeout: 15e3,
                            styleDelay: 1,
                            config: { root: '', path: r },
                            STATUS: { OK: 1, ERROR: -1 },
                            fileURL: function (t) {
                                var e = t.match(/^\[([-._a-z0-9]+)\]/i);
                                return (
                                    e &&
                                        e[1] in r &&
                                        (t =
                                            (r[e[1]] || this.config.root) +
                                            t.substr(e[1].length + 2)),
                                    t
                                );
                            },
                            fileName: function (t) {
                                var e = this.config.root;
                                if (t.substr(0, e.length) === e)
                                    t = '[MathJax]' + t.substr(e.length);
                                else
                                    for (var i in r)
                                        if (
                                            r.hasOwnProperty(i) &&
                                            r[i] &&
                                            t.substr(0, r[i].length) === r[i]
                                        ) {
                                            t = '[' + i + ']' + t.substr(r[i].length);
                                            break;
                                        }
                                return t;
                            },
                            fileRev: function (t) {
                                var i = e.cdnFileVersions[name] || e.cdnVersion;
                                return i && (i = '?rev=' + i), i;
                            },
                            urlRev: function (t) {
                                return this.fileURL(t) + this.fileRev(t);
                            },
                            Require: function (t, i) {
                                var n;
                                if (((i = e.Callback(i)), t instanceof Object))
                                    for (var a in t)
                                        t.hasOwnProperty(a) && ((n = a.toUpperCase()), (t = t[a]));
                                else n = t.split(/\./).pop().toUpperCase();
                                if (((t = this.fileURL(t)), this.loaded[t])) i(this.loaded[t]);
                                else {
                                    var s = {};
                                    (s[n] = t), this.Load(s, i);
                                }
                                return i;
                            },
                            Load: function (t, i) {
                                var n;
                                if (((i = e.Callback(i)), t instanceof Object))
                                    for (var a in t)
                                        t.hasOwnProperty(a) && ((n = a.toUpperCase()), (t = t[a]));
                                else n = t.split(/\./).pop().toUpperCase();
                                if (((t = this.fileURL(t)), this.loading[t])) this.addHook(t, i);
                                else {
                                    if (((this.head = (this.head, null)), !this.loader[n]))
                                        throw Error("Can't load files of type " + n);
                                    this.loader[n].call(this, t, i);
                                }
                                return i;
                            },
                            LoadHook: function (t, i, n) {
                                if (((i = e.Callback(i)), t instanceof Object))
                                    for (var a in t) t.hasOwnProperty(a) && (t = t[a]);
                                return (
                                    (t = this.fileURL(t)),
                                    this.loaded[t] ? i(this.loaded[t]) : this.addHook(t, i, n),
                                    i
                                );
                            },
                            addHook: function (t, e, i) {
                                this.loadHooks[t] || (this.loadHooks[t] = l.Callback.Hooks()),
                                    this.loadHooks[t].Add(e, i),
                                    (e.file = t);
                            },
                            removeHook: function (t) {
                                this.loadHooks[t.file] &&
                                    (this.loadHooks[t.file].Remove(t),
                                    this.loadHooks[t.file].hooks.length ||
                                        delete this.loadHooks[t.file]);
                            },
                            Preloading: function () {
                                for (var t = 0, e = arguments.length; t < e; t++) {
                                    var i = this.fileURL(arguments[t]);
                                    this.loading[i] ||
                                        this.loaded[i] ||
                                        (this.loading[i] = { preloaded: !0 });
                                }
                            },
                            loader: {
                                JS: function (t, i) {
                                    var n = this.fileName(t),
                                        a = e.Callback(['loadTimeout', this, t]);
                                    (this.loading[t] = {
                                        callback: i,
                                        timeout: setTimeout(a, this.timeout),
                                        status: this.STATUS.OK,
                                        script: null,
                                    }),
                                        (this.loading[t].message = e.Message.File(n)),
                                        u.System ? u.System.import(t).catch(a) : a();
                                },
                                CSS: function (t, i) {
                                    var n = this.fileName(t),
                                        a = p.createElement('link');
                                    (a.rel = 'stylesheet'),
                                        (a.type = 'text/css'),
                                        (a.href = t + this.fileRev(n)),
                                        (this.loading[t] = {
                                            callback: i,
                                            message: e.Message.File(n),
                                            status: this.STATUS.OK,
                                        }),
                                        this.head.appendChild(a),
                                        this.timer.create.call(this, [this.timer.file, t], a);
                                },
                            },
                            timer: {
                                create: function (t, a) {
                                    return (
                                        (t = e.Callback(t)),
                                        ('STYLE' === a.nodeName &&
                                            a.styleSheet &&
                                            void 0 !== a.styleSheet.cssText) ||
                                        (u.chrome && 'LINK' === a.nodeName)
                                            ? t(this.STATUS.OK)
                                            : i
                                              ? this.timer.start(
                                                    this,
                                                    [this.timer.checkSafari2, n++, t],
                                                    this.styleDelay,
                                                )
                                              : this.timer.start(
                                                    this,
                                                    [this.timer.checkLength, a, t],
                                                    this.styleDelay,
                                                ),
                                        t
                                    );
                                },
                                start: function (t, i, n, a) {
                                    ((i = e.Callback(i)).execute = this.execute),
                                        (i.time = this.time),
                                        (i.STATUS = t.STATUS),
                                        (i.timeout = a || t.timeout),
                                        (i.delay = i.total = n || 0),
                                        n ? setTimeout(i, n) : i();
                                },
                                time: function (t) {
                                    return (
                                        (this.total += this.delay),
                                        (this.delay = Math.floor(1.05 * this.delay + 5)),
                                        this.total >= this.timeout ? (t(this.STATUS.ERROR), 1) : 0
                                    );
                                },
                                file: function (t, i) {
                                    i < 0 ? e.Ajax.loadTimeout(t) : e.Ajax.loadComplete(t);
                                },
                                execute: function () {
                                    this.hook.call(this.object, this, this.data[0], this.data[1]);
                                },
                                checkSafari2: function (t, e, i) {
                                    t.time(i) ||
                                        (p.styleSheets.length > e &&
                                        p.styleSheets[e].cssRules &&
                                        p.styleSheets[e].cssRules.length
                                            ? i(t.STATUS.OK)
                                            : setTimeout(t, t.delay));
                                },
                                checkLength: function (t, i, n) {
                                    if (!t.time(n)) {
                                        var a = 0,
                                            s = i.sheet || i.styleSheet;
                                        try {
                                            (s.cssRules || s.rules || []).length > 0 && (a = 1);
                                        } catch (t) {
                                            (t.message.match(/protected variable|restricted URI/) ||
                                                t.message.match(/Security error/)) &&
                                                (a = 1);
                                        }
                                        a
                                            ? setTimeout(e.Callback([n, t.STATUS.OK]), 0)
                                            : setTimeout(t, t.delay);
                                    }
                                },
                            },
                            loadComplete: function (t) {
                                t = this.fileURL(t);
                                var i = this.loading[t];
                                return (
                                    i && !i.preloaded
                                        ? (e.Message.Clear(i.message),
                                          i.timeout && clearTimeout(i.timeout),
                                          i.script &&
                                              (0 === a.length && setTimeout(s, 0),
                                              a.push(i.script)),
                                          (this.loaded[t] = i.status),
                                          delete this.loading[t],
                                          this.addHook(t, i.callback))
                                        : (i && delete this.loading[t],
                                          (this.loaded[t] = this.STATUS.OK),
                                          (i = { status: this.STATUS.OK })),
                                    this.loadHooks[t] ? this.loadHooks[t].Execute(i.status) : null
                                );
                            },
                            loadTimeout: function (t) {
                                this.loading[t].timeout && clearTimeout(this.loading[t].timeout),
                                    (this.loading[t].status = this.STATUS.ERROR),
                                    this.loadError(t),
                                    this.loadComplete(t);
                            },
                            loadError: function (t) {
                                e.Message.Set(
                                    ['LoadFailed', 'File failed to load: %1', t],
                                    null,
                                    2e3,
                                ),
                                    e.Hub.signal.Post(['file load error', t]);
                            },
                            Styles: function (t, i) {
                                var n = this.StyleString(t);
                                if ('' === n) (i = e.Callback(i))();
                                else {
                                    var a = p.createElement('style');
                                    (a.type = 'text/css'),
                                        (this.head = (this.head, null)),
                                        this.head.appendChild(a),
                                        a.styleSheet && void 0 !== a.styleSheet.cssText
                                            ? (a.styleSheet.cssText = n)
                                            : a.appendChild(p.createTextNode(n)),
                                        (i = this.timer.create.call(this, i, a));
                                }
                                return i;
                            },
                            StyleString: function (t) {
                                if ('string' == typeof t) return t;
                                var e,
                                    i,
                                    n = '';
                                for (e in t)
                                    if (t.hasOwnProperty(e))
                                        if ('string' == typeof t[e]) n += e + ' {' + t[e] + '}\n';
                                        else if (t[e] instanceof Array)
                                            for (var a = 0; a < t[e].length; a++)
                                                ((i = {})[e] = t[e][a]), (n += this.StyleString(i));
                                        else if ('@media' === e.substr(0, 6))
                                            n += e + ' {' + this.StyleString(t[e]) + '}\n';
                                        else if (null != t[e]) {
                                            for (var s in ((i = []), t[e]))
                                                t[e].hasOwnProperty(s) &&
                                                    null != t[e][s] &&
                                                    (i[i.length] = s + ': ' + t[e][s]);
                                            n += e + ' {' + i.join('; ') + '}\n';
                                        }
                                return n;
                            },
                        };
                    })(),
                    (l.HTML = {
                        setDocument: function (t) {
                            p = this.document = t;
                        },
                        Element: function (t, e, i) {
                            var n,
                                a = p.createElement(t);
                            if (e) {
                                if (e.hasOwnProperty('style')) {
                                    var s = e.style;
                                    for (n in ((e.style = {}), s))
                                        s.hasOwnProperty(n) &&
                                            (e.style[n.replace(/-([a-z])/g, this.ucMatch)] = s[n]);
                                }
                                for (n in (l.Hub.Insert(a, e), e))
                                    ('role' !== n && 'aria-' !== n.substr(0, 5)) ||
                                        a.setAttribute(n, e[n]);
                            }
                            if (i) {
                                l.Object.isArray(i) || (i = [i]);
                                for (var r = 0, o = i.length; r < o; r++)
                                    l.Object.isArray(i[r])
                                        ? a.appendChild(this.Element(i[r][0], i[r][1], i[r][2]))
                                        : 'script' === t
                                          ? this.setScript(a, i[r])
                                          : a.appendChild(p.createTextNode(i[r]));
                            }
                            return a;
                        },
                        ucMatch: function (t, e) {
                            return e.toUpperCase();
                        },
                        addElement: function (t, e, i, n) {
                            return t.appendChild(this.Element(e, i, n));
                        },
                        TextNode: function (t) {
                            return p.createTextNode(t);
                        },
                        addText: function (t, e) {
                            return t.appendChild(this.TextNode(e));
                        },
                        setScript: function (t, e) {
                            if (this.setScriptBug) t.text = e;
                            else {
                                for (; t.firstChild; ) t.removeChild(t.firstChild);
                                this.addText(t, e);
                            }
                        },
                        getScript: function (t) {
                            return t.innerText;
                        },
                    }),
                    (l.Localization = {
                        locale: 'en',
                        directory: '[MathJax]/localization',
                        strings: {
                            ast: { menuTitle: 'asturianu' },
                            bg: {
                                menuTitle: '\u0431\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438',
                            },
                            bcc: { menuTitle: '\u0628\u0644\u0648\u0686\u06cc' },
                            br: { menuTitle: 'brezhoneg' },
                            ca: { menuTitle: 'catal\xe0' },
                            cdo: { menuTitle: 'M\xecng-d\u0115\u0324ng-ng\u1e73\u0304' },
                            cs: { menuTitle: '\u010de\u0161tina' },
                            da: { menuTitle: 'dansk' },
                            de: { menuTitle: 'Deutsch' },
                            en: { menuTitle: 'English', isLoaded: !0 },
                            eo: { menuTitle: 'Esperanto' },
                            es: { menuTitle: 'espa\xf1ol' },
                            fa: { menuTitle: '\u0641\u0627\u0631\u0633\u06cc' },
                            fi: { menuTitle: 'suomi' },
                            fr: { menuTitle: 'fran\xe7ais' },
                            gl: { menuTitle: 'galego' },
                            he: { menuTitle: '\u05e2\u05d1\u05e8\u05d9\u05ea' },
                            ia: { menuTitle: 'interlingua' },
                            it: { menuTitle: 'italiano' },
                            ja: { menuTitle: '\u65e5\u672c\u8a9e' },
                            kn: { menuTitle: '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1' },
                            ko: { menuTitle: '\ud55c\uad6d\uc5b4' },
                            lb: { menuTitle: 'L\xebtzebuergesch' },
                            lt: { menuTitle: 'lietuvi\u0173' },
                            mk: {
                                menuTitle:
                                    '\u043c\u0430\u043a\u0435\u0434\u043e\u043d\u0441\u043a\u0438',
                            },
                            nl: { menuTitle: 'Nederlands' },
                            oc: { menuTitle: 'occitan' },
                            pl: { menuTitle: 'polski' },
                            pt: { menuTitle: 'portugus\xea' },
                            'pt-br': { menuTitle: 'portugu\xeas do Brasil' },
                            ru: { menuTitle: '\u0440\u0443\u0441\u0441\u043a\u0438\u0439' },
                            sco: { menuTitle: 'Scots' },
                            scn: { menuTitle: 'sicilianu' },
                            sl: { menuTitle: 'sloven\u0161\u010dina' },
                            sv: { menuTitle: 'svenska' },
                            tr: { menuTitle: 'T\xfcrk\xe7e' },
                            uk: {
                                menuTitle:
                                    '\u0443\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430',
                            },
                            vi: { menuTitle: 'Ti\u1ebfng Vi\u1ec7t' },
                            'zh-hans': { menuTitle: '\u4e2d\u6587\uff08\u7b80\u4f53\uff09' },
                        },
                        pattern: /%(\d+|\{\d+\}|\{[a-z]+:\%\d+(?:\|(?:%\{\d+\}|%.|[^\}])*)+\}|.)/g,
                        SPLIT:
                            3 === 'axb'.split(/(x)/).length
                                ? function (t, e) {
                                      return t.split(e);
                                  }
                                : function (t, e) {
                                      var i,
                                          n = [],
                                          a = 0;
                                      for (e.lastIndex = 0; (i = e.exec(t)); )
                                          n.push(t.substr(a, i.index - a)),
                                              n.push.apply(n, i.slice(1)),
                                              (a = i.index + i[0].length);
                                      return n.push(t.substr(a)), n;
                                  },
                        _: function (t, e) {
                            return e instanceof Array
                                ? this.processSnippet(t, e)
                                : this.processString(
                                      this.lookupPhrase(t, e),
                                      [].slice.call(arguments, 2),
                                  );
                        },
                        processString: function (t, e, i) {
                            var n, a;
                            for (n = 0, a = e.length; n < a; n++)
                                i && e[n] instanceof Array && (e[n] = this.processSnippet(i, e[n]));
                            var s = this.SPLIT(t, this.pattern);
                            for (n = 1, a = s.length; n < a; n += 2) {
                                var r = s[n].charAt(0);
                                if (r >= '0' && r <= '9')
                                    (s[n] = e[s[n] - 1]),
                                        'number' == typeof s[n] && (s[n] = this.number(s[n]));
                                else if ('{' === r)
                                    if ((r = s[n].substr(1)) >= '0' && r <= '9')
                                        (s[n] = e[s[n].substr(1, s[n].length - 2) - 1]),
                                            'number' == typeof s[n] && (s[n] = this.number(s[n]));
                                    else {
                                        var o = s[n].match(/^\{([a-z]+):%(\d+)\|(.*)\}$/);
                                        if (o)
                                            if ('plural' === o[1]) {
                                                var l = e[o[2] - 1];
                                                if (void 0 === l) s[n] = '???';
                                                else {
                                                    l = this.plural(l) - 1;
                                                    var u = o[3]
                                                        .replace(/(^|[^%])(%%)*%\|/g, '$1$2%\uefef')
                                                        .split(/\|/);
                                                    l >= 0 && l < u.length
                                                        ? (s[n] = this.processString(
                                                              u[l].replace(/\uEFEF/g, '|'),
                                                              e,
                                                              i,
                                                          ))
                                                        : (s[n] = '???');
                                                }
                                            } else s[n] = '%' + s[n];
                                    }
                                null == s[n] && (s[n] = '???');
                            }
                            if (!i) return s.join('');
                            var h = [],
                                p = '';
                            for (n = 0; n < a; n++)
                                (p += s[n]),
                                    ++n < a &&
                                        (s[n] instanceof Array
                                            ? (h.push(p), (h = h.concat(s[n])), (p = ''))
                                            : (p += s[n]));
                            return '' !== p && h.push(p), h;
                        },
                        processSnippet: function (t, e) {
                            for (var i = [], n = 0, a = e.length; n < a; n++)
                                if (e[n] instanceof Array) {
                                    var s = e[n];
                                    if ('string' == typeof s[1]) {
                                        var r = s[0];
                                        r instanceof Array || (r = [t, r]);
                                        var o = this.lookupPhrase(r, s[1]);
                                        i = i.concat(this.processMarkdown(o, s.slice(2), t));
                                    } else
                                        s[1] instanceof Array
                                            ? (i = i.concat(this.processSnippet.apply(this, s)))
                                            : s.length >= 3
                                              ? i.push([s[0], s[1], this.processSnippet(t, s[2])])
                                              : i.push(e[n]);
                                } else i.push(e[n]);
                            return i;
                        },
                        markdownPattern:
                            /(%.)|(\*{1,3})((?:%.|.)+?)\2|(`+)((?:%.|.)+?)\4|\[((?:%.|.)+?)\]\(([^\s\)]+)\)/,
                        processMarkdown: function (t, e, i) {
                            for (
                                var n,
                                    a = [],
                                    s = t.split(this.markdownPattern),
                                    r = s[0],
                                    o = 1,
                                    l = s.length;
                                o < l;
                                o += 8
                            )
                                s[o + 1]
                                    ? ((n = this.processString(s[o + 2], e, i)) instanceof Array ||
                                          (n = [n]),
                                      (n = [['b', 'i', 'i'][s[o + 1].length - 1], {}, n]),
                                      3 === s[o + 1].length && (n = ['b', {}, n]))
                                    : s[o + 3]
                                      ? ((n = this.processString(
                                            s[o + 4].replace(/^\s/, '').replace(/\s$/, ''),
                                            e,
                                            i,
                                        )) instanceof Array || (n = [n]),
                                        (n = ['code', {}, n]))
                                      : s[o + 5]
                                        ? ((n = this.processString(s[o + 5], e, i)) instanceof
                                              Array || (n = [n]),
                                          (n = [
                                              'a',
                                              {
                                                  href: this.processString(s[o + 6], e),
                                                  target: '_blank',
                                              },
                                              n,
                                          ]))
                                        : ((r += s[o]), (n = null)),
                                    n && ((a = this.concatString(a, r, e, i)).push(n), (r = '')),
                                    '' !== s[o + 7] && (r += s[o + 7]);
                            return (a = this.concatString(a, r, e, i));
                        },
                        concatString: function (t, e, i, n) {
                            return (
                                '' != e &&
                                    ((e = this.processString(e, i, n)) instanceof Array ||
                                        (e = [e]),
                                    (t = t.concat(e))),
                                t
                            );
                        },
                        lookupPhrase: function (t, e, i) {
                            i || (i = '_'),
                                t instanceof Array && ((i = t[0] || '_'), (t = t[1] || ''));
                            var n = this.loadDomain(i);
                            n && l.Hub.RestartAfter(n);
                            var a = this.strings[this.locale];
                            if (a && a.domains && i in a.domains) {
                                var s = a.domains[i];
                                s.strings && t in s.strings && (e = s.strings[t]);
                            }
                            return e;
                        },
                        loadFile: function (t, e, i) {
                            ((i = l.Callback(i)),
                            (t = e.file || t).match(/\.js$/) || (t += '.js'),
                            t.match(/^([a-z]+:|\[MathJax\])/)) ||
                                (t =
                                    (this.strings[this.locale].directory ||
                                        this.directory + '/' + this.locale ||
                                        '[MathJax]/localization/' + this.locale) +
                                    '/' +
                                    t);
                            var n = l.Ajax.Require(t, function () {
                                return (e.isLoaded = !0), i();
                            });
                            return n.called ? null : n;
                        },
                        loadDomain: function (t, e) {
                            var i,
                                n = this.strings[this.locale];
                            if (n) {
                                if (!n.isLoaded && (i = this.loadFile(this.locale, n)))
                                    return l.Callback.Queue(i, ['loadDomain', this, t]).Push(
                                        e || {},
                                    );
                                if (n.domains && t in n.domains) {
                                    var a = n.domains[t];
                                    if (!a.isLoaded && (i = this.loadFile(t, a)))
                                        return l.Callback.Queue(i).Push(e);
                                }
                            }
                            return l.Callback(e)();
                        },
                        Try: function (t) {
                            (t = l.Callback(t)).autoReset = !0;
                            try {
                                t();
                            } catch (e) {
                                if (!e.restart) throw e;
                                l.Callback.After(['Try', this, t], e.restart);
                            }
                        },
                        resetLocale: function (t) {
                            if (t) {
                                for (t = t.toLowerCase(); !this.strings[t]; ) {
                                    var e = t.lastIndexOf('-');
                                    if (-1 === e) return;
                                    t = t.substring(0, e);
                                }
                                var i = this.strings[t].remap;
                                this.locale = i || t;
                            }
                        },
                        setLocale: function (t) {
                            this.resetLocale(t), l.Menu && this.loadDomain('MathMenu');
                        },
                        addTranslation: function (t, e, i) {
                            var n = this.strings[t],
                                a = !1;
                            n || ((n = this.strings[t] = {}), (a = !0)),
                                n.domains || (n.domains = {}),
                                e && (n.domains[e] || (n.domains[e] = {}), (n = n.domains[e])),
                                l.Hub.Insert(n, i),
                                a && l.Menu.menu && l.Menu.CreateLocaleMenu();
                        },
                        setCSS: function (t) {
                            var e = this.strings[this.locale];
                            return (
                                e &&
                                    (e.fontFamily && (t.style.fontFamily = e.fontFamily),
                                    e.fontDirection &&
                                        ((t.style.direction = e.fontDirection),
                                        'rtl' === e.fontDirection &&
                                            (t.style.textAlign = 'right'))),
                                t
                            );
                        },
                        fontFamily: function () {
                            var t = this.strings[this.locale];
                            return t ? t.fontFamily : null;
                        },
                        fontDirection: function () {
                            var t = this.strings[this.locale];
                            return t ? t.fontDirection : null;
                        },
                        plural: function (t) {
                            var e = this.strings[this.locale];
                            return e && e.plural ? e.plural(t) : 1 == t ? 1 : 2;
                        },
                        number: function (t) {
                            var e = this.strings[this.locale];
                            return e && e.number ? e.number(t) : t;
                        },
                    }),
                    (l.Message = {
                        localize: function (t) {
                            return l.Localization._(t, t);
                        },
                        filterText: function (t, e, i) {
                            return (
                                'simple' === l.Hub.config.messageStyle &&
                                    ('LoadFile' === i
                                        ? (this.loading ||
                                              (this.loading = this.localize('Loading') + ' '),
                                          (t = this.loading),
                                          (this.loading += '.'))
                                        : 'ProcessMath' === i
                                          ? (this.processing ||
                                                (this.processing =
                                                    this.localize('Processing') + ' '),
                                            (t = this.processing),
                                            (this.processing += '.'))
                                          : 'TypesetMath' === i &&
                                            (this.typesetting ||
                                                (this.typesetting =
                                                    this.localize('Typesetting') + ' '),
                                            (t = this.typesetting),
                                            (this.typesetting += '.'))),
                                t
                            );
                        },
                        Set: function (t, e, i) {
                            l.debug &&
                                (Array.isArray(t) &&
                                    (t = l.Localization._.apply(l.Localization, t)),
                                console.log('Message: ' + t));
                        },
                        Clear: function (t, e) {},
                        Remove: function () {},
                        File: function (t) {
                            return this.Set(['LoadFile', 'Loading %1', t], null, null);
                        },
                        Log: function () {},
                    }),
                    (l.Hub = {
                        config: {
                            root: './mathjax2/legacy',
                            config: [],
                            jax: [],
                            extensions: [],
                            preJax: null,
                            postJax: null,
                            displayAlign: 'center',
                            displayIndent: '0',
                            preRemoveClass: 'MathJax_Preview',
                            showProcessingMessages: !0,
                            messageStyle: 'normal',
                            delayStartupUntil: 'none',
                            skipStartupTypeset: !1,
                            elements: [],
                            positionToHash: !0,
                            showMathMenu: !0,
                            showMathMenuMSIE: !0,
                            menuSettings: {
                                zoom: 'None',
                                CTRL: !1,
                                ALT: !1,
                                CMD: !1,
                                Shift: !1,
                                discoverable: !1,
                                zscale: '200%',
                                renderer: null,
                                font: 'Auto',
                                context: 'MathJax',
                                locale: null,
                                mpContext: !1,
                                mpMouse: !1,
                                texHints: !0,
                                FastPreview: null,
                                assistiveMML: null,
                                inTabOrder: !0,
                                semantics: !1,
                            },
                            errorSettings: {
                                message: [
                                    '[',
                                    ['MathProcessingError', 'Math Processing Error'],
                                    ']',
                                ],
                                style: { color: '#CC0000', 'font-style': 'italic' },
                            },
                            ignoreMMLattributes: {},
                        },
                        preProcessors: l.Callback.Hooks(!0),
                        inputJax: {},
                        outputJax: { order: {} },
                        processSectionDelay: 50,
                        processUpdateTime: 250,
                        processUpdateDelay: 10,
                        signal: l.Callback.Signal('Hub'),
                        Config: function (t) {
                            this.Insert(this.config, t),
                                this.config.Augment && this.Augment(this.config.Augment);
                        },
                        CombineConfig: function (t, e) {
                            for (
                                var i, n, a = this.config, s = 0, r = (t = t.split(/\./)).length;
                                s < r;
                                s++
                            )
                                a[(i = t[s])] || (a[i] = {}), (n = a), (a = a[i]);
                            return (n[i] = a = this.Insert(e, a)), a;
                        },
                        Register: {
                            PreProcessor: function () {
                                return l.Hub.preProcessors.Add.apply(
                                    l.Hub.preProcessors,
                                    arguments,
                                );
                            },
                            MessageHook: function () {
                                return l.Hub.signal.MessageHook.apply(l.Hub.signal, arguments);
                            },
                            StartupHook: function () {
                                return l.Hub.Startup.signal.MessageHook.apply(
                                    l.Hub.Startup.signal,
                                    arguments,
                                );
                            },
                            LoadHook: function () {
                                return l.Ajax.LoadHook.apply(l.Ajax, arguments);
                            },
                        },
                        UnRegister: {
                            PreProcessor: function (t) {
                                l.Hub.preProcessors.Remove(t);
                            },
                            MessageHook: function (t) {
                                l.Hub.signal.RemoveHook(t);
                            },
                            StartupHook: function (t) {
                                l.Hub.Startup.signal.RemoveHook(t);
                            },
                            LoadHook: function (t) {
                                l.Ajax.removeHook(t);
                            },
                        },
                        setRenderer: function (t, e) {
                            if (t) {
                                if (l.OutputJax[t]) {
                                    (this.config.menuSettings.renderer = t),
                                        null == e && (e = 'jax/mml');
                                    var i = this.outputJax;
                                    return i[e] && i[e].length && t !== i[e][0].id
                                        ? (i[e].unshift(l.OutputJax[t]),
                                          this.signal.Post(['Renderer Selected', t]))
                                        : null;
                                }
                                this.config.menuSettings.renderer = '';
                                var n = '[MathJax]/jax/output/' + t + '/config.js';
                                return l.Ajax.Require(n, ['setRenderer', this, t, e]);
                            }
                        },
                        Queue: function () {
                            return this.queue.Push.apply(this.queue, arguments);
                        },
                        RestartAfter: function (t) {
                            throw this.Insert(Error('restart'), { restart: l.Callback(t) });
                        },
                        Insert: function (t, e) {
                            for (var i in e)
                                e.hasOwnProperty(i) &&
                                    ('object' != typeof e[i] ||
                                    e[i] instanceof Array ||
                                    ('object' != typeof t[i] && 'function' != typeof t[i])
                                        ? (t[i] = e[i])
                                        : this.Insert(t[i], e[i]));
                            return t;
                        },
                        SplitList:
                            'trim' in String.prototype
                                ? function (t) {
                                      return t.trim().split(/\s+/);
                                  }
                                : function (t) {
                                      return t.replace(/^\s+/, '').replace(/\s+$/, '').split(/\s+/);
                                  },
                    }),
                    (l.Extension = {}),
                    (l.Hub.Startup = {
                        queue: l.Callback.Queue(),
                        signal: l.Callback.Signal('Startup'),
                    }),
                    (l.Ajax.config.root = l.Hub.config.root),
                    (i = u.MathJax),
                    (n = '[MathJax]'),
                    (a = i.Hub),
                    (s = i.Ajax),
                    (r = i.Callback),
                    (o = l.Object.Subclass(
                        {
                            JAXFILE: 'jax.js',
                            require: null,
                            config: {},
                            Init: function (t, e) {
                                return 0 === arguments.length
                                    ? this
                                    : this.constructor.Subclass(t, e)();
                            },
                            Augment: function (t, e) {
                                var i = this.constructor,
                                    n = {};
                                if (null != t) {
                                    for (var s in t)
                                        t.hasOwnProperty(s) &&
                                            ('function' == typeof t[s]
                                                ? i.protoFunction(s, t[s])
                                                : (n[s] = t[s]));
                                    t.toString !== i.prototype.toString &&
                                        t.toString !== {}.toString &&
                                        i.protoFunction('toString', t.toString);
                                }
                                return a.Insert(i.prototype, n), i.Augment(null, e), this;
                            },
                            Translate: function (t, e) {
                                throw Error(
                                    this.directory +
                                        '/' +
                                        this.JAXFILE +
                                        ' failed to define the Translate() method',
                                );
                            },
                            Register: function (t) {},
                            Config: function () {
                                (this.config = a.CombineConfig(this.id, this.config)),
                                    this.config.Augment && this.Augment(this.config.Augment);
                            },
                            Startup: function () {},
                            loadComplete: function (t) {
                                if ('config.js' === t)
                                    return s.loadComplete(this.directory + '/' + t);
                                var e = r.Queue();
                                return (
                                    e.Push(
                                        ['Post', a.Startup.signal, this.id + ' Jax Config'],
                                        ['Config', this],
                                        ['Post', a.Startup.signal, this.id + ' Jax Startup'],
                                        ['Startup', this],
                                        ['Post', a.Startup.signal, this.id + ' Jax Ready'],
                                    ),
                                    this.copyTranslate &&
                                        e.Push([
                                            function (t) {
                                                (t.preProcess = t.preTranslate),
                                                    (t.Process = t.Translate),
                                                    (t.postProcess = t.postTranslate);
                                            },
                                            this.constructor.prototype,
                                        ]),
                                    e.Push(['loadComplete', s, this.directory + '/' + t])
                                );
                            },
                        },
                        {
                            id: 'Jax',
                            version: '2.6.0',
                            directory: n + '/jax',
                            extensionDir: n + '/extensions',
                        },
                    )),
                    (i.InputJax = o.Subclass(
                        {
                            elementJax: 'mml',
                            sourceMenuTitle: ['Original', 'Original Form'],
                            copyTranslate: !0,
                            Process: function (t, e) {
                                throw Error('Input jax failed to load properly');
                            },
                            needsUpdate: function (t) {
                                var e = t.SourceElement();
                                return t.originalText !== i.HTML.getScript(e);
                            },
                            Register: function (t) {
                                a.inputJax || (a.inputJax = {}), (a.inputJax[t] = this);
                            },
                        },
                        {
                            id: 'InputJax',
                            version: '2.6.0',
                            directory: o.directory + '/input',
                            extensionDir: o.extensionDir,
                        },
                    )),
                    (i.OutputJax = o.Subclass(
                        {
                            copyTranslate: !0,
                            preProcess: function (t) {
                                throw Error('Output jax failed to load properly');
                            },
                            Register: function (t) {
                                var e = a.outputJax;
                                e[t] || (e[t] = []),
                                    e[t].length &&
                                    (this.id === a.config.menuSettings.renderer ||
                                        (e.order[this.id] || 0) < (e.order[e[t][0].id] || 0))
                                        ? e[t].unshift(this)
                                        : e[t].push(this);
                            },
                            Remove: function (t) {},
                        },
                        {
                            id: 'OutputJax',
                            version: '2.6.0',
                            directory: o.directory + '/output',
                            extensionDir: o.extensionDir,
                            fontDir: n + (i.isPacked ? '' : '/..') + '/fonts',
                            imageDir: n + (i.isPacked ? '' : '/..') + '/images',
                        },
                    )),
                    (i.ElementJax = o.Subclass(
                        {
                            Init: function (t, e) {
                                return this.constructor.Subclass(t, e);
                            },
                            inputJax: null,
                            outputJax: null,
                            inputID: null,
                            originalText: '',
                            mimeType: '',
                            sourceMenuTitle: ['MathMLcode', 'MathML Code'],
                            Text: function (t, e) {
                                var n = this.SourceElement();
                                return (
                                    i.HTML.setScript(n, t),
                                    (n.MathJax.state = this.STATE.UPDATE),
                                    a.Update(n, e)
                                );
                            },
                            Reprocess: function (t) {
                                var e = this.SourceElement();
                                return (e.MathJax.state = this.STATE.UPDATE), a.Reprocess(e, t);
                            },
                            Update: function (t) {
                                return this.Rerender(t);
                            },
                            Rerender: function (t) {
                                var e = this.SourceElement();
                                return (e.MathJax.state = this.STATE.OUTPUT), a.Process(e, t);
                            },
                            Remove: function (t) {
                                this.hover && this.hover.clear(this),
                                    i.OutputJax[this.outputJax].Remove(this),
                                    t ||
                                        (a.signal.Post(['Remove Math', this.inputID]),
                                        this.Detach());
                            },
                            needsUpdate: function () {
                                return i.InputJax[this.inputJax].needsUpdate(this);
                            },
                            SourceElement: function () {
                                return p.getElementById(this.inputID);
                            },
                            Attach: function (t, e) {
                                var n = t.MathJax.elementJax;
                                return (
                                    t.MathJax.state === this.STATE.UPDATE
                                        ? n.Clone(this)
                                        : ((n = t.MathJax.elementJax = this),
                                          t.id
                                              ? (this.inputID = t.id)
                                              : ((t.id = this.inputID = i.ElementJax.GetID()),
                                                (this.newID = 1))),
                                    (n.originalText = i.HTML.getScript(t)),
                                    (n.inputJax = e),
                                    n.root && (n.root.inputID = n.inputID),
                                    n
                                );
                            },
                            Detach: function () {
                                var t = this.SourceElement();
                                if (t) {
                                    try {
                                        delete t.MathJax;
                                    } catch (e) {
                                        t.MathJax = null;
                                    }
                                    this.newID && (t.id = '');
                                }
                            },
                            Clone: function (t) {
                                var e;
                                for (e in this)
                                    this.hasOwnProperty(e) &&
                                        void 0 === t[e] &&
                                        'newID' !== e &&
                                        delete this[e];
                                for (e in t)
                                    t.hasOwnProperty(e) &&
                                        (void 0 === this[e] ||
                                            (this[e] !== t[e] && 'inputID' !== e)) &&
                                        (this[e] = t[e]);
                            },
                        },
                        {
                            id: 'ElementJax',
                            version: '2.6.0',
                            directory: o.directory + '/element',
                            extensionDir: o.extensionDir,
                            ID: 0,
                            STATE: { PENDING: 1, PROCESSED: 2, UPDATE: 3, OUTPUT: 4 },
                            GetID: function () {
                                return this.ID++, 'MathJax-Element-' + this.ID;
                            },
                            Subclass: function () {
                                var t = o.Subclass.apply(this, arguments);
                                return (t.loadComplete = this.prototype.loadComplete), t;
                            },
                        },
                    )),
                    (i.ElementJax.prototype.STATE = i.ElementJax.STATE),
                    (l.Hub.Browser = { Select: function () {} });
            },
            477: function () {
                var t, e, i;
                (t = MathJax.ElementJax.mml),
                    (e = [
                        'texWithDelims',
                        'movesupsub',
                        'subsupOK',
                        'primes',
                        'movablelimits',
                        'scriptlevel',
                        'open',
                        'close',
                        'isError',
                        'multiline',
                        'variantForm',
                        'autoOP',
                        'fnOP',
                    ]),
                    (i = { texWithDelims: 'withDelims' }),
                    t.mbase.Augment({
                        toMmlNode: function (t) {
                            var e = this.type;
                            'texatom' === e && (e = 'TeXAtom');
                            var i = this.nodeMake(t, e);
                            return 'texClass' in this && (i.texClass = this.texClass), i;
                        },
                        nodeMake: function (t, e) {
                            for (
                                var i = t.MML['TeXmathchoice' === e ? 'mathchoice' : e](),
                                    n =
                                        this.data[0] && this.data[0].inferred && this.inferRow
                                            ? this.data[0].data
                                            : this.data,
                                    a = 0,
                                    s = n.length;
                                a < s;
                                a++
                            ) {
                                var r = n[a];
                                r && i.appendChild(r.toMmlNode(t));
                            }
                            return this.nodeAddAttributes(i), this.nodeAddProperties(i), i;
                        },
                        nodeAddAttributes: function (e) {
                            var i =
                                    'mstyle' === this.type
                                        ? t.math.prototype.defaults
                                        : this.defaults,
                                n = this.attrNames || t.copyAttributeNames,
                                a = t.skipAttributes,
                                s = t.copyAttributes;
                            if (!this.attrNames) {
                                for (var r in i)
                                    a[r] ||
                                        s[r] ||
                                        !i.hasOwnProperty(r) ||
                                        (null != this[r] &&
                                            this[r] !== i[r] &&
                                            this.Get(r, null, 1) !== this[r] &&
                                            e.attributes.set(r, this[r]));
                                this.class && e.attributes.set('class', this.class);
                            }
                            for (var o = 0, l = n.length; o < l; o++)
                                if (1 !== s[n[o]] || i.hasOwnProperty(n[o])) {
                                    var u = (this.attr || {})[n[o]];
                                    null == u && (u = this[n[o]]),
                                        ('true' !== u && 'false' !== u) || (u = 'true' === u),
                                        null != u && e.attributes.set(n[o], u);
                                }
                        },
                        nodeAddProperties: function (n) {
                            for (var a = 0, s = e.length; a < s; a++) {
                                var r = e[a];
                                null == this[r] ||
                                    (null != this.defaults[r] && this.defaults[r] !== t.AUTO) ||
                                    n.setProperty(i[r] || r, this[r]);
                            }
                        },
                    }),
                    t.chars.Augment({
                        toMmlNode: function (t) {
                            return t.MML.text().setText(this.data.join(''));
                        },
                    }),
                    t.entity.Augment({
                        toMmlNode: function (t) {
                            return t.MML.text().setText(this.toString());
                        },
                    }),
                    t.msubsup.Augment({
                        toMmlNode: function (t) {
                            var e =
                                null == this.data[this.sub]
                                    ? 'msup'
                                    : null == this.data[this.sup]
                                      ? 'msub'
                                      : 'msubsup';
                            return this.nodeMake(t, e);
                        },
                    }),
                    t.munderover.Augment({
                        toMmlNode: function (t) {
                            var e =
                                null == this.data[this.under]
                                    ? 'mover'
                                    : null == this.data[this.over]
                                      ? 'munder'
                                      : 'munderover';
                            return this.nodeMake(t, e);
                        },
                    }),
                    t.xml.Augment({
                        toMmlNode: function (t) {
                            return t.MML.xml(this.data);
                        },
                    });
            },
            404: function () {
                (MathJax.ElementJax.mml = MathJax.ElementJax(
                    { mimeType: 'jax/mml' },
                    {
                        id: 'mml',
                        version: '2.7.2',
                        directory: MathJax.ElementJax.directory + '/mml',
                        extensionDir: MathJax.ElementJax.extensionDir + '/mml',
                        optableDir: MathJax.ElementJax.directory + '/mml/optable',
                    },
                )),
                    MathJax.ElementJax.mml.Augment(
                        {
                            Init: function () {
                                if (
                                    (1 === arguments.length && 'math' === arguments[0].type
                                        ? (this.root = arguments[0])
                                        : (this.root = MathJax.ElementJax.mml.math.apply(
                                              this,
                                              arguments,
                                          )),
                                    this.root.attr && this.root.attr.mode)
                                ) {
                                    this.root.display ||
                                        'display' !== this.root.attr.mode ||
                                        ((this.root.display = 'block'),
                                        this.root.attrNames.push('display')),
                                        delete this.root.attr.mode;
                                    for (var t = 0, e = this.root.attrNames.length; t < e; t++)
                                        if ('mode' === this.root.attrNames[t]) {
                                            this.root.attrNames.splice(t, 1);
                                            break;
                                        }
                                }
                            },
                        },
                        {
                            INHERIT: '_inherit_',
                            AUTO: '_auto_',
                            SIZE: {
                                INFINITY: 'infinity',
                                SMALL: 'small',
                                NORMAL: 'normal',
                                BIG: 'big',
                            },
                            COLOR: { TRANSPARENT: 'transparent' },
                            VARIANT: {
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
                                CALIGRAPHIC: '-tex-caligraphic',
                                OLDSTYLE: '-tex-oldstyle',
                            },
                            FORM: { PREFIX: 'prefix', INFIX: 'infix', POSTFIX: 'postfix' },
                            LINEBREAK: {
                                AUTO: 'auto',
                                NEWLINE: 'newline',
                                NOBREAK: 'nobreak',
                                GOODBREAK: 'goodbreak',
                                BADBREAK: 'badbreak',
                            },
                            LINEBREAKSTYLE: {
                                BEFORE: 'before',
                                AFTER: 'after',
                                DUPLICATE: 'duplicate',
                                INFIXLINBREAKSTYLE: 'infixlinebreakstyle',
                            },
                            INDENTALIGN: {
                                LEFT: 'left',
                                CENTER: 'center',
                                RIGHT: 'right',
                                AUTO: 'auto',
                                ID: 'id',
                                INDENTALIGN: 'indentalign',
                            },
                            INDENTSHIFT: { INDENTSHIFT: 'indentshift' },
                            LINETHICKNESS: { THIN: 'thin', MEDIUM: 'medium', THICK: 'thick' },
                            NOTATION: {
                                LONGDIV: 'longdiv',
                                ACTUARIAL: 'actuarial',
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
                                UPDIAGONALARROW: 'updiagonalarrow',
                                VERTICALSTRIKE: 'verticalstrike',
                                HORIZONTALSTRIKE: 'horizontalstrike',
                                PHASORANGLE: 'phasorangle',
                                MADRUWB: 'madruwb',
                            },
                            ALIGN: {
                                TOP: 'top',
                                BOTTOM: 'bottom',
                                CENTER: 'center',
                                BASELINE: 'baseline',
                                AXIS: 'axis',
                                LEFT: 'left',
                                RIGHT: 'right',
                            },
                            LINES: { NONE: 'none', SOLID: 'solid', DASHED: 'dashed' },
                            SIDE: {
                                LEFT: 'left',
                                RIGHT: 'right',
                                LEFTOVERLAP: 'leftoverlap',
                                RIGHTOVERLAP: 'rightoverlap',
                            },
                            WIDTH: { AUTO: 'auto', FIT: 'fit' },
                            ACTIONTYPE: {
                                TOGGLE: 'toggle',
                                STATUSLINE: 'statusline',
                                TOOLTIP: 'tooltip',
                                INPUT: 'input',
                            },
                            LENGTH: {
                                VERYVERYTHINMATHSPACE: 'veryverythinmathspace',
                                VERYTHINMATHSPACE: 'verythinmathspace',
                                THINMATHSPACE: 'thinmathspace',
                                MEDIUMMATHSPACE: 'mediummathspace',
                                THICKMATHSPACE: 'thickmathspace',
                                VERYTHICKMATHSPACE: 'verythickmathspace',
                                VERYVERYTHICKMATHSPACE: 'veryverythickmathspace',
                                NEGATIVEVERYVERYTHINMATHSPACE: 'negativeveryverythinmathspace',
                                NEGATIVEVERYTHINMATHSPACE: 'negativeverythinmathspace',
                                NEGATIVETHINMATHSPACE: 'negativethinmathspace',
                                NEGATIVEMEDIUMMATHSPACE: 'negativemediummathspace',
                                NEGATIVETHICKMATHSPACE: 'negativethickmathspace',
                                NEGATIVEVERYTHICKMATHSPACE: 'negativeverythickmathspace',
                                NEGATIVEVERYVERYTHICKMATHSPACE: 'negativeveryverythickmathspace',
                            },
                            OVERFLOW: {
                                LINBREAK: 'linebreak',
                                SCROLL: 'scroll',
                                ELIDE: 'elide',
                                TRUNCATE: 'truncate',
                                SCALE: 'scale',
                            },
                            UNIT: {
                                EM: 'em',
                                EX: 'ex',
                                PX: 'px',
                                IN: 'in',
                                CM: 'cm',
                                MM: 'mm',
                                PT: 'pt',
                                PC: 'pc',
                            },
                            TEXCLASS: {
                                ORD: 0,
                                OP: 1,
                                BIN: 2,
                                REL: 3,
                                OPEN: 4,
                                CLOSE: 5,
                                PUNCT: 6,
                                INNER: 7,
                                VCENTER: 8,
                                NONE: -1,
                            },
                            TEXCLASSNAMES: [
                                'ORD',
                                'OP',
                                'BIN',
                                'REL',
                                'OPEN',
                                'CLOSE',
                                'PUNCT',
                                'INNER',
                                'VCENTER',
                            ],
                            skipAttributes: { texClass: !0, useHeight: !0, texprimestyle: !0 },
                            copyAttributes: {
                                displaystyle: 1,
                                scriptlevel: 1,
                                open: 1,
                                close: 1,
                                form: 1,
                                actiontype: 1,
                                fontfamily: !0,
                                fontsize: !0,
                                fontweight: !0,
                                fontstyle: !0,
                                color: !0,
                                background: !0,
                                id: !0,
                                class: 1,
                                href: !0,
                                style: !0,
                            },
                            copyAttributeNames: [
                                'displaystyle',
                                'scriptlevel',
                                'open',
                                'close',
                                'form',
                                'actiontype',
                                'fontfamily',
                                'fontsize',
                                'fontweight',
                                'fontstyle',
                                'color',
                                'background',
                                'id',
                                'class',
                                'href',
                                'style',
                            ],
                            nocopyAttributes: {
                                fontfamily: !0,
                                fontsize: !0,
                                fontweight: !0,
                                fontstyle: !0,
                                color: !0,
                                background: !0,
                                id: !0,
                                class: !0,
                                href: !0,
                                style: !0,
                                xmlns: !0,
                            },
                            Error: function (t, e) {
                                var i = this.merror(t),
                                    n = MathJax.Localization.fontDirection(),
                                    a = MathJax.Localization.fontFamily();
                                return (
                                    e && (i = i.With(e)),
                                    (n || a) &&
                                        ((i = this.mstyle(i)),
                                        n && (i.dir = n),
                                        a && (i.style.fontFamily = 'font-family: ' + a)),
                                    i
                                );
                            },
                        },
                    ),
                    (function (t) {
                        (t.mbase = MathJax.Object.Subclass(
                            {
                                type: 'base',
                                isToken: !1,
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    dir: t.INHERIT,
                                },
                                noInherit: {},
                                noInheritAttribute: { texClass: !0 },
                                getRemoved: {},
                                linebreakContainer: !1,
                                Init: function () {
                                    (this.data = []),
                                        !this.inferRow ||
                                            (1 === arguments.length && arguments[0].inferred) ||
                                            this.Append(
                                                t.mrow().With({ inferred: !0, notParent: !0 }),
                                            ),
                                        this.Append.apply(this, arguments);
                                },
                                With: function (t) {
                                    for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e]);
                                    return this;
                                },
                                Append: function () {
                                    if (this.inferRow && this.data.length)
                                        this.data[0].Append.apply(this.data[0], arguments);
                                    else
                                        for (var t = 0, e = arguments.length; t < e; t++)
                                            this.SetData(this.data.length, arguments[t]);
                                },
                                SetData: function (e, i) {
                                    null != i &&
                                        (i instanceof t.mbase ||
                                            (i =
                                                this.isToken || this.isChars
                                                    ? t.chars(i)
                                                    : t.mtext(i)),
                                        (i.parent = this),
                                        i.setInherit(this.inheritFromMe ? this : this.inherit)),
                                        (this.data[e] = i);
                                },
                                Parent: function () {
                                    for (var t = this.parent; t && t.notParent; ) t = t.parent;
                                    return t;
                                },
                                Get: function (e, i, n) {
                                    if (!n) {
                                        if (null != this[e]) return this[e];
                                        if (this.attr && null != this.attr[e]) return this.attr[e];
                                    }
                                    var a = this.Parent();
                                    if (a && null != a['adjustChild_' + e])
                                        return a['adjustChild_' + e](this.childPosition(), i);
                                    for (var s = this.inherit, r = s; s; ) {
                                        var o = s[e];
                                        if (
                                            (null == o && s.attr && (o = s.attr[e]),
                                            s.removedStyles &&
                                                s.getRemoved[e] &&
                                                null == o &&
                                                (o = s.removedStyles[s.getRemoved[e]]),
                                            null != o &&
                                                s.noInheritAttribute &&
                                                !s.noInheritAttribute[e])
                                        ) {
                                            var l = s.noInherit[this.type];
                                            if (!l || !l[e]) return o;
                                        }
                                        (r = s), (s = s.inherit);
                                    }
                                    if (!i) {
                                        if (this.defaults[e] === t.AUTO) return this.autoDefault(e);
                                        if (
                                            this.defaults[e] !== t.INHERIT &&
                                            null != this.defaults[e]
                                        )
                                            return this.defaults[e];
                                        if (r) return r.defaults[e];
                                    }
                                    return null;
                                },
                                hasValue: function (t) {
                                    return null != this.Get(t, !0);
                                },
                                getValues: function () {
                                    for (var t = {}, e = 0, i = arguments.length; e < i; e++)
                                        t[arguments[e]] = this.Get(arguments[e]);
                                    return t;
                                },
                                adjustChild_scriptlevel: function (t, e) {
                                    return this.Get('scriptlevel', e);
                                },
                                adjustChild_displaystyle: function (t, e) {
                                    return this.Get('displaystyle', e);
                                },
                                adjustChild_texprimestyle: function (t, e) {
                                    return this.Get('texprimestyle', e);
                                },
                                childPosition: function () {
                                    for (var t = this, e = t.parent; e.notParent; )
                                        e = (t = e).parent;
                                    for (var i = 0, n = e.data.length; i < n; i++)
                                        if (e.data[i] === t) return i;
                                    return null;
                                },
                                setInherit: function (t) {
                                    if (t !== this.inherit && null == this.inherit) {
                                        this.inherit = t;
                                        for (var e = 0, i = this.data.length; e < i; e++)
                                            this.data[e] &&
                                                this.data[e].setInherit &&
                                                this.data[e].setInherit(t);
                                    }
                                },
                                setTeXclass: function (t) {
                                    return (
                                        this.getPrevClass(t), void 0 !== this.texClass ? this : t
                                    );
                                },
                                getPrevClass: function (t) {
                                    t &&
                                        ((this.prevClass = t.Get('texClass')),
                                        (this.prevLevel = t.Get('scriptlevel')));
                                },
                                updateTeXclass: function (t) {
                                    t &&
                                        ((this.prevClass = t.prevClass),
                                        delete t.prevClass,
                                        (this.prevLevel = t.prevLevel),
                                        delete t.prevLevel,
                                        (this.texClass = t.Get('texClass')));
                                },
                                texSpacing: function () {
                                    var e =
                                            null != this.prevClass
                                                ? this.prevClass
                                                : t.TEXCLASS.NONE,
                                        i = this.Get('texClass') || t.TEXCLASS.ORD;
                                    if (e === t.TEXCLASS.NONE || i === t.TEXCLASS.NONE) return '';
                                    e === t.TEXCLASS.VCENTER && (e = t.TEXCLASS.ORD),
                                        i === t.TEXCLASS.VCENTER && (i = t.TEXCLASS.ORD);
                                    var n = this.TEXSPACE[e][i];
                                    return (this.prevLevel > 0 || this.Get('scriptlevel') > 0) &&
                                        n >= 0
                                        ? ''
                                        : this.TEXSPACELENGTH[Math.abs(n)];
                                },
                                TEXSPACELENGTH: [
                                    '',
                                    t.LENGTH.THINMATHSPACE,
                                    t.LENGTH.MEDIUMMATHSPACE,
                                    t.LENGTH.THICKMATHSPACE,
                                ],
                                TEXSPACE: [
                                    [0, -1, 2, 3, 0, 0, 0, 1],
                                    [-1, -1, 0, 3, 0, 0, 0, 1],
                                    [2, 2, 0, 0, 2, 0, 0, 2],
                                    [3, 3, 0, 0, 3, 0, 0, 3],
                                    [0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, -1, 2, 3, 0, 0, 0, 1],
                                    [1, 1, 0, 1, 1, 1, 1, 1],
                                    [1, -1, 2, 3, 1, 0, 1, 1],
                                ],
                                autoDefault: function (t) {
                                    return '';
                                },
                                isSpacelike: function () {
                                    return !1;
                                },
                                isEmbellished: function () {
                                    return !1;
                                },
                                Core: function () {
                                    return this;
                                },
                                CoreMO: function () {
                                    return this;
                                },
                                childIndex: function (t) {
                                    if (null != t)
                                        for (var e = 0, i = this.data.length; e < i; e++)
                                            if (t === this.data[e]) return e;
                                },
                                CoreIndex: function () {
                                    return ((this.inferRow && this.data[0]) || this).childIndex(
                                        this.Core(),
                                    );
                                },
                                hasNewline: function () {
                                    if (this.isEmbellished()) return this.CoreMO().hasNewline();
                                    if (this.isToken || this.linebreakContainer) return !1;
                                    for (var t = 0, e = this.data.length; t < e; t++)
                                        if (this.data[t] && this.data[t].hasNewline()) return !0;
                                    return !1;
                                },
                                array: function () {
                                    return this.inferred ? this.data : [this];
                                },
                                toString: function () {
                                    return this.type + '(' + this.data.join(',') + ')';
                                },
                                getAnnotation: function () {
                                    return null;
                                },
                            },
                            {
                                childrenSpacelike: function () {
                                    for (var t = 0, e = this.data.length; t < e; t++)
                                        if (!this.data[t].isSpacelike()) return !1;
                                    return !0;
                                },
                                childEmbellished: function () {
                                    return this.data[0] && this.data[0].isEmbellished();
                                },
                                childCore: function () {
                                    return this.inferRow && this.data[0]
                                        ? this.data[0].Core()
                                        : this.data[0];
                                },
                                childCoreMO: function () {
                                    return this.data[0] ? this.data[0].CoreMO() : null;
                                },
                                setChildTeXclass: function (t) {
                                    return (
                                        this.data[0] &&
                                            ((t = this.data[0].setTeXclass(t)),
                                            this.updateTeXclass(this.data[0])),
                                        t
                                    );
                                },
                                setBaseTeXclasses: function (e) {
                                    this.getPrevClass(e),
                                        (this.texClass = null),
                                        this.data[0]
                                            ? this.isEmbellished() || this.data[0].isa(t.mi)
                                                ? ((e = this.data[0].setTeXclass(e)),
                                                  this.updateTeXclass(this.Core()))
                                                : (this.data[0].setTeXclass(), (e = this))
                                            : (e = this);
                                    for (var i = 1, n = this.data.length; i < n; i++)
                                        this.data[i] && this.data[i].setTeXclass();
                                    return e;
                                },
                                setSeparateTeXclasses: function (t) {
                                    this.getPrevClass(t);
                                    for (var e = 0, i = this.data.length; e < i; e++)
                                        this.data[e] && this.data[e].setTeXclass();
                                    return (
                                        this.isEmbellished() && this.updateTeXclass(this.Core()),
                                        this
                                    );
                                },
                            },
                        )),
                            (t.mi = t.mbase.Subclass({
                                type: 'mi',
                                isToken: !0,
                                texClass: t.TEXCLASS.ORD,
                                defaults: {
                                    mathvariant: t.AUTO,
                                    mathsize: t.INHERIT,
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    dir: t.INHERIT,
                                },
                                autoDefault: function (e) {
                                    if ('mathvariant' === e) {
                                        var i = (this.data[0] || '').toString();
                                        return 1 === i.length ||
                                            (2 === i.length &&
                                                i.charCodeAt(0) >= 55296 &&
                                                i.charCodeAt(0) < 56320)
                                            ? t.VARIANT.ITALIC
                                            : t.VARIANT.NORMAL;
                                    }
                                    return '';
                                },
                                setTeXclass: function (e) {
                                    this.getPrevClass(e);
                                    var i = this.data.join('');
                                    return (
                                        i.length > 1 &&
                                            i.match(/^[a-z][a-z0-9]*$/i) &&
                                            this.texClass === t.TEXCLASS.ORD &&
                                            ((this.texClass = t.TEXCLASS.OP), (this.autoOP = !0)),
                                        this
                                    );
                                },
                            })),
                            (t.mn = t.mbase.Subclass({
                                type: 'mn',
                                isToken: !0,
                                texClass: t.TEXCLASS.ORD,
                                defaults: {
                                    mathvariant: t.INHERIT,
                                    mathsize: t.INHERIT,
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    dir: t.INHERIT,
                                },
                            })),
                            (t.mo = t.mbase.Subclass({
                                type: 'mo',
                                isToken: !0,
                                defaults: {
                                    mathvariant: t.INHERIT,
                                    mathsize: t.INHERIT,
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    dir: t.INHERIT,
                                    form: t.AUTO,
                                    fence: t.AUTO,
                                    separator: t.AUTO,
                                    lspace: t.AUTO,
                                    rspace: t.AUTO,
                                    stretchy: t.AUTO,
                                    symmetric: t.AUTO,
                                    maxsize: t.AUTO,
                                    minsize: t.AUTO,
                                    largeop: t.AUTO,
                                    movablelimits: t.AUTO,
                                    accent: t.AUTO,
                                    linebreak: t.LINEBREAK.AUTO,
                                    lineleading: t.INHERIT,
                                    linebreakstyle: t.AUTO,
                                    linebreakmultchar: t.INHERIT,
                                    indentalign: t.INHERIT,
                                    indentshift: t.INHERIT,
                                    indenttarget: t.INHERIT,
                                    indentalignfirst: t.INHERIT,
                                    indentshiftfirst: t.INHERIT,
                                    indentalignlast: t.INHERIT,
                                    indentshiftlast: t.INHERIT,
                                    texClass: t.AUTO,
                                },
                                defaultDef: {
                                    form: t.FORM.INFIX,
                                    fence: !1,
                                    separator: !1,
                                    lspace: t.LENGTH.THICKMATHSPACE,
                                    rspace: t.LENGTH.THICKMATHSPACE,
                                    stretchy: !1,
                                    symmetric: !1,
                                    maxsize: t.SIZE.INFINITY,
                                    minsize: '0em',
                                    largeop: !1,
                                    movablelimits: !1,
                                    accent: !1,
                                    linebreak: t.LINEBREAK.AUTO,
                                    lineleading: '1ex',
                                    linebreakstyle: 'before',
                                    indentalign: t.INDENTALIGN.AUTO,
                                    indentshift: '0',
                                    indenttarget: '',
                                    indentalignfirst: t.INDENTALIGN.INDENTALIGN,
                                    indentshiftfirst: t.INDENTSHIFT.INDENTSHIFT,
                                    indentalignlast: t.INDENTALIGN.INDENTALIGN,
                                    indentshiftlast: t.INDENTSHIFT.INDENTSHIFT,
                                    texClass: t.TEXCLASS.REL,
                                },
                                SPACE_ATTR: { lspace: 1, rspace: 2, form: 4 },
                                useMMLspacing: 7,
                                autoDefault: function (e, i) {
                                    var n = this.def;
                                    if (!n) {
                                        if ('form' === e)
                                            return (
                                                (this.useMMLspacing &= ~this.SPACE_ATTR.form),
                                                this.getForm()
                                            );
                                        for (
                                            var a = this.data.join(''),
                                                s = [
                                                    this.Get('form'),
                                                    t.FORM.INFIX,
                                                    t.FORM.POSTFIX,
                                                    t.FORM.PREFIX,
                                                ],
                                                r = 0,
                                                o = s.length;
                                            r < o;
                                            r++
                                        ) {
                                            var l = this.OPTABLE[s[r]][a];
                                            if (l) {
                                                n = this.makeDef(l);
                                                break;
                                            }
                                        }
                                        n || (n = this.CheckRange(a)),
                                            !n && i
                                                ? (n = {})
                                                : (n ||
                                                      (n = MathJax.Hub.Insert({}, this.defaultDef)),
                                                  this.parent
                                                      ? (this.def = n)
                                                      : (n = MathJax.Hub.Insert({}, n)),
                                                  (n.form = s[0]));
                                    }
                                    return (
                                        (this.useMMLspacing &= ~(this.SPACE_ATTR[e] || 0)),
                                        null != n[e] ? n[e] : i ? '' : this.defaultDef[e]
                                    );
                                },
                                CheckRange: function (e) {
                                    var i = e.charCodeAt(0);
                                    i >= 55296 &&
                                        i < 56320 &&
                                        (i =
                                            ((i - 55296) << 10) +
                                            (e.charCodeAt(1) - 56320) +
                                            65536);
                                    for (
                                        var n = 0, a = this.RANGES.length;
                                        n < a && this.RANGES[n][0] <= i;
                                        n++
                                    )
                                        if (i <= this.RANGES[n][1]) {
                                            if (this.RANGES[n][3]) {
                                                var s =
                                                    t.optableDir + '/' + this.RANGES[n][3] + '.js';
                                                (this.RANGES[n][3] = null),
                                                    MathJax.Hub.RestartAfter(
                                                        MathJax.Ajax.Require(s),
                                                    );
                                            }
                                            var r = t.TEXCLASSNAMES[this.RANGES[n][2]];
                                            return (
                                                (r = this.OPTABLE.infix[e] =
                                                    t.mo.OPTYPES['BIN' === r ? 'BIN3' : r]),
                                                this.makeDef(r)
                                            );
                                        }
                                    return null;
                                },
                                makeDef: function (e) {
                                    null == e[2] && (e[2] = this.defaultDef.texClass),
                                        e[3] || (e[3] = {});
                                    var i = MathJax.Hub.Insert({}, e[3]);
                                    return (
                                        (i.lspace = this.SPACE[e[0]]),
                                        (i.rspace = this.SPACE[e[1]]),
                                        (i.texClass = e[2]),
                                        i.texClass === t.TEXCLASS.REL &&
                                            (this.movablelimits ||
                                                this.data.join('').match(/^[a-z]+$/i)) &&
                                            (i.texClass = t.TEXCLASS.OP),
                                        i
                                    );
                                },
                                getForm: function () {
                                    for (
                                        var e = this, i = this.parent, n = this.Parent();
                                        n && n.isEmbellished();

                                    )
                                        (e = i), (i = n.parent), (n = n.Parent());
                                    if (i && 'mrow' === i.type && 1 !== i.NonSpaceLength()) {
                                        if (i.FirstNonSpace() === e) return t.FORM.PREFIX;
                                        if (i.LastNonSpace() === e) return t.FORM.POSTFIX;
                                    }
                                    return t.FORM.INFIX;
                                },
                                isEmbellished: function () {
                                    return !0;
                                },
                                hasNewline: function () {
                                    return this.Get('linebreak') === t.LINEBREAK.NEWLINE;
                                },
                                CoreParent: function () {
                                    for (
                                        var e = this;
                                        e &&
                                        e.isEmbellished() &&
                                        e.CoreMO() === this &&
                                        !e.isa(t.math);

                                    )
                                        e = e.Parent();
                                    return e;
                                },
                                CoreText: function (e) {
                                    if (!e) return '';
                                    if (e.isEmbellished()) return e.CoreMO().data.join('');
                                    for (
                                        ;
                                        (((e.isa(t.mrow) ||
                                            e.isa(t.TeXAtom) ||
                                            e.isa(t.mstyle) ||
                                            e.isa(t.mphantom)) &&
                                            1 === e.data.length) ||
                                            e.isa(t.munderover)) &&
                                        e.data[0];

                                    )
                                        e = e.data[0];
                                    return e.isToken ? e.data.join('') : '';
                                },
                                remapChars: {
                                    '*': '\u2217',
                                    '"': '\u2033',
                                    '\xb0': '\u2218',
                                    '\xb2': '2',
                                    '\xb3': '3',
                                    '\xb4': '\u2032',
                                    '\xb9': '1',
                                },
                                remap: function (t, e) {
                                    return (
                                        (t = t.replace(/-/g, '\u2212')),
                                        e &&
                                            1 ===
                                                (t = t
                                                    .replace(/'/g, '\u2032')
                                                    .replace(/`/g, '\u2035')).length &&
                                            (t = e[t] || t),
                                        t
                                    );
                                },
                                setTeXclass: function (e) {
                                    var i = this.getValues('form', 'lspace', 'rspace', 'fence');
                                    return this.useMMLspacing
                                        ? ((this.texClass = t.TEXCLASS.NONE), this)
                                        : (i.fence &&
                                              !this.texClass &&
                                              (i.form === t.FORM.PREFIX &&
                                                  (this.texClass = t.TEXCLASS.OPEN),
                                              i.form === t.FORM.POSTFIX &&
                                                  (this.texClass = t.TEXCLASS.CLOSE)),
                                          (this.texClass = this.Get('texClass')),
                                          '\u2061' === this.data.join('')
                                              ? (e && ((e.texClass = t.TEXCLASS.OP), (e.fnOP = !0)),
                                                (this.texClass = this.prevClass = t.TEXCLASS.NONE),
                                                e)
                                              : this.adjustTeXclass(e));
                                },
                                adjustTeXclass: function (e) {
                                    if (this.texClass === t.TEXCLASS.NONE) return e;
                                    if (
                                        (e
                                            ? (!e.autoOP ||
                                                  (this.texClass !== t.TEXCLASS.BIN &&
                                                      this.texClass !== t.TEXCLASS.REL) ||
                                                  (e.texClass = t.TEXCLASS.ORD),
                                              (this.prevClass = e.texClass || t.TEXCLASS.ORD),
                                              (this.prevLevel = e.Get('scriptlevel')))
                                            : (this.prevClass = t.TEXCLASS.NONE),
                                        this.texClass !== t.TEXCLASS.BIN ||
                                            (this.prevClass !== t.TEXCLASS.NONE &&
                                                this.prevClass !== t.TEXCLASS.BIN &&
                                                this.prevClass !== t.TEXCLASS.OP &&
                                                this.prevClass !== t.TEXCLASS.REL &&
                                                this.prevClass !== t.TEXCLASS.OPEN &&
                                                this.prevClass !== t.TEXCLASS.PUNCT))
                                    )
                                        if (
                                            this.prevClass !== t.TEXCLASS.BIN ||
                                            (this.texClass !== t.TEXCLASS.REL &&
                                                this.texClass !== t.TEXCLASS.CLOSE &&
                                                this.texClass !== t.TEXCLASS.PUNCT)
                                        ) {
                                            if (this.texClass === t.TEXCLASS.BIN) {
                                                for (
                                                    var i = this, n = this.parent;
                                                    n &&
                                                    n.parent &&
                                                    n.isEmbellished() &&
                                                    (1 === n.data.length ||
                                                        ('mrow' !== n.type && n.Core() === i));

                                                )
                                                    (i = n), (n = n.parent);
                                                n.data[n.data.length - 1] === i &&
                                                    (this.texClass = t.TEXCLASS.ORD);
                                            }
                                        } else e.texClass = this.prevClass = t.TEXCLASS.ORD;
                                    else this.texClass = t.TEXCLASS.ORD;
                                    return this;
                                },
                            })),
                            (t.mtext = t.mbase.Subclass({
                                type: 'mtext',
                                isToken: !0,
                                isSpacelike: function () {
                                    return !0;
                                },
                                texClass: t.TEXCLASS.ORD,
                                defaults: {
                                    mathvariant: t.INHERIT,
                                    mathsize: t.INHERIT,
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    dir: t.INHERIT,
                                },
                            })),
                            (t.mspace = t.mbase.Subclass({
                                type: 'mspace',
                                isToken: !0,
                                isSpacelike: function () {
                                    return !0;
                                },
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    width: '0em',
                                    height: '0ex',
                                    depth: '0ex',
                                    linebreak: t.LINEBREAK.AUTO,
                                },
                                hasDimAttr: function () {
                                    return (
                                        this.hasValue('width') ||
                                        this.hasValue('height') ||
                                        this.hasValue('depth')
                                    );
                                },
                                hasNewline: function () {
                                    return (
                                        !this.hasDimAttr() &&
                                        this.Get('linebreak') === t.LINEBREAK.NEWLINE
                                    );
                                },
                            })),
                            (t.ms = t.mbase.Subclass({
                                type: 'ms',
                                isToken: !0,
                                texClass: t.TEXCLASS.ORD,
                                defaults: {
                                    mathvariant: t.INHERIT,
                                    mathsize: t.INHERIT,
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    dir: t.INHERIT,
                                    lquote: '"',
                                    rquote: '"',
                                },
                            })),
                            (t.mglyph = t.mbase.Subclass({
                                type: 'mglyph',
                                isToken: !0,
                                texClass: t.TEXCLASS.ORD,
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    alt: '',
                                    src: '',
                                    width: t.AUTO,
                                    height: t.AUTO,
                                    valign: '0em',
                                },
                            })),
                            (t.mrow = t.mbase.Subclass({
                                type: 'mrow',
                                isSpacelike: t.mbase.childrenSpacelike,
                                inferred: !1,
                                notParent: !1,
                                isEmbellished: function () {
                                    for (var t = !1, e = 0, i = this.data.length; e < i; e++)
                                        if (null != this.data[e])
                                            if (this.data[e].isEmbellished()) {
                                                if (t) return !1;
                                                (t = !0), (this.core = e);
                                            } else if (!this.data[e].isSpacelike()) return !1;
                                    return t;
                                },
                                NonSpaceLength: function () {
                                    for (var t = 0, e = 0, i = this.data.length; e < i; e++)
                                        this.data[e] && !this.data[e].isSpacelike() && t++;
                                    return t;
                                },
                                FirstNonSpace: function () {
                                    for (var t = 0, e = this.data.length; t < e; t++)
                                        if (this.data[t] && !this.data[t].isSpacelike())
                                            return this.data[t];
                                    return null;
                                },
                                LastNonSpace: function () {
                                    for (var t = this.data.length - 1; t >= 0; t--)
                                        if (this.data[0] && !this.data[t].isSpacelike())
                                            return this.data[t];
                                    return null;
                                },
                                Core: function () {
                                    return this.isEmbellished() && void 0 !== this.core
                                        ? this.data[this.core]
                                        : this;
                                },
                                CoreMO: function () {
                                    return this.isEmbellished() && void 0 !== this.core
                                        ? this.data[this.core].CoreMO()
                                        : this;
                                },
                                toString: function () {
                                    return this.inferred
                                        ? '[' + this.data.join(',') + ']'
                                        : this.SUPER(arguments).toString.call(this);
                                },
                                setTeXclass: function (e) {
                                    var i,
                                        n = this.data.length;
                                    if ((!this.open && !this.close) || (e && e.fnOP)) {
                                        for (i = 0; i < n; i++)
                                            this.data[i] && (e = this.data[i].setTeXclass(e));
                                        return this.data[0] && this.updateTeXclass(this.data[0]), e;
                                    }
                                    for (this.getPrevClass(e), e = null, i = 0; i < n; i++)
                                        this.data[i] && (e = this.data[i].setTeXclass(e));
                                    return (
                                        this.hasOwnProperty('texClass') ||
                                            (this.texClass = t.TEXCLASS.INNER),
                                        this
                                    );
                                },
                                getAnnotation: function (t) {
                                    return 1 != this.data.length
                                        ? null
                                        : this.data[0].getAnnotation(t);
                                },
                            })),
                            (t.mfrac = t.mbase.Subclass({
                                type: 'mfrac',
                                num: 0,
                                den: 1,
                                linebreakContainer: !0,
                                isEmbellished: t.mbase.childEmbellished,
                                Core: t.mbase.childCore,
                                CoreMO: t.mbase.childCoreMO,
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    linethickness: t.LINETHICKNESS.MEDIUM,
                                    numalign: t.ALIGN.CENTER,
                                    denomalign: t.ALIGN.CENTER,
                                    bevelled: !1,
                                },
                                adjustChild_displaystyle: function (t) {
                                    return !1;
                                },
                                adjustChild_scriptlevel: function (t) {
                                    var e = this.Get('scriptlevel');
                                    return (!this.Get('displaystyle') || e > 0) && e++, e;
                                },
                                adjustChild_texprimestyle: function (t) {
                                    return t == this.den || this.Get('texprimestyle');
                                },
                                setTeXclass: t.mbase.setSeparateTeXclasses,
                            })),
                            (t.msqrt = t.mbase.Subclass({
                                type: 'msqrt',
                                inferRow: !0,
                                linebreakContainer: !0,
                                texClass: t.TEXCLASS.ORD,
                                setTeXclass: t.mbase.setSeparateTeXclasses,
                                adjustChild_texprimestyle: function (t) {
                                    return !0;
                                },
                            })),
                            (t.mroot = t.mbase.Subclass({
                                type: 'mroot',
                                linebreakContainer: !0,
                                texClass: t.TEXCLASS.ORD,
                                adjustChild_displaystyle: function (t) {
                                    return 1 !== t && this.Get('displaystyle');
                                },
                                adjustChild_scriptlevel: function (t) {
                                    var e = this.Get('scriptlevel');
                                    return 1 === t && (e += 2), e;
                                },
                                adjustChild_texprimestyle: function (t) {
                                    return 0 === t || this.Get('texprimestyle');
                                },
                                setTeXclass: t.mbase.setSeparateTeXclasses,
                            })),
                            (t.mstyle = t.mbase.Subclass({
                                type: 'mstyle',
                                isSpacelike: t.mbase.childrenSpacelike,
                                isEmbellished: t.mbase.childEmbellished,
                                Core: t.mbase.childCore,
                                CoreMO: t.mbase.childCoreMO,
                                inferRow: !0,
                                defaults: {
                                    scriptlevel: t.INHERIT,
                                    displaystyle: t.INHERIT,
                                    scriptsizemultiplier: Math.sqrt(0.5),
                                    scriptminsize: '8pt',
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    dir: t.INHERIT,
                                    infixlinebreakstyle: t.LINEBREAKSTYLE.BEFORE,
                                    decimalseparator: '.',
                                },
                                adjustChild_scriptlevel: function (t) {
                                    var e = this.scriptlevel;
                                    if (null == e) e = this.Get('scriptlevel');
                                    else if (String(e).match(/^ *[-+]/)) {
                                        e = this.Get('scriptlevel', null, !0) + parseInt(e);
                                    }
                                    return e;
                                },
                                inheritFromMe: !0,
                                noInherit: {
                                    mpadded: {
                                        width: !0,
                                        height: !0,
                                        depth: !0,
                                        lspace: !0,
                                        voffset: !0,
                                    },
                                    mtable: { width: !0, height: !0, depth: !0, align: !0 },
                                },
                                getRemoved: {
                                    fontfamily: 'fontFamily',
                                    fontweight: 'fontWeight',
                                    fontstyle: 'fontStyle',
                                    fontsize: 'fontSize',
                                },
                                setTeXclass: t.mbase.setChildTeXclass,
                            })),
                            (t.merror = t.mbase.Subclass({
                                type: 'merror',
                                inferRow: !0,
                                linebreakContainer: !0,
                                texClass: t.TEXCLASS.ORD,
                            })),
                            (t.mpadded = t.mbase.Subclass({
                                type: 'mpadded',
                                inferRow: !0,
                                isSpacelike: t.mbase.childrenSpacelike,
                                isEmbellished: t.mbase.childEmbellished,
                                Core: t.mbase.childCore,
                                CoreMO: t.mbase.childCoreMO,
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    width: '',
                                    height: '',
                                    depth: '',
                                    lspace: 0,
                                    voffset: 0,
                                },
                                setTeXclass: t.mbase.setChildTeXclass,
                            })),
                            (t.mphantom = t.mbase.Subclass({
                                type: 'mphantom',
                                texClass: t.TEXCLASS.ORD,
                                inferRow: !0,
                                isSpacelike: t.mbase.childrenSpacelike,
                                isEmbellished: t.mbase.childEmbellished,
                                Core: t.mbase.childCore,
                                CoreMO: t.mbase.childCoreMO,
                                setTeXclass: t.mbase.setChildTeXclass,
                            })),
                            (t.mfenced = t.mbase.Subclass({
                                type: 'mfenced',
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    open: '(',
                                    close: ')',
                                    separators: ',',
                                },
                                addFakeNodes: function () {
                                    var e = this.getValues('open', 'close', 'separators');
                                    if (
                                        ((e.open = e.open.replace(/[ \t\n\r]/g, '')),
                                        (e.close = e.close.replace(/[ \t\n\r]/g, '')),
                                        (e.separators = e.separators.replace(/[ \t\n\r]/g, '')),
                                        '' !== e.open &&
                                            (this.SetData(
                                                'open',
                                                t.mo(e.open).With({
                                                    fence: !0,
                                                    form: t.FORM.PREFIX,
                                                    texClass: t.TEXCLASS.OPEN,
                                                }),
                                            ),
                                            (this.data.open.useMMLspacing = 0)),
                                        '' !== e.separators)
                                    ) {
                                        for (; e.separators.length < this.data.length; )
                                            e.separators += e.separators.charAt(
                                                e.separators.length - 1,
                                            );
                                        for (var i = 1, n = this.data.length; i < n; i++)
                                            this.data[i] &&
                                                (this.SetData(
                                                    'sep' + i,
                                                    t
                                                        .mo(e.separators.charAt(i - 1))
                                                        .With({ separator: !0 }),
                                                ),
                                                (this.data['sep' + i].useMMLspacing = 0));
                                    }
                                    '' !== e.close &&
                                        (this.SetData(
                                            'close',
                                            t.mo(e.close).With({
                                                fence: !0,
                                                form: t.FORM.POSTFIX,
                                                texClass: t.TEXCLASS.CLOSE,
                                            }),
                                        ),
                                        (this.data.close.useMMLspacing = 0));
                                },
                                texClass: t.TEXCLASS.OPEN,
                                setTeXclass: function (e) {
                                    this.addFakeNodes(),
                                        this.getPrevClass(e),
                                        this.data.open && (e = this.data.open.setTeXclass(e)),
                                        this.data[0] && (e = this.data[0].setTeXclass(e));
                                    for (var i = 1, n = this.data.length; i < n; i++)
                                        this.data['sep' + i] &&
                                            (e = this.data['sep' + i].setTeXclass(e)),
                                            this.data[i] && (e = this.data[i].setTeXclass(e));
                                    return (
                                        this.data.close && (e = this.data.close.setTeXclass(e)),
                                        this.updateTeXclass(this.data.open),
                                        (this.texClass = t.TEXCLASS.INNER),
                                        e
                                    );
                                },
                            })),
                            (t.menclose = t.mbase.Subclass({
                                type: 'menclose',
                                inferRow: !0,
                                linebreakContainer: !0,
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    notation: t.NOTATION.LONGDIV,
                                    texClass: t.TEXCLASS.ORD,
                                },
                                setTeXclass: t.mbase.setSeparateTeXclasses,
                            })),
                            (t.msubsup = t.mbase.Subclass({
                                type: 'msubsup',
                                base: 0,
                                sub: 1,
                                sup: 2,
                                isEmbellished: t.mbase.childEmbellished,
                                Core: t.mbase.childCore,
                                CoreMO: t.mbase.childCoreMO,
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    subscriptshift: '',
                                    superscriptshift: '',
                                    texClass: t.AUTO,
                                },
                                autoDefault: function (e) {
                                    return 'texClass' === e
                                        ? this.isEmbellished()
                                            ? this.CoreMO().Get(e)
                                            : t.TEXCLASS.ORD
                                        : 0;
                                },
                                adjustChild_displaystyle: function (t) {
                                    return !(t > 0) && this.Get('displaystyle');
                                },
                                adjustChild_scriptlevel: function (t) {
                                    var e = this.Get('scriptlevel');
                                    return t > 0 && e++, e;
                                },
                                adjustChild_texprimestyle: function (t) {
                                    return t === this.sub || this.Get('texprimestyle');
                                },
                                setTeXclass: t.mbase.setBaseTeXclasses,
                            })),
                            (t.msub = t.msubsup.Subclass({ type: 'msub' })),
                            (t.msup = t.msubsup.Subclass({ type: 'msup', sub: 2, sup: 1 })),
                            (t.mmultiscripts = t.msubsup.Subclass({
                                type: 'mmultiscripts',
                                adjustChild_texprimestyle: function (t) {
                                    return t % 2 == 1 || this.Get('texprimestyle');
                                },
                            })),
                            (t.mprescripts = t.mbase.Subclass({ type: 'mprescripts' })),
                            (t.none = t.mbase.Subclass({ type: 'none' })),
                            (t.munderover = t.mbase.Subclass({
                                type: 'munderover',
                                base: 0,
                                under: 1,
                                over: 2,
                                sub: 1,
                                sup: 2,
                                ACCENTS: ['', 'accentunder', 'accent'],
                                linebreakContainer: !0,
                                isEmbellished: t.mbase.childEmbellished,
                                Core: t.mbase.childCore,
                                CoreMO: t.mbase.childCoreMO,
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    accent: t.AUTO,
                                    accentunder: t.AUTO,
                                    align: t.ALIGN.CENTER,
                                    texClass: t.AUTO,
                                    subscriptshift: '',
                                    superscriptshift: '',
                                },
                                autoDefault: function (e) {
                                    return 'texClass' === e
                                        ? this.isEmbellished()
                                            ? this.CoreMO().Get(e)
                                            : t.TEXCLASS.ORD
                                        : 'accent' === e && this.data[this.over]
                                          ? this.data[this.over].CoreMO().Get('accent')
                                          : !('accentunder' !== e || !this.data[this.under]) &&
                                            this.data[this.under].CoreMO().Get('accent');
                                },
                                adjustChild_displaystyle: function (t) {
                                    return !(t > 0) && this.Get('displaystyle');
                                },
                                adjustChild_scriptlevel: function (t) {
                                    var e = this.Get('scriptlevel'),
                                        i =
                                            this.data[this.base] &&
                                            !this.Get('displaystyle') &&
                                            this.data[this.base].CoreMO().Get('movablelimits');
                                    return (
                                        t != this.under || (!i && this.Get('accentunder')) || e++,
                                        t != this.over || (!i && this.Get('accent')) || e++,
                                        e
                                    );
                                },
                                adjustChild_texprimestyle: function (t) {
                                    return (
                                        !(t !== this.base || !this.data[this.over]) ||
                                        this.Get('texprimestyle')
                                    );
                                },
                                setTeXclass: t.mbase.setBaseTeXclasses,
                            })),
                            (t.munder = t.munderover.Subclass({ type: 'munder' })),
                            (t.mover = t.munderover.Subclass({
                                type: 'mover',
                                over: 1,
                                under: 2,
                                sup: 1,
                                sub: 2,
                                ACCENTS: ['', 'accent', 'accentunder'],
                            })),
                            (t.mtable = t.mbase.Subclass({
                                type: 'mtable',
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    align: t.ALIGN.AXIS,
                                    rowalign: t.ALIGN.BASELINE,
                                    columnalign: t.ALIGN.CENTER,
                                    groupalign: '{left}',
                                    alignmentscope: !0,
                                    columnwidth: t.WIDTH.AUTO,
                                    width: t.WIDTH.AUTO,
                                    rowspacing: '1ex',
                                    columnspacing: '.8em',
                                    rowlines: t.LINES.NONE,
                                    columnlines: t.LINES.NONE,
                                    frame: t.LINES.NONE,
                                    framespacing: '0.4em 0.5ex',
                                    equalrows: !1,
                                    equalcolumns: !1,
                                    displaystyle: !1,
                                    side: t.SIDE.RIGHT,
                                    minlabelspacing: '0.8em',
                                    texClass: t.TEXCLASS.ORD,
                                    useHeight: 1,
                                },
                                adjustChild_displaystyle: function () {
                                    return null != this.displaystyle
                                        ? this.displaystyle
                                        : this.defaults.displaystyle;
                                },
                                inheritFromMe: !0,
                                noInherit: {
                                    mover: { align: !0 },
                                    munder: { align: !0 },
                                    munderover: { align: !0 },
                                    mtable: {
                                        align: !0,
                                        rowalign: !0,
                                        columnalign: !0,
                                        groupalign: !0,
                                        alignmentscope: !0,
                                        columnwidth: !0,
                                        width: !0,
                                        rowspacing: !0,
                                        columnspacing: !0,
                                        rowlines: !0,
                                        columnlines: !0,
                                        frame: !0,
                                        framespacing: !0,
                                        equalrows: !0,
                                        equalcolumns: !0,
                                        displaystyle: !0,
                                        side: !0,
                                        minlabelspacing: !0,
                                        texClass: !0,
                                        useHeight: 1,
                                    },
                                },
                                linebreakContainer: !0,
                                Append: function () {
                                    for (var e = 0, i = arguments.length; e < i; e++)
                                        arguments[e] instanceof t.mtr ||
                                            arguments[e] instanceof t.mlabeledtr ||
                                            (arguments[e] = t.mtr(arguments[e]));
                                    this.SUPER(arguments).Append.apply(this, arguments);
                                },
                                setTeXclass: t.mbase.setSeparateTeXclasses,
                            })),
                            (t.mtr = t.mbase.Subclass({
                                type: 'mtr',
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    rowalign: t.INHERIT,
                                    columnalign: t.INHERIT,
                                    groupalign: t.INHERIT,
                                },
                                inheritFromMe: !0,
                                noInherit: {
                                    mrow: { rowalign: !0, columnalign: !0, groupalign: !0 },
                                    mtable: { rowalign: !0, columnalign: !0, groupalign: !0 },
                                },
                                linebreakContainer: !0,
                                Append: function () {
                                    for (var e = 0, i = arguments.length; e < i; e++)
                                        arguments[e] instanceof t.mtd ||
                                            (arguments[e] = t.mtd(arguments[e]));
                                    this.SUPER(arguments).Append.apply(this, arguments);
                                },
                                setTeXclass: t.mbase.setSeparateTeXclasses,
                            })),
                            (t.mtd = t.mbase.Subclass({
                                type: 'mtd',
                                inferRow: !0,
                                linebreakContainer: !0,
                                isEmbellished: t.mbase.childEmbellished,
                                Core: t.mbase.childCore,
                                CoreMO: t.mbase.childCoreMO,
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    rowspan: 1,
                                    columnspan: 1,
                                    rowalign: t.INHERIT,
                                    columnalign: t.INHERIT,
                                    groupalign: t.INHERIT,
                                },
                                setTeXclass: t.mbase.setSeparateTeXclasses,
                            })),
                            (t.maligngroup = t.mbase.Subclass({
                                type: 'maligngroup',
                                isSpacelike: function () {
                                    return !0;
                                },
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    groupalign: t.INHERIT,
                                },
                                inheritFromMe: !0,
                                noInherit: { mrow: { groupalign: !0 }, mtable: { groupalign: !0 } },
                            })),
                            (t.malignmark = t.mbase.Subclass({
                                type: 'malignmark',
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    edge: t.SIDE.LEFT,
                                },
                                isSpacelike: function () {
                                    return !0;
                                },
                            })),
                            (t.mlabeledtr = t.mtr.Subclass({ type: 'mlabeledtr' })),
                            (t.maction = t.mbase.Subclass({
                                type: 'maction',
                                defaults: {
                                    mathbackground: t.INHERIT,
                                    mathcolor: t.INHERIT,
                                    actiontype: t.ACTIONTYPE.TOGGLE,
                                    selection: 1,
                                },
                                selected: function () {
                                    return this.data[this.Get('selection') - 1] || t.NULL;
                                },
                                isEmbellished: function () {
                                    return this.selected().isEmbellished();
                                },
                                isSpacelike: function () {
                                    return this.selected().isSpacelike();
                                },
                                Core: function () {
                                    return this.selected().Core();
                                },
                                CoreMO: function () {
                                    return this.selected().CoreMO();
                                },
                                setTeXclass: function (e) {
                                    this.Get('actiontype') === t.ACTIONTYPE.TOOLTIP &&
                                        this.data[1] &&
                                        this.data[1].setTeXclass();
                                    var i = this.selected();
                                    return (e = i.setTeXclass(e)), this.updateTeXclass(i), e;
                                },
                            })),
                            (t.semantics = t.mbase.Subclass({
                                type: 'semantics',
                                notParent: !0,
                                isEmbellished: t.mbase.childEmbellished,
                                Core: t.mbase.childCore,
                                CoreMO: t.mbase.childCoreMO,
                                defaults: { definitionURL: null, encoding: null },
                                setTeXclass: t.mbase.setChildTeXclass,
                                getAnnotation: function (t) {
                                    var e = MathJax.Hub.config.MathMenu.semanticsAnnotations[t];
                                    if (e)
                                        for (var i = 0, n = this.data.length; i < n; i++) {
                                            var a = this.data[i].Get('encoding');
                                            if (a)
                                                for (var s = 0, r = e.length; s < r; s++)
                                                    if (e[s] === a) return this.data[i];
                                        }
                                    return null;
                                },
                            })),
                            (t.annotation = t.mbase.Subclass({
                                type: 'annotation',
                                isChars: !0,
                                linebreakContainer: !0,
                                defaults: {
                                    definitionURL: null,
                                    encoding: null,
                                    cd: 'mathmlkeys',
                                    name: '',
                                    src: null,
                                },
                            })),
                            (t['annotation-xml'] = t.mbase.Subclass({
                                type: 'annotation-xml',
                                linebreakContainer: !0,
                                defaults: {
                                    definitionURL: null,
                                    encoding: null,
                                    cd: 'mathmlkeys',
                                    name: '',
                                    src: null,
                                },
                            })),
                            (t.math = t.mstyle.Subclass({
                                type: 'math',
                                defaults: {
                                    mathvariant: t.VARIANT.NORMAL,
                                    mathsize: t.SIZE.NORMAL,
                                    mathcolor: '',
                                    mathbackground: t.COLOR.TRANSPARENT,
                                    dir: 'ltr',
                                    scriptlevel: 0,
                                    displaystyle: t.AUTO,
                                    display: 'inline',
                                    maxwidth: '',
                                    overflow: t.OVERFLOW.LINEBREAK,
                                    altimg: '',
                                    'altimg-width': '',
                                    'altimg-height': '',
                                    'altimg-valign': '',
                                    alttext: '',
                                    cdgroup: '',
                                    scriptsizemultiplier: Math.sqrt(0.5),
                                    scriptminsize: '8px',
                                    infixlinebreakstyle: t.LINEBREAKSTYLE.BEFORE,
                                    lineleading: '1ex',
                                    indentshift: 'auto',
                                    indentalign: t.INDENTALIGN.AUTO,
                                    indentalignfirst: t.INDENTALIGN.INDENTALIGN,
                                    indentshiftfirst: t.INDENTSHIFT.INDENTSHIFT,
                                    indentalignlast: t.INDENTALIGN.INDENTALIGN,
                                    indentshiftlast: t.INDENTSHIFT.INDENTSHIFT,
                                    decimalseparator: '.',
                                    texprimestyle: !1,
                                },
                                autoDefault: function (t) {
                                    return 'displaystyle' === t
                                        ? 'block' === this.Get('display')
                                        : '';
                                },
                                linebreakContainer: !0,
                                setTeXclass: t.mbase.setChildTeXclass,
                                getAnnotation: function (t) {
                                    return 1 != this.data.length
                                        ? null
                                        : this.data[0].getAnnotation(t);
                                },
                            })),
                            (t.chars = t.mbase.Subclass({
                                type: 'chars',
                                Append: function () {
                                    this.data.push.apply(this.data, arguments);
                                },
                                value: function () {
                                    return this.data.join('');
                                },
                                toString: function () {
                                    return this.data.join('');
                                },
                            })),
                            (t.entity = t.mbase.Subclass({
                                type: 'entity',
                                Append: function () {
                                    this.data.push.apply(this.data, arguments);
                                },
                                value: function () {
                                    return '#x' === this.data[0].substr(0, 2)
                                        ? parseInt(this.data[0].substr(2), 16)
                                        : '#' === this.data[0].substr(0, 1)
                                          ? parseInt(this.data[0].substr(1))
                                          : 0;
                                },
                                toString: function () {
                                    var t = this.value();
                                    return t <= 65535
                                        ? String.fromCharCode(t)
                                        : ((t -= 65536),
                                          String.fromCharCode(
                                              55296 + (t >> 10),
                                              56320 + (1023 & t),
                                          ));
                                },
                            })),
                            (t.xml = t.mbase.Subclass({
                                type: 'xml',
                                Init: function () {
                                    return (
                                        (this.div = document.createElement('div')),
                                        this.SUPER(arguments).Init.apply(this, arguments)
                                    );
                                },
                                Append: function () {
                                    for (var t = 0, e = arguments.length; t < e; t++) {
                                        var i = this.Import(arguments[t]);
                                        this.data.push(i), this.div.appendChild(i);
                                    }
                                },
                                Import: function (t) {
                                    if (document.importNode) return document.importNode(t, !0);
                                    var e, i, n;
                                    if (1 === t.nodeType) {
                                        for (
                                            e = document.createElement(t.nodeName),
                                                i = 0,
                                                n = t.attributes.length;
                                            i < n;
                                            i++
                                        ) {
                                            var a = t.attributes[i];
                                            a.specified &&
                                                null != a.nodeValue &&
                                                '' != a.nodeValue &&
                                                e.setAttribute(a.nodeName, a.nodeValue),
                                                'style' === a.nodeName &&
                                                    (e.style.cssText = a.nodeValue);
                                        }
                                        t.className && (e.className = t.className);
                                    } else if (3 === t.nodeType || 4 === t.nodeType)
                                        e = document.createTextNode(t.nodeValue);
                                    else {
                                        if (8 !== t.nodeType) return document.createTextNode('');
                                        e = document.createComment(t.nodeValue);
                                    }
                                    for (i = 0, n = t.childNodes.length; i < n; i++)
                                        e.appendChild(this.Import(t.childNodes[i]));
                                    return e;
                                },
                                value: function () {
                                    return this.div;
                                },
                                toString: function () {
                                    return this.div.innerHTML;
                                },
                            })),
                            (t.TeXAtom = t.mbase.Subclass({
                                type: 'texatom',
                                linebreakContainer: !0,
                                inferRow: !0,
                                notParent: !0,
                                texClass: t.TEXCLASS.ORD,
                                Core: t.mbase.childCore,
                                CoreMO: t.mbase.childCoreMO,
                                isEmbellished: t.mbase.childEmbellished,
                                setTeXclass: function (t) {
                                    return this.data[0].setTeXclass(), this.adjustTeXclass(t);
                                },
                                adjustTeXclass: t.mo.prototype.adjustTeXclass,
                            })),
                            (t.NULL = t.mbase().With({ type: 'null' }));
                        var e = t.TEXCLASS,
                            i = {
                                ORD: [0, 0, e.ORD],
                                ORD11: [1, 1, e.ORD],
                                ORD21: [2, 1, e.ORD],
                                ORD02: [0, 2, e.ORD],
                                ORD55: [5, 5, e.ORD],
                                OP: [1, 2, e.OP, { largeop: !0, movablelimits: !0, symmetric: !0 }],
                                OPFIXED: [1, 2, e.OP, { largeop: !0, movablelimits: !0 }],
                                INTEGRAL: [0, 1, e.OP, { largeop: !0, symmetric: !0 }],
                                INTEGRAL2: [1, 2, e.OP, { largeop: !0, symmetric: !0 }],
                                BIN3: [3, 3, e.BIN],
                                BIN4: [4, 4, e.BIN],
                                BIN01: [0, 1, e.BIN],
                                BIN5: [5, 5, e.BIN],
                                TALLBIN: [4, 4, e.BIN, { stretchy: !0 }],
                                BINOP: [4, 4, e.BIN, { largeop: !0, movablelimits: !0 }],
                                REL: [5, 5, e.REL],
                                REL1: [1, 1, e.REL, { stretchy: !0 }],
                                REL4: [4, 4, e.REL],
                                RELSTRETCH: [5, 5, e.REL, { stretchy: !0 }],
                                RELACCENT: [5, 5, e.REL, { accent: !0 }],
                                WIDEREL: [5, 5, e.REL, { accent: !0, stretchy: !0 }],
                                OPEN: [0, 0, e.OPEN, { fence: !0, stretchy: !0, symmetric: !0 }],
                                CLOSE: [0, 0, e.CLOSE, { fence: !0, stretchy: !0, symmetric: !0 }],
                                INNER: [0, 0, e.INNER],
                                PUNCT: [0, 3, e.PUNCT],
                                ACCENT: [0, 0, e.ORD, { accent: !0 }],
                                WIDEACCENT: [0, 0, e.ORD, { accent: !0, stretchy: !0 }],
                            };
                        t.mo.Augment(
                            {
                                SPACE: [
                                    '0em',
                                    '0.1111em',
                                    '0.1667em',
                                    '0.2222em',
                                    '0.2667em',
                                    '0.3333em',
                                ],
                                RANGES: [
                                    [32, 127, e.REL, 'BasicLatin'],
                                    [160, 255, e.ORD, 'Latin1Supplement'],
                                    [256, 383, e.ORD],
                                    [384, 591, e.ORD],
                                    [688, 767, e.ORD, 'SpacingModLetters'],
                                    [768, 879, e.ORD, 'CombDiacritMarks'],
                                    [880, 1023, e.ORD, 'GreekAndCoptic'],
                                    [7680, 7935, e.ORD],
                                    [8192, 8303, e.PUNCT, 'GeneralPunctuation'],
                                    [8304, 8351, e.ORD],
                                    [8352, 8399, e.ORD],
                                    [8400, 8447, e.ORD, 'CombDiactForSymbols'],
                                    [8448, 8527, e.ORD, 'LetterlikeSymbols'],
                                    [8528, 8591, e.ORD],
                                    [8592, 8703, e.REL, 'Arrows'],
                                    [8704, 8959, e.BIN, 'MathOperators'],
                                    [8960, 9215, e.ORD, 'MiscTechnical'],
                                    [9312, 9471, e.ORD],
                                    [9472, 9631, e.ORD],
                                    [9632, 9727, e.ORD, 'GeometricShapes'],
                                    [9984, 10175, e.ORD, 'Dingbats'],
                                    [10176, 10223, e.ORD, 'MiscMathSymbolsA'],
                                    [10224, 10239, e.REL, 'SupplementalArrowsA'],
                                    [10496, 10623, e.REL, 'SupplementalArrowsB'],
                                    [10624, 10751, e.ORD, 'MiscMathSymbolsB'],
                                    [10752, 11007, e.BIN, 'SuppMathOperators'],
                                    [11008, 11263, e.ORD, 'MiscSymbolsAndArrows'],
                                    [119808, 120831, e.ORD],
                                ],
                                OPTABLE: {
                                    prefix: {
                                        '\u2200': i.ORD21,
                                        '\u2202': i.ORD21,
                                        '\u2203': i.ORD21,
                                        '\u2207': i.ORD21,
                                        '\u220f': i.OP,
                                        '\u2210': i.OP,
                                        '\u2211': i.OP,
                                        '\u2212': i.BIN01,
                                        '\u2213': i.BIN01,
                                        '\u221a': [1, 1, e.ORD, { stretchy: !0 }],
                                        '\u2220': i.ORD,
                                        '\u222b': i.INTEGRAL,
                                        '\u222e': i.INTEGRAL,
                                        '\u22c0': i.OP,
                                        '\u22c1': i.OP,
                                        '\u22c2': i.OP,
                                        '\u22c3': i.OP,
                                        '\u2308': i.OPEN,
                                        '\u230a': i.OPEN,
                                        '\u27e8': i.OPEN,
                                        '\u27ee': i.OPEN,
                                        '\u2a00': i.OP,
                                        '\u2a01': i.OP,
                                        '\u2a02': i.OP,
                                        '\u2a04': i.OP,
                                        '\u2a06': i.OP,
                                        '\xac': i.ORD21,
                                        '\xb1': i.BIN01,
                                        '(': i.OPEN,
                                        '+': i.BIN01,
                                        '-': i.BIN01,
                                        '[': i.OPEN,
                                        '{': i.OPEN,
                                        '|': i.OPEN,
                                    },
                                    postfix: {
                                        '!': [1, 0, e.CLOSE],
                                        '&': i.ORD,
                                        '\u2032': i.ORD02,
                                        '\u203e': i.WIDEACCENT,
                                        '\u2309': i.CLOSE,
                                        '\u230b': i.CLOSE,
                                        '\u23de': i.WIDEACCENT,
                                        '\u23df': i.WIDEACCENT,
                                        '\u266d': i.ORD02,
                                        '\u266e': i.ORD02,
                                        '\u266f': i.ORD02,
                                        '\u27e9': i.CLOSE,
                                        '\u27ef': i.CLOSE,
                                        '\u02c6': i.WIDEACCENT,
                                        '\u02c7': i.WIDEACCENT,
                                        '\u02c9': i.WIDEACCENT,
                                        '\u02ca': i.ACCENT,
                                        '\u02cb': i.ACCENT,
                                        '\u02d8': i.ACCENT,
                                        '\u02d9': i.ACCENT,
                                        '\u02dc': i.WIDEACCENT,
                                        '\u0302': i.WIDEACCENT,
                                        '\xa8': i.ACCENT,
                                        '\xaf': i.WIDEACCENT,
                                        ')': i.CLOSE,
                                        ']': i.CLOSE,
                                        '^': i.WIDEACCENT,
                                        _: i.WIDEACCENT,
                                        '`': i.ACCENT,
                                        '|': i.CLOSE,
                                        '}': i.CLOSE,
                                        '~': i.WIDEACCENT,
                                    },
                                    infix: {
                                        '': i.ORD,
                                        '%': [3, 3, e.ORD],
                                        '\u2022': i.BIN4,
                                        '\u2026': i.INNER,
                                        '\u2044': i.TALLBIN,
                                        '\u2061': i.ORD,
                                        '\u2062': i.ORD,
                                        '\u2063': [
                                            0,
                                            0,
                                            e.ORD,
                                            { linebreakstyle: 'after', separator: !0 },
                                        ],
                                        '\u2064': i.ORD,
                                        '\u2190': i.WIDEREL,
                                        '\u2191': i.RELSTRETCH,
                                        '\u2192': i.WIDEREL,
                                        '\u2193': i.RELSTRETCH,
                                        '\u2194': i.WIDEREL,
                                        '\u2195': i.RELSTRETCH,
                                        '\u2196': i.RELSTRETCH,
                                        '\u2197': i.RELSTRETCH,
                                        '\u2198': i.RELSTRETCH,
                                        '\u2199': i.RELSTRETCH,
                                        '\u21a6': i.WIDEREL,
                                        '\u21a9': i.WIDEREL,
                                        '\u21aa': i.WIDEREL,
                                        '\u21bc': i.WIDEREL,
                                        '\u21bd': i.WIDEREL,
                                        '\u21c0': i.WIDEREL,
                                        '\u21c1': i.WIDEREL,
                                        '\u21cc': i.WIDEREL,
                                        '\u21d0': i.WIDEREL,
                                        '\u21d1': i.RELSTRETCH,
                                        '\u21d2': i.WIDEREL,
                                        '\u21d3': i.RELSTRETCH,
                                        '\u21d4': i.WIDEREL,
                                        '\u21d5': i.RELSTRETCH,
                                        '\u2208': i.REL,
                                        '\u2209': i.REL,
                                        '\u220b': i.REL,
                                        '\u2212': i.BIN4,
                                        '\u2213': i.BIN4,
                                        '\u2215': i.TALLBIN,
                                        '\u2216': i.BIN4,
                                        '\u2217': i.BIN4,
                                        '\u2218': i.BIN4,
                                        '\u2219': i.BIN4,
                                        '\u221d': i.REL,
                                        '\u2223': i.REL,
                                        '\u2225': i.REL,
                                        '\u2227': i.BIN4,
                                        '\u2228': i.BIN4,
                                        '\u2229': i.BIN4,
                                        '\u222a': i.BIN4,
                                        '\u223c': i.REL,
                                        '\u2240': i.BIN4,
                                        '\u2243': i.REL,
                                        '\u2245': i.REL,
                                        '\u2248': i.REL,
                                        '\u224d': i.REL,
                                        '\u2250': i.REL,
                                        '\u2260': i.REL,
                                        '\u2261': i.REL,
                                        '\u2264': i.REL,
                                        '\u2265': i.REL,
                                        '\u226a': i.REL,
                                        '\u226b': i.REL,
                                        '\u227a': i.REL,
                                        '\u227b': i.REL,
                                        '\u2282': i.REL,
                                        '\u2283': i.REL,
                                        '\u2286': i.REL,
                                        '\u2287': i.REL,
                                        '\u228e': i.BIN4,
                                        '\u2291': i.REL,
                                        '\u2292': i.REL,
                                        '\u2293': i.BIN4,
                                        '\u2294': i.BIN4,
                                        '\u2295': i.BIN4,
                                        '\u2296': i.BIN4,
                                        '\u2297': i.BIN4,
                                        '\u2298': i.BIN4,
                                        '\u2299': i.BIN4,
                                        '\u22a2': i.REL,
                                        '\u22a3': i.REL,
                                        '\u22a4': i.ORD55,
                                        '\u22a5': i.REL,
                                        '\u22a8': i.REL,
                                        '\u22c4': i.BIN4,
                                        '\u22c5': i.BIN4,
                                        '\u22c6': i.BIN4,
                                        '\u22c8': i.REL,
                                        '\u22ee': i.ORD55,
                                        '\u22ef': i.INNER,
                                        '\u22f1': [5, 5, e.INNER],
                                        '\u25b3': i.BIN4,
                                        '\u25b5': i.BIN4,
                                        '\u25b9': i.BIN4,
                                        '\u25bd': i.BIN4,
                                        '\u25bf': i.BIN4,
                                        '\u25c3': i.BIN4,
                                        '\u2758': i.REL,
                                        '\u27f5': i.WIDEREL,
                                        '\u27f6': i.WIDEREL,
                                        '\u27f7': i.WIDEREL,
                                        '\u27f8': i.WIDEREL,
                                        '\u27f9': i.WIDEREL,
                                        '\u27fa': i.WIDEREL,
                                        '\u27fc': i.WIDEREL,
                                        '\u2a2f': i.BIN4,
                                        '\u2a3f': i.BIN4,
                                        '\u2aaf': i.REL,
                                        '\u2ab0': i.REL,
                                        '\xb1': i.BIN4,
                                        '\xb7': i.BIN4,
                                        '\xd7': i.BIN4,
                                        '\xf7': i.BIN4,
                                        '*': i.BIN3,
                                        '+': i.BIN4,
                                        ',': [
                                            0,
                                            3,
                                            e.PUNCT,
                                            { linebreakstyle: 'after', separator: !0 },
                                        ],
                                        '-': i.BIN4,
                                        '.': [3, 3, e.ORD],
                                        '/': i.ORD11,
                                        ':': [1, 2, e.REL],
                                        ';': [
                                            0,
                                            3,
                                            e.PUNCT,
                                            { linebreakstyle: 'after', separator: !0 },
                                        ],
                                        '<': i.REL,
                                        '=': i.REL,
                                        '>': i.REL,
                                        '?': [1, 1, e.CLOSE],
                                        '\\': i.ORD,
                                        '^': i.ORD11,
                                        _: i.ORD11,
                                        '|': [
                                            2,
                                            2,
                                            e.ORD,
                                            { fence: !0, stretchy: !0, symmetric: !0 },
                                        ],
                                        '#': i.ORD,
                                        $: i.ORD,
                                        '.': [0, 3, e.PUNCT, { separator: !0 }],
                                        '\u02b9': i.ORD,
                                        '\u0300': i.ACCENT,
                                        '\u0301': i.ACCENT,
                                        '\u0303': i.WIDEACCENT,
                                        '\u0304': i.ACCENT,
                                        '\u0306': i.ACCENT,
                                        '\u0307': i.ACCENT,
                                        '\u0308': i.ACCENT,
                                        '\u030c': i.ACCENT,
                                        '\u0332': i.WIDEACCENT,
                                        '\u0338': i.REL4,
                                        '\u2015': [0, 0, e.ORD, { stretchy: !0 }],
                                        '\u2017': [0, 0, e.ORD, { stretchy: !0 }],
                                        '\u2020': i.BIN3,
                                        '\u2021': i.BIN3,
                                        '\u20d7': i.ACCENT,
                                        '\u2111': i.ORD,
                                        '\u2113': i.ORD,
                                        '\u2118': i.ORD,
                                        '\u211c': i.ORD,
                                        '\u2205': i.ORD,
                                        '\u221e': i.ORD,
                                        '\u2305': i.BIN3,
                                        '\u2306': i.BIN3,
                                        '\u2322': i.REL4,
                                        '\u2323': i.REL4,
                                        '\u2329': i.OPEN,
                                        '\u232a': i.CLOSE,
                                        '\u23aa': i.ORD,
                                        '\u23af': [0, 0, e.ORD, { stretchy: !0 }],
                                        '\u23b0': i.OPEN,
                                        '\u23b1': i.CLOSE,
                                        '\u2500': i.ORD,
                                        '\u25ef': i.BIN3,
                                        '\u2660': i.ORD,
                                        '\u2661': i.ORD,
                                        '\u2662': i.ORD,
                                        '\u2663': i.ORD,
                                        '\u3008': i.OPEN,
                                        '\u3009': i.CLOSE,
                                        '\ufe37': i.WIDEACCENT,
                                        '\ufe38': i.WIDEACCENT,
                                    },
                                },
                            },
                            { OPTYPES: i },
                        );
                        var n = t.mo.prototype.OPTABLE;
                        (n.infix['^'] = i.WIDEREL),
                            (n.infix._ = i.WIDEREL),
                            (n.prefix['\u2223'] = i.OPEN),
                            (n.prefix['\u2225'] = i.OPEN),
                            (n.postfix['\u2223'] = i.CLOSE),
                            (n.postfix['\u2225'] = i.CLOSE);
                    })(MathJax.ElementJax.mml),
                    MathJax.ElementJax.mml.loadComplete('jax.js');
            },
            315: function () {
                (MathJax.InputJax.AsciiMath = MathJax.InputJax({
                    id: 'AsciiMath',
                    version: '2.7.2',
                    directory: MathJax.InputJax.directory + '/AsciiMath',
                    extensionDir: MathJax.InputJax.extensionDir + '/AsciiMath',
                    config: {
                        fixphi: !0,
                        useMathMLspacing: !0,
                        displaystyle: !0,
                        decimalsign: '.',
                    },
                })),
                    MathJax.InputJax.AsciiMath.Register('math/asciimath'),
                    MathJax.InputJax.AsciiMath.loadComplete('config.js');
            },
            247: function () {
                var t, e;
                !(function (t) {
                    var e,
                        i = MathJax.Object.Subclass({
                            firstChild: null,
                            lastChild: null,
                            Init: function () {
                                this.childNodes = [];
                            },
                            appendChild: function (t) {
                                return (
                                    t.parent && t.parent.removeChild(t),
                                    this.lastChild && (this.lastChild.nextSibling = t),
                                    this.firstChild || (this.firstChild = t),
                                    this.childNodes.push(t),
                                    (t.parent = this),
                                    (this.lastChild = t),
                                    t
                                );
                            },
                            removeChild: function (t) {
                                for (
                                    var e = 0, i = this.childNodes.length;
                                    e < i && this.childNodes[e] !== t;
                                    e++
                                );
                                if (e !== i)
                                    return (
                                        this.childNodes.splice(e, 1),
                                        t === this.firstChild && (this.firstChild = t.nextSibling),
                                        t === this.lastChild &&
                                            (this.childNodes.length
                                                ? (this.lastChild =
                                                      this.childNodes[this.childNodes.length - 1])
                                                : (this.lastChild = null)),
                                        e && (this.childNodes[e - 1].nextSibling = t.nextSibling),
                                        (t.nextSibling = t.parent = null),
                                        t
                                    );
                            },
                            replaceChild: function (t, e) {
                                for (
                                    var i = 0, n = this.childNodes.length;
                                    i < n && this.childNodes[i] !== e;
                                    i++
                                );
                                return (
                                    i
                                        ? (this.childNodes[i - 1].nextSibling = t)
                                        : (this.firstChild = t),
                                    i >= n - 1 && (this.lastChild = t),
                                    (this.childNodes[i] = t),
                                    (t.nextSibling = e.nextSibling),
                                    (e.nextSibling = e.parent = null),
                                    e
                                );
                            },
                            hasChildNodes: function (t) {
                                return this.childNodes.length > 0;
                            },
                            toString: function () {
                                return '{' + this.childNodes.join('') + '}';
                            },
                        }),
                        n = {
                            getElementById: !0,
                            createElementNS: function (i, n) {
                                var a = e[n]();
                                return (
                                    'mo' === n &&
                                        t.config.useMathMLspacing &&
                                        (a.useMMLspacing = 128),
                                    a
                                );
                            },
                            createTextNode: function (t) {
                                return e.chars(t).With({ nodeValue: t });
                            },
                            createDocumentFragment: function () {
                                return i();
                            },
                        },
                        a = { appName: 'MathJax' },
                        s = 'blue',
                        r = !0,
                        o = !0,
                        l = '.',
                        u = 'Microsoft' == a.appName.slice(0, 9);
                    function h(t) {
                        return u
                            ? n.createElement(t)
                            : n.createElementNS('http://www.w3.org/1999/xhtml', t);
                    }
                    var p = 'http://www.w3.org/1998/Math/MathML';
                    function c(t) {
                        return u ? n.createElement('m:' + t) : n.createElementNS(p, t);
                    }
                    function d(t, e) {
                        var i;
                        return (
                            (i = u ? n.createElement('m:' + t) : n.createElementNS(p, t)),
                            e && i.appendChild(e),
                            i
                        );
                    }
                    var m = [
                            '\ud835\udc9c',
                            '\u212c',
                            '\ud835\udc9e',
                            '\ud835\udc9f',
                            '\u2130',
                            '\u2131',
                            '\ud835\udca2',
                            '\u210b',
                            '\u2110',
                            '\ud835\udca5',
                            '\ud835\udca6',
                            '\u2112',
                            '\u2133',
                            '\ud835\udca9',
                            '\ud835\udcaa',
                            '\ud835\udcab',
                            '\ud835\udcac',
                            '\u211b',
                            '\ud835\udcae',
                            '\ud835\udcaf',
                            '\ud835\udcb0',
                            '\ud835\udcb1',
                            '\ud835\udcb2',
                            '\ud835\udcb3',
                            '\ud835\udcb4',
                            '\ud835\udcb5',
                            '\ud835\udcb6',
                            '\ud835\udcb7',
                            '\ud835\udcb8',
                            '\ud835\udcb9',
                            '\u212f',
                            '\ud835\udcbb',
                            '\u210a',
                            '\ud835\udcbd',
                            '\ud835\udcbe',
                            '\ud835\udcbf',
                            '\ud835\udcc0',
                            '\ud835\udcc1',
                            '\ud835\udcc2',
                            '\ud835\udcc3',
                            '\u2134',
                            '\ud835\udcc5',
                            '\ud835\udcc6',
                            '\ud835\udcc7',
                            '\ud835\udcc8',
                            '\ud835\udcc9',
                            '\ud835\udcca',
                            '\ud835\udccb',
                            '\ud835\udccc',
                            '\ud835\udccd',
                            '\ud835\udcce',
                            '\ud835\udccf',
                        ],
                        f = [
                            '\ud835\udd04',
                            '\ud835\udd05',
                            '\u212d',
                            '\ud835\udd07',
                            '\ud835\udd08',
                            '\ud835\udd09',
                            '\ud835\udd0a',
                            '\u210c',
                            '\u2111',
                            '\ud835\udd0d',
                            '\ud835\udd0e',
                            '\ud835\udd0f',
                            '\ud835\udd10',
                            '\ud835\udd11',
                            '\ud835\udd12',
                            '\ud835\udd13',
                            '\ud835\udd14',
                            '\u211c',
                            '\ud835\udd16',
                            '\ud835\udd17',
                            '\ud835\udd18',
                            '\ud835\udd19',
                            '\ud835\udd1a',
                            '\ud835\udd1b',
                            '\ud835\udd1c',
                            '\u2128',
                            '\ud835\udd1e',
                            '\ud835\udd1f',
                            '\ud835\udd20',
                            '\ud835\udd21',
                            '\ud835\udd22',
                            '\ud835\udd23',
                            '\ud835\udd24',
                            '\ud835\udd25',
                            '\ud835\udd26',
                            '\ud835\udd27',
                            '\ud835\udd28',
                            '\ud835\udd29',
                            '\ud835\udd2a',
                            '\ud835\udd2b',
                            '\ud835\udd2c',
                            '\ud835\udd2d',
                            '\ud835\udd2e',
                            '\ud835\udd2f',
                            '\ud835\udd30',
                            '\ud835\udd31',
                            '\ud835\udd32',
                            '\ud835\udd33',
                            '\ud835\udd34',
                            '\ud835\udd35',
                            '\ud835\udd36',
                            '\ud835\udd37',
                        ],
                        g = [
                            '\ud835\udd38',
                            '\ud835\udd39',
                            '\u2102',
                            '\ud835\udd3b',
                            '\ud835\udd3c',
                            '\ud835\udd3d',
                            '\ud835\udd3e',
                            '\u210d',
                            '\ud835\udd40',
                            '\ud835\udd41',
                            '\ud835\udd42',
                            '\ud835\udd43',
                            '\ud835\udd44',
                            '\u2115',
                            '\ud835\udd46',
                            '\u2119',
                            '\u211a',
                            '\u211d',
                            '\ud835\udd4a',
                            '\ud835\udd4b',
                            '\ud835\udd4c',
                            '\ud835\udd4d',
                            '\ud835\udd4e',
                            '\ud835\udd4f',
                            '\ud835\udd50',
                            '\u2124',
                            '\ud835\udd52',
                            '\ud835\udd53',
                            '\ud835\udd54',
                            '\ud835\udd55',
                            '\ud835\udd56',
                            '\ud835\udd57',
                            '\ud835\udd58',
                            '\ud835\udd59',
                            '\ud835\udd5a',
                            '\ud835\udd5b',
                            '\ud835\udd5c',
                            '\ud835\udd5d',
                            '\ud835\udd5e',
                            '\ud835\udd5f',
                            '\ud835\udd60',
                            '\ud835\udd61',
                            '\ud835\udd62',
                            '\ud835\udd63',
                            '\ud835\udd64',
                            '\ud835\udd65',
                            '\ud835\udd66',
                            '\ud835\udd67',
                            '\ud835\udd68',
                            '\ud835\udd69',
                            '\ud835\udd6a',
                            '\ud835\udd6b',
                        ],
                        y = 8,
                        E = { input: '"', tag: 'mtext', output: 'mbox', tex: null, ttype: 10 },
                        x = [
                            { input: 'alpha', tag: 'mi', output: '\u03b1', tex: null, ttype: 0 },
                            { input: 'beta', tag: 'mi', output: '\u03b2', tex: null, ttype: 0 },
                            { input: 'chi', tag: 'mi', output: '\u03c7', tex: null, ttype: 0 },
                            { input: 'delta', tag: 'mi', output: '\u03b4', tex: null, ttype: 0 },
                            { input: 'Delta', tag: 'mo', output: '\u0394', tex: null, ttype: 0 },
                            {
                                input: 'epsi',
                                tag: 'mi',
                                output: '\u03b5',
                                tex: 'epsilon',
                                ttype: 0,
                            },
                            {
                                input: 'varepsilon',
                                tag: 'mi',
                                output: '\u025b',
                                tex: null,
                                ttype: 0,
                            },
                            { input: 'eta', tag: 'mi', output: '\u03b7', tex: null, ttype: 0 },
                            { input: 'gamma', tag: 'mi', output: '\u03b3', tex: null, ttype: 0 },
                            { input: 'Gamma', tag: 'mo', output: '\u0393', tex: null, ttype: 0 },
                            { input: 'iota', tag: 'mi', output: '\u03b9', tex: null, ttype: 0 },
                            { input: 'kappa', tag: 'mi', output: '\u03ba', tex: null, ttype: 0 },
                            { input: 'lambda', tag: 'mi', output: '\u03bb', tex: null, ttype: 0 },
                            { input: 'Lambda', tag: 'mo', output: '\u039b', tex: null, ttype: 0 },
                            { input: 'lamda', tag: 'mi', output: '\u03bb', tex: null, ttype: 0 },
                            { input: 'Lamda', tag: 'mo', output: '\u039b', tex: null, ttype: 0 },
                            { input: 'mu', tag: 'mi', output: '\u03bc', tex: null, ttype: 0 },
                            { input: 'nu', tag: 'mi', output: '\u03bd', tex: null, ttype: 0 },
                            { input: 'omega', tag: 'mi', output: '\u03c9', tex: null, ttype: 0 },
                            { input: 'Omega', tag: 'mo', output: '\u03a9', tex: null, ttype: 0 },
                            { input: 'phi', tag: 'mi', output: '\u03d5', tex: null, ttype: 0 },
                            { input: 'varphi', tag: 'mi', output: '\u03c6', tex: null, ttype: 0 },
                            { input: 'Phi', tag: 'mo', output: '\u03a6', tex: null, ttype: 0 },
                            { input: 'pi', tag: 'mi', output: '\u03c0', tex: null, ttype: 0 },
                            { input: 'Pi', tag: 'mo', output: '\u03a0', tex: null, ttype: 0 },
                            { input: 'psi', tag: 'mi', output: '\u03c8', tex: null, ttype: 0 },
                            { input: 'Psi', tag: 'mi', output: '\u03a8', tex: null, ttype: 0 },
                            { input: 'rho', tag: 'mi', output: '\u03c1', tex: null, ttype: 0 },
                            { input: 'sigma', tag: 'mi', output: '\u03c3', tex: null, ttype: 0 },
                            { input: 'Sigma', tag: 'mo', output: '\u03a3', tex: null, ttype: 0 },
                            { input: 'tau', tag: 'mi', output: '\u03c4', tex: null, ttype: 0 },
                            { input: 'theta', tag: 'mi', output: '\u03b8', tex: null, ttype: 0 },
                            { input: 'vartheta', tag: 'mi', output: '\u03d1', tex: null, ttype: 0 },
                            { input: 'Theta', tag: 'mo', output: '\u0398', tex: null, ttype: 0 },
                            { input: 'upsilon', tag: 'mi', output: '\u03c5', tex: null, ttype: 0 },
                            { input: 'xi', tag: 'mi', output: '\u03be', tex: null, ttype: 0 },
                            { input: 'Xi', tag: 'mo', output: '\u039e', tex: null, ttype: 0 },
                            { input: 'zeta', tag: 'mi', output: '\u03b6', tex: null, ttype: 0 },
                            { input: '*', tag: 'mo', output: '\u22c5', tex: 'cdot', ttype: 0 },
                            { input: '**', tag: 'mo', output: '\u2217', tex: 'ast', ttype: 0 },
                            { input: '***', tag: 'mo', output: '\u22c6', tex: 'star', ttype: 0 },
                            { input: '//', tag: 'mo', output: '/', tex: null, ttype: 0 },
                            { input: '\\\\', tag: 'mo', output: '\\', tex: 'backslash', ttype: 0 },
                            { input: 'setminus', tag: 'mo', output: '\\', tex: null, ttype: 0 },
                            { input: 'xx', tag: 'mo', output: '\xd7', tex: 'times', ttype: 0 },
                            { input: '|><', tag: 'mo', output: '\u22c9', tex: 'ltimes', ttype: 0 },
                            { input: '><|', tag: 'mo', output: '\u22ca', tex: 'rtimes', ttype: 0 },
                            { input: '|><|', tag: 'mo', output: '\u22c8', tex: 'bowtie', ttype: 0 },
                            { input: '-:', tag: 'mo', output: '\xf7', tex: 'div', ttype: 0 },
                            { input: 'divide', tag: 'mo', output: '-:', tex: null, ttype: y },
                            { input: '@', tag: 'mo', output: '\u2218', tex: 'circ', ttype: 0 },
                            { input: 'o+', tag: 'mo', output: '\u2295', tex: 'oplus', ttype: 0 },
                            { input: 'ox', tag: 'mo', output: '\u2297', tex: 'otimes', ttype: 0 },
                            { input: 'o.', tag: 'mo', output: '\u2299', tex: 'odot', ttype: 0 },
                            { input: 'sum', tag: 'mo', output: '\u2211', tex: null, ttype: 7 },
                            { input: 'prod', tag: 'mo', output: '\u220f', tex: null, ttype: 7 },
                            { input: '^^', tag: 'mo', output: '\u2227', tex: 'wedge', ttype: 0 },
                            {
                                input: '^^^',
                                tag: 'mo',
                                output: '\u22c0',
                                tex: 'bigwedge',
                                ttype: 7,
                            },
                            { input: 'vv', tag: 'mo', output: '\u2228', tex: 'vee', ttype: 0 },
                            { input: 'vvv', tag: 'mo', output: '\u22c1', tex: 'bigvee', ttype: 7 },
                            { input: 'nn', tag: 'mo', output: '\u2229', tex: 'cap', ttype: 0 },
                            { input: 'nnn', tag: 'mo', output: '\u22c2', tex: 'bigcap', ttype: 7 },
                            { input: 'uu', tag: 'mo', output: '\u222a', tex: 'cup', ttype: 0 },
                            { input: 'uuu', tag: 'mo', output: '\u22c3', tex: 'bigcup', ttype: 7 },
                            { input: '!=', tag: 'mo', output: '\u2260', tex: 'ne', ttype: 0 },
                            { input: ':=', tag: 'mo', output: ':=', tex: null, ttype: 0 },
                            { input: 'lt', tag: 'mo', output: '<', tex: null, ttype: 0 },
                            { input: '<=', tag: 'mo', output: '\u2264', tex: 'le', ttype: 0 },
                            { input: 'lt=', tag: 'mo', output: '\u2264', tex: 'leq', ttype: 0 },
                            { input: 'gt', tag: 'mo', output: '>', tex: null, ttype: 0 },
                            { input: '>=', tag: 'mo', output: '\u2265', tex: 'ge', ttype: 0 },
                            { input: 'gt=', tag: 'mo', output: '\u2265', tex: 'geq', ttype: 0 },
                            { input: '-<', tag: 'mo', output: '\u227a', tex: 'prec', ttype: 0 },
                            { input: '-lt', tag: 'mo', output: '\u227a', tex: null, ttype: 0 },
                            { input: '>-', tag: 'mo', output: '\u227b', tex: 'succ', ttype: 0 },
                            { input: '-<=', tag: 'mo', output: '\u2aaf', tex: 'preceq', ttype: 0 },
                            { input: '>-=', tag: 'mo', output: '\u2ab0', tex: 'succeq', ttype: 0 },
                            { input: 'in', tag: 'mo', output: '\u2208', tex: null, ttype: 0 },
                            { input: '!in', tag: 'mo', output: '\u2209', tex: 'notin', ttype: 0 },
                            { input: 'sub', tag: 'mo', output: '\u2282', tex: 'subset', ttype: 0 },
                            { input: 'sup', tag: 'mo', output: '\u2283', tex: 'supset', ttype: 0 },
                            {
                                input: 'sube',
                                tag: 'mo',
                                output: '\u2286',
                                tex: 'subseteq',
                                ttype: 0,
                            },
                            {
                                input: 'supe',
                                tag: 'mo',
                                output: '\u2287',
                                tex: 'supseteq',
                                ttype: 0,
                            },
                            { input: '-=', tag: 'mo', output: '\u2261', tex: 'equiv', ttype: 0 },
                            { input: '~=', tag: 'mo', output: '\u2245', tex: 'cong', ttype: 0 },
                            { input: '~~', tag: 'mo', output: '\u2248', tex: 'approx', ttype: 0 },
                            { input: '~', tag: 'mo', output: '\u223c', tex: 'sim', ttype: 0 },
                            { input: 'prop', tag: 'mo', output: '\u221d', tex: 'propto', ttype: 0 },
                            { input: 'and', tag: 'mtext', output: 'and', tex: null, ttype: 6 },
                            { input: 'or', tag: 'mtext', output: 'or', tex: null, ttype: 6 },
                            { input: 'not', tag: 'mo', output: '\xac', tex: 'neg', ttype: 0 },
                            { input: '=>', tag: 'mo', output: '\u21d2', tex: 'implies', ttype: 0 },
                            { input: 'if', tag: 'mo', output: 'if', tex: null, ttype: 6 },
                            { input: '<=>', tag: 'mo', output: '\u21d4', tex: 'iff', ttype: 0 },
                            { input: 'AA', tag: 'mo', output: '\u2200', tex: 'forall', ttype: 0 },
                            { input: 'EE', tag: 'mo', output: '\u2203', tex: 'exists', ttype: 0 },
                            { input: '_|_', tag: 'mo', output: '\u22a5', tex: 'bot', ttype: 0 },
                            { input: 'TT', tag: 'mo', output: '\u22a4', tex: 'top', ttype: 0 },
                            { input: '|--', tag: 'mo', output: '\u22a2', tex: 'vdash', ttype: 0 },
                            { input: '|==', tag: 'mo', output: '\u22a8', tex: 'models', ttype: 0 },
                            { input: '(', tag: 'mo', output: '(', tex: 'left(', ttype: 4 },
                            { input: ')', tag: 'mo', output: ')', tex: 'right)', ttype: 5 },
                            { input: '[', tag: 'mo', output: '[', tex: 'left[', ttype: 4 },
                            { input: ']', tag: 'mo', output: ']', tex: 'right]', ttype: 5 },
                            { input: '{', tag: 'mo', output: '{', tex: null, ttype: 4 },
                            { input: '}', tag: 'mo', output: '}', tex: null, ttype: 5 },
                            { input: '|', tag: 'mo', output: '|', tex: null, ttype: 9 },
                            { input: ':|:', tag: 'mo', output: '|', tex: null, ttype: 0 },
                            { input: '|:', tag: 'mo', output: '|', tex: null, ttype: 4 },
                            { input: ':|', tag: 'mo', output: '|', tex: null, ttype: 5 },
                            { input: '(:', tag: 'mo', output: '\u2329', tex: 'langle', ttype: 4 },
                            { input: ':)', tag: 'mo', output: '\u232a', tex: 'rangle', ttype: 5 },
                            { input: '<<', tag: 'mo', output: '\u2329', tex: null, ttype: 4 },
                            { input: '>>', tag: 'mo', output: '\u232a', tex: null, ttype: 5 },
                            {
                                input: '{:',
                                tag: 'mo',
                                output: '{:',
                                tex: null,
                                ttype: 4,
                                invisible: !0,
                            },
                            {
                                input: ':}',
                                tag: 'mo',
                                output: ':}',
                                tex: null,
                                ttype: 5,
                                invisible: !0,
                            },
                            { input: 'int', tag: 'mo', output: '\u222b', tex: null, ttype: 0 },
                            { input: 'dx', tag: 'mi', output: '{:d x:}', tex: null, ttype: y },
                            { input: 'dy', tag: 'mi', output: '{:d y:}', tex: null, ttype: y },
                            { input: 'dz', tag: 'mi', output: '{:d z:}', tex: null, ttype: y },
                            { input: 'dt', tag: 'mi', output: '{:d t:}', tex: null, ttype: y },
                            { input: 'oint', tag: 'mo', output: '\u222e', tex: null, ttype: 0 },
                            { input: 'del', tag: 'mo', output: '\u2202', tex: 'partial', ttype: 0 },
                            { input: 'grad', tag: 'mo', output: '\u2207', tex: 'nabla', ttype: 0 },
                            { input: '+-', tag: 'mo', output: '\xb1', tex: 'pm', ttype: 0 },
                            { input: '-+', tag: 'mo', output: '\u2213', tex: 'mp', ttype: 0 },
                            { input: 'O/', tag: 'mo', output: '\u2205', tex: 'emptyset', ttype: 0 },
                            { input: 'oo', tag: 'mo', output: '\u221e', tex: 'infty', ttype: 0 },
                            { input: 'aleph', tag: 'mo', output: '\u2135', tex: null, ttype: 0 },
                            { input: '...', tag: 'mo', output: '...', tex: 'ldots', ttype: 0 },
                            {
                                input: ':.',
                                tag: 'mo',
                                output: '\u2234',
                                tex: 'therefore',
                                ttype: 0,
                            },
                            { input: ":'", tag: 'mo', output: '\u2235', tex: 'because', ttype: 0 },
                            { input: '/_', tag: 'mo', output: '\u2220', tex: 'angle', ttype: 0 },
                            {
                                input: '/_\\',
                                tag: 'mo',
                                output: '\u25b3',
                                tex: 'triangle',
                                ttype: 0,
                            },
                            { input: "'", tag: 'mo', output: '\u2032', tex: 'prime', ttype: 0 },
                            {
                                input: 'tilde',
                                tag: 'mover',
                                output: '~',
                                tex: null,
                                ttype: 1,
                                acc: !0,
                            },
                            { input: '\\ ', tag: 'mo', output: '\xa0', tex: null, ttype: 0 },
                            { input: 'frown', tag: 'mo', output: '\u2322', tex: null, ttype: 0 },
                            { input: 'quad', tag: 'mo', output: '\xa0\xa0', tex: null, ttype: 0 },
                            {
                                input: 'qquad',
                                tag: 'mo',
                                output: '\xa0\xa0\xa0\xa0',
                                tex: null,
                                ttype: 0,
                            },
                            { input: 'cdots', tag: 'mo', output: '\u22ef', tex: null, ttype: 0 },
                            { input: 'vdots', tag: 'mo', output: '\u22ee', tex: null, ttype: 0 },
                            { input: 'ddots', tag: 'mo', output: '\u22f1', tex: null, ttype: 0 },
                            { input: 'diamond', tag: 'mo', output: '\u22c4', tex: null, ttype: 0 },
                            { input: 'square', tag: 'mo', output: '\u25a1', tex: null, ttype: 0 },
                            { input: '|__', tag: 'mo', output: '\u230a', tex: 'lfloor', ttype: 0 },
                            { input: '__|', tag: 'mo', output: '\u230b', tex: 'rfloor', ttype: 0 },
                            { input: '|~', tag: 'mo', output: '\u2308', tex: 'lceiling', ttype: 0 },
                            { input: '~|', tag: 'mo', output: '\u2309', tex: 'rceiling', ttype: 0 },
                            { input: 'CC', tag: 'mo', output: '\u2102', tex: null, ttype: 0 },
                            { input: 'NN', tag: 'mo', output: '\u2115', tex: null, ttype: 0 },
                            { input: 'QQ', tag: 'mo', output: '\u211a', tex: null, ttype: 0 },
                            { input: 'RR', tag: 'mo', output: '\u211d', tex: null, ttype: 0 },
                            { input: 'ZZ', tag: 'mo', output: '\u2124', tex: null, ttype: 0 },
                            { input: 'f', tag: 'mi', output: 'f', tex: null, ttype: 1, func: !0 },
                            { input: 'g', tag: 'mi', output: 'g', tex: null, ttype: 1, func: !0 },
                            { input: 'lim', tag: 'mo', output: 'lim', tex: null, ttype: 7 },
                            { input: 'Lim', tag: 'mo', output: 'Lim', tex: null, ttype: 7 },
                            {
                                input: 'sin',
                                tag: 'mo',
                                output: 'sin',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'cos',
                                tag: 'mo',
                                output: 'cos',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'tan',
                                tag: 'mo',
                                output: 'tan',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'sinh',
                                tag: 'mo',
                                output: 'sinh',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'cosh',
                                tag: 'mo',
                                output: 'cosh',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'tanh',
                                tag: 'mo',
                                output: 'tanh',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'cot',
                                tag: 'mo',
                                output: 'cot',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'sec',
                                tag: 'mo',
                                output: 'sec',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'csc',
                                tag: 'mo',
                                output: 'csc',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'arcsin',
                                tag: 'mo',
                                output: 'arcsin',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'arccos',
                                tag: 'mo',
                                output: 'arccos',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'arctan',
                                tag: 'mo',
                                output: 'arctan',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'coth',
                                tag: 'mo',
                                output: 'coth',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'sech',
                                tag: 'mo',
                                output: 'sech',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'csch',
                                tag: 'mo',
                                output: 'csch',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'exp',
                                tag: 'mo',
                                output: 'exp',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'abs',
                                tag: 'mo',
                                output: 'abs',
                                tex: null,
                                ttype: 1,
                                rewriteleftright: ['|', '|'],
                            },
                            {
                                input: 'norm',
                                tag: 'mo',
                                output: 'norm',
                                tex: null,
                                ttype: 1,
                                rewriteleftright: ['\u2225', '\u2225'],
                            },
                            {
                                input: 'floor',
                                tag: 'mo',
                                output: 'floor',
                                tex: null,
                                ttype: 1,
                                rewriteleftright: ['\u230a', '\u230b'],
                            },
                            {
                                input: 'ceil',
                                tag: 'mo',
                                output: 'ceil',
                                tex: null,
                                ttype: 1,
                                rewriteleftright: ['\u2308', '\u2309'],
                            },
                            {
                                input: 'log',
                                tag: 'mo',
                                output: 'log',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            { input: 'ln', tag: 'mo', output: 'ln', tex: null, ttype: 1, func: !0 },
                            {
                                input: 'det',
                                tag: 'mo',
                                output: 'det',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            { input: 'dim', tag: 'mo', output: 'dim', tex: null, ttype: 0 },
                            { input: 'mod', tag: 'mo', output: 'mod', tex: null, ttype: 0 },
                            {
                                input: 'gcd',
                                tag: 'mo',
                                output: 'gcd',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'lcm',
                                tag: 'mo',
                                output: 'lcm',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            { input: 'lub', tag: 'mo', output: 'lub', tex: null, ttype: 0 },
                            { input: 'glb', tag: 'mo', output: 'glb', tex: null, ttype: 0 },
                            { input: 'min', tag: 'mo', output: 'min', tex: null, ttype: 7 },
                            { input: 'max', tag: 'mo', output: 'max', tex: null, ttype: 7 },
                            {
                                input: 'Sin',
                                tag: 'mo',
                                output: 'Sin',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Cos',
                                tag: 'mo',
                                output: 'Cos',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Tan',
                                tag: 'mo',
                                output: 'Tan',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Arcsin',
                                tag: 'mo',
                                output: 'Arcsin',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Arccos',
                                tag: 'mo',
                                output: 'Arccos',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Arctan',
                                tag: 'mo',
                                output: 'Arctan',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Sinh',
                                tag: 'mo',
                                output: 'Sinh',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Cosh',
                                tag: 'mo',
                                output: 'Cosh',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Tanh',
                                tag: 'mo',
                                output: 'Tanh',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Cot',
                                tag: 'mo',
                                output: 'Cot',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Sec',
                                tag: 'mo',
                                output: 'Sec',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Csc',
                                tag: 'mo',
                                output: 'Csc',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            {
                                input: 'Log',
                                tag: 'mo',
                                output: 'Log',
                                tex: null,
                                ttype: 1,
                                func: !0,
                            },
                            { input: 'Ln', tag: 'mo', output: 'Ln', tex: null, ttype: 1, func: !0 },
                            {
                                input: 'Abs',
                                tag: 'mo',
                                output: 'abs',
                                tex: null,
                                ttype: 1,
                                notexcopy: !0,
                                rewriteleftright: ['|', '|'],
                            },
                            {
                                input: 'uarr',
                                tag: 'mo',
                                output: '\u2191',
                                tex: 'uparrow',
                                ttype: 0,
                            },
                            {
                                input: 'darr',
                                tag: 'mo',
                                output: '\u2193',
                                tex: 'downarrow',
                                ttype: 0,
                            },
                            {
                                input: 'rarr',
                                tag: 'mo',
                                output: '\u2192',
                                tex: 'rightarrow',
                                ttype: 0,
                            },
                            { input: '->', tag: 'mo', output: '\u2192', tex: 'to', ttype: 0 },
                            {
                                input: '>->',
                                tag: 'mo',
                                output: '\u21a3',
                                tex: 'rightarrowtail',
                                ttype: 0,
                            },
                            {
                                input: '->>',
                                tag: 'mo',
                                output: '\u21a0',
                                tex: 'twoheadrightarrow',
                                ttype: 0,
                            },
                            {
                                input: '>->>',
                                tag: 'mo',
                                output: '\u2916',
                                tex: 'twoheadrightarrowtail',
                                ttype: 0,
                            },
                            { input: '|->', tag: 'mo', output: '\u21a6', tex: 'mapsto', ttype: 0 },
                            {
                                input: 'larr',
                                tag: 'mo',
                                output: '\u2190',
                                tex: 'leftarrow',
                                ttype: 0,
                            },
                            {
                                input: 'harr',
                                tag: 'mo',
                                output: '\u2194',
                                tex: 'leftrightarrow',
                                ttype: 0,
                            },
                            {
                                input: 'rArr',
                                tag: 'mo',
                                output: '\u21d2',
                                tex: 'Rightarrow',
                                ttype: 0,
                            },
                            {
                                input: 'lArr',
                                tag: 'mo',
                                output: '\u21d0',
                                tex: 'Leftarrow',
                                ttype: 0,
                            },
                            {
                                input: 'hArr',
                                tag: 'mo',
                                output: '\u21d4',
                                tex: 'Leftrightarrow',
                                ttype: 0,
                            },
                            { input: 'sqrt', tag: 'msqrt', output: 'sqrt', tex: null, ttype: 1 },
                            { input: 'root', tag: 'mroot', output: 'root', tex: null, ttype: 2 },
                            { input: 'frac', tag: 'mfrac', output: '/', tex: null, ttype: 2 },
                            { input: '/', tag: 'mfrac', output: '/', tex: null, ttype: 3 },
                            {
                                input: 'stackrel',
                                tag: 'mover',
                                output: 'stackrel',
                                tex: null,
                                ttype: 2,
                            },
                            {
                                input: 'overset',
                                tag: 'mover',
                                output: 'stackrel',
                                tex: null,
                                ttype: 2,
                            },
                            {
                                input: 'underset',
                                tag: 'munder',
                                output: 'stackrel',
                                tex: null,
                                ttype: 2,
                            },
                            { input: '_', tag: 'msub', output: '_', tex: null, ttype: 3 },
                            { input: '^', tag: 'msup', output: '^', tex: null, ttype: 3 },
                            {
                                input: 'hat',
                                tag: 'mover',
                                output: '^',
                                tex: null,
                                ttype: 1,
                                acc: !0,
                            },
                            {
                                input: 'bar',
                                tag: 'mover',
                                output: '\xaf',
                                tex: 'overline',
                                ttype: 1,
                                acc: !0,
                            },
                            {
                                input: 'vec',
                                tag: 'mover',
                                output: '\u2192',
                                tex: null,
                                ttype: 1,
                                acc: !0,
                            },
                            {
                                input: 'dot',
                                tag: 'mover',
                                output: '.',
                                tex: null,
                                ttype: 1,
                                acc: !0,
                            },
                            {
                                input: 'ddot',
                                tag: 'mover',
                                output: '..',
                                tex: null,
                                ttype: 1,
                                acc: !0,
                            },
                            {
                                input: 'overarc',
                                tag: 'mover',
                                output: '\u23dc',
                                tex: 'overparen',
                                ttype: 1,
                                acc: !0,
                            },
                            {
                                input: 'ul',
                                tag: 'munder',
                                output: '\u0332',
                                tex: 'underline',
                                ttype: 1,
                                acc: !0,
                            },
                            {
                                input: 'ubrace',
                                tag: 'munder',
                                output: '\u23df',
                                tex: 'underbrace',
                                ttype: 15,
                                acc: !0,
                            },
                            {
                                input: 'obrace',
                                tag: 'mover',
                                output: '\u23de',
                                tex: 'overbrace',
                                ttype: 15,
                                acc: !0,
                            },
                            { input: 'text', tag: 'mtext', output: 'text', tex: null, ttype: 10 },
                            { input: 'mbox', tag: 'mtext', output: 'mbox', tex: null, ttype: 10 },
                            { input: 'color', tag: 'mstyle', ttype: 2 },
                            { input: 'id', tag: 'mrow', ttype: 2 },
                            { input: 'class', tag: 'mrow', ttype: 2 },
                            {
                                input: 'cancel',
                                tag: 'menclose',
                                output: 'cancel',
                                tex: null,
                                ttype: 1,
                            },
                            E,
                            {
                                input: 'bb',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'bold',
                                output: 'bb',
                                tex: null,
                                ttype: 1,
                            },
                            {
                                input: 'mathbf',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'bold',
                                output: 'mathbf',
                                tex: null,
                                ttype: 1,
                            },
                            {
                                input: 'sf',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'sans-serif',
                                output: 'sf',
                                tex: null,
                                ttype: 1,
                            },
                            {
                                input: 'mathsf',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'sans-serif',
                                output: 'mathsf',
                                tex: null,
                                ttype: 1,
                            },
                            {
                                input: 'bbb',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'double-struck',
                                output: 'bbb',
                                tex: null,
                                ttype: 1,
                                codes: g,
                            },
                            {
                                input: 'mathbb',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'double-struck',
                                output: 'mathbb',
                                tex: null,
                                ttype: 1,
                                codes: g,
                            },
                            {
                                input: 'cc',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'script',
                                output: 'cc',
                                tex: null,
                                ttype: 1,
                                codes: m,
                            },
                            {
                                input: 'mathcal',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'script',
                                output: 'mathcal',
                                tex: null,
                                ttype: 1,
                                codes: m,
                            },
                            {
                                input: 'tt',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'monospace',
                                output: 'tt',
                                tex: null,
                                ttype: 1,
                            },
                            {
                                input: 'mathtt',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'monospace',
                                output: 'mathtt',
                                tex: null,
                                ttype: 1,
                            },
                            {
                                input: 'fr',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'fraktur',
                                output: 'fr',
                                tex: null,
                                ttype: 1,
                                codes: f,
                            },
                            {
                                input: 'mathfrak',
                                tag: 'mstyle',
                                atname: 'mathvariant',
                                atval: 'fraktur',
                                output: 'mathfrak',
                                tex: null,
                                ttype: 1,
                                codes: f,
                            },
                        ];
                    function T(t, e) {
                        return t.input > e.input ? 1 : -1;
                    }
                    var C,
                        b,
                        S,
                        I = [];
                    function N() {
                        var t,
                            e = x.length;
                        for (t = 0; t < e; t++)
                            x[t].tex &&
                                x.push({
                                    input: x[t].tex,
                                    tag: x[t].tag,
                                    output: x[t].output,
                                    ttype: x[t].ttype,
                                    acc: x[t].acc || !1,
                                });
                        A();
                    }
                    function A() {
                        var t;
                        for (x.sort(T), t = 0; t < x.length; t++) I[t] = x[t].input;
                    }
                    function v(t, e) {
                        var i;
                        i =
                            '\\' == t.charAt(e) && '\\' != t.charAt(e + 1) && ' ' != t.charAt(e + 1)
                                ? t.slice(e + 1)
                                : t.slice(e);
                        for (var n = 0; n < i.length && i.charCodeAt(n) <= 32; n += 1);
                        return i.slice(n);
                    }
                    function R(t, e, i) {
                        if (0 == i) {
                            var n, a;
                            for (i = -1, n = t.length; i + 1 < n; )
                                t[(a = (i + n) >> 1)] < e ? (i = a) : (n = a);
                            return n;
                        }
                        for (var s = i; s < t.length && t[s] < e; s++);
                        return s;
                    }
                    function O(t) {
                        for (var e, i, n, a = 0, s = '', r = !0, o = 1; o <= t.length && r; o++)
                            (i = t.slice(0, o)),
                                (a = R(I, i, a)) < I.length &&
                                    t.slice(0, I[a].length) == I[a] &&
                                    ((e = a), (o = (s = I[a]).length)),
                                (r = a < I.length && t.slice(0, I[a].length) >= I[a]);
                        if (((b = S), '' != s)) return (S = x[e].ttype), x[e];
                        (S = 0), (a = 1), (i = t.slice(0, 1));
                        for (var u = !0; '0' <= i && i <= '9' && a <= t.length; )
                            (i = t.slice(a, a + 1)), a++;
                        if (i == l && '0' <= (i = t.slice(a, a + 1)) && i <= '9')
                            for (u = !1, a++; '0' <= i && i <= '9' && a <= t.length; )
                                (i = t.slice(a, a + 1)), a++;
                        return (
                            (u && a > 1) || a > 2
                                ? ((i = t.slice(0, a - 1)), (n = 'mn'))
                                : ((a = 2),
                                  (n =
                                      ('A' > (i = t.slice(0, 1)) || i > 'Z') && ('a' > i || i > 'z')
                                          ? 'mo'
                                          : 'mi')),
                            '-' == i && ' ' !== t.charAt(1) && 3 == b
                                ? ((S = 3), { input: i, tag: n, output: i, ttype: 1, func: !0 })
                                : { input: i, tag: n, output: i, ttype: 0 }
                        );
                    }
                    function L(t) {
                        var e;
                        t.hasChildNodes() &&
                            (!t.firstChild.hasChildNodes() ||
                                ('mrow' != t.nodeName && 'M:MROW' != t.nodeName) ||
                                ('(' != (e = t.firstChild.firstChild.nodeValue) &&
                                    '[' != e &&
                                    '{' != e) ||
                                t.removeChild(t.firstChild),
                            !t.lastChild.hasChildNodes() ||
                                ('mrow' != t.nodeName && 'M:MROW' != t.nodeName) ||
                                (')' != (e = t.lastChild.firstChild.nodeValue) &&
                                    ']' != e &&
                                    '}' != e) ||
                                t.removeChild(t.lastChild));
                    }
                    function M(t) {
                        var e,
                            i,
                            a,
                            s,
                            r,
                            o = n.createDocumentFragment();
                        if (null == (e = O((t = v(t, 0)))) || (5 == e.ttype && C > 0))
                            return [null, t];
                        switch (
                            (e.ttype == y && (e = O((t = e.output + v(t, e.input.length)))),
                            e.ttype)
                        ) {
                            case 7:
                            case 0:
                            default:
                                return (
                                    (t = v(t, e.input.length)),
                                    [d(e.tag, n.createTextNode(e.output)), t]
                                );
                            case 4:
                                return (
                                    C++,
                                    (a = D((t = v(t, e.input.length)), !0)),
                                    C--,
                                    'boolean' == typeof e.invisible && e.invisible
                                        ? (i = d('mrow', a[0]))
                                        : ((i = d('mo', n.createTextNode(e.output))),
                                          (i = d('mrow', i)).appendChild(a[0])),
                                    [i, a[1]]
                                );
                            case 10:
                                return (
                                    e != E && (t = v(t, e.input.length)),
                                    -1 ==
                                        (s =
                                            '{' == t.charAt(0)
                                                ? t.indexOf('}')
                                                : '(' == t.charAt(0)
                                                  ? t.indexOf(')')
                                                  : '[' == t.charAt(0)
                                                    ? t.indexOf(']')
                                                    : e == E
                                                      ? t.slice(1).indexOf('"') + 1
                                                      : 0) && (s = t.length),
                                    ' ' == (r = t.slice(1, s)).charAt(0) &&
                                        ((i = d('mspace')).setAttribute('width', '1ex'),
                                        o.appendChild(i)),
                                    o.appendChild(d(e.tag, n.createTextNode(r))),
                                    ' ' == r.charAt(r.length - 1) &&
                                        ((i = d('mspace')).setAttribute('width', '1ex'),
                                        o.appendChild(i)),
                                    (t = v(t, s + 1)),
                                    [d('mrow', o), t]
                                );
                            case 15:
                            case 1:
                                if (null == (a = M((t = v(t, e.input.length))))[0])
                                    return [d(e.tag, n.createTextNode(e.output)), t];
                                if ('boolean' == typeof e.func && e.func)
                                    return '^' == (r = t.charAt(0)) ||
                                        '_' == r ||
                                        '/' == r ||
                                        '|' == r ||
                                        ',' == r ||
                                        (1 == e.input.length && e.input.match(/\w/) && '(' != r)
                                        ? [d(e.tag, n.createTextNode(e.output)), t]
                                        : ((i = d(
                                              'mrow',
                                              d(e.tag, n.createTextNode(e.output)),
                                          )).appendChild(a[0]),
                                          [i, a[1]]);
                                if ((L(a[0]), 'sqrt' == e.input)) return [d(e.tag, a[0]), a[1]];
                                if (void 0 !== e.rewriteleftright)
                                    return (
                                        (i = d(
                                            'mrow',
                                            d('mo', n.createTextNode(e.rewriteleftright[0])),
                                        )).appendChild(a[0]),
                                        i.appendChild(
                                            d('mo', n.createTextNode(e.rewriteleftright[1])),
                                        ),
                                        [i, a[1]]
                                    );
                                if ('cancel' == e.input)
                                    return (
                                        (i = d(e.tag, a[0])).setAttribute(
                                            'notation',
                                            'updiagonalstrike',
                                        ),
                                        [i, a[1]]
                                    );
                                if ('boolean' == typeof e.acc && e.acc) {
                                    i = d(e.tag, a[0]);
                                    var l = d('mo', n.createTextNode(e.output));
                                    return (
                                        'vec' == e.input &&
                                            (('mrow' == a[0].nodeName &&
                                                1 == a[0].childNodes.length &&
                                                null !== a[0].firstChild.firstChild.nodeValue &&
                                                1 == a[0].firstChild.firstChild.nodeValue.length) ||
                                                (null !== a[0].firstChild.nodeValue &&
                                                    1 == a[0].firstChild.nodeValue.length)) &&
                                            l.setAttribute('stretchy', !1),
                                        i.appendChild(l),
                                        [i, a[1]]
                                    );
                                }
                                if (!u && void 0 !== e.codes)
                                    for (s = 0; s < a[0].childNodes.length; s++)
                                        if (
                                            'mi' == a[0].childNodes[s].nodeName ||
                                            'mi' == a[0].nodeName
                                        ) {
                                            r =
                                                'mi' == a[0].nodeName
                                                    ? a[0].firstChild.nodeValue
                                                    : a[0].childNodes[s].firstChild.nodeValue;
                                            for (var h = [], p = 0; p < r.length; p++)
                                                r.charCodeAt(p) > 64 && r.charCodeAt(p) < 91
                                                    ? (h += e.codes[r.charCodeAt(p) - 65])
                                                    : r.charCodeAt(p) > 96 && r.charCodeAt(p) < 123
                                                      ? (h += e.codes[r.charCodeAt(p) - 71])
                                                      : (h += r.charAt(p));
                                            'mi' == a[0].nodeName
                                                ? (a[0] = d('mo').appendChild(n.createTextNode(h)))
                                                : a[0].replaceChild(
                                                      d('mo').appendChild(n.createTextNode(h)),
                                                      a[0].childNodes[s],
                                                  );
                                        }
                                return (
                                    (i = d(e.tag, a[0])).setAttribute(e.atname, e.atval), [i, a[1]]
                                );
                            case 2:
                                if (null == (a = M((t = v(t, e.input.length))))[0])
                                    return [d('mo', n.createTextNode(e.input)), t];
                                L(a[0]);
                                var c = M(a[1]);
                                return null == c[0]
                                    ? [d('mo', n.createTextNode(e.input)), t]
                                    : (L(c[0]),
                                      ['color', 'class', 'id'].indexOf(e.input) >= 0
                                          ? ('{' == t.charAt(0)
                                                ? (s = t.indexOf('}'))
                                                : '(' == t.charAt(0)
                                                  ? (s = t.indexOf(')'))
                                                  : '[' == t.charAt(0) && (s = t.indexOf(']')),
                                            (r = t.slice(1, s)),
                                            (i = d(e.tag, c[0])),
                                            'color' === e.input
                                                ? i.setAttribute('mathcolor', r)
                                                : 'class' === e.input
                                                  ? i.setAttribute('class', r)
                                                  : 'id' === e.input && i.setAttribute('id', r),
                                            [i, c[1]])
                                          : (('root' != e.input && 'stackrel' != e.output) ||
                                                o.appendChild(c[0]),
                                            o.appendChild(a[0]),
                                            'frac' == e.input && o.appendChild(c[0]),
                                            [d(e.tag, o), c[1]]));
                            case 3:
                                return (
                                    (t = v(t, e.input.length)),
                                    [d('mo', n.createTextNode(e.output)), t]
                                );
                            case 6:
                                return (
                                    (t = v(t, e.input.length)),
                                    (i = d('mspace')).setAttribute('width', '1ex'),
                                    o.appendChild(i),
                                    o.appendChild(d(e.tag, n.createTextNode(e.output))),
                                    (i = d('mspace')).setAttribute('width', '1ex'),
                                    o.appendChild(i),
                                    [d('mrow', o), t]
                                );
                            case 9:
                                return (
                                    C++,
                                    (a = D((t = v(t, e.input.length)), !1)),
                                    C--,
                                    (r = ''),
                                    null != a[0].lastChild &&
                                        (r = a[0].lastChild.firstChild.nodeValue),
                                    '|' == r && ',' !== t.charAt(0)
                                        ? ((i = d('mo', n.createTextNode(e.output))),
                                          (i = d('mrow', i)).appendChild(a[0]),
                                          [i, a[1]])
                                        : ((i = d('mo', n.createTextNode('\u2223'))),
                                          [(i = d('mrow', i)), t])
                                );
                        }
                    }
                    function k(t) {
                        var e, i, a, s, r, o;
                        if (
                            ((i = O((t = v(t, 0)))),
                            (s = (r = M(t))[0]),
                            3 == (e = O((t = r[1]))).ttype && '/' != e.input)
                        ) {
                            if (
                                (null == (r = M((t = v(t, e.input.length))))[0]
                                    ? (r[0] = d('mo', n.createTextNode('\u25a1')))
                                    : L(r[0]),
                                (t = r[1]),
                                (o = 7 == i.ttype || 15 == i.ttype),
                                '_' == e.input)
                            )
                                if ('^' == (a = O(t)).input) {
                                    var l = M((t = v(t, a.input.length)));
                                    L(l[0]),
                                        (t = l[1]),
                                        (s = d(o ? 'munderover' : 'msubsup', s)).appendChild(r[0]),
                                        s.appendChild(l[0]),
                                        (s = d('mrow', s));
                                } else (s = d(o ? 'munder' : 'msub', s)).appendChild(r[0]);
                            else
                                '^' == e.input && o
                                    ? (s = d('mover', s)).appendChild(r[0])
                                    : (s = d(e.tag, s)).appendChild(r[0]);
                            void 0 !== i.func &&
                                i.func &&
                                3 != (a = O(t)).ttype &&
                                5 != a.ttype &&
                                (i.input.length > 1 || 4 == a.ttype) &&
                                ((r = k(t)), (s = d('mrow', s)).appendChild(r[0]), (t = r[1]));
                        }
                        return [s, t];
                    }
                    function D(t, e) {
                        var i,
                            a,
                            s,
                            r,
                            o = n.createDocumentFragment();
                        do {
                            (a = (s = k((t = v(t, 0))))[0]),
                                3 == (i = O((t = s[1]))).ttype && '/' == i.input
                                    ? (null == (s = k((t = v(t, i.input.length))))[0]
                                          ? (s[0] = d('mo', n.createTextNode('\u25a1')))
                                          : L(s[0]),
                                      (t = s[1]),
                                      L(a),
                                      (a = d(i.tag, a)).appendChild(s[0]),
                                      o.appendChild(a),
                                      (i = O(t)))
                                    : null != a && o.appendChild(a);
                        } while (
                            ((5 != i.ttype && (9 != i.ttype || e)) || 0 == C) &&
                            null != i &&
                            '' != i.output
                        );
                        if (5 == i.ttype || 9 == i.ttype) {
                            var l = o.childNodes.length;
                            if (
                                l > 0 &&
                                'mrow' == o.childNodes[l - 1].nodeName &&
                                o.childNodes[l - 1].lastChild &&
                                o.childNodes[l - 1].lastChild.firstChild
                            ) {
                                var u = o.childNodes[l - 1].lastChild.firstChild.nodeValue;
                                if (')' == u || ']' == u) {
                                    var h = o.childNodes[l - 1].firstChild.firstChild.nodeValue;
                                    if (
                                        ('(' == h && ')' == u && '}' != i.output) ||
                                        ('[' == h && ']' == u)
                                    ) {
                                        var p = [],
                                            c = !0,
                                            m = o.childNodes.length;
                                        for (r = 0; c && r < m; r += 2) {
                                            if (
                                                ((p[r] = []),
                                                (a = o.childNodes[r]),
                                                c &&
                                                    (c =
                                                        'mrow' == a.nodeName &&
                                                        (r == m - 1 ||
                                                            ('mo' == a.nextSibling.nodeName &&
                                                                ',' ==
                                                                    a.nextSibling.firstChild
                                                                        .nodeValue)) &&
                                                        a.firstChild.firstChild.nodeValue == h &&
                                                        a.lastChild.firstChild.nodeValue == u),
                                                c)
                                            )
                                                for (var f = 0; f < a.childNodes.length; f++)
                                                    ',' == a.childNodes[f].firstChild.nodeValue &&
                                                        (p[r][p[r].length] = f);
                                            c && r > 1 && (c = p[r].length == p[r - 2].length);
                                        }
                                        var g = [];
                                        if ((c = c && (p.length > 1 || p[0].length > 0))) {
                                            var y,
                                                E,
                                                x,
                                                T,
                                                b = n.createDocumentFragment();
                                            for (r = 0; r < m; r += 2) {
                                                for (
                                                    y = n.createDocumentFragment(),
                                                        E = n.createDocumentFragment(),
                                                        x = (a = o.firstChild).childNodes.length,
                                                        T = 0,
                                                        a.removeChild(a.firstChild),
                                                        f = 1;
                                                    f < x - 1;
                                                    f++
                                                )
                                                    void 0 !== p[r][T] && f == p[r][T]
                                                        ? (a.removeChild(a.firstChild),
                                                          'mrow' == a.firstChild.nodeName &&
                                                          1 == a.firstChild.childNodes.length &&
                                                          '\u2223' ==
                                                              a.firstChild.firstChild.firstChild
                                                                  .nodeValue
                                                              ? (0 == r && g.push('solid'),
                                                                a.removeChild(a.firstChild),
                                                                a.removeChild(a.firstChild),
                                                                (f += 2),
                                                                T++)
                                                              : 0 == r && g.push('none'),
                                                          y.appendChild(d('mtd', E)),
                                                          T++)
                                                        : E.appendChild(a.firstChild);
                                                y.appendChild(d('mtd', E)),
                                                    0 == r && g.push('none'),
                                                    o.childNodes.length > 2 &&
                                                        (o.removeChild(o.firstChild),
                                                        o.removeChild(o.firstChild)),
                                                    b.appendChild(d('mtr', y));
                                            }
                                            (a = d('mtable', b)).setAttribute(
                                                'columnlines',
                                                g.join(' '),
                                            ),
                                                'boolean' == typeof i.invisible &&
                                                    i.invisible &&
                                                    a.setAttribute('columnalign', 'left'),
                                                o.replaceChild(a, o.firstChild);
                                        }
                                    }
                                }
                            }
                            (t = v(t, i.input.length)),
                                ('boolean' == typeof i.invisible && i.invisible) ||
                                    ((a = d('mo', n.createTextNode(i.output))), o.appendChild(a));
                        }
                        return [o, t];
                    }
                    function P(t, e) {
                        var i;
                        return (
                            (C = 0),
                            (i = d(
                                'mstyle',
                                D(
                                    (t = (t = (t = t.replace(/&nbsp;/g, '')).replace(
                                        /&gt;/g,
                                        '>',
                                    )).replace(/&lt;/g, '<')).replace(/^\s+/g, ''),
                                    !1,
                                )[0],
                            )),
                            '' != s && i.setAttribute('mathcolor', s),
                            '' != w &&
                                (i.setAttribute('fontsize', w), i.setAttribute('mathsize', w)),
                            '' != H &&
                                (i.setAttribute('fontfamily', H), i.setAttribute('mathvariant', H)),
                            r && i.setAttribute('displaystyle', 'true'),
                            (i = d('math', i)),
                            o && i.setAttribute('title', t.replace(/\s+/g, ' ')),
                            i
                        );
                    }
                    o = !1;
                    var H = '',
                        w = ((s = ''), '');
                    !(function () {
                        for (var t = 0, e = x.length; t < e; t++)
                            x[t].codes && delete x[t].codes, x[t].func && (x[t].tag = 'mi');
                    })(),
                        t.Augment({
                            AM: {
                                Init: function () {
                                    if (
                                        ((r = t.config.displaystyle),
                                        (l = t.config.decimal || t.config.decimalsign),
                                        !t.config.fixphi)
                                    )
                                        for (var n = 0, a = x.length; n < a; n++)
                                            'phi' === x[n].input && (x[n].output = '\u03c6'),
                                                'varphi' === x[n].input &&
                                                    ((x[n].output = '\u03d5'), (n = a));
                                    var s;
                                    (s = (e = MathJax.ElementJax.mml).mbase.prototype.Init),
                                        e.mbase.Augment({
                                            firstChild: null,
                                            lastChild: null,
                                            nodeValue: null,
                                            nextSibling: null,
                                            Init: function () {
                                                var t = s.apply(this, arguments) || this;
                                                return (
                                                    (t.childNodes = t.data),
                                                    (t.nodeName = t.type),
                                                    t
                                                );
                                            },
                                            appendChild: function (t) {
                                                t.parent && t.parent.removeChild(t);
                                                var e = arguments;
                                                t.isa(i) &&
                                                    ((e = t.childNodes),
                                                    (t.data = t.childNodes = []),
                                                    (t.firstChild = t.lastChild = null));
                                                for (var n = 0, a = e.length; n < a; n++)
                                                    (t = e[n]),
                                                        this.lastChild &&
                                                            (this.lastChild.nextSibling = t),
                                                        this.firstChild || (this.firstChild = t),
                                                        this.Append(t),
                                                        (this.lastChild = t);
                                                return t;
                                            },
                                            removeChild: function (t) {
                                                for (
                                                    var e = 0, i = this.childNodes.length;
                                                    e < i && this.childNodes[e] !== t;
                                                    e++
                                                );
                                                if (e !== i)
                                                    return (
                                                        this.childNodes.splice(e, 1),
                                                        t === this.firstChild &&
                                                            (this.firstChild = t.nextSibling),
                                                        t === this.lastChild &&
                                                            (this.childNodes.length
                                                                ? (this.lastChild =
                                                                      this.childNodes[
                                                                          this.childNodes.length - 1
                                                                      ])
                                                                : (this.lastChild = null)),
                                                        e &&
                                                            (this.childNodes[e - 1].nextSibling =
                                                                t.nextSibling),
                                                        (t.nextSibling = t.parent = null),
                                                        t
                                                    );
                                            },
                                            replaceChild: function (t, e) {
                                                for (
                                                    var i = 0, n = this.childNodes.length;
                                                    i < n && this.childNodes[i] !== e;
                                                    i++
                                                );
                                                return (
                                                    i
                                                        ? (this.childNodes[i - 1].nextSibling = t)
                                                        : (this.firstChild = t),
                                                    i >= n - 1 && (this.lastChild = t),
                                                    this.SetData(i, t),
                                                    (t.nextSibling = e.nextSibling),
                                                    (e.nextSibling = e.parent = null),
                                                    e
                                                );
                                            },
                                            hasChildNodes: function (t) {
                                                return this.childNodes.length > 0;
                                            },
                                            setAttribute: function (t, e) {
                                                this[t] = e;
                                            },
                                        }),
                                        N();
                                },
                                Augment: function (t) {
                                    for (var e in t)
                                        if (t.hasOwnProperty(e)) {
                                            switch (e) {
                                                case 'displaystyle':
                                                    r = t[e];
                                                    break;
                                                case 'decimal':
                                                    decimal = t[e];
                                                    break;
                                                case 'parseMath':
                                                    P = t[e];
                                                    break;
                                                case 'parseExpr':
                                                    D = t[e];
                                                    break;
                                                case 'parseIexpr':
                                                    k = t[e];
                                                    break;
                                                case 'parseSexpr':
                                                    M = t[e];
                                                    break;
                                                case 'removeBrackets':
                                                    L = t[e];
                                                    break;
                                                case 'getSymbol':
                                                    O = t[e];
                                                    break;
                                                case 'position':
                                                    R = t[e];
                                                    break;
                                                case 'removeCharsAndBlanks':
                                                    v = t[e];
                                                    break;
                                                case 'createMmlNode':
                                                    d = t[e];
                                                    break;
                                                case 'createElementMathML':
                                                    c = t[e];
                                                    break;
                                                case 'createElementXHTML':
                                                    h = t[e];
                                                    break;
                                                case 'initSymbols':
                                                    N = t[e];
                                                    break;
                                                case 'refreshSymbols':
                                                    A = t[e];
                                                    break;
                                                case 'compareNames':
                                                    T = t[e];
                                            }
                                            this[e] = t[e];
                                        }
                                },
                                parseMath: P,
                                parseExpr: D,
                                parseIexpr: k,
                                parseSexr: M,
                                removeBrackets: L,
                                getSymbol: O,
                                position: R,
                                removeCharsAndBlanks: v,
                                createMmlNode: d,
                                createElementMathML: c,
                                createElementXHTML: h,
                                initSymbols: N,
                                refreshSymbols: A,
                                compareNames: T,
                                createDocumentFragment: i,
                                document: n,
                                define: function (t, e) {
                                    x.push({ input: t, tag: 'mo', output: e, tex: null, ttype: y }),
                                        A();
                                },
                                newcommand: function (t, e) {
                                    x.push({ input: t, tag: 'mo', output: e, tex: null, ttype: y }),
                                        A();
                                },
                                newsymbol: function (t) {
                                    x.push(t), A();
                                },
                                symbols: x,
                                names: I,
                                TOKEN: {
                                    CONST: 0,
                                    UNARY: 1,
                                    BINARY: 2,
                                    INFIX: 3,
                                    LEFTBRACKET: 4,
                                    RIGHTBRACKET: 5,
                                    SPACE: 6,
                                    UNDEROVER: 7,
                                    DEFINITION: y,
                                    LEFTRIGHT: 9,
                                    TEXT: 10,
                                    UNARYUNDEROVER: 15,
                                },
                            },
                        });
                })(MathJax.InputJax.AsciiMath),
                    (t = MathJax.InputJax.AsciiMath).Augment({
                        sourceMenuTitle: ['AsciiMathInput', 'AsciiMath Input'],
                        annotationEncoding: 'text/x-asciimath',
                        prefilterHooks: MathJax.Callback.Hooks(!0),
                        postfilterHooks: MathJax.Callback.Hooks(!0),
                        Translate: function (t) {
                            var i,
                                n = MathJax.HTML.getScript(t),
                                a = { math: n, script: t },
                                s = this.prefilterHooks.Execute(a);
                            if (s) return s;
                            n = a.math;
                            try {
                                i = this.AM.parseMath(n);
                            } catch (t) {
                                if (!t.asciimathError) throw t;
                                i = this.formatError(t, n);
                            }
                            return (
                                (a.math = e(i)),
                                this.postfilterHooks.Execute(a),
                                this.postfilterHooks.Execute(a) || a.math
                            );
                        },
                        formatError: function (t, i, n) {
                            var a = t.message.replace(/\n.*/, '');
                            return (
                                MathJax.Hub.signal.Post(['AsciiMath Jax - parse error', a, i, n]),
                                e.Error(a)
                            );
                        },
                        Error: function (t) {
                            throw MathJax.Hub.Insert(Error(t), { asciimathError: !0 });
                        },
                        Startup: function () {
                            (e = MathJax.ElementJax.mml), this.AM.Init();
                        },
                    }),
                    t.loadComplete('jax.js');
            },
            723: function (t, e) {
                'use strict';
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            649: function (t, e) {
                'use strict';
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractFindMath = MathJax._.core.FindMath.AbstractFindMath);
            },
            309: function (t, e) {
                'use strict';
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractInputJax = MathJax._.core.InputJax.AbstractInputJax);
            },
            769: function (t, e) {
                'use strict';
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.protoItem = MathJax._.core.MathItem.protoItem),
                    (e.AbstractMathItem = MathJax._.core.MathItem.AbstractMathItem),
                    (e.STATE = MathJax._.core.MathItem.STATE),
                    (e.newState = MathJax._.core.MathItem.newState);
            },
            806: function (t, e) {
                'use strict';
                e.g = MathJax._.core.MmlTree.MmlFactory.MmlFactory;
            },
            77: function (t, e) {
                'use strict';
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
            720: function (t, e) {
                'use strict';
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
    function i(n) {
        var a = e[n];
        if (void 0 !== a) return a.exports;
        var s = (e[n] = { exports: {} });
        return t[n].call(s.exports, s, s.exports, i), s.exports;
    }
    (i.g = (function () {
        if ('object' == typeof globalThis) return globalThis;
        try {
            return this || new Function('return this')();
        } catch (t) {
            if ('object' == typeof window) return window;
        }
    })()),
        (function () {
            'use strict';
            var t = i(723),
                e = i(306),
                n = i(884),
                a = i(577);
            MathJax.loader && MathJax.loader.checkVersion('input/asciimath', e.q, 'input'),
                (0, t.r8)({ _: { input: { asciimath_ts: n, asciimath: { FindAsciiMath: a } } } }),
                MathJax.startup &&
                    (MathJax.startup.registerConstructor('asciimath', n.AsciiMath),
                    MathJax.startup.useInput('asciimath'));
        })();
})();
