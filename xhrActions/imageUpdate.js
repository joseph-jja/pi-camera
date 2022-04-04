

module.exports = function(resolveFileLocation) {

return (request, response) => {
    if (request.body && Object.keys(request.body).length > 0) {
        const options = filterRequestBody(request.body);
        if (options.length > 0) {
            const spawnOpts = options.map(item => {
                return item.split(' ');
            }).reduce((acc, next) => acc.concat(next));
            setImageUpdateOptions(spawnOpts);
            if (global.imageStreamProcess) {
                const pid = global.imageStreamProcess.pid;
                childProcess.exec(`kill -9 ${pid}`, () => {
                    global.imageStreamProcess = undefined;
                    imageStream(spawnOpts);
                });
            } else {
                imageStream(spawnOpts);
            }
            response.writeHead(200, {});
            const message = `Executed image script with options ${stringify(spawnOpts)} on ${new Date()}`;
            response.end(message);
            logger.info(message);
        }
    } else {
        response.writeHead(200, {});
        response.end('No changes applied!');
    }
};
}
