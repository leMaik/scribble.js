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
      var bgImage;
      this.el = el;
      this.canvas = $(el);
      this.context = el.getContext('2d');
      this.options = $.extend({
        toolLinks: true,
        defaultTool: 'marker',
        defaultColor: '#000000',
        defaultSize: 5
      }, opts);
      this.painting = false;
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
      this.action = [];
      this.canvas.bind('click mousedown mouseup mousemove mouseleave mouseout touchstart touchmove touchend touchcancel', this.onEvent);
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
      var action, j, len, ref, shapes;
      shapes = [];
      ref = this.actions;
      for (j = 0, len = ref.length; j < len; j++) {
        action = ref[j];
        if (action.events != null) {
          shapes.push(action);
        }
      }
      return shapes;
    };

    Sketch.prototype.loadShapes = function(shapes, silent) {
      if (silent == null) {
        silent = false;
      }
      this.actions = shapes;
      this.redraw();
      if (!silent) {
        return this.canvas.trigger("change");
      }
    };

    Sketch.prototype.set = function(key, value) {
      this[key] = value;
      return this.canvas.trigger("sketch.change" + key, value);
    };

    Sketch.prototype.startPainting = function() {
      this.painting = true;
      return this.action = {
        tool: this.tool,
        color: this.color,
        size: parseFloat(this.size),
        events: []
      };
    };

    Sketch.prototype.calculateCurvature = function(p1, p2, p3) {
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
    };

    Sketch.prototype.optimize = function(action) {
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
      return action;
    };

    Sketch.prototype.stopPainting = function() {
      var old;
      old = this.getShapes();
      if (this.action) {
        this.actions.push(this.action);
      }
      this.redraw();
      this.painting = false;
      if (this.action) {
        this.canvas.trigger("change", [this.getShapes(), old]);
      }
      return this.action = null;
    };

    Sketch.prototype.onEvent = function(e) {
      if (e.originalEvent && e.originalEvent.targetTouches) {
        e.pageX = e.originalEvent.targetTouches[0].pageX;
        e.pageY = e.originalEvent.targetTouches[0].pageY;
      }
      $.sketch.tools[$(this).data('sketch').tool].onEvent.call($(this).data('sketch'), e);
      e.preventDefault();
      return false;
    };

    Sketch.prototype.redraw = function() {
      var sketch;
      this.el.width = this.canvas.width();
      this.context = this.el.getContext('2d');
      if (this.background != null) {
        this.context.drawImage(this.background, 0, 0);
      }
      sketch = this;
      $.each(this.actions, function() {
        if (this.tool) {
          return $.sketch.tools[this.tool].draw.call(sketch, this);
        }
      });
      if (this.painting && this.action) {
        return $.sketch.tools[this.action.tool].draw.call(sketch, this.action);
      }
    };

    return Sketch;

  })();
  $.sketch = {
    tools: {}
  };
  $.sketch.tools.marker = {
    onEvent: function(e) {
      switch (e.type) {
        case 'mousedown':
        case 'touchstart':
          this.startPainting();
          break;
        case 'mouseup':
        case 'mouseout':
        case 'mouseleave':
        case 'touchend':
        case 'touchcancel':
          this.stopPainting();
      }
      if (this.painting) {
        this.action.events.push({
          x: e.pageX - this.canvas.offset().left,
          y: e.pageY - this.canvas.offset().top
        });
        return this.redraw();
      }
    },
    draw: function(action) {
      var event, j, len, previous, ref;
      this.context.lineJoin = "round";
      this.context.lineCap = "round";
      this.context.beginPath();
      this.context.moveTo(action.events[0].x, action.events[0].y);
      ref = action.events;
      for (j = 0, len = ref.length; j < len; j++) {
        event = ref[j];
        this.context.lineTo(event.x, event.y);
        previous = event;
      }
      this.context.strokeStyle = action.color;
      this.context.lineWidth = action.size;
      this.context.stroke();
      return this.context.closePath();
    }
  };
  $.sketch.tools.highlighter = {
    onEvent: function(e) {
      return $.sketch.tools.marker.onEvent.call(this, e);
    },
    draw: function(action) {
      var event, j, len, previous, ref;
      this.context.lineJoin = "round";
      this.context.lineCap = "round";
      this.context.beginPath();
      this.context.moveTo(action.events[0].x, action.events[0].y);
      ref = action.events;
      for (j = 0, len = ref.length; j < len; j++) {
        event = ref[j];
        this.context.lineTo(event.x, event.y);
        previous = event;
      }
      this.context.strokeStyle = action.color;
      this.context.lineWidth = action.size;
      this.context.globalCompositeOperation = "multiply";
      this.context.stroke();
      this.context.closePath();
      return this.context.globalCompositeOperation = "source-over";
    }
  };
  return $.sketch.tools.eraser = {
    onEvent: function(e) {
      var event, inRadius, j, l, len, len1, location, newActions, otherAction, ref, ref1, remove;
      switch (e.type) {
        case 'mousedown':
        case 'touchstart':
          this.startPainting();
          break;
        case 'mouseup':
        case 'mouseout':
        case 'mouseleave':
        case 'touchend':
        case 'touchcancel':
          this.action = null;
          this.stopPainting();
      }
      if (this.painting) {
        location = {
          x: e.pageX - this.canvas.offset().left,
          y: e.pageY - this.canvas.offset().top,
          event: e.type
        };
        inRadius = function(p1, p2, r) {
          if (r == null) {
            r = 10;
          }
          return Math.abs(p1.x - p2.x) < r && Math.abs(p1.y - p2.y) < r;
        };
        newActions = [];
        ref = this.actions;
        for (j = 0, len = ref.length; j < len; j++) {
          otherAction = ref[j];
          remove = false;
          if (otherAction.events != null) {
            ref1 = otherAction.events;
            for (l = 0, len1 = ref1.length; l < len1; l++) {
              event = ref1[l];
              if (inRadius(location, event)) {
                remove = true;
                break;
              }
            }
          }
          if (!remove) {
            newActions.push(otherAction);
          }
        }
        this.actions = newActions;
        return this.redraw();
      }
    },
    draw: function(action) {}
  };
};

module.exports = sketchjs;


},{}]},{},[1])(1)
});