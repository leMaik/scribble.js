(function() {
  var EventEmitter, Undo,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('event-emitter');

  Undo = (function(superClass) {
    extend(Undo, superClass);

    function Undo() {
      this.undoStack = [];
      this.redoStack = [];
    }

    Undo.prototype.push = function(action) {
      this.undoStack.push(action);
      if (this.undoStack.length === 1) {
        this.trigger('undoAvailable');
      }
      if (this.redoStack.length > 0) {
        this.redoStack = [];
        return this.trigger('redoUnavailable');
      }
    };

    Undo.prototype.undo = function() {
      var action;
      if (this.undoStack.length > 0) {
        action = this.undoStack.pop();
        action.undo();
        this.redoStack.push(action);
        if (this.undoStack.length === 0) {
          this.trigger('undoUnavailable');
        }
        if (this.redoStack.length === 1) {
          return this.trigger('redoAvailable');
        }
      }
    };

    Undo.prototype.redo = function() {
      var action;
      if (this.redoStack.length > 0) {
        action = this.redoStack.pop();
        action.redo();
        this.undoStack.push(action);
        if (this.undoStack.length === 1) {
          this.trigger('undoAvailable');
        }
        if (this.redoStack.length === 0) {
          return this.trigger('redoUnavailable');
        }
      }
    };

    return Undo;

  })(EventEmitter);

  module.exports = Undo;

}).call(this);
