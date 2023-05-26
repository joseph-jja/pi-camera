import {
    io
} from "/js/socket.io.esm.min.js";

const socketInfo = document.getElementById('server-info');

const socket = io();
socket.on('connect', () => {
    console.log('Socket connected ', socket.id);
    setInterval(() => {
        // ping
        socket.emit('status', {});
    }, 5000);
});
socket.on('info', (data) => {
    //console.log('Got data ', data);
    const keys = Object.keys(data);
    const results = keys.map(key => {
        return `${key}: ${JSON.stringify(data[key])}`;
    }).reduce((acc, next) => {
        return `${acc} <br> ${next}`;
    });
    socketInfo.innerHTML = results;
});

socket.on('histogram', (data) => {

});
/*
partial code to graph histogtam
const h = window.canvasRef.height-10;
posx = 10;

Object.keys(x).forEach(key => {

  v = x[key];// value
    
  ys = h;
  ye =  h - Math.ceil(v/h);

  for ( let i = 0; i<2; i++ ) {
    window.canvasRef.line(posx, ys, posx, ye);
    posx++;
  }

});

*/

