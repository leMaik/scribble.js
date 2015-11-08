(function() {
  var Undo, scribblejs,
    slice = [].slice;

  Undo = require('./undo');

  scribblejs = function($) {
    var Scribble;
    $.fn.scribble = function() {
      var args, key, scribble;
      key = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (this.length > 1) {
        $.error('Scribble.js can only be called on one element at a time.');
      }
      scribble = this.data('scribble');
      if (typeof key === 'string' && scribble) {
        if (scribble[key]) {
          if (typeof scribble[key] === 'function') {
            return scribble[key].apply(scribble, args);
          } else if (args.length === 0) {
            return scribble[key];
          } else if (args.length === 1) {
            return scribble[key] = args[0];
          }
        } else {
          return $.error('Scribble.js did not recognize the given command.');
        }
      } else if (scribble) {
        return scribble;
      } else {
        this.data('scribble', new Scribble(this.get(0), key));
        return this;
      }
    };
    Scribble = (function() {
      function Scribble(el, opts) {
        var bgImage, currentTool, getCursorPosition, old, painting, stop;
        this.el = el;
        this.canvas = $(el);
        this.options = $.extend({
          toolLinks: true,
          defaultTool: 'marker',
          defaultColor: '#000000',
          defaultSize: 5,
          undo: new Undo()
        }, opts);
        this.scale = 1;
        this.color = this.options.defaultColor;
        this.size = this.options.defaultSize;
        this.tool = this.options.defaultTool;
        this.background = void 0;
        if (this.canvas.data('background') != null) {
          bgImage = new Image();
          bgImage.onload = (function(_this) {
            return function() {
              _this.background = bgImage;
              return _this.redraw();
            };
          })(this);
          bgImage.src = this.canvas.data('background');
        }
        this.actions = [];
        this._undo = this.options.undo;
        this._undo.on('undoAvailable', (function(_this) {
          return function() {
            return _this.canvas.trigger("scribble:undoAvailable");
          };
        })(this));
        this._undo.on('undoUnavailable', (function(_this) {
          return function() {
            return _this.canvas.trigger("scribble:undoUnavailable");
          };
        })(this));
        this._undo.on('redoAvailable', (function(_this) {
          return function() {
            return _this.canvas.trigger("scribble:redoAvailable");
          };
        })(this));
        this._undo.on('redoUnavailable', (function(_this) {
          return function() {
            return _this.canvas.trigger("scribble:redoUnavailable");
          };
        })(this));
        getCursorPosition = (function(_this) {
          return function(e) {
            if (e == null) {
              return {
                x: 0,
                y: 0
              };
            }
            if (e.originalEvent && e.originalEvent.targetTouches) {
              e.pageX = e.originalEvent.targetTouches[0].pageX;
              e.pageY = e.originalEvent.targetTouches[0].pageY;
            }
            return {
              x: (e.pageX - _this.canvas.offset().left) / _this.scale,
              y: (e.pageY - _this.canvas.offset().top) / _this.scale
            };
          };
        })(this);
        currentTool = (function(_this) {
          return function() {
            return $.scribble.tools[_this.tool];
          };
        })(this);
        old = [];
        painting = false;
        stop = (function(_this) {
          return function(e) {
            var undoAction;
            if (painting) {
              painting = false;
              _this.actions = currentTool().stopUse.call(void 0, _this.canvas[0].getContext('2d'), getCursorPosition(e), _this.actions, _this.scale);
              _this.redraw();
              undoAction = function(old, current) {
                return {
                  undo: function() {
                    _this.actions = old;
                    return _this.redraw();
                  },
                  redo: function() {
                    _this.actions = current;
                    return _this.redraw();
                  }
                };
              };
              _this._undo.push(undoAction(old.slice(0), _this.actions.slice(0)));
              return _this.canvas.trigger("afterPaint", [_this.actions, old]);
            }
          };
        })(this);
        this.canvas.on('scribble:toolchanged', stop);
        this.canvas.bind('mousedown touchstart', (function(_this) {
          return function(e) {
            if (!currentTool().usesMouse || !currentTool().usesMouse()) {
              if (painting) {
                stop(e);
              }
              painting = true;
              old = _this.getShapes();
              _this.actions.push({
                tool: _this.tool,
                color: _this.color,
                size: parseFloat(_this.size),
                events: []
              });
              _this.actions = currentTool().startUse.call(void 0, _this.canvas[0].getContext('2d'), getCursorPosition(e), _this.actions, _this.redraw.bind(_this), stop, _this.scale);
              return _this.redraw();
            }
          };
        })(this));
        this.canvas.bind('mousemove touchmove', (function(_this) {
          return function(e) {
            if (!currentTool().usesMouse || !currentTool().usesMouse()) {
              if (painting) {
                _this.actions = currentTool().continueUse.call(void 0, _this.canvas[0].getContext('2d'), getCursorPosition(e), _this.actions, _this.scale);
                return _this.redraw();
              }
            }
          };
        })(this));
        this.canvas.bind('mouseup mouseleave mouseout touchend touchcancel', (function(_this) {
          return function(e) {
            if (!currentTool().usesMouse || !currentTool().usesMouse()) {
              if (!currentTool().customStopHandling || !currentTool().customStopHandling()) {
                return stop(e);
              }
            }
          };
        })(this));
        if (this.options.toolLinks) {
          $('body').delegate("a[href=\"#" + (this.canvas.attr('id')) + "\"]", 'click', function(e) {
            var $canvas, $this, i, key, len, ref, sketch;
            $this = $(this);
            $canvas = $($this.attr('href'));
            sketch = $canvas.data('scribble');
            ref = ['color', 'size', 'tool'];
            for (i = 0, len = ref.length; i < len; i++) {
              key = ref[i];
              if ($this.attr("data-" + key)) {
                sketch.set.call(sketch, key, $(this).attr("data-" + key));
              }
            }
            if ($(this).attr('data-download')) {
              sketch.download.call(sketch, $(this).attr('data-download'));
            }
            if ($(this).attr('data-action')) {
              switch ($this.attr('data-action')) {
                case 'undo':
                  sketch.undo.call(sketch);
                  break;
                case 'redo':
                  sketch.redo.call(sketch);
              }
            }
            return false;
          });
        }
      }

      Scribble.prototype.download = function(format) {
        var mime;
        format || (format = "png");
        if (format === "jpg") {
          format = "jpeg";
        }
        mime = "image/" + format;
        return window.open(this.el.toDataURL(mime));
      };

      Scribble.prototype.setScale = function(scale) {
        this.scale = scale;
        return this.redraw();
      };

      Scribble.prototype.getShapes = function() {
        return this.actions.slice();
      };

      Scribble.prototype.loadShapes = function(shapes, silent) {
        var old;
        if (silent == null) {
          silent = false;
        }
        old = this.actions;
        this.actions = shapes;
        this.redraw();
        if (!silent) {
          return this.canvas.trigger("afterPaint", [this.actions, old]);
        }
      };

      Scribble.prototype.undo = function() {
        return this._undo.undo();
      };

      Scribble.prototype.redo = function() {
        return this._undo.redo();
      };

      Scribble.prototype.set = function(key, value) {
        this[key] = value;
        if (key === 'tool') {
          this.canvas.trigger('scribble:toolchanged', value);
        }
        return this.canvas.trigger("sketch.change" + key, value);
      };

      Scribble.prototype.redraw = function(predicate) {
        var action, context, i, len, newHeight, newWidth, ratio, ref, results, sketch;
        this.el.width = this.canvas.width();
        context = this.el.getContext('2d');
        if (this.background != null) {
          ratio = this.background.width / this.background.height;
          newWidth = ratio * this.canvas.height();
          newHeight = this.canvas.height();
          if (newWidth > this.canvas.width()) {
            newWidth = this.canvas.width();
            newHeight = newWidth / ratio;
          }
          context.drawImage(this.background, 0, 0, this.background.width, this.background.height, 0, 0, newWidth, newHeight);
        }
        sketch = this;
        ref = this.actions;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          action = ref[i];
          if (action.tool && (!predicate || predicate(action))) {
            results.push($.scribble.tools[action.tool].draw.call(void 0, action, context, this.scale));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      return Scribble;

    })();
    return $.scribble = {
      tools: {
        marker: require('./tools/marker'),
        highlighter: require('./tools/highlighter'),
        eraser: require('./tools/eraser'),
        text: require('./tools/text')
      }
    };
  };

  scribblejs.Undo = Undo;

  module.exports = scribblejs;

}).call(this);
