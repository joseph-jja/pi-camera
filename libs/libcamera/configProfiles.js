const {
        mkdirSync,
        readFileSync
    } = require('fs'), 
    {
        writeFile,
        readFile,
        readdir
    } = require('fs').promises;

const basedir = process.cwd(),
    {
        getEnvVar
    } = require(`${basedir}/libs/env`),
    stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    asyncWrapper = require(`${basedir}/libs/PromiseWrapper`);

const HOME_DIR = getEnvVar('HOME');

const PROFILE_DIR = `${HOME_DIR}/profiles`;
      
async function getProfiles() {

    return new Promise(async resolve => {
        const captureProfiles = [];
        const [err, profiles] = await asyncWrapper(readdir(PROFILE_DIR));
        if (!err && Array.isArray(profiles) && profiles.length > 0) {
            profiles.forEach(async item => {
                const [e, filedata] = readFileSync(`${PROFILE_DIR}/${item}`);
                if (!e && filedata) {
                   try {
                       const data = JSON.parse(filedata.toString());
                       captureProfiles.push(data);
                   } catch(e) {
                       logger.error(stringify(e.message)); 
                   }
                }
            });
        }
        return resolve(captureProfiles);
    });
}

function init() {
    try {
        mkdirSync(PROFILE_DIR);
    } catch (e) {
        logger.verbose(e);
    }
}
init();

const IMAGE_RESOLUTION = (getEnvVar('PIVARITY_16MP') ? '--width 2328 --height 1748' : '--width 1640 --height 1232');

module.exports = getProfiles;