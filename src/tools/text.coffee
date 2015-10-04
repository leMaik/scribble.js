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

# # text tool
#
# The text tool allows writing text on the sketch.
module.exports =
  customStopHandling: yes

  startUse: (context, position, actions, redraw, stop) ->
    $('body').off '.sketchjstexttool'
    event =
      text: ''
      x: position.x
      y: position.y
    actions[actions.length - 1].events.push event

    $('body').on 'keydown.sketchjstexttool', (e) ->
      if e.keyCode == 13 #enter
        e.preventDefault()
        if e.shiftKey
          fh = determineFontHeight context.fontStyle
          event =
            text: ''
            x: event.x
            y: event.y + fh
          actions[actions.length - 1].events.push event
        else
          $('body').off '.sketchjstexttool'
          stop()
      else if e.keyCode == 8
        e.preventDefault()
        if event.text.length == 0
          events = actions[actions.length - 1].events
          if events.length > 1
            events.pop()
            event = events[events.length - 1]
        else
          event.text = event.text.substring(0, event.text.length - 1)
        redraw()

    $('body').on 'keypress.sketchjstexttool', (e) ->
      event.text += String.fromCharCode(e.charCode)
      redraw()
      e.preventDefault()

    return actions

  continueUse: (context, position, actions) ->
    return actions

  stopUse: (context, position, actions) ->
    return actions

  draw: (action, context, scale) ->
    context.fillStyle = action.color
    for event in action.events
      context.font = (action.size * scale) + 'px Arial'
      context.fillText event.text, event.x * scale, event.y * scale
