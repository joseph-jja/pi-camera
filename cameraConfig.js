module.exports = [{
    name: 'ISO_Gain',
    paramName: '--gain',
    range: [1, 40],
    step: 0.1,
    decimalPlaces: 1
},{
    name: 'videoSize',
    paramName: '',
    values:['--width 640 --height 480', '--width 1296 --height 730']
},{
    name: 'filename',
    fieldValue: 'video.png'
},{
    name: 'EV_compensation',
    paramName: '--ev',
    range: [-10, 10],
    step: 0.1,
    decimalPlaces: 1
},{
    name: 'metering',
    paramName: '--metering',
    values: ['centre', 'spot', 'average'] // 'custom'
},{
    name: 'framerate',
    paramName: '--framerate',
    values: [30, 60]
}];
