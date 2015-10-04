EventEmitter = require './events'

class Undo extends EventEmitter
  constructor: ->
    @undoStack = []
    @redoStack = []

  push: (state) ->
    @undoStack.push state
    if @undoStack.length == 1
      @trigger 'undoAvailable'
    if @redoStack.length > 0
      @redoStack = []
      @trigger 'redoUnavailable'

  undo: (state) ->
    if @undoStack.length > 0
      @redoStack.push state
      restoredState = @undoStack.pop()

      if @undoStack.length == 0
        @trigger 'undoUnavailable'
      if @redoStack.length == 1
        @trigger 'redoAvailable'

      return restoredState
    else
      return state

  redo: (state) ->
    if @redoStack.length > 0
      @undoStack.push state
      restoredState = @redoStack.pop()

      if @undoStack.length == 1
        @trigger 'undoAvailable'
      if @redoStack.length == 0
        @trigger 'redoUnavailable'

      return restoredState
    return state

module.exports = Undo
