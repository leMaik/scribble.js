sketchjs = require '../../lib/sketch'
BCSocket = require('./node_modules/browserchannel/dist/bcsocket').BCSocket
sketchjs($);
json = require 'ot-json0'    
jsondiff = require 'jsondiff-share-ops'

$ ->
    $.each ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#000', '#fff'], ->
      $('#tools').append "<a href='#simple_sketch' data-color='" + this + "' style='border: 1px solid black; width: 30px; height: 30px; background: " + this + "; display: inline-block;'></a> "
        
    sketch = $('#simple_sketch').sketch().sketch();
    
    getUrlParameter = (name) ->
        return (new RegExp(name + '=' + '(.+?)(&|$)').exec(window.location.search)||[null])[1];
    
    socket = new BCSocket(null, {reconnect: true})
    sjs = new sharejs.Connection(socket)
    doc = sjs.get('bla', 'blubbs2')
    ctx = null
    
    doc.subscribe ->
      sketch.loadShapes ctx.getSnapshot().shapes.slice(), yes  
       
    doc.whenReady ->          
      if (!doc.type)
        doc.create json.type.name, { shapes: [] }
      ctx = doc.createContext()
      ctx.addListener {}, '', -> #workaround for json0 api bug
      doc.on 'after op', ->
        sketch.loadShapes ctx.getSnapshot().shapes.slice(), yes
        
      $('#simple_sketch').on 'afterPaint', (e, newShapes, old) ->
        diff = jsondiff.diff { shapes: old }, { shapes: newShapes }
        ctx.submitOp diff if diff.length > 0