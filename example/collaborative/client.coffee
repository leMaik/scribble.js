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
      sketch.loadShapes(ctx?.getSnapshot().shapes);
    
    doc.whenReady ->          
      if (!doc.type)
        doc.create json.type.name, old
      ctx = doc.createContext()
      old = (ctx.getSnapshot()
      
      $('#simple_sketch').on 'change', -> 
        diff = jsondiff.diff old, { shapes: sketch.getShapes() }  
        old = { shapes: sketch.getShapes() }  
        ctx.submitOp diff
          