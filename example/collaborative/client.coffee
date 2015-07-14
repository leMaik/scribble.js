sketchjs = require '../../lib/sketch'
BCSocket = require('./node_modules/browserchannel/dist/bcsocket').BCSocket
sketchjs($);
json = require 'ot-json0'    
jsondiff = require 'jsondiff-share-ops'

$ ->
    sketch = $('#simple_sketch').sketch().sketch();
    
    getUrlParameter = (name) ->
        return (new RegExp(name + '=' + '(.+?)(&|$)').exec(window.location.search)||[null])[1];
    
    socket = new BCSocket(null, {reconnect: true})
    sjs = new sharejs.Connection(socket)
    doc = sjs.get('bla', 'blubbs2')
    ctx = null
    
    doc.subscribe ->
      sketch.loadShapes(ctx?.getSnapshot().shapes)
      
    doc.on 'after op', ->
      sketch.loadShapes(ctx?.getSnapshot().shapes)
    
    doc.whenReady ->          
      if (!doc.type)
        doc.create json.type.name, { shapes: [] }
      ctx = doc.createContext()
      
      $('#simple_sketch').on 'change', (e, newShapes, old) ->
        if arguments.length >= 3
            diff = jsondiff.diff { shapes: old }, { shapes: newShapes }
            ctx.submitOp diff