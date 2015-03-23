var nodemailer = require('nodemailer'), 
  
  transporter, 
  timerId;

function setupTransport(host, port, user, pass) {
  transporter = nodemailer.createTransport({
    host: host,
    port: port,
    auth: {
      user: user,
      pass: pass
    }
  });
  
function sendEmail(user, smtphost, port, file) {
  var mailOptions;
  if (timerId) {
    return;
  }
  
  timerId = setTimeout(function() {
    clearTimeout(timerId);
    timerId = null;
  }, 10000);

  console.log('Sendig an Email..');

  mailOptions = {
    from: 'Video Cam ' + user,
    to: user,
    subject: 'Motion Detected',
    text: 'Motion detected. ' + Date(),
    attachments: [{
      path: file
    }]
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });
};

module.exports = {
  setupTransport: setupTransport,
  sendEmail: sendEmail
};

