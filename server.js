// const request = require('request-promise-native');
const axios = require('axios');

function processKeywordResearch(keyword, maxLevels) {
  return new Promise(async (resolve, reject) => {
    const allLevelKeywords = [];

    function processArray(array, func, level, maxLevels) {
      return new Promise(async (resolve, reject) => {
        const arrayOfPromises = [];
        array.forEach((item) => {
          arrayOfPromises.push(func(item, level, maxLevels));
        });
        Promise.all(arrayOfPromises).then(() => {
          resolve('Done processing array');
        });
      });
    }

    async function getAllKeywordStrings(keyword) {
      const count = 20;

      const requestURL = `https://www.pinterest.co.uk/_ngjs/resource/AdvancedTypeaheadResource/get/?source_url=/&data={"options":{"count":5,"pin_scope":"pins","term":"${keyword}"},"context":{}}&_=${Date.now()}"`;

      let response = undefined;

      try {
        response = await axios(encodeURI(requestURL), {
          credentials: 'include',
          headers: {
            accept: 'application/json, text/javascript, */*, q=0.01', 'accept-language': 'de,pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7', 'cache-control': 'no-cache', pragma: 'no-cache', 'x-app-version': '69ec505', 'x-pinterest-appstate': 'active', 'x-requested-with': 'XMLHttpRequest',
          },
          referrer: 'https://www.pinterest.co.uk/',
          referrerPolicy: 'origin',
          body: null,
          method: 'GET',
          mode: 'cors',
        });
      } catch (error) {
        console.log(error);
      }
      const keywordItems = response.data.resource_response.data.items;
      const filteredKeywords = keywordItems.filter(keywordItem => keywordItem.type === 'query');
      const keywordStrings = filteredKeywords.map(keywordItem => keywordItem.label);

      const filteredKeywordStrings = keywordStrings.filter(keywordString => keywordString !== keyword);

      return filteredKeywordStrings;
    }

    async function getAllPinterestKeywords(keyword, level = 1, maxLevels = 3) {
      return new Promise(async (resolve, reject) => {
        if (level > maxLevels) {
          resolve(`Max level reached - ${maxLevels}`);
          return;
        }
        // remove the original keyword from the array

        const allKeywordStrings = await getAllKeywordStrings(keyword);

        allLevelKeywords.push(allKeywordStrings);

        await processArray(allKeywordStrings, getAllPinterestKeywords, level + 1, maxLevels);

        resolve(allLevelKeywords);
      });
    }

    const result = await getAllPinterestKeywords(keyword, 1, maxLevels);
    resolve(result);
  });
}


module.exports = processKeywordResearch;
