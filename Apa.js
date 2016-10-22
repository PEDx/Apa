// name     : Apa.js
// version  : 1.0.0
// author   : ped <pedclubsite@gmial.com>
// date     : 2016-08-25


(function() {
    var arr = [],
        push = arr.push,
        splice = arr.splice,
        sort = arr.sort,
        slice = arr.slice;

    // 浏览器特性检测
    var support = {};
    support.getElementsByClassName = function() {
        var nativeReg = /^[^{]]\s*native\w/;
        return nativeReg.test(document.getElementsByClassName);
    };
    support.addEventListener = !!window.addEventListener;
    support.attachEvent = !!window.attachEvent;
    support.removeEventListener = !!window.removeEventListener;
    support.detachEvent = !!window.detachEvent;
    if (!support.getElementsByClassName) {
        getElementsByClassName = function(classValue) {
            var arr = [],
                context = this.nodeType === 1 ? this : document;
            Apa.each(context.getElementsByTagName('*'), function() {
                if ((' ' + context.className + ' ').indexOf(' ' + classValue + ' ') !== -1) arr.push(this);
            });
            return arr;
        };
    }

    // 核心构造函数
    var Apa = function(selector, context) {
        return new Apa.prototype._init(selector, context);
    };
    Apa.prototype = {
        constructor: 'Apa',
        // 每个Apa对象都要维护一个自己的length属性，由apply借用数组方法push来完成
        length: 0,
        // split 添加数组的属性后可以构造出Object[0] 对象
        splice: splice,
        slice: slice,
        selector: '',
        _init: function(selector, context) {
            if (Apa.isString(selector)) { //
                var firstChar = selector.charAt(0);
                if (firstChar === '<') {
                    push.apply(this, Apa.parseHtml(selector));
                } else {
                    push.apply(this, select(selector, context));
                    this.selector = selector;
                }
            } else if (Apa.isDOM(selector)) { //
                this[0] = selector;
                this.length = 1;
            } else if (Apa.isApa(selector)) {
                return selector;
            } else if (Apa.isArrayLike(selector)) {
                push.apply(this, selector);
            }
            return this;
        },
    };
    // 改变init的原型指向 新创建的Apa对象原型指向变为Apa
    Apa.prototype._init.prototype = Apa.prototype;

    // 简写prototype属性
    Apa.fn = Apa.prototype;

    Apa.fn.extend = Apa.extend = function(obj) {
        for (var key in obj) {
            this[key] = obj[key];
        }
    };

    // 给Apa对象添加静态方法
    Apa.extend({
        parseHtml: function(htmlString) {
            var _dv = document.createElement('div'),
                results = [];
            _dv.innerHTML = htmlString;
            push.apply(results, _dv.childNodes);
            return results;
        },
        each: function(obj, fn) {
            if (obj.length && obj.length >= 0) {
                // fn.apply(obj[i], i, obj[i] );
                for (var i = 0, len = obj.length; i < len; i++) {
                    // 用call是为了在执行fn时返回false能控制迭代
                    // 对于 each 的实现来说 下标 i 为第一个参数是合理的,因为其回调函数内 this 就可以取到迭代的当前项,
                    if (fn.call(obj[i], i, obj[i]) === false) break;
                }
            } else {
                for (var key in obj) {
                    if (fn.call(obj[key], key, obj[key]) === false) break;
                }
            }
        },
        trim: function(str) {
            if (String.prototype.trim) {
                return str.trim();
            } else {
                return str.replace(/^\s+|\s+$/, '');
            }
        },
        isDOM: function(obj) {
            return !!obj.nodeType;
        },
        isString: function(obj) {
            return typeof obj === 'string';
        },
        isFunction: function(obj) {
            return typeof obj === 'function';
        },
        isArrayLike: function(obj) {
            return obj.length && obj.length >= 0;
        },
        isApa: function(obj) {
            return 'selector' in obj;
        },
        nextElementSibling: function(node) {
            while (node = node.nextSibling) {
                if (node.nodeType === 1) {
                    return node;
                }
            }
            return null;
        },
        nextElementSiblingAll: function(node) {
            var arr = [];
            while (node = node.nextSibling) {
                if (node.nodeType === 1) {
                    arr.push(node);
                }
            }
            return arr;
        },
        toClass: function(className) { //格式化类名
            var cls = Apa.trim(className);
            cls = cls.replace(/\s{2,}/, ' ');
            return ' ' + cls + ' ';
        },
        getTxtContent: function(node) {
            var child = node.childNodes,
                txtArr = [];
            Apa.each(child, function() {
                if (this.nodeType === 3) {
                    txtArr.push(this);
                } else if (this.nodeType === 1) {
                    txtArr = txtArr.concat(getTxtContent(this));
                }
            });
            return txtArr.join('');
        },
    });

    // 在原型上添加各种方法
    // DOM操作
    Apa.fn.extend({
        each: function(callback) {
            Apa.each(this, callback);
            return this;
        },
        appendTo: function(selector) {
            var target = Apa(selector),
                source = this,
                arr = [],
                len = target.length - 1;
            target.each(function(i) {
                var that = this;
                source.each(function() {
                    srcNode = (i === len) ? this : this.cloneNode(true);
                    that.appendChild(srcNode);
                    arr.push(srcNode);
                });
            });
            return Apa(arr);
        },
        append: function(selector) {
            Apa(selector).appendTo(this);
            return this;
        },
        prependTo: function(selector) {
            var target = Apa(selector),
                source = [].reverse.call(this),
                arr = [],
                stack = [];
            len = target.length - 1;
            target.each(function(i) {
                var that = this;
                source.each(function() {
                    srcNode = (i === len) ? this : this.cloneNode(true);
                    that.insertBefore(srcNode, that.firstChild);
                    stack.push(srcNode);
                });
                source.each(function() {
                    arr.push(stack.pop());
                });
            });
            return Apa(arr);
        },
        prepend: function(selector) {
            Apa(selector).prependTo(this);
            return this;
        },
        remove: function() {
            return this.each(function() {
                this.parentNode.removeChild(this);
            });
        },
        next: function() {
            var arr = [],
                node = null;
            this.each(function() {
                node = Apa.nextElementSibling(this);
                if (node !== null) {
                    arr.push(node);
                }
            });
            return Apa(arr);
        },
        nextAll: function() {
            var arr = [];
            this.each(function() {
                arr.concat(Apa.nextElementSiblingAll(this));
            });
            return Apa(arr);
        }
    });

    // 事件方法
    Apa.fn.extend({
        on: function(eventName, handler) {
            if (support.addEventListener) {
                this.each(function() {
                    this.addEventListener(eventName, handler, false);
                });
            } else if (support.attachEvent) {
                this.each(function() {
                    var that = this;
                    this.attachEvent('on' + eventName, function() {
                        // ie浏览器中handler函数中无法用this取得调用它的对象，而是指向window，且函数中无法取得evnet对象，
                        // 同样这个对象被放在了window上,y因此要手动绑定this和传入event对象。
                        handler.call(that, window.event);
                    });
                });
            } else {
                this.each(function() {
                    var that = this,
                        oldHandler = this['on' + eventName];
                    // 实现绑定多次同名事件处理函数
                    if (typeof oldHandler !== 'function') { // 如果同名事件还未绑定函数
                        this['on' + eventName] = function(event) {
                            // 兼容ie浏览器handler中没有event以及无法正确取得this
                            e = event || window.event;
                            handler.call(that, e);
                        };
                    } else {
                        this['on' + eventName] = function(event) {
                            // 兼容ie浏览器handler中没有event以及无法正确取得this
                            e = event || window.event;
                            oldHandler.call(that, e);
                            handler.call(that, e);
                        };
                    }
                });
            }
            return this;
        },
        off: function(eventName, handler) {
            if (support.removeEventListener) {
                this.each(function() {
                    this.removeEventListener(eventName, handler, false);
                });
            } else if (support.detachEvent) {
                this.each(function() {
                    this.detachEvent('on' + eventName, handler);
                });
            } else {
                this.each(function() {
                    this['on' + eventName] = null;
                });
            }
            return this;
        },
    });
    // 一次性在Apa对象原型上添加各种事件
    var eventList = ("blur,focus,load,resize,scroll,unload,click,dblclick," +
        "mousedown,mouseup,mousemove,mouseover,mouseout,change,reset,select," +
        "submit,keydown,keypress,keyup,error").split(",");
    Apa.each(eventList, function(index, value) {
        var that = this;
        Apa.fn[value] = function(handler) {
            return this.on(that, handler);
        };
    });

    // 属性操作方法
    var booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped";
    Apa.fn.extend({
        val: function(_val) {
            if (arguments.length === 0) {
                return this[0].value;
            }
            if (_val === undefined || _val === null) {
                _val = '';
            }
            return this.each(function() {
                this.value = _val;
            });
        },
        html: function(htmlString) {
            if (htmlString === undefined) {
                return this[0].innerHTML;
            }
            return this.each(function() {
                this.innerHTML = htmlString;
            });
        },
        attr: function(name, value) {
            if (arguments.length === 1) {
                if (booleans.indexOf(name) > -1) {
                    return this[0][name];
                } else {
                    return this[0].getAttribute(name);
                }
            }
            if (booleans.indexOf(name) > -1) {
                this.each(function() {
                    this[name] = value;
                });
            } else {
                this.each(function() {
                    this.setAttribute(name, value);
                });
            }
            return this;
        },
        text: function(str) {
            // textContent 与 innerText 不同点在于，前者获取文本会将空格制表符等获取到，后者不会
            // 前者在会获取<script> 和 <style>以及隐藏后的标签中的文本，后者不会
            // 前者不会引发重排，后者会
            if (typeof str === undefined) {
                var txtArr = [];
                if (textContent in this[0]) {
                    this.each(function() {
                        txtArr.push(this.textContent);
                    });
                } else {
                    this.each(function() {
                        txtArr.push(Apa.getTxtContent(this));
                    });
                }
                return txtArr.join('');
            }
            if ('textContent' in this[0]) {
                this.each(function() {
                    this.textContent = str;
                });
            } else {
                this.each(function() {
                    var txt = document.createTextNode(str);
                    this.innerHTML = '';
                    this.appendChild(txt);
                });
            }
        },
    });

    // 样式操作方法
    Apa.fn.extend({
        hasClass: function(_clasName) {
            var hasCls = false;
            _clasName = Apa.toClass(_clasName);
            this.each(function() {
                if (Apa.toClass(this.className).indexOf(_clasName) !== -1) {
                    hasCls = true;
                    return false;
                } // 返回false是为了中断循环
            });
            return hasCls;
        },
        addClass: function(_clasName) {
            _clasName = Apa.toClass(_clasName);
            return this.each(function() {
                if (!Apa(this).hasClass(_clasName)) {
                    var cls = Apa.trim(this.className) + _clasName;
                    this.className = Apa.trim(cls);
                }
            });
        },
        removeClass: function(_clasName) {
            _clasName = Apa.toClass(_clasName);
            return this.each(function() {
                if (Apa(this).hasClass(_clasName)) {
                    var cls = Apa.toClass(this.className).replace(_clasName, ' ');
                    this.className = Apa.trim(cls);
                }
            });
        },
        toggleClass: function(_clasName) {
            _clasName = Apa.toClass(_clasName);
            return this.each(function() {
                Apa(this).hasClass(_clasName) ? Apa(this).removeClass(_clasName) : Apa(this).addClass(_clasName);
            });
        },
    });

    // 动画函数扩展
    var easeFuncLis = {
        linear: function(x, t, b, c, d) {
            return t * (c - b) / d;
        },
        swing: function(x, t, b, c, d) {
            var a = 2 * (c - b) / (d * d),
                v_0 = a * d;
            return v_0 * t - 1 / 2 * a * t * t;
        },
        easeinQuad: function(x, t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeoutQuad: function(x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeinoutQuad: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
    }
    var targetKey = {
        left: 'offsetLeft',
        top: 'offsetTop',
        width: 'offsetWidth',
        height: 'offsetHeight'
    };

    function getStartPosition(node, target) {
        var obj = {};
        for (var key in target) {
            obj[key] = node[targetKey[key]];
        }
        return obj;
    }

    function getDistance(node, target) {
        var obj = {};
        for (var key in target) {
            obj[key] = target[key] - node[targetKey[key]];
        }
        return obj;
    }

    function getTweens(node, passingTime, startPositions, target, duration, easeFunc) {
        var obj = {};
        for (var key in target) {
            obj[key] = easeFuncLis[easeFunc](null, passingTime, startPositions[key], target[key], duration);
        }
        return obj;
    }

    function setStyle(node, startPositions, target, tween) {
        for (var key in target) {
            node.style[key] = startPositions[key] + tween[key] + 'px';
        }
    }
    // linear: function(x, passingTime, startPositions, target, duration) {
    //      return passingTime * (target - startPositions) / duration
    // },
    // 动画模块
    Apa.fn.extend({
        animate: function(target, duration, easing, fn) {
            this.each(function() {
                var node = this,
                    startPositions = getStartPosition(node, target),
                    distance = getDistance(node, target),
                    starTime = +new Date(),
                    passingTime = 0,
                    tween = 0,
                    timer = null;

                function play() {
                    passingTime = +new Date() - starTime;
                    if (passingTime >= duration) {
                        tween = distance;
                        if (fn) fn.call(Apa(node));
                        clearInterval(timer);
                    } else {
                        tween = getTweens(null, passingTime, startPositions, target, duration, easing);
                    }
                    setStyle(node, startPositions, target, tween);
                }
                play();
                timer = setInterval(play, 20);
            });
        },
    });

    // 模板引擎
    Apa.extend({
        templateConfig: {
            start: '<%',
            end: "%>",
            interpolate: /<%=(.+?)%>/g,
        },
        // 将逃逸字符前自动加上 反斜线 \
        escapeRegExp: function(s) {
            return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
        },
        template: function(str, data) {
            var tem = Apa.templateConfig,
                // 构造可配置的模板尾标志正则表达式
                endMatch = new RegExp("'(?=[^" + tem.end.substr(0, 1) + "]*" + Apa.escapeRegExp(tem.end) + ")", "g"),
                functionBodyString = "var p=[],print=function(){p.push.apply(p,arguments);};" +
                'with(obj){p.push(\'' +
                str.replace(/[\t\n\r]/g, " ")
                .replace(endMatch, "\t")
                .split("'").join("\\")
                .split("\t").join("'")
                .replace(tem.interpolate, "',$1,'")
                .split(tem.start).join("');")
                .split(tem.end).join("p.push('") +
                "')}return p.join('');",
                fn = new Function('obj', functionBodyString);
            return data ? fn(data) : fn;
        },
    });

    // 选择器模块
    // TODO: 去重问题
    var select = (function(selector, context, results) {
        function getApaById(id, results) {
            results = results || [];
            push.apply(results, [document.getElementById(id)]);
            // results.push(document.getElementById(id));
            return results;
        }

        function getApasByClassName(className, context, results) {
            results = results || [];
            context = context || document;
            push.apply(results, context.getElementsByClassName(className));
            return results;
        }

        function getApasByTagName(tag, context, results) {
            results = results || [];
            context = context || document;
            push.apply(results, context.getElementsByTagName(tag));
            return results;
        }
        // 匹配id class tag
        var quickReg = /^(?:#([\w-]+)|\.([\w-]+)|([\w-]+)|(\*))$/;
        // get 方法返回一个包裹dom对象的数组
        function get(selector, context, results) {
            context = context || document;
            results = results || [];
            // 此处实现了后代选择器
            var m = quickReg.exec(selector);
            if (m) {
                if (Apa.isDOM(context)) context = [context];
                if (Apa.isString(context)) context = get(context);
                Apa.each(context, function() {
                    if (m[1]) {
                        push.apply(results, getApaById(m[1]));
                    } else if (m[2]) {
                        push.apply(results, getApasByClassName(m[2], this));
                    } else {
                        push.apply(results, getApasByTagName(selector, this));
                    }
                });
            }
            return results;
        }

        function select(selector, context, results) {
            if (!selector) return results;
            context = context || document;
            results = results || [];
            var seleLis = selector.split(',');
            // 此处实现并集选择器
            Apa.each(seleLis, function() {
                var ctx = context;
                Apa.each(Apa.trim(this).split(' '), function() {
                    if ((this + '') !== '') {
                        ctx =  get(this, ctx); // 此处将context更新为最新后代，直到没有后代
                    }
                });
                push.apply(results, ctx); // 返回
            });
            return results;
        }
        return select;
    })();
    // 给Apa本身扩展select属性
    Apa.extend({
        select: select,
    });
    // 暴露库的接口
    window.A = window.Apa = Apa;
})(window);
