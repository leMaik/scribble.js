# # Sketch.js (v0.0.1)
#
# **Sketch.js** is a simple jQuery plugin for creating drawable canvases
# using HTML5 Canvas. It supports multiple browsers including mobile
# devices (albeit with performance penalties).
sketchjs = ($) ->
  # calculates the sign of a number
  # see: http://stackoverflow.com/questions/7624920/number-sign-in-javascript
  sign = (x) ->
    if typeof x == 'number' then (if x then (if x < 0 then -1 else 1) else if x == x then 0 else NaN) else NaN


  # ### jQuery('#mycanvas').sketch(options)
  #
  # Given an ID selector for a `<canvas>` element, initialize the specified
  # canvas as a drawing canvas. See below for the options that may be passed in.
  $.fn.sketch = (key, args...)->
    $.error('Sketch.js can only be called on one element at a time.') if this.length > 1
    sketch = this.data('sketch')

    # If a canvas has already been initialized as a sketchpad, calling
    # `.sketch()` will return the Sketch instance (see documentation below)
    # for the canvas. If you pass a single string argument (such as `'color'`)
    # it will return the value of any set instance variables. If you pass
    # a string argument followed by a value, it will set an instance variable
    # (e.g. `.sketch('color','#f00')`.
    if typeof(key) == 'string' && sketch
      if sketch[key]
        if typeof(sketch[key]) == 'function'
          sketch[key].apply sketch, args
        else if args.length == 0
          sketch[key]
        else if args.length == 1
          sketch[key] = args[0]
      else
        $.error('Sketch.js did not recognize the given command.')
    else if sketch
      sketch
    else
      this.data('sketch', new Sketch(this.get(0), key))
      this

  # ## Sketch
  #
  # The Sketch class represents an activated drawing canvas. It holds the
  # state, all relevant data, and all methods related to the plugin.
  class Sketch
    # ### new Sketch(el, opts)
    #
    # Initialize the Sketch class with a canvas DOM element and any specified
    # options. The available options are:
    #
    # * `toolLinks`: If `true`, automatically turn links with href of `#mycanvas`
    #   into tool action links. See below for a description of the available
    #   tool links.
    # * `defaultTool`: Defaults to `marker`, the tool is any of the extensible
    #   tools that the canvas should default to.
    # * `defaultColor`: The default drawing color. Defaults to black.
    # * `defaultSize`: The default stroke size. Defaults to 5.
    constructor: (el, opts)->
      @el = el
      @canvas = $(el)
      @context = el.getContext '2d'
      @options = $.extend {
        toolLinks: true
        defaultTool: 'marker'
        defaultColor: '#000000'
        defaultSize: 5
      }, opts
      @painting = false
      @color = @options.defaultColor
      @size = @options.defaultSize
      @tool = @options.defaultTool
      @background = undefined
      if @canvas.data('background')?
        bgImage = new Image()
        bgImage.onload = =>
          @background = bgImage
          @redraw()
        bgImage.src = @canvas.data('background')
      @actions = []
      @action = []

      @canvas.bind 'click mousedown mouseup mousemove mouseleave mouseout touchstart touchmove touchend touchcancel', @onEvent

      # ### Tool Links
      #
      # Tool links automatically bind `a` tags that have an `href` attribute
      # of `#mycanvas` (mycanvas being the ID of your `<canvas>` element to
      # perform actions on the canvas.
      if @options.toolLinks
        $('body').delegate "a[href=\"##{@canvas.attr('id')}\"]", 'click', (e)->
          $this = $(this)
          $canvas = $($this.attr('href'))
          sketch = $canvas.data('sketch')
          # Tool links are keyed off of HTML5 `data` attributes. The following
          # attributes are supported:
          #
          # * `data-tool`: Change the current tool to the specified value.
          # * `data-color`: Change the draw color to the specified value.
          # * `data-size`: Change the stroke size to the specified value.
          # * `data-download`: Trigger a sketch download in the specified format.
          for key in ['color', 'size', 'tool']
            if $this.attr("data-#{key}")
              sketch.set key, $(this).attr("data-#{key}")
          if $(this).attr('data-download')
            sketch.download $(this).attr('data-download')
          false

    # ### sketch.download(format)
    #
    # Cause the browser to open up a new window with the Data URL of the current
    # canvas. The `format` parameter can be either `png` or `jpeg`.
    download: (format)->
      format or= "png"
      format = "jpeg" if format == "jpg"
      mime = "image/#{format}"

      window.open @el.toDataURL(mime)

    getShapes: ->
      shapes = []
      for action in @actions
        if action.events?
          shapes.push action
      return shapes

    loadShapes: (shapes) ->
      @actions = shapes
      @redraw()

    # ### sketch.set(key, value)
    #
    # *Internal method.* Sets an arbitrary instance variable on the Sketch instance
    # and triggers a `changevalue` event so that any appropriate bindings can take
    # place.
    set: (key, value)->
      this[key] = value
      @canvas.trigger("sketch.change#{key}", value)

    # ### sketch.startPainting()
    #
    # *Internal method.* Called when a mouse or touch event is triggered
    # that begins a paint stroke.
    startPainting: ->
      @painting = true
      @action = {
        tool: @tool
        color: @color
        size: parseFloat(@size)
        events: []
      }

    # calculates the [discrete] curvature of two connected line segments represented
    # by their points p1-p2-p3 where (p1,p2) is the first line segment and (p2,p3) the second
    calculateCurvature: (p1,p2,p3) ->
      # Idea from http://page.math.tu-berlin.de/~bobenko/Lehre/Skripte/KuF.pdf page 22
      # r1: direction of segment p1->p2
      # r2: direction of segmet p3->p2
      r1 = {x: p2.x-p1.x, y: p2.y-p1.y}
      r2 = {x: p2.x-p3.x, y: p2.y-p3.y}

      crossZ = r1.x * r2.y - r2.x * r1.y
      if crossZ == 0 then crossZ = 1

      # phi: angle of the two line segmets
      # k: curvature
      phi = sign(crossZ) * Math.acos((r1.x*r2.x+r1.y*r2.y) / ( Math.sqrt(r1.x*r1.x+r1.y*r1.y) * Math.sqrt(r2.x*r2.x+r2.y*r2.y) ))
      k = 2 / Math.tan(phi / 2)

      ###
      k is always positive, as acos maps to 0 to pi, but it is important to also consider
      negative phi's. On a Line all curvature fluctations should nearly cancel themselves out
      the sign can be calculated using the cross product where the direction of the
      z component determines the sign
                   |       0        |
          a x b =  |       0        |  => sign ( ax by - bx ay)
                   | ax by - bx ay  |
      ###

      return k

    optimize: (action) ->
      curvatureThreshold = 0.08
      path = action.events
      newPath = [path[0]]
      last = 0;
      for i in [0...path.length-2]
        k = @calculateCurvature path[last], path[i], path[i+1]

        if Math.abs(k)>curvatureThreshold
          last = i
          newPath.push path[i]

      newPath.push path[path.length-1]

      #console.log("optimizedPath\n points before opzimization: " + path.length + "\n points after opzimization: " + newPath.length);
      action.events = newPath
      return action;

      return action

    # ### sketch.stopPainting()
    #
    # *Internal method.* Called when the mouse is released or leaves the canvas.
    stopPainting: ->
      @actions.push @optimize @action if @action
      @painting = false
      @action = null
      @redraw()

    # ### sketch.onEvent(e)
    #
    # *Internal method.* Universal event handler for the canvas. Any mouse or
    # touch related events are passed through this handler before being passed
    # on to the individual tools.
    onEvent: (e)->
      if e.originalEvent && e.originalEvent.targetTouches
        e.pageX = e.originalEvent.targetTouches[0].pageX
        e.pageY = e.originalEvent.targetTouches[0].pageY
      $.sketch.tools[$(this).data('sketch').tool].onEvent.call($(this).data('sketch'), e)
      e.preventDefault()
      false

    # ### sketch.redraw()
    #
    # *Internal method.* Redraw the sketchpad from scratch using the aggregated
    # actions that have been stored as well as the action in progress if it has
    # something renderable.
    redraw: ->
      @el.width = @canvas.width()
      @context = @el.getContext '2d'

      if @background?
        @context.drawImage @background, 0, 0

      sketch = this
      $.each @actions, ->
        if this.tool
          $.sketch.tools[this.tool].draw.call sketch, this
      $.sketch.tools[@action.tool].draw.call sketch, @action if @painting && @action

  # # Tools
  #
  # Sketch.js is built with a pluggable, extensible tool foundation. Each tool works
  # by accepting and manipulating events registered on the sketch using an `onEvent`
  # method and then building up **actions** that, when passed to the `draw` method,
  # will render the tool's effect to the canvas. The tool methods are executed with
  # the Sketch instance as `this`.
  #
  # Tools can be added simply by adding a new key to the `$.sketch.tools` object.
  $.sketch = { tools: {} }

  # ## marker
  #
  # The marker is the most basic drawing tool. It will draw a stroke of the current
  # width and current color wherever the user drags his or her mouse.
  $.sketch.tools.marker =
    onEvent: (e)->
      switch e.type
        when 'mousedown', 'touchstart'
          @startPainting()
        when 'mouseup', 'mouseout', 'mouseleave', 'touchend', 'touchcancel'
          @stopPainting()

      if @painting
        @action.events.push
          x: e.pageX - @canvas.offset().left
          y: e.pageY - @canvas.offset().top

        @redraw()

    draw: (action)->
      @context.lineJoin = "round"
      @context.lineCap = "round"
      @context.beginPath()

      @context.moveTo action.events[0].x, action.events[0].y
      for event in action.events
        @context.lineTo event.x, event.y

        previous = event
      @context.strokeStyle = action.color
      @context.lineWidth = action.size
      @context.stroke()

  # ## highlighter
  #
  # The highlighter works like the marker but uses a different blending mode to look more like a highlighter.
  $.sketch.tools.highlighter =
    onEvent: (e)->
      $.sketch.tools.marker.onEvent.call this, e

    draw: (action)->
      @context.lineJoin = "round"
      @context.lineCap = "round"
      @context.beginPath()

      @context.moveTo action.events[0].x, action.events[0].y
      for event in action.events
        @context.lineTo event.x, event.y

        previous = event
      @context.strokeStyle = action.color
      @context.lineWidth = action.size
      @context.globalCompositeOperation = "multiply"
      @context.stroke()
      @context.globalCompositeOperation = "source-over"

  # ## eraser
  #
  # The eraser does just what you'd expect: removes any of the existing sketch.
  $.sketch.tools.eraser =
    onEvent: (e)->
      switch e.type
        when 'mousedown', 'touchstart'
          @startPainting()
        when 'mouseup', 'mouseout', 'mouseleave', 'touchend', 'touchcancel'
          @action = null
          @stopPainting()

      if @painting
        location =
          x: e.pageX - @canvas.offset().left
          y: e.pageY - @canvas.offset().top
          event: e.type

        inRadius = (p1, p2, r = 10) -> Math.abs(p1.x - p2.x) < r && Math.abs(p1.y - p2.y) < r

        newActions = []
        for otherAction in @actions
          remove = no
          if otherAction.events?
            for event in otherAction.events
              if inRadius(location, event)
                remove = yes
                break

          if not remove
            newActions.push otherAction

        @actions = newActions
        @redraw()

    draw: (action) ->

# ## Sketch.js module
#
# **Sketch.js** is exported as a function. Simply invoke it with `jQuery` as first argument
# to activate it.
module.exports = sketchjs
