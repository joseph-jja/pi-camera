module.exports = [{
    name: 'Star Capture',
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
    }]
}, {
    name: 'Moon Capture',
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
        value: '--framerate 15',
        forms: ['videoOptions']
    }, {
        name: 'videoSize',
        value: '--width 1920 --height 1080',
        forms: ['videoOptions']
    }]
}];
