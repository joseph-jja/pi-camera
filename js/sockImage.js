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
    const keys = Object.keys(data);
    const results = keys.map(key => {
        return `<br>${key}: ${JSON.stringify(data[key])}`;
    }).reduce((acc, next) => {
        return acc + next;
    });
    socketInfo.innerHTML = results;
});
