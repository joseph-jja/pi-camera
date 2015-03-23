var nodemailer = require('nodemailer'),
    transporter, util = require("util"),
    events = require("events"),
    timerId;

function Mailer() {
    events.EventEmitter.call(this);
}

util.inherits(Mailer, events.EventEmitter);

Mailer.prototype.waitTime = 10000;

Mailer.prototype.setupTransport = function(host, port, user, pass) {
    var options = {
        secure: false,
        host: host,
        port: port,
        auth: {
            user: user,
            pass: pass
        }
    };
    transporter = nodemailer.createTransport(options);
}

Mailer.prototype.sendEmail = function(user, file) {
    var mailOptions;

    if(timerId) {
        return;
    }
    this.emit("start", {
        "filename": file,
        "msg": "Sending an Email.."
    });

    timerId = setTimeout(function() {
        clearTimeout(timerId);
        timerId = null;
    }, this.waitTime);

    console.log('Sending an Email..');
    this.emit("timerSet", {
        "filename": file,
        "time": this.waitTime
    });

    mailOptions = {
        from: user,
        to: user,
        subject: 'Motion Detected',
        text: 'Motion detected. '
    };

    if(file) {
        mailOptions.attachments = [{
            path: file
        }];
    }

    //console.log('DEBUG -- Sendig an Email..' + transporter.sendMail);
    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            console.log("An error occured: " + error);
        } else {
            console.log('Message sent: ' + info.response);
        }
        this.emit("end", {
            "error": error,
            "info": info,
            "filename": file
        });
    });
};

module.exports = Mailer;