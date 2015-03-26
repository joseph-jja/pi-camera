var nodemailer = require('nodemailer'), 
  transporter, 
  isSending = false,
  timerId;

function setupTransport(host, port, user, pass) {
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
  
function sendEmail(user, file) {
  var mailOptions;
  
  if (timerId) {
    return;
  }
  
  timerId = setTimeout(function() {
    clearTimeout(timerId);
    timerId = null;
  }, 10000);

  console.log('Sending an Email..');

  mailOptions = {
    from: user,
    to: user,
    subject: 'Motion Detected',
    text: 'Motion detected. '
  };

  if ( file ) {
    mailOptions.attachments = [{
      path: file
    }];
  }

  //console.log('DEBUG -- Sendig an Email..' + transporter.sendMail);
  transporter.sendMail(mailOptions, function(error, info) {
    console.log('DEBUG -- Sending an Email..');
    if (error) {
      console.log("An error occured: " + error);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });
};

module.exports = {
  setupTransport: setupTransport,
  sendEmail: sendEmail
};

