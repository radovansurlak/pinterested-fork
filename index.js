const express = require('express');
const compression = require('compression');

const bodyParser = require('body-parser');

const processKeywordResearch = require('./server');

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

app.post('/getKeywords', async (req, res) => {
  const { keyword, levels } = req.body;
  const keywords = await processKeywordResearch(keyword, levels);
  res.send(keywords);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Pinteresting app listening on port ${port}!`));
