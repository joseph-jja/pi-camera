const nodemailer = require( 'nodemailer' ),
    baseDir = process.cwd(),
    logger = require( `${baseDir}/libs/logger` ),
    transporter, util = require( "util" ),
    events = require( "events" );

function Mailer() {
    events.EventEmitter.call( this );
}

util.inherits( Mailer, events.EventEmitter );

Mailer.prototype.setupTransport = function ( host, port, user, pass, opts = {} ) {
    var options = {
        secure: opts.secure || false,
        host: host,
        port: port,
        auth: {
            user: user,
            pass: pass
        }
    };
    transporter = nodemailer.createTransport( options );
}

Mailer.prototype.sendEmail = function ( user, file, opts = {} ) {
    var mailOptions, self = this,
        timenow;

    this.emit( "start", {
        "filename": file,
        "msg": "Sending an Email.."
    } );

    logger.info( 'Sending an Email..' );
    timenow = new Date();

    const subject = opts.subject || 'Motion Detected ' + timenow.toDateString(),
        msgText = opts.msg || 'Motion detected at ' + timenow.toString();

    mailOptions = {
        from: user,
        to: user,
        subject: subject,
        text: msgText
    };

    if ( file ) {
        mailOptions.attachments = [ {
            path: file
        } ];
    }

    logger.debug( 'DEBUG -- Sendig an Email..' + transporter.sendMail );
    transporter.sendMail( mailOptions, function ( error, info ) {
        if ( error ) {
            logger.error( "An error occured: " + error );
        } else {
            logger.info( 'Message sent: ' + info.response );
        }
        self.emit( "end", {
            "error": error,
            "info": info,
            "filename": file
        } );
    } );
};

module.exports = Mailer;
