const spawn = require('child_process').spawn;

function whichCommand(checkCommand) {
    return new Promise((resolve, reject) => {
        const whichCmd = spawn('which', [checkCommand]);

        let commandPath;

        whichCmd.stdout.on('data', d => {
            if (d && d.length > 0) {
                commandPath = d.toString().trim().replace(/\/\//g, '/');
            }
        });

        whichCmd.stderr.on('data', d => {
            return reject((d || '').toString());
        });


        whichCmd.on('close', (code) => {
            if (commandPath) {
                return resolve(commandPath);
            } else {
                return reject(`Command: 'which ${checkCommand}' returned ${code}. Command: ${checkCommand} does not exist!`);
            }
        });
    });
}

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const commandToRun = (args && Array.isArray(args) ? spawn(command, args) : spawn(command));

        const results = [];

        commandToRun.stdout.on('data', d => {
            if (d && d.length > 0) {
                results.push(d);
            }
        });

        commandToRun.stderr.on('data', d => {
            // command runs but spits our error message so we are ok to run command
            if (d && d.length > 0) {
                results.push(d);
            }
        });


        commandToRun.on('close', (code) => {
            if (results) {
                return resolve(Buffer.concat(results).toString());
            } else {
                return reject(`Command: ${command} exited with code: ${code} and resulted in no output!`);
            }
        });

    });
}

module.exports = {
    whichCommand,
    runCommand
};