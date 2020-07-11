const baseDir = process.cwd();

const {
    getSunriseSunset
} = require(`${baseDir}/libs/utilities`);

getSunriseSunset(38.5816, 121.4944, 4, data => {
    console.log(data);
});