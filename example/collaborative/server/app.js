var sharejs = require('share');
var connect = require('connect');
var livedb = require('livedb');
var browserChannel = require('browserchannel');
var Duplex = require('duplex');

// This hosts share.js on http://myserver.com/share.js. See connect/express docs.
var server = connect(connect.static(__dirname + '/public'));

var backend = livedb.client({db: require('livedb-memory-mongo')()});

// Create the sharejs server instance.
var share = sharejs.server.createClient({backend:backend});

server.use(browserChannel.server({webserver: server}, function(client) {
  var stream = new Duplex({objectMode: true});

  stream._write = function(chunk, encoding, callback) {
    if (client.state !== 'closed') {
      client.send(chunk);
    }
    callback();
  };

  stream._read = function() {};

  stream.headers = client.headers;
  stream.remoteAddress = stream.address;

  client.on('message', function(data) {
    stream.push(data);
  });
  stream.on('error', function(msg) {
    client.stop();
  });
  client.on('close', function(reason) {
    stream.emit('close');
    stream.emit('end');
    stream.end();
  });

  // Actually pass the stream to ShareJS
  share.listen(stream);
}));

server.listen(8000, function(){
    console.log('Server running at http://127.0.0.1:8000/');
});