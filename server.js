var express = require( 'express' ),
    server,
    secureServer,
    args = process.argv,
    bodyParser = require( 'body-parser' ),
    winston = require( 'winston' ),
    exec = require( "child_process" ).exec,
    exphbs = require( 'express-handlebars' ),
    app = express(),
    https = require( 'https' ),
    http = require( 'http' ),
    fs = require( "fs" ),
    clientCode,
    options = {},
    clientConfig,
    config;

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
clientCode = args[ 2 ];
clientConfig = args[ 3 ];
config = JSON.parse( fs.readFileSync( clientConfig ) );

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

server = http.createServer( app );
server.listen( 5000 );
winston.log( 'info', "Listening on port 5000, not secure!" );
//secureServer = https.createServer(options, app);
//secureServer.listen(5443);
