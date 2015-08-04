var express = require( 'express' ),
    server,
    args = process.argv,
    winston = require( 'winston' ),
    exec = require( "child_process" ).exec,
    exphbs = require( 'express-handlebars' ),
    app = express(),
    fs = require( "fs" ),
    config;

app.engine( '.hbs', exphbs( {
    defaultLayout: 'baseLayout',
    extname: '.hbs'
} ) );
app.set( 'view engine', '.hbs' );

// read config
config = JSON.parse( fs.readFileSync( args[ 3 ] ) );

// respond with "hello world" when a GET request is made to the homepage
app.get( '/', function ( req, res ) {
    var result, cmd;
    cmd = "node " + args[ 2 ] + " " + args[ 3 ];
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
        result = result.replace( "Done!", "" );
        result = JSON.parse( result );
        res.render( 'index', {
            "currentState": result[ config.replyMessage ]
        } );
    } );
} );

server = app.listen( 3000, function () {

    var host, port;

    host = server.address().address;
    port = server.address().port;

    winston.log( 'info', 'Listening at http://%s:%s', host, port );

} );
