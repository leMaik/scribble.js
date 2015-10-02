(function() {
  var scribblejs,
    slice = [].slice;

  scribblejs = function($) {
    var Scribble, sign;
    sign = function(x) {
      if (typeof x === 'number') {
        if (x) {
          if (x < 0) {
            return -1;
          } else {
            return 1;
          }
        } else if (x === x) {
          return 0;
        } else {
          return NaN;
        }
      } else {
        return NaN;
      }
    };
    $.fn.scribble = function() {
      var args, key, scribble;
      key = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (this.length > 1) {
        $.error('Sketch.js can only be called on one element at a time.');
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
          defaultSize: 5
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
        this.undoStack = [];
        this.redoStack = [];
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
            if (painting) {
              painting = false;
              _this.actions = currentTool().stopUse.call(void 0, _this.canvas[0].getContext('2d'), getCursorPosition(e), _this.actions);
              _this.redraw();
              if (_this.redoStack.length > 0) {
                _this.canvas.trigger("scribble:redoUnavailable");
              }
              _this.redoStack = [];
            }
            return _this.canvas.trigger("afterPaint", [_this.actions, old]);
          };
        })(this);
        this.canvas.bind('mousedown touchstart', (function(_this) {
          return function(e) {
            painting = true;
            old = _this.getShapes();
            _this.undoStack.push(_this.getShapes());
            if (_this.undoStack.length === 1) {
              _this.canvas.trigger("scribble:undoAvailable");
            }
            if (_this.redoStack.length > 0) {
              _this.canvas.trigger("scribble:redoUnavailable");
            }
            _this.actions.push({
              tool: _this.tool,
              color: _this.color,
              size: parseFloat(_this.size),
              events: []
            });
            _this.actions = currentTool().startUse.call(void 0, _this.canvas[0].getContext('2d'), getCursorPosition(e), _this.actions, _this.redraw.bind(_this), stop);
            return _this.redraw();
          };
        })(this));
        this.canvas.bind('mousemove touchmove', (function(_this) {
          return function(e) {
            if (painting) {
              _this.actions = currentTool().continueUse.call(void 0, _this.canvas[0].getContext('2d'), getCursorPosition(e), _this.actions);
              return _this.redraw();
            }
          };
        })(this));
        this.canvas.bind('mouseup mouseleave mouseout touchend touchcancel', (function(_this) {
          return function(e) {
            if (!currentTool().customStopHandling) {
              return stop(e);
            }
          };
        })(this));
        if (this.options.toolLinks) {
          $('body').delegate("a[href=\"#" + (this.canvas.attr('id')) + "\"]", 'click', function(e) {
            var $canvas, $this, j, key, len, ref, sketch;
            $this = $(this);
            $canvas = $($this.attr('href'));
            sketch = $canvas.data('scribble');
            ref = ['color', 'size', 'tool'];
            for (j = 0, len = ref.length; j < len; j++) {
              key = ref[j];
              if ($this.attr("data-" + key)) {
                sketch.set(key, $(this).attr("data-" + key));
              }
            }
            if ($(this).attr('data-download')) {
              sketch.download($(this).attr('data-download'));
            }
            if ($(this).attr('data-action')) {
              switch ($this.attr('data-action')) {
                case 'undo':
                  sketch.undo();
                  break;
                case 'redo':
                  sketch.redo();
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
        if (this.undoStack.length > 0) {
          this.redoStack.push(this.getShapes());
          this.actions = this.undoStack.pop();
          this.redraw();
          if (this.undoStack.length === 0) {
            this.canvas.trigger("scribble:undoUnavailable");
          }
          if (this.redoStack.length === 1) {
            this.canvas.trigger("scribble:redoAvailable");
          }
          return true;
        }
        return false;
      };

      Scribble.prototype.redo = function() {
        if (this.redoStack.length > 0) {
          this.undoStack.push(this.getShapes());
          this.actions = this.redoStack.pop();
          this.redraw();
          if (this.undoStack.length === 1) {
            this.canvas.trigger("scribble:undoAvailable");
          }
          if (this.redoStack.length === 0) {
            this.canvas.trigger("scribble:redoUnavailable");
          }
          return true;
        }
        return false;
      };

      Scribble.prototype.set = function(key, value) {
        this[key] = value;
        return this.canvas.trigger("sketch.change" + key, value);
      };

      Scribble.prototype.redraw = function() {
        var action, context, j, len, newHeight, newWidth, ratio, ref, results, sketch;
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
        for (j = 0, len = ref.length; j < len; j++) {
          action = ref[j];
          if (action.tool) {
            results.push($.scribble.tools[action.tool].draw.call(void 0, action, context, this.scale));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      return Scribble;

    })();
    $.scribble = {
      tools: {}
    };
    $.scribble.tools.marker = {
      calculateCurvature: function(p1, p2, p3) {
        var crossZ, k, phi, r1, r2;
        r1 = {
          x: p2.x - p1.x,
          y: p2.y - p1.y
        };
        r2 = {
          x: p2.x - p3.x,
          y: p2.y - p3.y
        };
        crossZ = r1.x * r2.y - r2.x * r1.y;
        if (crossZ === 0) {
          crossZ = 1;
        }
        phi = sign(crossZ) * Math.acos((r1.x * r2.x + r1.y * r2.y) / (Math.sqrt(r1.x * r1.x + r1.y * r1.y) * Math.sqrt(r2.x * r2.x + r2.y * r2.y)));
        k = 2 / Math.tan(phi / 2);

        /*
        k is always positive, as acos maps to 0 to pi, but it is important to also consider
        negative phi's. On a Line all curvature fluctations should nearly cancel themselves out
        the sign can be calculated using the cross product where the direction of the
        z component determines the sign
                     |       0        |
            a x b =  |       0        |  => sign ( ax by - bx ay)
                     | ax by - bx ay  |
         */
        return k;
      },
      optimize: function(action) {
        var curvatureThreshold, i, j, k, last, newPath, path, ref;
        curvatureThreshold = 0.08;
        path = action.events;
        newPath = [path[0]];
        last = 0;
        for (i = j = 0, ref = path.length - 2; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          k = this.calculateCurvature(path[last], path[i], path[i + 1]);
          if (Math.abs(k) > curvatureThreshold) {
            last = i;
            newPath.push(path[i]);
          }
        }
        newPath.push(path[path.length - 1]);
        action.events = newPath;
        return action;
      },
      startUse: function(context, position, actions) {
        actions[actions.length - 1].events.push(position);
        return actions;
      },
      continueUse: function(context, position, actions) {
        actions[actions.length - 1].events.push(position);
        return actions;
      },
      stopUse: function(context, position, actions) {
        actions[actions.length - 1].events.push(position);
        actions[actions.length - 1] = $.scribble.tools.marker.optimize(actions[actions.length - 1]);
        return actions;
      },
      draw: function(action, context, scale) {
        var event, j, len, previous, ref;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(action.events[0].x * scale, action.events[0].y * scale);
        ref = action.events;
        for (j = 0, len = ref.length; j < len; j++) {
          event = ref[j];
          context.lineTo(event.x * scale, event.y * scale);
          previous = event;
        }
        context.strokeStyle = action.color;
        context.lineWidth = action.size * scale;
        context.stroke();
        return context.closePath();
      }
    };
    $.scribble.tools.highlighter = {
      startUse: function(context, position, actions) {
        actions[actions.length - 1].events.push(position);
        return actions;
      },
      continueUse: function(context, position, actions) {
        actions[actions.length - 1].events.push(position);
        return actions;
      },
      stopUse: function(context, position, actions) {
        actions[actions.length - 1].events.push(position);
        actions[actions.length - 1] = $.scribble.tools.marker.optimize(actions[actions.length - 1]);
        return actions;
      },
      draw: function(action, context, scale) {
        var event, j, len, previous, ref;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(action.events[0].x * scale, action.events[0].y * scale);
        ref = action.events;
        for (j = 0, len = ref.length; j < len; j++) {
          event = ref[j];
          context.lineTo(event.x * scale, event.y * scale);
          previous = event;
        }
        context.strokeStyle = action.color;
        context.lineWidth = action.size * scale;
        context.globalCompositeOperation = "multiply";
        context.stroke();
        context.closePath();
        return context.globalCompositeOperation = "source-over";
      }
    };
    $.scribble.tools.text = {
      customStopHandling: true,
      _determineFontHeight: function(fontStyle) {
        var body, dummy, dummyText, result;
        body = document.getElementsByTagName("body")[0];
        dummy = document.createElement("div");
        dummyText = document.createTextNode("M");
        dummy.appendChild(dummyText);
        dummy.setAttribute("style", fontStyle);
        body.appendChild(dummy);
        result = dummy.offsetHeight;
        body.removeChild(dummy);
        return result;
      },
      startUse: function(context, position, actions, redraw, stop) {
        var event;
        $('body').off('.sketchjstexttool');
        event = {
          text: '',
          x: position.x,
          y: position.y
        };
        actions[actions.length - 1].events.push(event);
        $('body').on('keydown.sketchjstexttool', function(e) {
          var events, fh;
          if (e.keyCode === 13) {
            e.preventDefault();
            if (e.shiftKey) {
              fh = $.sketch.tools.text._determineFontHeight(context.fontStyle);
              event = {
                text: '',
                x: event.x,
                y: event.y + fh
              };
              return actions[actions.length - 1].events.push(event);
            } else {
              $('body').off('.sketchjstexttool');
              return stop();
            }
          } else if (e.keyCode === 8) {
            e.preventDefault();
            if (event.text.length === 0) {
              events = actions[actions.length - 1].events;
              if (events.length > 1) {
                events.pop();
                event = events[events.length - 1];
              }
            } else {
              event.text = event.text.substring(0, event.text.length - 1);
            }
            return redraw();
          }
        });
        $('body').on('keypress.sketchjstexttool', function(e) {
          event.text += String.fromCharCode(e.charCode);
          redraw();
          return e.preventDefault();
        });
        return actions;
      },
      continueUse: function(context, position, actions) {
        return actions;
      },
      stopUse: function(context, position, actions) {
        return actions;
      },
      draw: function(action, context, scale) {
        var event, j, len, ref, results;
        context.fillStyle = action.color;
        ref = action.events;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          event = ref[j];
          context.font = (action.size * scale) + 'px Arial';
          results.push(context.fillText(event.text, event.x * scale, event.y * scale));
        }
        return results;
      }
    };
    return $.scribble.tools.eraser = {
      startUse: function(context, position, actions) {
        actions.pop();
        return actions;
      },
      continueUse: function(context, position, actions) {
        var event, inRadius, j, l, len, len1, newActions, otherAction, ref, remove;
        inRadius = function(p1, p2, r) {
          if (r == null) {
            r = 10;
          }
          return Math.abs(p1.x - p2.x) < r && Math.abs(p1.y - p2.y) < r;
        };
        newActions = [];
        for (j = 0, len = actions.length; j < len; j++) {
          otherAction = actions[j];
          remove = false;
          if (otherAction.events != null) {
            ref = otherAction.events;
            for (l = 0, len1 = ref.length; l < len1; l++) {
              event = ref[l];
              if (inRadius(position, event)) {
                remove = true;
                break;
              }
            }
          }
          if (!remove) {
            newActions.push(otherAction);
          }
        }
        return newActions;
      },
      stopUse: function(context, position, actions) {
        return actions;
      },
      draw: function(action, context) {}
    };
  };

  module.exports = scribblejs;

}).call(this);
