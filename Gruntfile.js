module.exports = function ( grunt ) {

    grunt.initConfig( {

        "jsbeautifier": {
            "default": {
                src: [ "**/*.js", "!node_modules/**/**.js" ],
                options: {
                    js: {
                        braceStyle: "collapse",
                        breakChainedMethods: false,
                        e4x: false,
                        evalCode: false,
                        indentChar: " ",
                        indentLevel: 0,
                        indentSize: 4,
                        indentWithTabs: false,
                        jslintHappy: true,
                        keepArrayIndentation: false,
                        keepFunctionIndentation: false,
                        maxPreserveNewlines: 5,
                        preserveNewlines: true,
                        spaceBeforeConditional: true,
                        spaceInParen: true,
                        unescapeStrings: false,
                        wrapLineLength: 0,
                        endWithNewline: true
                    }
                }
            }
        }
    } );
    grunt.loadNpmTasks( "grunt-jsbeautifier" );

    grunt.registerTask( 'default', [ 'jsbeautifier' ] );
}
