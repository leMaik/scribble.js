class EventEmitter
  on: (eventName, listeners...) ->
    @_events or= []
    handlers = @_events[eventName] or= []
    for l in listeners when l not in handlers
      handlers.push l
    return this

  off: (eventName, listeners...) ->
    if eventName
      return if not @_events[eventName]
      if listeners.length > 0
        @_events[eventName] = @_events[eventName].filter (h) -> h not in listeners
      else
        @_events[eventName] = []
    else
      @_events = []

  trigger: (eventName, args...) ->
    if @_events[eventName]
      handler(args) for handler in @_events[eventName]

module.exports = EventEmitter
