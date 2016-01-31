Undo = require './undo'

# # Scribble.js (v0.0.1)
#
# **Scribble.js** is a simple jQuery plugin for creating drawable canvases
# using HTML5 Canvas. It supports multiple browsers including mobile
# devices (albeit with performance penalties).
scribblejs = ($) ->
  # ### jQuery('#mycanvas').scribble(options)
  #
  # Given an ID selector for a `<canvas>` element, initialize the specified
  # canvas as a drawing canvas. See below for the options that may be passed in.
  $.fn.scribble = (key, args...)->
    $.error('Scribble.js can only be called on one element at a time.') if this.length > 1
    scribble = this.data('scribble')

    # If a canvas has already been initialized as a sketchpad, calling
    # `.sketch()` will return the Sketch instance (see documentation below)
    # for the canvas. If you pass a single string argument (such as `'color'`)
    # it will return the value of any set instance variables. If you pass
    # a string argument followed by a value, it will set an instance variable
    # (e.g. `.sketch('color','#f00')`.
    if typeof(key) == 'string' && scribble
      if scribble[key]
        if typeof(scribble[key]) == 'function'
          scribble[key].apply scribble, args
        else if args.length == 0
          scribble[key]
        else if args.length == 1
          scribble[key] = args[0]
      else
        $.error('Scribble.js did not recognize the given command.')
    else if scribble
      scribble
    else
      this.data('scribble', new Scribble(this.get(0), key))
      this

  # ## Scribble
  #
  # The Scribble class represents an activated drawing canvas. It holds the
  # state, all relevant data, and all methods related to the plugin.
  class Scribble
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
      @options = $.extend {
        toolLinks: true
        defaultTool: 'marker'
        defaultColor: '#000000'
        defaultSize: 5
        undo: new Undo()
      }, opts
      @scale = 1
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

      @_undo = @options.undo
      @_undo.on 'undoAvailable', => @canvas.trigger "scribble:undoAvailable"
      @_undo.on 'undoUnavailable', => @canvas.trigger "scribble:undoUnavailable"
      @_undo.on 'redoAvailable', => @canvas.trigger "scribble:redoAvailable"
      @_undo.on 'redoUnavailable', => @canvas.trigger "scribble:redoUnavailable"

      getCursorPosition = (e) =>
        return {x: 0, y: 0} if not e?
        if e.originalEvent && e.originalEvent.targetTouches
          e.pageX = e.originalEvent.targetTouches[0].pageX
          e.pageY = e.originalEvent.targetTouches[0].pageY
        return {
          x: (e.pageX - @canvas.offset().left) / @scale
          y: (e.pageY - @canvas.offset().top) / @scale
        }

      currentTool = => $.scribble.tools[@tool]

      old = []
      painting = no

      stop = (e, tool, oldTool) =>
        oldTool = if oldTool then $.scribble.tools[oldTool] else currentTool()

        if oldTool && (painting || oldTool.customStopHandling)
          painting = no
          @actions = oldTool.stopUse.call undefined, @canvas[0].getContext('2d'), getCursorPosition(e), @actions, @scale
          @redraw()

          undoAction = (old, current) =>
            undo: =>
              @actions = old
              @redraw()
            redo: =>
              @actions = current
              @redraw()

          @_undo.push undoAction(old.slice(0), @actions.slice(0))
          @canvas.trigger "afterPaint", [@actions, old]

      @canvas.on 'scribble:toolchanged', stop

      @canvas.bind 'mousedown touchstart', (e) =>
        if !currentTool().usesMouse || !currentTool().usesMouse()
          if painting then stop(e) #yes, this happens sometimes
          painting = yes
          old = @getShapes()

          @actions.push
            tool: @tool
            color: @color
            size: parseFloat(@size)
            events: []

          @actions = currentTool().startUse.call undefined, @canvas[0].getContext('2d'), getCursorPosition(e), @actions, @redraw.bind(this), stop, @scale
          @redraw()

      @canvas.bind 'mousemove touchmove', (e) =>
        if !currentTool().usesMouse || !currentTool().usesMouse()
          if painting
            @actions = currentTool().continueUse.call undefined, @canvas[0].getContext('2d'), getCursorPosition(e), @actions, @scale
            @redraw()

      @canvas.bind 'mouseup mouseleave mouseout touchend touchcancel', (e) =>
        if !currentTool().usesMouse || !currentTool().usesMouse()
          if !currentTool().customStopHandling || !currentTool().customStopHandling()
            stop(e)


      # ### Tool Links
      #
      # Tool links automatically bind `a` tags that have an `href` attribute
      # of `#mycanvas` (mycanvas being the ID of your `<canvas>` element to
      # perform actions on the canvas.
      if @options.toolLinks
        $('body').delegate "a[href=\"##{@canvas.attr('id')}\"]", 'click', (e) ->
          $this = $(this)
          $canvas = $($this.attr('href'))
          sketch = $canvas.data('scribble')
          # Tool links are keyed off of HTML5 `data` attributes. The following
          # attributes are supported:
          #
          # * `data-tool`: Change the current tool to the specified value.
          # * `data-color`: Change the draw color to the specified value.
          # * `data-size`: Change the stroke size to the specified value.
          # * `data-download`: Trigger a sketch download in the specified format.
          for key in ['color', 'size', 'tool']
            if $this.attr("data-#{key}")
              sketch.set.call sketch, key, $(this).attr("data-#{key}")
          if $(this).attr('data-download')
            sketch.download.call sketch, $(this).attr('data-download')

          if $(this).attr('data-action')
            switch $this.attr('data-action')
              when 'undo' then sketch.undo.call sketch
              when 'redo' then sketch.redo.call sketch

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

    # ### sketch.setScale(scale)
    #
    # Set the scaling factor of all drawings.
    setScale: (scale) ->
      @scale = scale
      @redraw()

    getShapes: ->
      @actions.slice()

    loadShapes: (shapes, silent = no) ->
      old = @actions
      @actions = shapes
      @redraw()
      @canvas.trigger("afterPaint", [@actions, old]) if not silent

    undo: -> @_undo.undo()

    redo: -> @_undo.redo()

    # ### sketch.set(key, value)
    #
    # *Internal method.* Sets an arbitrary instance variable on the Sketch instance
    # and triggers a `changevalue` event so that any appropriate bindings can take
    # place.
    set: (key, value) ->
      old = this[key]
      this[key] = value
      if key == 'tool'
        @canvas.trigger('scribble:toolchanged', [value, old])
      @canvas.trigger("sketch.change#{key}", [value, old])

    # ### sketch.redraw()
    #
    # *Internal method.* Redraw the sketchpad from scratch using the aggregated
    # actions that have been stored as well as the action in progress if it has
    # something renderable. If a predicate is specified, only matching actions
    # are drawn.
    redraw: (predicate) ->
      @el.width = @canvas.width()
      context = @el.getContext '2d'
      @drawOn(context, @canvas.width(), @canvas.height(), predicate)

    drawOn: (context, width, height, predicate) ->
      if @background?
        ratio = @background.width / @background.height
        newWidth = ratio * height
        newHeight = height
        if newWidth > width
          newWidth = width
          newHeight = newWidth / ratio

        context.drawImage @background, 0, 0, @background.width, @background.height,
                          0, 0, newWidth, newHeight

      actions = if predicate? then @actions.filter(predicate) else @actions
      Scribble.drawShapesOn(contect, actions, @scale)

    # ### Scribble.drawShapesOn(context, shapes[, scale = 1])
    #
    # Draw the specified shapes on the context, as if the context was
    # ana actual scribble.js canvas context.
    @drawShapesOn: (context, shapes, scale) ->
      for action in shapes when action.tool
        $.scribble.tools[action.tool].draw.call(undefined, action, context, scale || 1)
      return


  # # Tools
  #
  # Scribble.js is built with a pluggable, extensible tool foundation. Each tool works
  # by accepting and manipulating events registered on the sketch using an `onEvent`
  # method and then building up **actions** that, when passed to the `draw` method,
  # will render the tool's effect to the canvas. The tool methods are executed without
  # a `this` instance and may not have any state.
  #
  # Tools can be added simply by adding a new key to the `$.scribble.tools` object.
  $.scribble =
    tools:
      marker: require './tools/marker'
      highlighter: require './tools/highlighter'
      eraser: require './tools/eraser'
      text: require './tools/text'


  return Scribble

# # Scribble.js module
#
# The undo class is also exposed.
scribblejs.Undo = Undo

# **Scribble.js** is exported as a function. Simply invoke it with `jQuery` as first argument
# to activate it.
module.exports = scribblejs
