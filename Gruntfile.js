module.exports = function(grunt) {

    grunt.initConfig({

        "jsbeautifier": {
            "default": {
                src: ["**/*.js", "!node_modules/**/**.js"],
                options: {

                }
            }
        }
    });
    grunt.loadNpmTasks("grunt-jsbeautifier");

    grunt.registerTask('default', ['jsbeautifier']);
}
