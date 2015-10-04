# # eraser
#
# The eraser does just what you'd expect: removes any of the existing sketch.
module.exports =
  startUse: (context, position, actions) ->
    actions.pop() # eraser does not need an action
    return actions

  continueUse: (context, position, actions) ->
    inRadius = (p1, p2, r = 10) -> Math.abs(p1.x - p2.x) < r && Math.abs(p1.y - p2.y) < r

    newActions = []
    for otherAction in actions
      remove = no
      if otherAction.events?
        for event in otherAction.events
          if inRadius(position, event)
            remove = yes
            break

      if not remove
        newActions.push otherAction

    return newActions

  stopUse: (context, position, actions) ->
    actions

  draw: (action, context) ->
    # an eraser doesn't draw
