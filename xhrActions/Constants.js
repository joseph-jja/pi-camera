const OLD_FILENAME_MATCH = /^[a-zA-Z]*-(\d)*\.[a-z0-9]*$/;

const VALID_CHARACTERS = /[a-zA-Z]/g;

const PLATE_SOLVE_DIR = `${process.env.HOME}/solved`;

module.exports = {
    OLD_FILENAME_MATCH,
    VALID_CHARACTERS,
    PLATE_SOLVE_DIR
};
