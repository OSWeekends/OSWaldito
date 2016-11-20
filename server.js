var project = require('pillars'),
    io = require('socket.io')(project.services.get('http').server),
    rpio = require('rpio'),
    fs = require('fs'),
    config = require('./config');

if (config.socialConnectionEnable){
    require('./directo');
}

// Starting the project
project.services.get('http').configure({
    port: process.env.PORT || 3000
}).start();


// Static Files, like index.html in this case
var staticRoute = new Route({
    id: 'staticRoute',
    path: '/*:path',
    directory: {
        path: './public',
        listing: true
    }
});

var streamRoute = new Route({
    id: 'stream',
    path: '/stream/*:path'
  },
    function(gw) {
      var picUrl = './public/cam.jpg'
      if (gw.pathParams.path === "face" || gw.pathParams.path === "hvs" || gw.pathParams.path === "shapes" ){
        picUrl = './public/cam-'+gw.pathParams.path+'.jpg'
      }
      fs.readFile(picUrl, function(err, picture) {
          if (err) throw err;
          gw.setHeader('content-type', 'image/jpeg');
          gw.send(picture)
      });
  });

var leftForward = 38
var leftBackward = 33
var rightForward = 35
var rightBackward = 40

rpio.open(leftForward, rpio.OUTPUT, rpio.LOW);
rpio.open(leftBackward, rpio.OUTPUT, rpio.LOW);
rpio.open(rightForward, rpio.OUTPUT, rpio.LOW);
rpio.open(rightBackward, rpio.OUTPUT, rpio.LOW);

io.on('connection', function (socket) {
    socket.on('talk', function(data){
      console.log("talk disparado con ", data)
      socket.emit('voice', {
        msg: data || "Hello humans! Peace, love and Open Source!",
        voice: "UK English Male"
      })
    })
    socket.on('stop', function () {
        rpio.write(rightForward, rpio.LOW);
        rpio.write(rightBackward, rpio.LOW);
        rpio.write(leftForward, rpio.LOW);
        rpio.write(leftBackward, rpio.LOW);
    });

    socket.on('forward', function () {
        rpio.write(rightForward, rpio.HIGH);
        rpio.write(leftForward, rpio.HIGH);
    });

    socket.on('reverse', function () {
        rpio.write(rightBackward, rpio.HIGH);
        rpio.write(leftBackward, rpio.HIGH);
    });

    socket.on('left', function () {
        rpio.write(rightForward, rpio.HIGH);
        rpio.write(leftBackward, rpio.HIGH);
    });

    socket.on('right', function () {
        rpio.write(rightBackward, rpio.HIGH);
        rpio.write(leftForward, rpio.HIGH);
    });
});

project.routes.add(streamRoute);
project.routes.add(staticRoute);