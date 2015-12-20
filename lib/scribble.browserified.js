(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.scribblejs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var canvastext, drawtext, fontHeight, textSelection;

  fontHeight = require('./fontHeight');

  textSelection = require('./selectedText');

  drawtext = function(canvas, ctx, x, y, lines) {
    var i, j, len, line, lineHeight, results;
    lineHeight = fontHeight('font: ' + ctx.font);
    results = [];
    for (i = j = 0, len = lines.length; j < len; i = ++j) {
      line = lines[i];
      results.push(ctx.fillText(line, x, y + (i + 1) * lineHeight));
    }
    return results;
  };

  canvastext = function(config) {
    return (function() {
      var canvas, ctx, cursorpos, field, forwardRemove, getCursorAt, insert, lineBreak, lineHeight, lines, mouseSelection, navigate, onKeyDown, onKeyPress, remove, removeSelected, repaint, repaintInterval, resetSelection, selectAll, selection;
      canvas = config.canvas;
      ctx = config.canvas.getContext('2d');
      field = {
        x: config.x,
        y: config.y,
        w: config.width,
        h: config.height
      };
      cursorpos = {
        line: 0,
        character: 0
      };
      selection = textSelection();
      lines = (config.text || '').split('\n');
      lineHeight = fontHeight('font: ' + ctx.font);
      repaint = (function() {
        var blink, last;
        blink = true;
        last = Date.now();
        return function(showCursor, forceCursor) {
          var curx, cury;
          if (showCursor == null) {
            showCursor = true;
          }
          if (forceCursor == null) {
            forceCursor = false;
          }
          lineHeight = fontHeight('font: ' + ctx.font);
          if (config.clearContext != null) {
            config.clearContext();
          } else {
            ctx.clearRect(field.x, field.y, field.w, field.h);
          }
          drawtext(canvas, ctx, field.x, field.y, lines);
          selection.mark(canvas, ctx, field.x, field.y, lines);
          if (forceCursor || (showCursor && blink)) {
            curx = field.x + ctx.measureText(lines[cursorpos.line].substr(0, cursorpos.character)).width;
            cury = field.y + cursorpos.line * lineHeight;
            ctx.save();
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(curx, cury);
            ctx.lineTo(curx, cury + lineHeight);
            ctx.stroke();
            ctx.restore();
          }
          if (forceCursor || Date.now() - last >= 450) {
            blink = !blink || forceCursor;
            return last = Date.now();
          }
        };
      })();
      repaintInterval = setInterval(repaint, 500);
      insert = function(character) {
        if (!selection.isEmpty()) {
          removeSelected();
        }
        lines[cursorpos.line] = lines[cursorpos.line].slice(0, cursorpos.character) + character + lines[cursorpos.line].substr(cursorpos.character);
        cursorpos.character++;
        return repaint();
      };
      removeSelected = function() {
        var end, normalizedSelection, start;
        try {
          normalizedSelection = selection.normalize();
          start = normalizedSelection.start;
          end = normalizedSelection.end;
          lines[start.line] = lines[start.line].substr(0, start.character) + lines[end.line].substr(end.character);
          if (end.line > start.line) {
            lines.splice(start.line + 1, end.line - start.line);
          }
          cursorpos = start;
          resetSelection();
          return repaint(true, true);
        } catch (undefined) {}
      };
      remove = function() {
        var i, j, ref, ref1;
        if (!selection.isEmpty()) {
          return removeSelected();
        } else if (cursorpos.character > 0) {
          cursorpos.character--;
          lines[cursorpos.line] = lines[cursorpos.line].slice(0, cursorpos.character) + lines[cursorpos.line].substr(cursorpos.character + 1);
          return repaint(true, true);
        } else if (cursorpos.line > 0) {
          cursorpos.line--;
          cursorpos.character = lines[cursorpos.line].length;
          lines[cursorpos.line] += lines[cursorpos.line + 1];
          for (i = j = ref = cursorpos.line + 1, ref1 = lines.length - 1; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
            lines[i] = lines[i + 1];
          }
          lines.pop();
          return repaint(true, true);
        }
      };
      forwardRemove = function() {
        var i, j, ref, ref1;
        if (!selection.isEmpty()) {
          return removeSelected();
        } else if (cursorpos.character < lines[cursorpos.line].length) {
          lines[cursorpos.line] = lines[cursorpos.line].slice(0, cursorpos.character) + lines[cursorpos.line].substr(cursorpos.character + 1);
          return repaint(true, true);
        } else if (cursorpos.line < lines.length - 1) {
          lines[cursorpos.line] += lines[cursorpos.line + 1];
          for (i = j = ref = cursorpos.line + 1, ref1 = lines.length - 1; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
            lines[i] = lines[i + 1];
          }
          lines.pop();
          return repaint(true, true);
        }
      };
      lineBreak = function() {
        if (!selection.isEmpty()) {
          removeSelected();
        }
        cursorpos.line++;
        lines.splice(cursorpos.line, 0, lines[cursorpos.line - 1].substr(cursorpos.character));
        lines[cursorpos.line - 1] = lines[cursorpos.line - 1].slice(0, cursorpos.character);
        cursorpos.character = 0;
        return repaint();
      };
      navigate = function(direction, extendSelection) {
        var oldCursorpos;
        oldCursorpos = {
          line: cursorpos.line,
          character: cursorpos.character
        };
        switch (direction) {
          case 'up':
            if (cursorpos.line > 0) {
              cursorpos.line--;
              cursorpos.character = Math.min(lines[cursorpos.line].length, cursorpos.character);
            }
            break;
          case 'down':
            if (cursorpos.line < lines.length - 1) {
              cursorpos.line++;
              cursorpos.character = Math.min(lines[cursorpos.line].length, cursorpos.character);
            } else {
              cursorpos.character = lines[cursorpos.line].length;
            }
            break;
          case 'left':
            if (cursorpos.character > 0) {
              cursorpos.character--;
            } else if (cursorpos.line > 0) {
              cursorpos.line--;
              cursorpos.character = lines[cursorpos.line].length;
            }
            break;
          case 'right':
            if (cursorpos.character < lines[cursorpos.line].length) {
              cursorpos.character++;
            } else if (cursorpos.line < lines.length - 1) {
              cursorpos.line++;
              cursorpos.character = 0;
            }
            break;
          case 'lineStart':
            cursorpos.character = 0;
            break;
          case 'start':
            cursorpos.character = 0;
            cursorpos.line = 0;
            break;
          case 'lineEnd':
            cursorpos.character = lines[cursorpos.line].length;
            break;
          case 'end':
            cursorpos.line = lines.length - 1;
            cursorpos.character = lines[cursorpos.line].length;
        }
        if (extendSelection) {
          selection.setEnd(cursorpos);
        } else {
          if (!selection.isEmpty()) {
            cursorpos.character = oldCursorpos.character;
            cursorpos.line = oldCursorpos.line;
          }
          resetSelection();
        }
        return repaint(true, true);
      };
      resetSelection = function() {
        selection.setStart(cursorpos);
        return selection.setEnd(cursorpos);
      };
      selectAll = function() {
        var end;
        selection.setStart({
          line: 0,
          character: 0
        });
        end = {
          line: lines.length - 1,
          character: lines[lines.length - 1].length
        };
        selection.setEnd(end);
        cursorpos = end;
        return repaint(true, true);
      };
      getCursorAt = function(x, y) {
        var character, line;
        line = Math.min(lines.length - 1, Math.max(0, Math.floor((y - field.y) / lineHeight)));
        character = 0;
        while (character < lines[line].length && field.x + ctx.measureText(lines[line].substr(0, character + 1)).width <= x) {
          character++;
        }
        return {
          line: line,
          character: character
        };
      };
      mouseSelection = (function() {
        var down;
        down = false;
        return {
          down: function(e) {
            cursorpos = getCursorAt(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
            selection.setStart(cursorpos);
            selection.setEnd(cursorpos);
            repaint(true, true);
            return down = true;
          },
          move: function(e) {
            if (down) {
              cursorpos = getCursorAt(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
              selection.setEnd(cursorpos);
              return repaint(true, true);
            }
          },
          up: function(e) {
            return down = false;
          }
        };
      })();
      onKeyPress = function(e) {
        insert(String.fromCharCode(e.keyCode || e.which));
        if (config.onChange != null) {
          return config.onChange(lines);
        }
      };
      onKeyDown = function(e) {
        var key;
        key = e.keyCode || e.which;
        switch (key) {
          case 8:
            remove();
            break;
          case 13:
            if ((config.onEnterPressed != null) && !e.shiftKey) {
              config.onEnterPressed();
            } else {
              lineBreak();
            }
            break;
          case 35:
            navigate((e.ctrlKey ? 'end' : 'lineEnd'), e.shiftKey);
            break;
          case 36:
            navigate((e.ctrlKey ? 'start' : 'lineStart'), e.shiftKey);
            break;
          case 37:
            navigate('left', e.shiftKey);
            break;
          case 38:
            navigate('up', e.shiftKey);
            break;
          case 39:
            navigate('right', e.shiftKey);
            break;
          case 40:
            navigate('down', e.shiftKey);
            break;
          case 46:
            forwardRemove();
            break;
          case 65:
            if (e.ctrlKey) {
              selectAll();
            } else {
              return;
            }
            break;
          default:
            return;
        }
        e.preventDefault();
        if (config.onChange != null) {
          return config.onChange(lines);
        }
      };
      document.addEventListener('keypress', onKeyPress);
      document.addEventListener('keydown', onKeyDown);
      canvas.addEventListener('mousedown', mouseSelection.down);
      canvas.addEventListener('mousemove', mouseSelection.move);
      canvas.addEventListener('mouseup', mouseSelection.up);
      canvas.addEventListener('mouseleave', mouseSelection.up);
      navigate('end');
      return {
        repaint: repaint,
        text: function() {
          return lines.join('\n');
        },
        dispose: function() {
          document.removeEventListener('keypress', onKeyPress);
          document.removeEventListener('keydown', onKeyDown);
          canvas.removeEventListener('mousedown', mouseSelection.down);
          canvas.removeEventListener('mousemove', mouseSelection.move);
          canvas.removeEventListener('mouseup', mouseSelection.up);
          canvas.removeEventListener('mouseleave', mouseSelection.up);
          clearInterval(repaintInterval);
          repaint(false);
        }
      };
    })();
  };

  module.exports = {
    field: canvastext,
    draw: drawtext
  };

}).call(this);

},{"./fontHeight":2,"./selectedText":3}],2:[function(require,module,exports){
(function() {
  module.exports = function(fontStyle) {
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
  };

}).call(this);

},{}],3:[function(require,module,exports){
(function() {
  var fontHeight;

  fontHeight = require('./fontHeight');

  module.exports = function() {
    var _selection, isEmpty, normalize;
    _selection = {
      start: {
        line: 0,
        character: 0
      },
      end: {
        line: 0,
        character: 0
      }
    };
    normalize = function() {
      var end, start, tmp;
      start = _selection.start;
      end = _selection.end;
      if (end.line < start.line || (end.line === start.line && end.character < start.character)) {
        tmp = end;
        end = start;
        start = tmp;
      }
      return {
        start: {
          line: start.line,
          character: start.character
        },
        end: {
          line: end.line,
          character: end.character
        }
      };
    };
    isEmpty = function() {
      return _selection.start.line === _selection.end.line && _selection.start.character === _selection.end.character;
    };
    return {
      setStart: function(start) {
        return _selection.start = {
          line: start.line,
          character: start.character
        };
      },
      setEnd: function(end) {
        return _selection.end = {
          line: end.line,
          character: end.character
        };
      },
      getStart: function() {
        return {
          line: _selection.start.line,
          character: _selection.start.character
        };
      },
      getEnd: function() {
        return {
          line: _selection.end.line,
          character: _selection.end.character
        };
      },
      getText: function(lines) {
        var end, i, line, ref, ref1, start, text;
        text = [];
        start = _selection.start;
        end = _selection.end;
        for (line = i = ref = start.line, ref1 = end.line; ref <= ref1 ? i <= ref1 : i >= ref1; line = ref <= ref1 ? ++i : --i) {
          if (line === start.line) {
            text.push(lines[line].substr(start.character));
          } else if (line === end.line) {
            text.push(lines[line].slice(0, -end.character));
          } else {
            text.push(lines[line]);
          }
        }
        return text.join('\n');
      },
      normalize: normalize,
      isEmpty: isEmpty,
      mark: function(canvas, ctx, x, y, lines) {
        var e, end, i, line, lineHeight, normalizedSelection, positionOf, ref, ref1, s, selectedTextEnd, selectedTextStart, start;
        normalizedSelection = normalize();
        start = normalizedSelection.start;
        end = normalizedSelection.end;
        if (isEmpty()) {
          return;
        }
        ctx.save();
        lineHeight = fontHeight('font: ' + ctx.font);
        positionOf = function(line, character) {
          return {
            x: ctx.measureText(lines[line].slice(0, character)).width + x,
            y: line * lineHeight + y
          };
        };
        selectedTextStart = function(line) {
          if (line > start.line) {
            return 0;
          } else {
            return start.character;
          }
        };
        selectedTextEnd = function(line) {
          if (line < end.line) {
            return lines[line].length;
          } else {
            return end.character;
          }
        };
        ctx.fillStyle = 'lightblue';
        ctx.globalCompositeOperation = 'multiply';
        for (line = i = ref = start.line, ref1 = end.line; ref <= ref1 ? i <= ref1 : i >= ref1; line = ref <= ref1 ? ++i : --i) {
          s = positionOf(line, selectedTextStart(line));
          e = positionOf(line, selectedTextEnd(line));
          ctx.fillRect(s.x, s.y, e.x - s.x, lineHeight);
        }
        return ctx.restore();
      }
    };
  };

}).call(this);

},{"./fontHeight":2}],4:[function(require,module,exports){
// Generated by CoffeeScript 1.9.3
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
      if (!this._events) {
        return;
      }
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
      if (this._events && this._events[eventName]) {
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

  EventEmitter.installOn = function(object) {
    var emitter;
    emitter = new EventEmitter();
    object.on = emitter.on;
    object.off = emitter.off;
    object.trigger = emitter.trigger;
    return object;
  };

  module.exports = EventEmitter;

}).call(this);

},{}],5:[function(require,module,exports){
var Undo,scribblejs,slice=[].slice;Undo=require("./undo"),scribblejs=function(t){var n;return t.fn.scribble=function(){var o,e,i;return e=arguments[0],o=2<=arguments.length?slice.call(arguments,1):[],this.length>1&&t.error("Scribble.js can only be called on one element at a time."),i=this.data("scribble"),"string"==typeof e&&i?i[e]?"function"==typeof i[e]?i[e].apply(i,o):0===o.length?i[e]:1===o.length?i[e]=o[0]:void 0:t.error("Scribble.js did not recognize the given command."):i?i:(this.data("scribble",new n(this.get(0),e)),this)},n=function(){function n(n,o){var e,i,s,a,r,c;this.el=n,this.canvas=t(n),this.options=t.extend({toolLinks:!0,defaultTool:"marker",defaultColor:"#000000",defaultSize:5,undo:new Undo},o),this.scale=1,this.color=this.options.defaultColor,this.size=this.options.defaultSize,this.tool=this.options.defaultTool,this.background=void 0,null!=this.canvas.data("background")&&(e=new Image,e.onload=function(t){return function(){return t.background=e,t.redraw()}}(this),e.src=this.canvas.data("background")),this.actions=[],this._undo=this.options.undo,this._undo.on("undoAvailable",function(t){return function(){return t.canvas.trigger("scribble:undoAvailable")}}(this)),this._undo.on("undoUnavailable",function(t){return function(){return t.canvas.trigger("scribble:undoUnavailable")}}(this)),this._undo.on("redoAvailable",function(t){return function(){return t.canvas.trigger("scribble:redoAvailable")}}(this)),this._undo.on("redoUnavailable",function(t){return function(){return t.canvas.trigger("scribble:redoUnavailable")}}(this)),s=function(t){return function(n){return null==n?{x:0,y:0}:(n.originalEvent&&n.originalEvent.targetTouches&&(n.pageX=n.originalEvent.targetTouches[0].pageX,n.pageY=n.originalEvent.targetTouches[0].pageY),{x:(n.pageX-t.canvas.offset().left)/t.scale,y:(n.pageY-t.canvas.offset().top)/t.scale})}}(this),i=function(n){return function(){return t.scribble.tools[n.tool]}}(this),a=[],r=!1,c=function(n){return function(o,e,c){var u;return c=c?t.scribble.tools[c]:i(),c&&(r||c.customStopHandling)?(r=!1,n.actions=c.stopUse.call(void 0,n.canvas[0].getContext("2d"),s(o),n.actions,n.scale),n.redraw(),u=function(t,o){return{undo:function(){return n.actions=t,n.redraw()},redo:function(){return n.actions=o,n.redraw()}}},n._undo.push(u(a.slice(0),n.actions.slice(0))),n.canvas.trigger("afterPaint",[n.actions,a])):void 0}}(this),this.canvas.on("scribble:toolchanged",c),this.canvas.bind("mousedown touchstart",function(t){return function(n){return i().usesMouse&&i().usesMouse()?void 0:(r&&c(n),r=!0,a=t.getShapes(),t.actions.push({tool:t.tool,color:t.color,size:parseFloat(t.size),events:[]}),t.actions=i().startUse.call(void 0,t.canvas[0].getContext("2d"),s(n),t.actions,t.redraw.bind(t),c,t.scale),t.redraw())}}(this)),this.canvas.bind("mousemove touchmove",function(t){return function(n){return i().usesMouse&&i().usesMouse()||!r?void 0:(t.actions=i().continueUse.call(void 0,t.canvas[0].getContext("2d"),s(n),t.actions,t.scale),t.redraw())}}(this)),this.canvas.bind("mouseup mouseleave mouseout touchend touchcancel",function(t){return function(t){return i().usesMouse&&i().usesMouse()||i().customStopHandling&&i().customStopHandling()?void 0:c(t)}}(this)),this.options.toolLinks&&t("body").delegate('a[href="#'+this.canvas.attr("id")+'"]',"click",function(n){var o,e,i,s,a,r,c;for(e=t(this),o=t(e.attr("href")),c=o.data("scribble"),r=["color","size","tool"],i=0,a=r.length;a>i;i++)s=r[i],e.attr("data-"+s)&&c.set.call(c,s,t(this).attr("data-"+s));if(t(this).attr("data-download")&&c.download.call(c,t(this).attr("data-download")),t(this).attr("data-action"))switch(e.attr("data-action")){case"undo":c.undo.call(c);break;case"redo":c.redo.call(c)}return!1})}return n.prototype.download=function(t){var n;return t||(t="png"),"jpg"===t&&(t="jpeg"),n="image/"+t,window.open(this.el.toDataURL(n))},n.prototype.setScale=function(t){return this.scale=t,this.redraw()},n.prototype.getShapes=function(){return this.actions.slice()},n.prototype.loadShapes=function(t,n){var o;return null==n&&(n=!1),o=this.actions,this.actions=t,this.redraw(),n?void 0:this.canvas.trigger("afterPaint",[this.actions,o])},n.prototype.undo=function(){return this._undo.undo()},n.prototype.redo=function(){return this._undo.redo()},n.prototype.set=function(t,n){var o;return o=this[t],this[t]=n,"tool"===t&&this.canvas.trigger("scribble:toolchanged",[n,o]),this.canvas.trigger("sketch.change"+t,[n,o])},n.prototype.redraw=function(n){var o,e,i,s,a,r,c,u,l,d;for(this.el.width=this.canvas.width(),e=this.el.getContext("2d"),null!=this.background&&(c=this.background.width/this.background.height,r=c*this.canvas.height(),a=this.canvas.height(),r>this.canvas.width()&&(r=this.canvas.width(),a=r/c),e.drawImage(this.background,0,0,this.background.width,this.background.height,0,0,r,a)),d=this,u=this.actions,l=[],i=0,s=u.length;s>i;i++)o=u[i],!o.tool||n&&!n(o)?l.push(void 0):l.push(t.scribble.tools[o.tool].draw.call(void 0,o,e,this.scale));return l},n}(),t.scribble={tools:{marker:require("./tools/marker"),highlighter:require("./tools/highlighter"),eraser:require("./tools/eraser"),text:require("./tools/text")}}},scribblejs.Undo=Undo,module.exports=scribblejs;

},{"./tools/eraser":6,"./tools/highlighter":7,"./tools/marker":8,"./tools/text":10,"./undo":11}],6:[function(require,module,exports){
module.exports={startUse:function(n,t,e){return e.pop(),e},continueUse:function(n,t,e){var r,u,o,s,f,a,i,l,c,h;for(o=function(n,t,e){return null==e&&(e=10),Math.abs(n.x-t.x)<e&&Math.abs(n.y-t.y)<e},i=[],u=0,f=e.length;f>u;u++){if(l=e[u],h=!1,null!=l.events)for(c=l.events,s=0,a=c.length;a>s;s++)if(r=c[s],o(t,r)){h=!0;break}h||i.push(l)}return i},stopUse:function(n,t,e){return e},draw:function(n,t){}};

},{}],7:[function(require,module,exports){
var optimize;optimize=require("./optimizePath"),module.exports={startUse:function(e,t,n){return n[n.length-1].events.push(t),n},continueUse:function(e,t,n){return n[n.length-1].events.push(t),n},stopUse:function(e,t,n){return n[n.length-1].events.push(t),n[n.length-1]=optimize(n[n.length-1]),n},draw:function(e,t,n){var o,i,r,s,l;for(t.lineJoin="round",t.lineCap="round",t.beginPath(),t.moveTo(e.events[0].x*n,e.events[0].y*n),l=e.events,i=0,r=l.length;r>i;i++)o=l[i],t.lineTo(o.x*n,o.y*n),s=o;return t.strokeStyle=e.color,t.lineWidth=e.size*n,t.globalCompositeOperation="multiply",t.stroke(),t.closePath(),t.globalCompositeOperation="source-over"}};

},{"./optimizePath":9}],8:[function(require,module,exports){
var optimize;optimize=require("./optimizePath"),module.exports={startUse:function(e,t,n){return n[n.length-1].events.push(t),n},continueUse:function(e,t,n){return n[n.length-1].events.push(t),n},stopUse:function(e,t,n){return n[n.length-1].events.push(t),n[n.length-1]=optimize(n[n.length-1]),n},draw:function(e,t,n){var o,i,r,s,u;for(t.lineJoin="round",t.lineCap="round",t.beginPath(),t.moveTo(e.events[0].x*n,e.events[0].y*n),u=e.events,i=0,r=u.length;r>i;i++)o=u[i],t.lineTo(o.x*n,o.y*n),s=o;return t.strokeStyle=e.color,t.lineWidth=e.size*n,t.stroke(),t.closePath()}};

},{"./optimizePath":9}],9:[function(require,module,exports){
var calculateCurvature,optimizePath,sign;sign=function(t){return"number"==typeof t?t?0>t?-1:1:t===t?0:NaN:NaN},calculateCurvature=function(t,a,e){var r,u,n,x,y;return x={x:a.x-t.x,y:a.y-t.y},y={x:a.x-e.x,y:a.y-e.y},r=x.x*y.y-y.x*x.y,0===r&&(r=1),n=sign(r)*Math.acos((x.x*y.x+x.y*y.y)/(Math.sqrt(x.x*x.x+x.y*x.y)*Math.sqrt(y.x*y.x+y.y*y.y))),u=2/Math.tan(n/2)},optimizePath=function(t){var a,e,r,u,n,x,y,h;for(a=.08,y=t.events,x=[y[0]],n=0,e=r=0,h=y.length-2;h>=0?h>r:r>h;e=h>=0?++r:--r)u=calculateCurvature(y[n],y[e],y[e+1]),Math.abs(u)>a&&(n=e,x.push(y[e]));return x.push(y[y.length-1]),t.events=x,t},module.exports=optimizePath;

},{}],10:[function(require,module,exports){
var canvastext,usesMouse;canvastext=require("canvastext"),usesMouse=!1,module.exports={customStopHandling:function(){return!0},usesMouse:function(){return usesMouse},startUse:function(e,t,n,s,u,r){var i,o,a;return usesMouse=!0,o={text:"",x:t.x,y:t.y},i=n[n.length-1],i.events.push(o),a=canvastext.field({canvas:e.canvas,x:t.x,y:t.y,width:100,height:100,clearContext:function(){return s(function(e){return e!==i}),e.fillStyle=i.color,e.font=i.size*r+"px Arial"},onEnterPressed:function(){return u()},onChange:function(){return n[n.length-1].events[0].text=a.text()}}),i.field=a,n},continueUse:function(e,t,n){return n},stopUse:function(e,t,n){var s;return usesMouse=!1,s=n[n.length-1],null!=s.field&&(s.events[0].text=s.field.text(),s.field.dispose(),delete s.field),n},draw:function(e,t,n){return e.field?e.field.repaint():(t.fillStyle=e.color,t.font=e.size*n+"px Arial",canvastext.draw(t.canvas,t,e.events[0].x,e.events[0].y,e.events[0].text.split("\n")))}};

},{"canvastext":1}],11:[function(require,module,exports){
var EventEmitter,Undo,extend=function(t,e){function o(){this.constructor=t}for(var r in e)hasProp.call(e,r)&&(t[r]=e[r]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},hasProp={}.hasOwnProperty;EventEmitter=require("event-emitter"),Undo=function(t){function e(){this.undoStack=[],this.redoStack=[]}return extend(e,t),e.prototype.push=function(t){return this.undoStack.push(t),1===this.undoStack.length&&this.trigger("undoAvailable"),this.redoStack.length>0?(this.redoStack=[],this.trigger("redoUnavailable")):void 0},e.prototype.undo=function(){var t;return this.undoStack.length>0&&(t=this.undoStack.pop(),t.undo(),this.redoStack.push(t),0===this.undoStack.length&&this.trigger("undoUnavailable"),1===this.redoStack.length)?this.trigger("redoAvailable"):void 0},e.prototype.redo=function(){var t;return this.redoStack.length>0&&(t=this.redoStack.pop(),t.redo(),this.undoStack.push(t),1===this.undoStack.length&&this.trigger("undoAvailable"),0===this.redoStack.length)?this.trigger("redoUnavailable"):void 0},e}(EventEmitter),module.exports=Undo;

},{"event-emitter":4}]},{},[5])(5)
});