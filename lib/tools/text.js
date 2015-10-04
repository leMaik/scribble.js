(function() {
  ({
    determineFontHeight: function(fontStyle) {
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
    }
  });

  module.exports = {
    customStopHandling: true,
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
            fh = determineFontHeight(context.fontStyle);
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
      var event, i, len, ref, results;
      context.fillStyle = action.color;
      ref = action.events;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        event = ref[i];
        context.font = (action.size * scale) + 'px Arial';
        results.push(context.fillText(event.text, event.x * scale, event.y * scale));
      }
      return results;
    }
  };

}).call(this);
