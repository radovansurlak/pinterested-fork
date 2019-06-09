const request = require('request-promise-native');

function processKeywordResearch(keyword, maxLevels) {
  return new Promise(async (resolve, reject) => {
    const allLevelKeywords = [];

    async function processArray(array, func, level, maxLevels) {
      return new Promise(async (resolve, reject) => {
        for (const item of array) {
          await func(item, level, maxLevels);
        }
        resolve('Done processing array');
      });
    }

    async function getAllKeywordStrings(keyword) {
      const count = 20;

      const response = await request(`https://sk.pinterest.com/_ngjs/resource/AdvancedTypeaheadResource/get/?source_url=%2F&data=%7B%22options%22%3A%7B%22count%22%3A${count}%2C%22term%22%3A%22${encodeURI(keyword)}%22%7D%2C%22context%22%3A%7B%7D%7D&_=1560072372706`, {
        credentials: 'include',
        headers: {
          accept: 'application/json, text/javascript, */*, q=0.01',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'x-app-version': '4f67d66',
          'x-pinterest-appstate': 'active',
          'x-requested-with': 'XMLHttpRequest',
        },
        body: null,
        method: 'GET',
        mode: 'cors',
      });
      const parsedResponse = JSON.parse(response);
      const keywordItems = parsedResponse.resource_response.data.items;
      const filteredKeywords = keywordItems.filter(keyword => keyword.type === 'query');
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
