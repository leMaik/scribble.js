(function() {
  module.exports = {
    startUse: function(context, position, actions) {
      actions.pop();
      return actions;
    },
    continueUse: function(context, position, actions) {
      var event, i, inRadius, j, len, len1, newActions, otherAction, ref, remove;
      inRadius = function(p1, p2, r) {
        if (r == null) {
          r = 10;
        }
        return Math.abs(p1.x - p2.x) < r && Math.abs(p1.y - p2.y) < r;
      };
      newActions = [];
      for (i = 0, len = actions.length; i < len; i++) {
        otherAction = actions[i];
        remove = false;
        if (otherAction.events != null) {
          ref = otherAction.events;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            event = ref[j];
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

}).call(this);
