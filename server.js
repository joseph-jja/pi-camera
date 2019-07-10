const express = require('express'),
    baseDir = __dirname,
    args = process.argv,
    bodyParser = require('body-parser'),
    logger = require(`${baseDir}/libs/logger`)(__filename),
    exec = require("child_process").exec,
    app = express(),
    https = require('https'),
    http = require('http'),
    util = require('util'),
    fs = require("fs");

const readFile = util.promisify(fs.readFile);

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// read config
const clientCode = args[2];
const clientConfig = args[3];
const config = JSON.parse(fs.readFileSync(clientConfig));

let baseLayout,
    indexPg;

async function sendResponse(res, toggle) {
    let result, cmd;
    cmd = "node " + clientCode + " " + clientConfig;
    if (typeof toggle !== 'undefined') {
        cmd = cmd + " " + toggle;
    }

    let pgs;
    if (!baseLayout || !indexPg) {
        baseLayout = await readFile(`${baseDir}/views/layouts/baseLayout.hbs`);
        indexPg = await readFile(`${baseDir}/views/index.hbs`);
        baseLayout = baseLayout.toString();
        indexPg = indexPg.toString();
    }

    result = exec(cmd, function(err, stdout, stderr) {
        let result = '';
        if (stdout) {
            result += stdout;
        }
        if (stderr) {
            result += stderr;
        }
        if (err) {
            result += err;
        }

        let pageData = '';
        if (result) {
            logger.debug(result);
            result = result.replace("Done!", "");
            try {
                result = JSON.parse(result);
            } catch (e) {}
            if (result && result[config.replyMessage]) {
                pageData = indexPg.replace('{{currentState}}', 'Disabled');
                pageData = pageData.replace('{{nextState}}', 'Enable');
            } else {
                pageData = indexPg.replace('{{currentState}}', 'Enabled');
                pageData = pageData.replace('{{nextState}}', 'Disable');
            }
        } else {
            pageData = indexPg.replace('{{currentState}}', '');
            pageData = pageData.replace('{{nextState}}', 'error');
        }

        res.send(baseLayout.replace('{{{ body }}}', pageData));
    });
}

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
    sendResponse(res);
});

// deal wtih a post
app.post('/update', function(req, res) {
    let updateKey;
    logger.info("Key = " + req.body.changeModeKey);
    if (req.body.changeModeKey && req.body.changeModeKey == config.changeModeKey) {
        updateKey = req.body.changeModeKey;
    }
    sendResponse(res, updateKey);
});

const sslOptions = {
    key: fs.readFileSync(`${baseDir}/keys/domain.key`).toString(),
    cert: fs.readFileSync(`${baseDir}/keys/domain.csr`).toString()
}

const secureServer = https.createServer(sslOptions, app);
secureServer.listen(5443);
logger.info("Listening on port 5443, secure-ish!");

/*
const server = http.createServer( app );
server.listen( 5000 );
logger.info( "Listening on port 5000, not secure!" );
*/
