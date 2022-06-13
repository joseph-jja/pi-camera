const fs = require('fs'),
    http = require('http');

const express = require('express'),
    {
        Server
    } = require("socket.io");

const basedir = process.cwd();

process.on('uncaughtException', (e) => {
    console.error(e);
});

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getIPAddress,
        getHostname
    } = require(`${basedir}/libs/utils`),

    socketCapture = require(`${basedir}/xhrActions/socketCapture`);

const app = express();
app.disable('x-powered-by');

const port = 12000;
const server = http.createServer(app);
const io = new Server(server);

async function start() {

    const hostname = (await getHostname()).trim();
    const ipaddr = await getIPAddress(hostname);

    server.listen(port);

    io.on('connection', (socket) => {
        logger.info(`Socket has connected with ID: ${socket.id}`);
        socketCapture(socket);
    });

    app.get('/js/socket.io.min.js', (request, response) => {
        response.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8'
        });
        fs.createReadStream('node_modules/socket.io/client-dist/socket.io.min.js').pipe(response);
    });

    app.get('/', (_request, response) => {
        const imageStream = fs.createReadStream(`${basedir}/views/imageStreamer.html`);
        imageStream.pipe(response);
    });

    logger.info(`Listening on IP: ${ipaddr} and port ${port}`);
}
start();
