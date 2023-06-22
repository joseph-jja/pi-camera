import {
    login
} from '#libs/astrometry/login.mjs';

import {
    upload
} from '#libs/astrometry/fileupload.mjs';

// TODO read this in from file
// create action 
const apiKey = '';

login(apiKey).then(session => {
    if (session) {
        const filepath = 'M3-20230603214015-tweaked.png';
        upload(session, filepath).then(status => {
            console.log(status);
        }).catch(xerr => {
            console.log(xerr);
        });
    } else {
        console.log(res);
    }
}).catch(err => {
    console.log(err);
});
