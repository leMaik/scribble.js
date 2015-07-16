(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sketchjs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var sketchjs,
  slice = [].slice;

sketchjs = function($) {
  var Sketch, sign;
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
  $.fn.sketch = function() {
    var args, key, sketch;
    key = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (this.length > 1) {
      $.error('Sketch.js can only be called on one element at a time.');
    }
    sketch = this.data('sketch');
    if (typeof key === 'string' && sketch) {
      if (sketch[key]) {
        if (typeof sketch[key] === 'function') {
          return sketch[key].apply(sketch, args);
        } else if (args.length === 0) {
          return sketch[key];
        } else if (args.length === 1) {
          return sketch[key] = args[0];
        }
      } else {
        return $.error('Sketch.js did not recognize the given command.');
      }
    } else if (sketch) {
      return sketch;
    } else {
      this.data('sketch', new Sketch(this.get(0), key));
      return this;
    }
  };
  Sketch = (function() {
    function Sketch(el, opts) {
      var bgImage, currentTool, getCursorPosition, painting;
      this.el = el;
      this.canvas = $(el);
      this.options = $.extend({
        toolLinks: true,
        defaultTool: 'marker',
        defaultColor: '#000000',
        defaultSize: 5
      }, opts);
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
      getCursorPosition = (function(_this) {
        return function(e) {
          if (e.originalEvent && e.originalEvent.targetTouches) {
            e.pageX = e.originalEvent.targetTouches[0].pageX;
            e.pageY = e.originalEvent.targetTouches[0].pageY;
          }
          return {
            x: e.pageX - _this.canvas.offset().left,
            y: e.pageY - _this.canvas.offset().top
          };
        };
      })(this);
      currentTool = (function(_this) {
        return function() {
          return $.sketch.tools[_this.tool];
        };
      })(this);
      painting = false;
      this.canvas.bind('mousedown touchstart', (function(_this) {
        return function(e) {
          painting = true;
          _this.actions.push({
            tool: _this.tool,
            color: _this.color,
            size: parseFloat(_this.size),
            events: []
          });
          _this.actions = currentTool().startUse.call(void 0, _this.context, getCursorPosition(e), _this.actions);
          return _this.redraw();
        };
      })(this));
      this.canvas.bind('mousemove touchmove', (function(_this) {
        return function(e) {
          if (painting) {
            _this.actions = currentTool().continueUse.call(void 0, _this.context, getCursorPosition(e), _this.actions);
            return _this.redraw();
          }
        };
      })(this));
      this.canvas.bind('mouseup mouseleave mouseout touchend touchcancel', (function(_this) {
        return function(e) {
          if (painting) {
            painting = false;
            _this.actions = currentTool().stopUse.call(void 0, _this.context, getCursorPosition(e), _this.actions);
            return _this.redraw();
          }
        };
      })(this));
      if (this.options.toolLinks) {
        $('body').delegate("a[href=\"#" + (this.canvas.attr('id')) + "\"]", 'click', function(e) {
          var $canvas, $this, j, key, len, ref, sketch;
          $this = $(this);
          $canvas = $($this.attr('href'));
          sketch = $canvas.data('sketch');
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
          return false;
        });
      }
    }

    Sketch.prototype.download = function(format) {
      var mime;
      format || (format = "png");
      if (format === "jpg") {
        format = "jpeg";
      }
      mime = "image/" + format;
      return window.open(this.el.toDataURL(mime));
    };

    Sketch.prototype.getShapes = function() {
      return this.actions.slice();
    };

    Sketch.prototype.loadShapes = function(shapes, silent) {
      var old;
      if (silent == null) {
        silent = false;
      }
      old = this.actions;
      this.actions = shapes;
      this.redraw();
      if (!silent) {
        return this.canvas.trigger("change", [this.actions, old]);
      }
    };

    Sketch.prototype.set = function(key, value) {
      this[key] = value;
      return this.canvas.trigger("sketch.change" + key, value);
    };

    Sketch.prototype.redraw = function() {
      var context, sketch;
      this.el.width = this.canvas.width();
      context = this.el.getContext('2d');
      if (this.background != null) {
        context.drawImage(this.background, 0, 0);
      }
      sketch = this;
      return $.each(this.actions, function() {
        if (this.tool) {
          return $.sketch.tools[this.tool].draw.call(void 0, this, context);
        }
      });
    };

    return Sketch;

  })();
  $.sketch = {
    tools: {}
  };
  $.sketch.tools.marker = {
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
      actions[actions.length - 1] = $.sketch.tools.marker.optimize(actions[actions.length - 1]);
      return actions;
    },
    draw: function(action, context) {
      var event, j, len, previous, ref;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(action.events[0].x, action.events[0].y);
      ref = action.events;
      for (j = 0, len = ref.length; j < len; j++) {
        event = ref[j];
        context.lineTo(event.x, event.y);
        previous = event;
      }
      context.strokeStyle = action.color;
      context.lineWidth = action.size;
      context.stroke();
      return context.closePath();
    }
  };
  $.sketch.tools.highlighter = {
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
      actions[actions.length - 1] = $.sketch.tools.marker.optimize(actions[actions.length - 1]);
      return actions;
    },
    draw: function(action, context) {
      var event, j, len, previous, ref;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(action.events[0].x, action.events[0].y);
      ref = action.events;
      for (j = 0, len = ref.length; j < len; j++) {
        event = ref[j];
        context.lineTo(event.x, event.y);
        previous = event;
      }
      context.strokeStyle = action.color;
      context.lineWidth = action.size;
      context.globalCompositeOperation = "multiply";
      context.stroke();
      context.closePath();
      return context.globalCompositeOperation = "source-over";
    }
  };
  return $.sketch.tools.eraser = {
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

module.exports = sketchjs;


},{}]},{},[1])(1)
});