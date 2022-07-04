const OLD_FILENAME_MATCH = /^[a-zA-Z0-9]*-(\d)*\.[a-z0-9]*$/;

const PLATE_SOLVE_FILENAME_MATCH = /^[a-zA-Z0-9]*-(\d)*\-objs.[a-z0-9]*$/;

const VALID_CHARACTERS = /[a-zA-Z0-9]/g;

const PLATE_SOLVE_DIR = `${process.env.HOME}/solved`;

module.exports = {
    OLD_FILENAME_MATCH,
    PLATE_SOLVE_FILENAME_MATCH,
    VALID_CHARACTERS,
    PLATE_SOLVE_DIR
};
