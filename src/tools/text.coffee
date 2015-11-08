canvastext = require('canvastext')

determineFontHeight: (fontStyle) ->
  body = document.getElementsByTagName("body")[0]
  dummy = document.createElement("div")
  dummyText = document.createTextNode("M")
  dummy.appendChild(dummyText)
  dummy.setAttribute("style", fontStyle)
  body.appendChild(dummy)
  result = dummy.offsetHeight
  body.removeChild(dummy)
  return result

usesMouse = no

# # text tool
#
# The text tool allows writing text on the sketch.
module.exports =
  customStopHandling: -> yes
  usesMouse: -> usesMouse

  startUse: (context, position, actions, redraw, stop, scale) ->
    usesMouse = yes
    event =
      text: ''
      x: position.x
      y: position.y
    action = actions[actions.length - 1]
    action.events.push event
    field = canvastext.field
      canvas: context.canvas
      x: position.x
      y: position.y
      width: 100
      height: 100
      clearContext: ->
        redraw (a) ->  a != action
        context.fillStyle = action.color
        context.font = (action.size * scale) + 'px Arial'
      onEnterPressed: -> stop()
      onChange: ->
        actions[actions.length - 1].events[0].text = field.text()
    action.field = field
    return actions

  continueUse: (context, position, actions) ->
    return actions

  stopUse: (context, position, actions) ->
    usesMouse = no
    action = actions[actions.length - 1]
    if action.field?
      action.events[0].text = action.field.text()
      action.field.dispose()
      delete action.field
    return actions

  draw: (action, context, scale) ->
    if !action.field
      context.fillStyle = action.color
      context.font = (action.size * scale) + 'px Arial'
      canvastext.draw(context.canvas, context, action.events[0].x, action.events[0].y, action.events[0].text.split('\n'))
    else
      action.field.repaint()
