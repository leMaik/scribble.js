optimize = require('./optimizePath')

# # highlighter
#
# The highlighter works like the marker but uses a different blending mode to look more like a highlighter.
module.exports =
  startUse: (context, position, actions) ->
    actions[actions.length - 1].events.push position
    return actions

  continueUse: (context, position, actions) ->
    actions[actions.length - 1].events.push position
    return actions

  stopUse: (context, position, actions) ->
    actions[actions.length - 1].events.push position
    actions[actions.length - 1] = optimize actions[actions.length - 1]
    return actions

  draw: (action, context, scale) ->
    context.lineJoin = "round"
    context.lineCap = "round"
    context.beginPath()

    context.moveTo action.events[0].x * scale, action.events[0].y * scale
    for event in action.events
      context.lineTo event.x * scale, event.y * scale
      previous = event

    context.strokeStyle = action.color
    context.lineWidth = action.size * scale
    context.globalCompositeOperation = "multiply"
    context.stroke()
    context.closePath()
    context.globalCompositeOperation = "source-over"
