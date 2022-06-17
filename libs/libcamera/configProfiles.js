const basedir = process.cwd(),
    {
        getEnvVar
    } = require(`${basedir}/libs/env`);

const IMAGE_RESOLUTION = (getEnvVar('PIVARITY_16MP') ? '--width 2328 --height 1748' : '--width 1640 --height 1232');

module.exports = [{
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
    name: 'Star Capture - Tracking',
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
}];
