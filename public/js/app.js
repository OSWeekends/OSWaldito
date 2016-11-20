var socket = io();

function moveForward(){
    socket.emit('forward');
}

function turnRight(){
    socket.emit('right');
}

function turnLeft(){
    socket.emit('left');
}

function moveReverse(){
    socket.emit('reverse');
}

function stop(){
    socket.emit('stop');
}


var addEvent;

if (typeof window.addEventListener === 'function') {
    addEvent = function(el, type, fn) {
        el.addEventListener(type, fn, false);
    };
} else {
    // Soporte para IE8
    addEvent = function(el, type, fn) {
        el.attachEvent('on' + type, fn);
    };
}

addEvent(document.getElementById('forward'), 'click', moveForward);
addEvent(document.getElementById('right'), 'click', turnRight);
addEvent(document.getElementById('left'), 'click', turnLeft);
addEvent(document.getElementById('reverse'), 'click', moveReverse);
addEvent(document.getElementById('stop'), 'click', stop);

document.addEventListener("keydown", function(event){
  var key = event.which || event.keyCode
  if (key === 87 || key === 38) {
    moveForward();
  } else if (key === 65 || key === 37){
    turnLeft();
  } else if (key === 83 || key === 40){
    moveReverse();
  } else if (key === 68 || key === 39){
    turnRight();
  }
});

document.addEventListener("keyup", function(event){
  var key = event.which || event.keyCode
  switch (key) {
    case 65:
    case 37:
    case 87:
    case 38:
    case 68:
    case 39:
    case 83:
    case 40:
      stop();
  }
});


function talkNow(data){
  var msg = 'Hello Humans! I am Oswaldito, Peace, love and Open Source!'
  if(data){
    msg = data.msg || msg
  }

  var utterance = new SpeechSynthesisUtterance(msg);
  var voices = window.speechSynthesis.getVoices();
  utterance.lang = 'en-US';
  utterance.pitch = 1;
  utterance.voice =  voices[67];
  utterance.voiceURI = voices[67].voiceURI;
  window.speechSynthesis.speak(utterance);
}

  socket.on('voice', function(data){
    talkNow(data);
  });
  
  talkNow("Hello Human!");