EventEmitter = require './events'

class Undo extends EventEmitter
  constructor: ->
    @undoStack = []
    @redoStack = []

  push: (action) ->
    @undoStack.push action
    if @undoStack.length == 1
      @trigger 'undoAvailable'
    if @redoStack.length > 0
      @redoStack = []
      @trigger 'redoUnavailable'

  undo: () ->
    if @undoStack.length > 0
      action = @undoStack.pop()
      action.undo()
      @redoStack.push action

      if @undoStack.length == 0
        @trigger 'undoUnavailable'
      if @redoStack.length == 1
        @trigger 'redoAvailable'

  redo: () ->
    if @redoStack.length > 0
      action = @redoStack.pop()
      action.redo()
      @undoStack.push action

      if @undoStack.length == 1
        @trigger 'undoAvailable'
      if @redoStack.length == 0
        @trigger 'redoUnavailable'

module.exports = Undo
