const socketInfo = document.getElementById('server-info');

const socket = io(); /* eslint-disable-line */
socket.on('connect', () => {
    console.log('Socket connected ', socket.id);
    setInterval(() => {
        // ping
        socket.emit('status', {});
    }, 5000);
});
socket.on('info', (data) => {
    console.log('Got data ', data);
    socketInfo.innerHTML = data;
});
