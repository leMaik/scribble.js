(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.scribblejs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){var e,n,t,r;t=require("./fontHeight"),r=require("./selectedText"),n=function(e,n,r,a,i){var c,l,s,o,h,u;for(h=t("font: "+n.font),u=[],c=l=0,s=i.length;s>l;c=++l)o=i[c],u.push(n.fillText(o,r,a+(c+1)*h));return u},e=function(e){return function(){var a,i,c,l,s,o,h,u,f,d,v,m,g,p,y,b,E,k,w,x,L;return a=e.canvas,i=e.canvas.getContext("2d"),l={x:e.x,y:e.y,w:e.width,h:e.height},c={line:0,character:0},L=r(),d=(e.text||"").split("\n"),f=t("font: "+i.font),E=function(){var r,s;return r=!0,s=Date.now(),function(o,h){var u,v;return null==o&&(o=!0),null==h&&(h=!1),f=t("font: "+i.font),null!=e.clearContext?e.clearContext():i.clearRect(l.x,l.y,l.w,l.h),n(a,i,l.x,l.y,d),L.mark(a,i,l.x,l.y,d),(h||o&&r)&&(u=l.x+i.measureText(d[c.line].substr(0,c.character)).width,v=l.y+c.line*f,console.log("what"),i.save(),i.lineWidth=1,i.beginPath(),i.moveTo(u,v),i.lineTo(u,v+f),i.stroke(),i.restore()),h||Date.now()-s>=450?(r=!r||h,s=Date.now()):void 0}}(),k=setInterval(E,500),h=function(e){return L.isEmpty()||b(),d[c.line]=d[c.line].slice(0,c.character)+e+d[c.line].substr(c.character),c.character++,E()},b=function(){var e,n,t;try{return n=L.normalize(),t=n.start,e=n.end,d[t.line]=d[t.line].substr(0,t.character)+d[e.line].substr(e.character),e.line>t.line&&d.splice(t.line+1,e.line-t.line),c=t,w(),E(!0,!0)}catch(r){}},y=function(){var e,n,t,r;if(!L.isEmpty())return b();if(c.character>0)return c.character--,d[c.line]=d[c.line].slice(0,c.character)+d[c.line].substr(c.character+1),E(!0,!0);if(c.line>0){for(c.line--,c.character=d[c.line].length,d[c.line]+=d[c.line+1],e=n=t=c.line+1,r=d.length-1;r>=t?r>n:n>r;e=r>=t?++n:--n)d[e]=d[e+1];return d.pop(),E(!0,!0)}},s=function(){var e,n,t,r;if(!L.isEmpty())return b();if(c.character<d[c.line].length)return d[c.line]=d[c.line].slice(0,c.character)+d[c.line].substr(c.character+1),E(!0,!0);if(c.line<d.length-1){for(d[c.line]+=d[c.line+1],e=n=t=c.line+1,r=d.length-1;r>=t?r>n:n>r;e=r>=t?++n:--n)d[e]=d[e+1];return d.pop(),E(!0,!0)}},u=function(){return L.isEmpty()||b(),c.line++,d.splice(c.line,0,d[c.line-1].substr(c.character)),d[c.line-1]=d[c.line-1].slice(0,c.character),c.character=0,E()},m=function(e,n){var t;switch(t={line:c.line,character:c.character},e){case"up":c.line>0&&(c.line--,c.character=Math.min(d[c.line].length,c.character));break;case"down":c.line<d.length-1?(c.line++,c.character=Math.min(d[c.line].length,c.character)):c.character=d[c.line].length;break;case"left":c.character>0?c.character--:c.line>0&&(c.line--,c.character=d[c.line].length);break;case"right":c.character<d[c.line].length?c.character++:c.line<d.length-1&&(c.line++,c.character=0);break;case"lineStart":c.character=0;break;case"start":c.character=0,c.line=0;break;case"lineEnd":c.character=d[c.line].length;break;case"end":c.line=d.length-1,c.character=d[c.line].length}return n?L.setEnd(c):(L.isEmpty()||(c.character=t.character,c.line=t.line),w()),E(!0,!0)},w=function(){return L.setStart(c),L.setEnd(c)},x=function(){var e;return L.setStart({line:0,character:0}),e={line:d.length-1,character:d[d.length-1].length},L.setEnd(e),c=e,E(!0,!0)},o=function(e,n){var t,r;for(r=Math.min(d.length-1,Math.max(0,Math.floor((n-l.y)/f))),t=0;t<d[r].length&&l.x+i.measureText(d[r].substr(0,t+1)).width<=e;)t++;return{line:r,character:t}},v=function(){var e;return e=!1,{down:function(n){return c=o(n.pageX-a.offsetLeft,n.pageY-a.offsetTop),L.setStart(c),L.setEnd(c),E(!0,!0),e=!0},move:function(n){return e?(c=o(n.pageX-a.offsetLeft,n.pageY-a.offsetTop),L.setEnd(c),E(!0,!0)):void 0},up:function(n){return e=!1}}}(),p=function(n){return h(String.fromCharCode(n.keyCode||n.which)),null!=e.onChange?e.onChange(d):void 0},g=function(n){var t;switch(t=n.keyCode||n.which){case 8:y();break;case 13:null==e.onEnterPressed||n.shiftKey?u():e.onEnterPressed();break;case 35:m(n.ctrlKey?"end":"lineEnd",n.shiftKey);break;case 36:m(n.ctrlKey?"start":"lineStart",n.shiftKey);break;case 37:m("left",n.shiftKey);break;case 38:m("up",n.shiftKey);break;case 39:m("right",n.shiftKey);break;case 40:m("down",n.shiftKey);break;case 46:s();break;case 65:if(!n.ctrlKey)return;x();break;default:return}return n.preventDefault(),null!=e.onChange?e.onChange(d):void 0},document.addEventListener("keypress",p),document.addEventListener("keydown",g),a.addEventListener("mousedown",v.down),a.addEventListener("mousemove",v.move),a.addEventListener("mouseup",v.up),a.addEventListener("mouseleave",v.up),m("end"),{repaint:E,text:function(){return d.join("\n")},dispose:function(){document.removeEventListener("keypress",p),document.removeEventListener("keydown",g),a.removeEventListener("mousedown",v.down),a.removeEventListener("mousemove",v.move),a.removeEventListener("mouseup",v.up),a.removeEventListener("mouseleave",v.up),clearInterval(k),E(!1)}}}()},module.exports={field:e,draw:n}}).call(this);

},{"./fontHeight":2,"./selectedText":3}],2:[function(require,module,exports){
(function(){module.exports=function(e){var t,d,n,o;return t=document.getElementsByTagName("body")[0],d=document.createElement("div"),n=document.createTextNode("M"),d.appendChild(n),d.setAttribute("style",e),t.appendChild(d),o=d.offsetHeight,t.removeChild(d),o}}).call(this);

},{}],3:[function(require,module,exports){
(function(){var e;e=require("./fontHeight"),module.exports=function(){var r,t,n;return r={start:{line:0,character:0},end:{line:0,character:0}},n=function(){var e,t,n;return t=r.start,e=r.end,(e.line<t.line||e.line===t.line&&e.character<t.character)&&(n=e,e=t,t=n),{start:{line:t.line,character:t.character},end:{line:e.line,character:e.character}}},t=function(){return r.start.line===r.end.line&&r.start.character===r.end.character},{setStart:function(e){return r.start={line:e.line,character:e.character}},setEnd:function(e){return r.end={line:e.line,character:e.character}},getStart:function(){return{line:r.start.line,character:r.start.character}},getEnd:function(){return{line:r.end.line,character:r.end.character}},getText:function(e){var t,n,a,c,i,l,u;for(u=[],l=r.start,t=r.end,a=n=c=l.line,i=t.line;i>=c?i>=n:n>=i;a=i>=c?++n:--n)a===l.line?u.push(e[a].substr(l.character)):a===t.line?u.push(e[a].slice(0,-t.character)):u.push(e[a]);return u.join("\n")},normalize:n,isEmpty:t,mark:function(r,a,c,i,l){var u,h,o,s,f,d,p,g,m,x,v,y,b;if(d=n(),b=d.start,h=d.end,!t()){for(a.save(),f=e("font: "+a.font),p=function(e,r){return{x:a.measureText(l[e].slice(0,r)).width+c,y:e*f+i}},y=function(e){return e>b.line?0:b.character},v=function(e){return e<h.line?l[e].length:h.character},a.fillStyle="lightblue",a.globalCompositeOperation="multiply",s=o=g=b.line,m=h.line;m>=g?m>=o:o>=m;s=m>=g?++o:--o)x=p(s,y(s)),u=p(s,v(s)),a.fillRect(x.x,x.y,u.x-x.x,f);return a.restore()}}}}}).call(this);

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
var Undo,scribblejs,slice=[].slice;Undo=require("./undo"),scribblejs=function(t){var n;return t.fn.scribble=function(){var e,o,i;return o=arguments[0],e=2<=arguments.length?slice.call(arguments,1):[],this.length>1&&t.error("Scribble.js can only be called on one element at a time."),i=this.data("scribble"),"string"==typeof o&&i?i[o]?"function"==typeof i[o]?i[o].apply(i,e):0===e.length?i[o]:1===e.length?i[o]=e[0]:void 0:t.error("Scribble.js did not recognize the given command."):i?i:(this.data("scribble",new n(this.get(0),o)),this)},n=function(){function n(n,e){var o,i,a,s,r,c;this.el=n,this.canvas=t(n),this.options=t.extend({toolLinks:!0,defaultTool:"marker",defaultColor:"#000000",defaultSize:5,undo:new Undo},e),this.scale=1,this.color=this.options.defaultColor,this.size=this.options.defaultSize,this.tool=this.options.defaultTool,this.background=void 0,null!=this.canvas.data("background")&&(o=new Image,o.onload=function(t){return function(){return t.background=o,t.redraw()}}(this),o.src=this.canvas.data("background")),this.actions=[],this._undo=this.options.undo,this._undo.on("undoAvailable",function(t){return function(){return t.canvas.trigger("scribble:undoAvailable")}}(this)),this._undo.on("undoUnavailable",function(t){return function(){return t.canvas.trigger("scribble:undoUnavailable")}}(this)),this._undo.on("redoAvailable",function(t){return function(){return t.canvas.trigger("scribble:redoAvailable")}}(this)),this._undo.on("redoUnavailable",function(t){return function(){return t.canvas.trigger("scribble:redoUnavailable")}}(this)),a=function(t){return function(n){return null==n?{x:0,y:0}:(n.originalEvent&&n.originalEvent.targetTouches&&(n.pageX=n.originalEvent.targetTouches[0].pageX,n.pageY=n.originalEvent.targetTouches[0].pageY),{x:(n.pageX-t.canvas.offset().left)/t.scale,y:(n.pageY-t.canvas.offset().top)/t.scale})}}(this),i=function(n){return function(){return t.scribble.tools[n.tool]}}(this),s=[],r=!1,c=function(t){return function(n){var e;return r?(r=!1,t.actions=i().stopUse.call(void 0,t.canvas[0].getContext("2d"),a(n),t.actions,t.scale),t.redraw(),e=function(n,e){return{undo:function(){return t.actions=n,t.redraw()},redo:function(){return t.actions=e,t.redraw()}}},t._undo.push(e(s.slice(0),t.actions.slice(0))),t.canvas.trigger("afterPaint",[t.actions,s])):void 0}}(this),this.canvas.on("scribble:toolchanged",c),this.canvas.bind("mousedown touchstart",function(t){return function(n){return i().usesMouse&&i().usesMouse()?void 0:(r&&c(n),r=!0,s=t.getShapes(),t.actions.push({tool:t.tool,color:t.color,size:parseFloat(t.size),events:[]}),t.actions=i().startUse.call(void 0,t.canvas[0].getContext("2d"),a(n),t.actions,t.redraw.bind(t),c,t.scale),t.redraw())}}(this)),this.canvas.bind("mousemove touchmove",function(t){return function(n){return i().usesMouse&&i().usesMouse()||!r?void 0:(t.actions=i().continueUse.call(void 0,t.canvas[0].getContext("2d"),a(n),t.actions,t.scale),t.redraw())}}(this)),this.canvas.bind("mouseup mouseleave mouseout touchend touchcancel",function(t){return function(t){return i().usesMouse&&i().usesMouse()||i().customStopHandling&&i().customStopHandling()?void 0:c(t)}}(this)),this.options.toolLinks&&t("body").delegate('a[href="#'+this.canvas.attr("id")+'"]',"click",function(n){var e,o,i,a,s,r,c;for(o=t(this),e=t(o.attr("href")),c=e.data("scribble"),r=["color","size","tool"],i=0,s=r.length;s>i;i++)a=r[i],o.attr("data-"+a)&&c.set.call(c,a,t(this).attr("data-"+a));if(t(this).attr("data-download")&&c.download.call(c,t(this).attr("data-download")),t(this).attr("data-action"))switch(o.attr("data-action")){case"undo":c.undo.call(c);break;case"redo":c.redo.call(c)}return!1})}return n.prototype.download=function(t){var n;return t||(t="png"),"jpg"===t&&(t="jpeg"),n="image/"+t,window.open(this.el.toDataURL(n))},n.prototype.setScale=function(t){return this.scale=t,this.redraw()},n.prototype.getShapes=function(){return this.actions.slice()},n.prototype.loadShapes=function(t,n){var e;return null==n&&(n=!1),e=this.actions,this.actions=t,this.redraw(),n?void 0:this.canvas.trigger("afterPaint",[this.actions,e])},n.prototype.undo=function(){return this._undo.undo()},n.prototype.redo=function(){return this._undo.redo()},n.prototype.set=function(t,n){return this[t]=n,"tool"===t&&this.canvas.trigger("scribble:toolchanged",n),this.canvas.trigger("sketch.change"+t,n)},n.prototype.redraw=function(n){var e,o,i,a,s,r,c,u,l,d;for(this.el.width=this.canvas.width(),o=this.el.getContext("2d"),null!=this.background&&(c=this.background.width/this.background.height,r=c*this.canvas.height(),s=this.canvas.height(),r>this.canvas.width()&&(r=this.canvas.width(),s=r/c),o.drawImage(this.background,0,0,this.background.width,this.background.height,0,0,r,s)),d=this,u=this.actions,l=[],i=0,a=u.length;a>i;i++)e=u[i],!e.tool||n&&!n(e)?l.push(void 0):l.push(t.scribble.tools[e.tool].draw.call(void 0,e,o,this.scale));return l},n}(),t.scribble={tools:{marker:require("./tools/marker"),highlighter:require("./tools/highlighter"),eraser:require("./tools/eraser"),text:require("./tools/text")}}},scribblejs.Undo=Undo,module.exports=scribblejs;

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