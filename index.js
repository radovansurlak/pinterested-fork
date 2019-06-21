const express = require('express');
const compression = require('compression');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const sslRedirect = require('heroku-ssl-redirect');
const fs = require('fs');

require('dotenv').config();

const app = express();

const getKeywordData = require('./server/getKeywordData');
const formatVolumeForSort = require('./server/formatVolumeForSort');
const restorePinterestSession = require('./server/restorePinterestSession');

app.use(compression());
app.use(helmet());

app.use(sslRedirect());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Using Pinterest session in Puppeteer to access internal Pinterest API
(async () => {
  // const port = process.env.PORT || 3000;
  const port = 8000;

  const loginEmail = process.env.PINTEREST_EMAIL;
  const loginPassword = process.env.PINTEREST_PASSWORD;
  const advertiserId = process.env.PINTEREST_ADVERTISER_ID;

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await restorePinterestSession(page);

  await page.goto('https://ads.pinterest.com');

  // Uncommented section with programmatical login into Pinterest

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
    const flattenedKeywordData = Array.from(keywordData);
    res.json(flattenedKeywordData);
  });

  app.get('/analyse/:keyword', async (req, res) => {
    const { keyword } = req.params;

    const keywordData = await page.evaluate(async (keyword, advertiserId) => {
      const data = await fetch(`https://api.pinterest.com/ads/v0/keyword_planner/related_keywords/keywords/?country=US&month=6&keywords=${keyword}&advertiser=${advertiserId}`, {
        credentials: 'include', headers: { accept: 'application/json, text/plain, */*', 'sec-fetch-mode': 'cors' }, referrer: 'https://ads.pinterest.com/', referrerPolicy: 'origin', body: null, method: 'GET', mode: 'cors',
      });
      const parsedData = await data.json();
      return parsedData.data;
    }, keyword, advertiserId);

    if (keywordData === null) {
      res.json(null);
      return;
    }
    // Formatting the output data to include numerical search volume property
    const dataWithSortVolume = keywordData.map((keywordObject) => {
      keywordObject.sortVolume = formatVolumeForSort(keywordObject.metrics.KEYWORD_QUERY_VOLUME);
      return keywordObject;
    });

    const dataSortedBySearchVolume = dataWithSortVolume.sort((current, next) => {
      if (current.sortVolume < next.sortVolume) {
        return 1;
      }
      if (current.sortVolume > next.sortVolume) {
        return -1;
      }
      return 0;
    });
    res.json(dataSortedBySearchVolume);
  });
  app.listen(port, () => console.log(`Pinterest keyword tool listening on port ${port}!`));
  fs.openSync('/tmp/app-initialized', 'w');
})();
