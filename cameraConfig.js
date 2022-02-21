module.exports = [{
    name: 'ISO',
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
    paramName: 'image.png'
},{
    name: 'framerate',
    paramName: '--framerate',
    values: [30, 60]
}];
