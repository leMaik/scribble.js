# based on https://github.com/share/ShareJS/blob/master/examples/ws.coffee
# see http://notherdev.blogspot.com/2014/10/sharejs-073-working-example.html
 
{Duplex} = require 'stream'
http = require 'http';
connect = require 'connect'
morgan = require 'morgan'
serveStatic = require 'serve-static'
argv = require('optimist').argv
livedb = require 'livedb'
livedbMongo = require 'livedb-mongo'
sharejs = require 'share'
 
app = connect()
 
app.use morgan()
app.use '/srv', serveStatic sharejs.scriptsDir
app.use serveStatic "#{__dirname}/public"
 
backend = livedb.client livedb.memory()
#backend = livedb.client livedbMongo('localhost:27017/test?auto_reconnect', safe:false)
 
backend.addProjection '_users', 'users', 'json0', {x:true}
 
share = sharejs.server.createClient {backend}
server = http.createServer app
 
WebSocketServer = require('ws').Server
wss = new WebSocketServer {server}
wss.on 'connection', (client) ->
 
  stream = new Duplex objectMode:yes
  stream._write = (chunk, encoding, callback) ->
    console.log 's->c ', chunk
    client.send JSON.stringify chunk
    callback()
 
  stream._read = -> # Ignore. You can't control the information, man!
 
  stream.headers = client.upgradeReq.headers
  stream.remoteAddress = client.upgradeReq.connection.remoteAddress
 
  client.on 'message', (data) ->
    console.log 'c->s ', data
    stream.push JSON.parse data
 
  stream.on 'error', (msg) ->
    console.error msg
    client.close msg
 
  client.on 'close', (reason) ->
    stream.push null
    stream.emit 'close'
 
    console.log 'client went away'
    client.close reason
 
  stream.on 'end', ->
    client.close()
 
  # ... and give the stream to ShareJS.
  share.listen stream
 
 
port = argv.p or 8080
server.listen port
console.log "Listening on http://localhost:#{port}/"