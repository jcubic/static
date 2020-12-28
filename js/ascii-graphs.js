(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.asciiGraphs = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){

/* Themes */

// generates a standard theme formatter
function make_standard_theme(chars, opts) {
    var block_formatter = _ => chars[0];

    var last_formatter = (fraction) => {
        if (fraction == 0) return '';
        var index = chars.length - (fraction * chars.length | 0) - 1;
        return chars[index];
    };

    var chart_width = 4;
    var divider = '|';

    return Object.assign({
        block_formatter,
        last_formatter,
        chart_width,
        divider,
    }, opts);
}

function make_basic_theme(head, tail, opts) {
    var block_formatter = _ => head;

    var last_formatter = (fraction) => {
        return tail;
    };

    var chart_width = 20;
    var divider = '|';

    return Object.assign({
        block_formatter,
        last_formatter,
        chart_width,
        divider,
    }, opts);
}

var standard_theme = make_standard_theme("█▉▊▋▌▍▎▏".split('')); // unicode 8 divisions per character block
// tribute to jim roskind - this is what you see when you visit chrome://histograms/
var jim_theme = make_basic_theme('-', 'o', { chart_width: 60, divider: '' });
var spark_line_chars = "█▇▆▅▄▃▁".split('');

var Themes = {
    standard: standard_theme,
    jim: jim_theme,
    equals: make_basic_theme('=', ']', { chart_width: 30 }),
    stars: make_basic_theme('*', ' '),
    pipes: make_standard_theme(['|'], { chart_width: 60 }),
    sparks: make_standard_theme(spark_line_chars, { chart_width: 1 }),
    bitly: make_basic_theme('∎', ' ', { chart_width: 60 }), /* bit.ly data_hacks like */

};

var times = (x) => new Array(x).fill(0);;
function fit(v, w) {
    w = w || 10;
    w = Math.max(w, v.length);
    return Array(w - v.length + 1).join(' ') + v;
}

/* Histogram */

// data is of array [0, 1, ..., n]
// or in future [{ value, label }]
function histogram_format(data, theme, options) {
    if (theme && theme.length) {
        theme = Themes[theme];
    } else {
        options = theme;
        theme = null
    }

    options = Object.assign({}, theme || standard_theme, options)

    var values = data;
    var min = options.min || Math.min(...values, 0);
    var max = options.max || Math.max(...values);
    // normalize min..max
    max -= min;
    values = values.map(v => v - min);
    var sum = values.reduce((x, y) => x + y, 0);
    var max_width = Math.max(...data.map(v => v.toFixed(0).length));
    
    var {
        block_formatter,
        last_formatter,
        chart_width,
        format = (x) => x,
        divider,
    } = options;

    var value_mapper = (v, i) => {
        var chars = v / max * chart_width;
        var blocks = times(chars | 0).map(block_formatter);
        var remainder = (chars % 1);
        var tail = last_formatter(remainder);
        var bar = blocks.join('') + tail;
        var remains = chart_width - bar.length + 1;

        var percentage = (v / sum * 100).toFixed(2) + '%';
        var value = fit(v.toFixed(0), max_width);
        var label = fit(`Item ${i}` + '', 10) + divider;

        // ${label}
        var str = `${value} ${divider}${format(bar)}${Array(remains + 1).join(' ')}${divider} ${percentage}`;

        return str;
    };

    return values.map(value_mapper);
}

/* sparkline */
function spark_line(data, options) {
    options = options || {};
    var values = data;
    var min = options.min || Math.min(...values);
    var max = options.max || Math.max(...values);
    max -= min;

    values = values.map(v => v - min);
    var sum = values.reduce((x, y) => x + y, 0);
    var avg = sum / values.length;

    var {
        block_formatter,
        last_formatter,
        chart_width,
        divider,
    } = options;

    var value_mapper = (v, i) => {
        // currently support 1 row sparkline
        var fraction = v / max;
        fraction = Math.max(Math.min(1, fraction), 0); // clamp 0..1

        // if (v === 0) return ' ';

        var index = spark_line_chars.length - (fraction * spark_line_chars.length | 0) - 1;

        return spark_line_chars[index];
    };

    var chart = values.map(value_mapper).join('');
    var stats = `Min: ${min.toFixed(2)} Avg: ${avg.toFixed(2)} Max: ${(max + min).toFixed(2)}`

    return `|${chart}| ${stats}`;
}

/* CLI helpers */

var last_lines = 0;

function clear_lines(lines) {
    var up = `\u001b[${lines}A`;
    var clear_screen = '\u001b[0J';

    process.stdout.write(up + clear_screen);
}

function clear_and_log(out) {
    if (last_lines) clear_lines(last_lines);

    last_lines = out.length;
    log(out);
}

function log(lines) {
    process.stdout.write(lines.join('\n') + '\n');
}

/* Lib Exports */

module.exports = {
    // charting apis
    histogram_format,
    spark_line,

    // CLI tools
    log,
    clear_lines,
    clear_and_log,
};

}).call(this,require('_process'))
},{"_process":1}]},{},[2])(2)
});
