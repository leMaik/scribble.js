(function() {
  var EventEmitter,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  EventEmitter = (function() {
    function EventEmitter() {}

    EventEmitter.prototype.on = function() {
      var base, eventName, handlers, i, l, len, listeners;
      eventName = arguments[0], listeners = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      this._events || (this._events = []);
      handlers = (base = this._events)[eventName] || (base[eventName] = []);
      for (i = 0, len = listeners.length; i < len; i++) {
        l = listeners[i];
        if (indexOf.call(handlers, l) < 0) {
          handlers.push(l);
        }
      }
      return this;
    };

    EventEmitter.prototype.off = function() {
      var eventName, listeners;
      eventName = arguments[0], listeners = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (eventName) {
        if (!this._events[eventName]) {
          return;
        }
        if (listeners.length > 0) {
          return this._events[eventName] = this._events[eventName].filter(function(h) {
            return indexOf.call(listeners, h) < 0;
          });
        } else {
          return this._events[eventName] = [];
        }
      } else {
        return this._events = [];
      }
    };

    EventEmitter.prototype.trigger = function() {
      var args, eventName, handler, i, len, ref, results;
      eventName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (this._events[eventName]) {
        ref = this._events[eventName];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          handler = ref[i];
          results.push(handler(args));
        }
        return results;
      }
    };

    return EventEmitter;

  })();

  module.exports = EventEmitter;

}).call(this);
