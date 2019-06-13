const express = require('express');
const compression = require('compression');

const bodyParser = require('body-parser');

const axios = require('axios');
const request = require('request-promise-native');


const processKeywordResearch = require('./getKeywordData');

const app = express();

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


app.use(express.static('dist'));

app.get('/pinterest-api/:keyword', async (req, res) => {
  const { keyword } = req.params;
  console.log(keyword);


  // const { code: authorizationCode, state } = req.query;
  // const response = await axios.post(`https://api.pinterest.com/v1/oauth/token?grant_type=authorization_code&client_id=5038129916334353792&client_secret=3cc5770ef2a2fb0327e9b397250c23ebdd9c1639aa9d2ab8ff04ebadd6b1f87b&code=${authorizationCode}`);
  // const { access_token: accessToken } = response.data;
  // console.log(accessToken);

  try {
    // const test = await axios(`https://api.pinterest.com/ads/v0/keyword_planner/related_keywords/keywords/?access_token=${accessToken}&country=US&month=6&keywords=banana&advertiser=549759187271`);


    const headers = {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      Referer: 'https://ads.pinterest.com/',
      Origin: 'https://ads.pinterest.com',
      DNT: '1',
      Connection: 'keep-alive',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      TE: 'Trailers',
      Cookie: '_ir=0; _auth=1; _pinterest_sess=TWc9PSZEeW9nemhjYXJqaCtYQmw2blA4VmlWOExrWVZ4TkZDYUs3YUZKSzA1RHY3SzhtY1NyZ3J4NmM1WW85dGF4UnhmMmNoblprODF6YkYwL0tiWlpQRVFUeTdJMCtua1JrRkdMbVZTZTJENGNOUUtud2lKZE4xcGlmSEl6NlkwQWxnR25MSitNTmlob0NPUFdMRHNMN0lnd2Fua2V0Q1NudkZxZEZPUFhzM1RoVVRsWVkyQ0xaN25mMzFoZUtPUUFONkdUNHhvcno3Kys2VDJ4dFBTTW1jUnJNZGlzOEtuM05xaGlIdktPN3ZVNXlWSWpmeGRmWHBVSUd1WFJoSllVWElBWDhlaytxKzZ6N3VqT0JmYXZJdGVkQmxScEEwWXJXaUNoSXVIQ3V1QWx1VWlta0NwVVJsL2wwN3hSeG56YmF4QThRU2E2VHZ5WWpzUERPMk9sN3V4a2RuMFQ4UnZKVG9jRVlKV0R1UXJZZnduUlg2OHdUenJKUDJNMWx6N1ZLYjFIOEg4eWJoQVBlWFNMbFVlSW1KdnpWY0dzdGcxUUtBMlRVZWZNVXRaUmZaZjBzUklYVlB6UzhuZnI4aHpvSmpXa3BKUE5SK0xDTTc1dWd1WDd1TUZBQmRzUVJZS05sTlE2c2RiVElLMldubllTVFlOTnVmaldWRFljNThsZnQxQWwvdHJxbzl5Mm1pY2JObTlPVDdzWU1XTEpaUzRRTEpSdTVTaDBqOEVtbFQyRmtORGxvQjFkakZacnYwcERqczRTN3ZCbmJDUXV6NUZZK0NHVzhqSUVhLzVDUnc0VFZEUkhyYzV1c1Z0MGprWUkrVmNqdDk3YTlIK3h2MS9FYXZXSi9yeHJVYzBDMU9YU0Z1eVBGbTZDVHBLcW1FU2ZrekhaWTFPcXlmdTVDeU1HWnBILy9qaXAvQVZhaGlvKy9ZcXIwS0gwaWRKai9ETXIxS01ubDRmUTgyS1ZEK29ORDJHcmg5OTh2Rm9nS05jS2NEZjRqRWVUVUtZcXFYZHJTZndSbEc4eC8wb0NDUWhzV2d3bklLM0NXN1VMZlJxWjRiNm80eXErUnZkZmMydHJVOER2SDdLMlFnUjl1RVcrbU5zbmFQSDVvZFBYQ2R4SWMyMzZjUU44QXB2MktONTZaWnE4ZXBVRDZRbnFUND0malExckh2WlNHcmxoNXZLcTZ4WThLZzRGaGFFPQ==; _b=AT7pYH0Hdj1IyJuTw8nn4fpmWeOM4EWyXK0xPuFAEKewN0tPHUyLCyvbkfXsRIzzDRg=; _pinterest_pfob=enabled',
    };

    const options = {
      url: `https://api.pinterest.com/ads/v0/keyword_planner/related_keywords/keywords/?country=US&month=6&keywords=${keyword}&advertiser=549759187271`,
      headers,
    };

    const response = await request(options);


    console.log(JSON.parse(response));

    
    res.json(JSON.parse(response));
  } catch (error) {
    console.log(error);
  }
});


app.post('/getKeywords', async (req, res) => {
  const { keyword, levels } = req.body;
  // const keywords = await processKeywordResearch(keyword, levels);
  const keywords = await processKeywordResearch(keyword, 3);
  res.send(keywords);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Pinteresting app listening on port ${port}!`));
