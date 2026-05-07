/** @type {import('@fullhuman/postcss-purgecss').UserDefinedOptions} */
module.exports = {
    content: ['./index.html'],
    css: ['./dist/assets/**/*.css'],
    fontFace: true,
    keyframes: true,
    // [Bug]: :is and :where selector lists are purged regardless of matching elements · Issue #978 · FullHuman/purgecss
    // https://github.com/FullHuman/purgecss/issues/978#issuecomment-1595425397
    safelist: {
        standard: [/^\:[-a-z]+$/],
    },
};