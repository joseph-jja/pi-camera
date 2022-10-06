const childProcess = require('child_process');

module.exports = (request, response) => {
    response.writeHead(200, {});
    response.end('');
    childProcess.spawn('sudo', ['shutdown', '-P', 'now']);
};
