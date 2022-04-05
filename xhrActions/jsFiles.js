const fs = require('fs');

module.exports = (request, response) => {
    const baseFileName = request.url.replace(/\/js\//, '');
    response.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8'
    });
    fs.createReadStream(`js/${baseFileName}`).pipe(response);
};