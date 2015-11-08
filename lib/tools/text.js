(function() {
  var canvastext, usesMouse;

  canvastext = require('canvastext');

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

  usesMouse = false;

  module.exports = {
    customStopHandling: function() {
      return true;
    },
    usesMouse: function() {
      return usesMouse;
    },
    startUse: function(context, position, actions, redraw, stop, scale) {
      var action, event, field;
      usesMouse = true;
      event = {
        text: '',
        x: position.x,
        y: position.y
      };
      action = actions[actions.length - 1];
      action.events.push(event);
      field = canvastext.field({
        canvas: context.canvas,
        x: position.x,
        y: position.y,
        width: 100,
        height: 100,
        clearContext: function() {
          redraw(function(a) {
            return a !== action;
          });
          context.fillStyle = action.color;
          return context.font = (action.size * scale) + 'px Arial';
        },
        onEnterPressed: function() {
          return stop();
        },
        onChange: function() {
          return actions[actions.length - 1].events[0].text = field.text();
        }
      });
      action.field = field;
      return actions;
    },
    continueUse: function(context, position, actions) {
      return actions;
    },
    stopUse: function(context, position, actions) {
      var action;
      usesMouse = false;
      action = actions[actions.length - 1];
      if (action.field != null) {
        action.events[0].text = action.field.text();
        action.field.dispose();
        delete action.field;
      }
      return actions;
    },
    draw: function(action, context, scale) {
      if (!action.field) {
        context.fillStyle = action.color;
        context.font = (action.size * scale) + 'px Arial';
        return canvastext.draw(context.canvas, context, action.events[0].x, action.events[0].y, action.events[0].text.split('\n'));
      } else {
        return action.field.repaint();
      }
    }
  };

}).call(this);
