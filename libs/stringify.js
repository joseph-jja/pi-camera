function stringify(m) {
    try {
        return JSON.stringify(m);
    } catch (e) {
        return m;
    }
}


module.exports = stringify;