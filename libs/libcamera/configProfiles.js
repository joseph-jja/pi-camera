const mkdirSync = require('fs').mkdirSync, 
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

function init() {
    try {
        mkdirSync(PROFILE_DIR);
    } catch (e) {
        logger.verbose(e);
    }
}
init();

const CAPTURE_PROFILES = [];
      
async function getProfiles() {
    
    const [err, profiles] = await asyncWrapper(readdir(PROFILE_DIR));
    if (!err && Array.isArray(profiles) && profiles.length > 0) {
        profiles.forEach(async item => {
            const [e, filedata] = await asyncWrapper(readFile(item));
            if (!e) {
               try {
                   const data = JSON.parse(filedata);
                   CAPTURE_PROFILES.push(data);
               } catch(e) {
                   logger.info(stringify(e)); 
               }
            }
        });
    }
}

const IMAGE_RESOLUTION = (getEnvVar('PIVARITY_16MP') ? '--width 2328 --height 1748' : '--width 1640 --height 1232');

module.exports = CAPTURE_PROFILES;
    
    /*[{
    name: 'Star Capture - No tracking',
    fields: [{
        name: 'ISO_Gain',
        value: '--gain 40.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 10.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'framerate',
        value: '--framerate 4',
        forms: ['videoOptions']
    }, {
        name: 'shutter_speed',
        value: '--shutter 250000',
        forms: ['imageOptions']
    }, {
        name: 'quality',
        value: '--quality 100',
        forms: ['imageOptions']
    }, {
        name: 'videoSize',
        value: '--width 1920 --height 1080',
        forms: ['videoOptions']
    }, {
        name: 'imageSize',
        value: IMAGE_RESOLUTION,
        forms: ['imageOptions']
    }]
}, {
    name: 'Star Capture - Tracking (2s)',
    fields: [{
        name: 'ISO_Gain',
        value: '--gain 40.0',
        forms: ['videoOptions']
    }, {
        name: 'ISO_Gain',
        value: '--gain 8.0',
        forms: ['imageOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 10.0',
        forms: ['videoOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 4.0',
        forms: ['imageOptions']
    }, {
        name: 'framerate',
        value: '--framerate 4',
        forms: ['videoOptions']
    }, {
        name: 'shutter_speed',
        value: '--shutter 2000000',
        forms: ['imageOptions']
    }, {
        name: 'quality',
        value: '--quality 100',
        forms: ['imageOptions']
    }, {
        name: 'videoSize',
        value: '--width 1920 --height 1080',
        forms: ['videoOptions']
    }, {
        name: 'imageSize',
        value: IMAGE_RESOLUTION,
        forms: ['imageOptions']
    }]
}, {
    name: 'Star Capture - Tracking (10s)',
    fields: [{
        name: 'ISO_Gain',
        value: '--gain 40.0',
        forms: ['videoOptions']
    }, {
        name: 'ISO_Gain',
        value: '--gain 8.0',
        forms: ['imageOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 10.0',
        forms: ['videoOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 6.0',
        forms: ['imageOptions']
    }, {
        name: 'framerate',
        value: '--framerate 4',
        forms: ['videoOptions']
    }, {
        name: 'shutter_speed',
        value: '--shutter 10000000',
        forms: ['imageOptions']
    }, {
        name: 'quality',
        value: '--quality 100',
        forms: ['imageOptions']
    }, {
        name: 'videoSize',
        value: '--width 1920 --height 1080',
        forms: ['videoOptions']
    }, {
        name: 'imageSize',
        value: IMAGE_RESOLUTION,
        forms: ['imageOptions']
    }]
}, {
    name: 'Star Capture - Tracking (30s)',
    fields: [{
        name: 'ISO_Gain',
        value: '--gain 40.0',
        forms: ['videoOptions']
    }, {
        name: 'ISO_Gain',
        value: '--gain 8.0',
        forms: ['imageOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 10.0',
        forms: ['videoOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 4.0',
        forms: ['imageOptions']
    }, {
        name: 'framerate',
        value: '--framerate 4',
        forms: ['videoOptions']
    }, {
        name: 'shutter_speed',
        value: '--shutter 30000000',
        forms: ['imageOptions']
    }, {
        name: 'quality',
        value: '--quality 100',
        forms: ['imageOptions']
    }, {
        name: 'videoSize',
        value: '--width 1920 --height 1080',
        forms: ['videoOptions']
    }, {
        name: 'imageSize',
        value: IMAGE_RESOLUTION,
        forms: ['imageOptions']
    }]
}, {
    name: 'Moon Capture - No Tracking',
    fields: [{
        name: 'ISO_Gain',
        value: '--gain 1.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev -1.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'framerate',
        value: '--framerate 30',
        forms: ['videoOptions']
    }, {
        name: 'videoSize',
        value: '--width 1920 --height 1080',
        forms: ['videoOptions']
    }, {
        name: 'imageSize',
        value: IMAGE_RESOLUTION,
        forms: ['imageOptions']
    }]
}, {
    name: 'Saturn Capture',
    fields: [{
        name: 'ISO_Gain',
        value: '--gain 40.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 10.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'framerate',
        value: '--framerate 60',
        forms: ['videoOptions']
    }, {
        name: 'quality',
        value: '--quality 100',
        forms: ['imageOptions']
    }, {
        name: 'videoSize',
        value: '--width 1280 --height 720',
        forms: ['videoOptions']
    }, {
        name: 'imageSize',
        value: IMAGE_RESOLUTION,
        forms: ['imageOptions']
    }]
}, {
    name: 'Jupiter Capture',
    fields: [{
        name: 'ISO_Gain',
        value: '--gain 14.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 0.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'framerate',
        value: '--framerate 60',
        forms: ['videoOptions']
    }, {
        name: 'quality',
        value: '--quality 100',
        forms: ['imageOptions']
    }, {
        name: 'videoSize',
        value: '--width 1280 --height 720',
        forms: ['videoOptions']
    }, {
        name: 'imageSize',
        value: IMAGE_RESOLUTION,
        forms: ['imageOptions']
    }]
}];*/
