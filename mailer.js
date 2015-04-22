var nodemailer = require( 'nodemailer' ),
    winston = require( "winston" ),
    transporter, util = require( "util" ),
    events = require( "events" );

function Mailer() {
    events.EventEmitter.call( this );
}

util.inherits( Mailer, events.EventEmitter );

Mailer.prototype.setupTransport = function ( host, port, user, pass ) {
    var options = {
        secure: false,
        host: host,
        port: port,
        auth: {
            user: user,
            pass: pass
        }
    };
    transporter = nodemailer.createTransport( options );
}

Mailer.prototype.sendEmail = function ( user, file ) {
    var mailOptions, self = this,
        timenow;

    this.emit( "start", {
        "filename": file,
        "msg": "Sending an Email.."
    } );

    winston.log( "info", 'Sending an Email..' );
    timenow = new Date();
    this.emit( "timerSet", {
        "filename": file,
        "time": timenow.toDateString()
    } );

    mailOptions = {
        from: user,
        to: user,
        subject: 'Motion Detected ' + timenow.toDateString(),
        text: 'Motion detected at ' + timenow.toString()
    };

    if ( file ) {
        mailOptions.attachments = [ {
            path: file
        } ];
    }

    winston.log( "debug", 'DEBUG -- Sendig an Email..' + transporter.sendMail );
    transporter.sendMail( mailOptions, function ( error, info ) {
        if ( error ) {
            winston.log( "error", "An error occured: " + error );
        } else {
            winston.log( "info", 'Message sent: ' + info.response );
        }
        self.emit( "end", {
            "error": error,
            "info": info,
            "filename": file
        } );
    } );
};

module.exports = Mailer;
