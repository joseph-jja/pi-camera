var express = require( 'express' ),
    server,
    args = process.argv,
    exec = require( "child_process" ).exec,
    app = express();

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
        res.send( '<html><body><pre>' + result + '</pre></body></html>' );
    } );
} );

server = app.listen( 3000, function () {

    var host, port;

    host = server.address().address;
    port = server.address().port;

    console.log( 'Listening at http://%s:%s', host, port );

} );
