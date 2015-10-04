(function() {
  var optimize;

  optimize = require('./optimizePath');

  module.exports = {
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
      actions[actions.length - 1] = optimize(actions[actions.length - 1]);
      return actions;
    },
    draw: function(action, context, scale) {
      var event, i, len, previous, ref;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(action.events[0].x * scale, action.events[0].y * scale);
      ref = action.events;
      for (i = 0, len = ref.length; i < len; i++) {
        event = ref[i];
        context.lineTo(event.x * scale, event.y * scale);
        previous = event;
      }
      context.strokeStyle = action.color;
      context.lineWidth = action.size * scale;
      context.stroke();
      return context.closePath();
    }
  };

}).call(this);
