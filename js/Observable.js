// ES Next Observable code taken from proposal repo and run through babel
// (+ removed exports)
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// === Symbol Polyfills ===

function polyfillSymbol(name) {

    if (!Symbol[name]) Object.defineProperty(Symbol, name, { value: Symbol(name) });
}

polyfillSymbol("observable");

// === Abstract Operations ===

function nonEnum(obj) {

    Object.getOwnPropertyNames(obj).forEach(function (k) {
        Object.defineProperty(obj, k, { enumerable: false });
    });

    return obj;
}

function getMethod(obj, key) {

    var value = obj[key];

    if (value == null) return undefined;

    if (typeof value !== "function") throw new TypeError(value + " is not a function");

    return value;
}

function cleanupSubscription(subscription) {

    // Assert:  observer._observer is undefined

    var cleanup = subscription._cleanup;

    if (!cleanup) return;

    // Drop the reference to the cleanup function so that we won't call it
    // more than once
    subscription._cleanup = undefined;

    // Call the cleanup function
    try {
        cleanup();
    } catch (e) {
        // HostReportErrors(e);
    }
}

function subscriptionClosed(subscription) {

    return subscription._observer === undefined;
}

function closeSubscription(subscription) {

    if (subscriptionClosed(subscription)) return;

    subscription._observer = undefined;
    cleanupSubscription(subscription);
}

function cleanupFromSubscription(subscription) {
    return function (_) {
        subscription.unsubscribe();
    };
}

function Subscription(observer, subscriber) {
    // Assert: subscriber is callable
    // The observer must be an object
    this._cleanup = undefined;
    this._observer = observer;

    // If the observer has a start method, call it with the subscription object
    try {
        var start = getMethod(observer, "start");

        if (start) {
            start.call(observer, this);
        }
    } catch (e) {}
    // HostReportErrors(e);


    // If the observer has unsubscribed from the start method, exit
    if (subscriptionClosed(this)) return;

    observer = new SubscriptionObserver(this);

    try {

        // Call the subscriber function
        var cleanup = subscriber.call(undefined, observer);

        // The return value must be undefined, null, a subscription object, or a function
        if (cleanup != null) {
            if (typeof cleanup.unsubscribe === "function") cleanup = cleanupFromSubscription(cleanup);else if (typeof cleanup !== "function") throw new TypeError(cleanup + " is not a function");

            this._cleanup = cleanup;
        }
    } catch (e) {

        // If an error occurs during startup, then send the error
        // to the observer.
        observer.error(e);
        return;
    }

    // If the stream is already finished, then perform cleanup
    if (subscriptionClosed(this)) {
        cleanupSubscription(this);
    }
}

Subscription.prototype = nonEnum({
    get closed() {
        return subscriptionClosed(this);
    },
    unsubscribe: function unsubscribe() {
        closeSubscription(this);
    }
});

function SubscriptionObserver(subscription) {
    this._subscription = subscription;
}

SubscriptionObserver.prototype = nonEnum({

    get closed() {

        return subscriptionClosed(this._subscription);
    },

    next: function next(value) {

        var subscription = this._subscription;

        // If the stream if closed, then return undefined
        if (subscriptionClosed(subscription)) return undefined;

        var observer = subscription._observer;

        try {
            var m = getMethod(observer, "next");

            // If the observer doesn't support "next", then return undefined
            if (!m) return undefined;

            // Send the next value to the sink
            m.call(observer, value);
        } catch (e) {
            // HostReportErrors(e);
        }
        return undefined;
    },
    error: function error(value) {

        var subscription = this._subscription;

        // If the stream is closed, throw the error to the caller
        if (subscriptionClosed(subscription)) {
            return undefined;
        }

        var observer = subscription._observer;
        subscription._observer = undefined;

        try {

            var m = getMethod(observer, "error");

            // If the sink does not support "complete", then return undefined
            if (m) {
                m.call(observer, value);
            } else {
                // HostReportErrors(e);
            }
        } catch (e) {
            // HostReportErrors(e);
        }

        cleanupSubscription(subscription);

        return undefined;
    },
    complete: function complete() {

        var subscription = this._subscription;

        // If the stream is closed, then return undefined
        if (subscriptionClosed(subscription)) return undefined;

        var observer = subscription._observer;
        subscription._observer = undefined;

        try {

            var m = getMethod(observer, "complete");

            // If the sink does not support "complete", then return undefined
            if (m) {
                m.call(observer);
            }
        } catch (e) {
            // HostReportErrors(e);
        }

        cleanupSubscription(subscription);

        return undefined;
    }
});

var Observable = function () {

    // == Fundamental ==

    function Observable(subscriber) {
        _classCallCheck(this, Observable);

        // The stream subscriber must be a function
        if (typeof subscriber !== "function") throw new TypeError("Observable initializer must be a function");

        this._subscriber = subscriber;
    }

    _createClass(Observable, [{
        key: "subscribe",
        value: function subscribe(observer) {
            if (typeof observer === "function") {
                observer = {
                    next: observer,
                    error: arguments.length <= 1 ? undefined : arguments[1],
                    complete: arguments.length <= 2 ? undefined : arguments[2]
                };
            } else if ((typeof observer === "undefined" ? "undefined" : _typeof(observer)) !== "object") {
                observer = {};
            }

            return new Subscription(observer, this._subscriber);
        }
    }, {
        key: Symbol.observable,
        value: function value() {
            return this;
        }

        // == Derived ==

    }], [{
        key: "from",
        value: function from(x) {

            var C = typeof this === "function" ? this : Observable;

            if (x == null) throw new TypeError(x + " is not an object");

            var method = getMethod(x, Symbol.observable);

            if (method) {

                var observable = method.call(x);

                if (Object(observable) !== observable) throw new TypeError(observable + " is not an object");

                if (observable.constructor === C) return observable;

                return new C(function (observer) {
                    return observable.subscribe(observer);
                });
            }

            method = getMethod(x, Symbol.iterator);

            if (!method) throw new TypeError(x + " is not observable");

            return new C(function (observer) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {

                    for (var _iterator = method.call(x)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var item = _step.value;


                        observer.next(item);

                        if (observer.closed) return;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                observer.complete();
            });
        }
    }, {
        key: "of",
        value: function of() {
            for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
                items[_key] = arguments[_key];
            }

            var C = typeof this === "function" ? this : Observable;

            return new C(function (observer) {

                for (var i = 0; i < items.length; ++i) {

                    observer.next(items[i]);

                    if (observer.closed) return;
                }

                observer.complete();
            });
        }
    }]);

    return Observable;
}();
