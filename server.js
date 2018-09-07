var express = require( 'express' ),
    baseDir = process.cwd(),
    args = process.argv,
    bodyParser = require( 'body-parser' ),
    winston = require( 'winston' ),
    exec = require( "child_process" ).exec,
    exphbs = require( 'express-handlebars' ),
    app = express(),
    https = require( 'https' ),
    http = require( 'http' ),
    fs = require( "fs" );

app.engine( '.hbs', exphbs( {
    defaultLayout: 'baseLayout',
    extname: '.hbs'
} ) );

app.set( 'view engine', '.hbs' );

// for parsing application/json
app.use( bodyParser.json() );
// for parsing application/x-www-form-urlencoded
app.use( bodyParser.urlencoded( {
    extended: true
} ) );

// read config
const clientCode = args[ 2 ];
const clientConfig = args[ 3 ];
const config = JSON.parse( fs.readFileSync( clientConfig ) );

function sendResponse( res, toggle ) {
    var result, cmd;
    cmd = "node " + clientCode + " " + clientConfig;
    if ( typeof toggle !== 'undefined' ) {
        cmd = cmd + " " + toggle;
    }
    result = exec( cmd, function ( err, stdout, stderr ) {
        var result = '';
        if ( stdout ) {
            result += stdout;
        }
        if ( stderr ) {
            result += stderr;
        }
        if ( err ) {
            result += err;
        }
        if ( result ) {
            winston.debug(result);
            result = result.replace( "Done!", "" );
            result = JSON.parse( result );
            res.render( 'index', {
                "currentState": result[ config.replyMessage ]
            } );
        } else {
            res.render( 'index', {
                "currentState": "error"
            } );
        }
    } );
}

// respond with "hello world" when a GET request is made to the homepage
app.get( '/', function ( req, res ) {
    sendResponse( res );
} );

// deal wtih a post
app.post( '/update', function ( req, res ) {
    var updateKey;
    winston.log( 'info', "Key = " + req.body.changeModeKey );
    if ( req.body.changeModeKey && req.body.changeModeKey == config.changeModeKey ) {
        updateKey = req.body.changeModeKey;
    }
    sendResponse( res, updateKey );
} );

const sslOptions = { 
    key: fs.readFileSync(`${baseDir}/keys/domain.key`).toString(),
    cert: fs.readFileSync(`${baseDir}/keys/domain.csr`).toString()
}

const secureServer = https.createServer(sslOptions, app);
secureServer.listen(5443);
winston.log( 'info', "Listening on port 5443, secure-ish!" );

//const server = http.createServer( app );
//server.listen( 5000 );
//winston.log( 'info', "Listening on port 5000, not secure!" );

