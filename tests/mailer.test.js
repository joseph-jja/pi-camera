const baseDir = process.cwd();

const Mailer = require(`${baseDir}/mailer`);

const mail = new Mailer();

const host = process.argv[2], 
	port = process.argv[3],
	user = process.argv[4],
	pass = process.argv[5];

mail.setupTransport(host, port, user, pass);

mail.sendEmail(user, `${baseDir}/mailer.js`);

