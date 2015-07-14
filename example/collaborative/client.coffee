sketchjs = require '../../lib/sketch'
BCSocket = require('./node_modules/browserchannel/dist/bcsocket').BCSocket
sketchjs($);
json = require 'ot-json0'    

$ ->
    sketch = $('#simple_sketch').sketch().sketch();
    
    getUrlParameter = (name) ->
        return (new RegExp(name + '=' + '(.+?)(&|$)').exec(window.location.search)||[null])[1];
    
    socket = new BCSocket(null, {reconnect: true});
    sjs = new sharejs.Connection(socket);
    doc = sjs.get('bla', 'blubbs2');
    
    doc.subscribe();
    
    doc.whenReady ->          
      if (!doc.type)
        doc.create(json.type.name, []);
      ctx = doc.createContext();
    
      doc.on 'after op', ->
        console.log(ctx.get());
        sketch.loadShapes(JSON.parse(ctx.get()));
      
      $('#simple_sketch').on 'change', (e) ->
        if e? and e.data?
            console.log e.data         
            ctx.submitOp doc.type.append({}, [{ p: {}, li: e.data }])
      