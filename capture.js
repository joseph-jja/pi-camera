const os = require('os');

async function start() {

    const baseDir = process.cwd();
    const config = require(`${baseDir}/cameraConfig`);

    const formFields = await import('./libs/form.mjs');

    const fields = config.map(item => {

        if (item.values) {
            return formFields.buildSelect(item.name, item.paramName, item.values);
        } else if (item.range) {
            const values = formFields.getRangeValues(item.range, item.step, item.decimalPlaces);
            return formFields.buildSelect(item.name, item.paramName, values);
        } else {
            console.log('Unsupported field: ', item);
            return '';
        }
    }).reduce((acc, next) => {
        return `${acc}${os.EOL}${next}`; 
    });
   
    console.log(fields); 
}

start();

