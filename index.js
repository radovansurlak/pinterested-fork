const express = require('express');
const compression = require('compression');
const puppeteer = require('puppeteer');
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const request = require('request-promise-native');
const helmet = require('helmet');

require('dotenv').config();

const getKeywordData = require('./getKeywordData');

const app = express();

app.use(compression());
app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static('dist'));

function restoreSession(page) {
  return new Promise(async (resolve, reject) => {
    const cookies = jsonfile.readFileSync('./cookies.json');

    if (cookies) {
      if (cookies.length !== 0) {
        for (const cookie of cookies) {
          await page.setCookie(cookie);
        }
        resolve('Session has been loaded in the browser');
      }
    }
  });
}

(async () => {
  const port = process.env.PORT || 3000;

  const loginEmail = process.env.PINTEREST_EMAIL;
  const loginPassword = process.env.PINTEREST_PASSWORD;
  const advertiserId = process.env.PINTEREST_ADVERTISER_ID;

  // const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  // const page = await browser.newPage();
  // await restoreSession(page);

  // await page.goto('https://ads.pinterest.com');

  // await Promise.all([
  //   page.click('[data-test-id="unauthheader-loginbutton"]'),
  //   page.waitForNavigation({ waitUntil: 'networkidle0' }),
  // ]);
  // await page.type('#email', loginEmail);
  // await page.type('#password', loginPassword);
  // await Promise.all([
  //   page.click('.red.SignupButton.active'),
  //   page.waitForNavigation({ waitUntil: 'networkidle0' }),
  // ]);


  // const cookiesObject = await page.cookies();
  // // Write cookies to temp file to be used in other profile pages
  // jsonfile.writeFile('./cookies.json', cookiesObject, { spaces: 2 },
  //   (err) => {
  //     if (err) {
  //       console.log('The file could not be written.', err);
  //     }
  //     console.log('Session has been successfully saved');
  //   });

  app.get('/analyse-global/:keyword', async (req, res) => {
    const { keyword } = req.params;

    const keywordData = await getKeywordData(keyword);
    const flattenedKeywordData = keywordData.flat();
    res.json(flattenedKeywordData);
  });

  app.get('/analyse/:keyword', async (req, res) => {
    const { keyword } = req.params;


    const data = await page.evaluate(async (keyword, advertiserId) => {
      const data = await fetch(`https://api.pinterest.com/ads/v0/keyword_planner/related_keywords/keywords/?country=US&month=6&keywords=${keyword}&advertiser=${advertiserId}`, {
        credentials: 'include', headers: { accept: 'application/json, text/plain, */*', 'sec-fetch-mode': 'cors' }, referrer: 'https://ads.pinterest.com/', referrerPolicy: 'origin', body: null, method: 'GET', mode: 'cors',
      });
      const parsedData = await data.json();
      return JSON.stringify(parsedData.data);
    }, keyword, advertiserId);
    res.json(JSON.parse(data));
  });

  app.listen(port, () => console.log(`Pinterest keyword tool listening on port ${port}!`));
})();
