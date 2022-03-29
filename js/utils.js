function sleep(time) {
    const sleepTime = time * 1000;
    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, sleepTime);
    });
}