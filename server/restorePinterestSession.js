const jsonfile = require('jsonfile');

module.exports = function restorePinterestSession(page) {
  return new Promise(async (resolve, reject) => {
    const cookies = jsonfile.readFileSync('./cookies.json');
    if (cookies) {
      if (cookies.length !== 0) {
        for (const cookie of cookies) {
          await page.setCookie(cookie);
        }
        resolve('Session has been loaded in the browser');
      }
    } else {
      reject(new Error('No cookies.json file was found'));
    }
  });
};
