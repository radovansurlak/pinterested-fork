module.exports = {
  plugins: {
    'posthtml-expressions': {
      delimiters: ['{==', '==}'],
      locals: {
        GTM_ID: process.env.GTM_ID,
        HOTJAR_ID: process.env.HOTJAR_ID,
      },
    },
  },
};
