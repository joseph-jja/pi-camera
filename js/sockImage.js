const image = document.getElementById('stream-image');
const xcanvas = document.getElementById('new-player');
const context = xcanvas.getContext('2d');
xcanvas.width = 640;
xcanvas.height = 480;
context.width = xcanvas.width;
context.height = xcanvas.height;
const socket = io(); /* eslint-disable-line */
socket.on('connect', () => {
    console.log('Socket connected ', socket.id);
});
socket.on('status', (data) => {
    console.log('Got data ', data);
});
