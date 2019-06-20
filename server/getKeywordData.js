const axios = require('axios');

function processAdvancedTypeaheadResponse(advancedTypeaheadResponse) {
  const keywordItems = advancedTypeaheadResponse.data.resource_response.data.items;
  const filteredKeywords = keywordItems.filter(keywordItem => keywordItem.type === 'query');
  const keywordStrings = filteredKeywords.map(keywordItem => keywordItem.label);
  return keywordStrings;
}
function processBaseSearchResponse(baseSearchResponse, baseKeyword) {
  const keywordItems = baseSearchResponse.data.resource_response.data.guides;
  if (keywordItems === null) return null;
  // add the root keyword to each of the words
  const keywordStrings = keywordItems.map(keywordItem => `${baseKeyword} ${keywordItem.term}`);
  return keywordStrings;
}

function fetchPinterestAPIResource(requestURL) {
  return new Promise((resolve, reject) => {
    try {
      axios(encodeURI(requestURL), {
        credentials: 'include',
        headers: {
          accept: 'application/json, text/javascript, */*, q=0.01', 'accept-language': 'de,en-US;q=0.8,en;q=0.7', 'cache-control': 'no-cache', pragma: 'no-cache', 'x-app-version': '69ec505', 'x-pinterest-appstate': 'active', 'x-requested-with': 'XMLHttpRequest',
        },
        referrer: 'https://www.pinterest.co.uk/',
        referrerPolicy: 'origin',
        body: null,
        method: 'GET',
        modea: 'cors',
      }).then((data) => {
        resolve(data);
      });
    } catch (error) {
      console.log({
        error,
        requestURL,
      });
      resolve(false);
    }
  });
}

function processKeywordResearch(keyword, maxLevels = 2) {
  return new Promise(async (resolve, reject) => {
    let allLevelKeywords = new Set();
    const searchedKeywords = new Set();

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

    function convertAccentedCharacters(str) {
      const conversions = new Object();
      conversions.ae = 'ä|æ|ǽ';
      conversions.oe = 'ö|œ';
      conversions.ue = 'ü';
      conversions.Ae = 'Ä';
      conversions.Ue = 'Ü';
      conversions.Oe = 'Ö';
      conversions.A = 'À|Á|Â|Ã|Ä|Å|Ǻ|Ā|Ă|Ą|Ǎ';
      conversions.a = 'à|á|â|ã|å|ǻ|ā|ă|ą|ǎ|ª';
      conversions.C = 'Ç|Ć|Ĉ|Ċ|Č';
      conversions.c = 'ç|ć|ĉ|ċ|č';
      conversions.D = 'Ð|Ď|Đ';
      conversions.d = 'ð|ď|đ';
      conversions.E = 'È|É|Ê|Ë|Ē|Ĕ|Ė|Ę|Ě';
      conversions.e = 'è|é|ê|ë|ē|ĕ|ė|ę|ě';
      conversions.G = 'Ĝ|Ğ|Ġ|Ģ';
      conversions.g = 'ĝ|ğ|ġ|ģ';
      conversions.H = 'Ĥ|Ħ';
      conversions.h = 'ĥ|ħ';
      conversions.I = 'Ì|Í|Î|Ï|Ĩ|Ī|Ĭ|Ǐ|Į|İ';
      conversions.i = 'ì|í|î|ï|ĩ|ī|ĭ|ǐ|į|ı';
      conversions.J = 'Ĵ';
      conversions.j = 'ĵ';
      conversions.K = 'Ķ';
      conversions.k = 'ķ';
      conversions.L = 'Ĺ|Ļ|Ľ|Ŀ|Ł';
      conversions.l = 'ĺ|ļ|ľ|ŀ|ł';
      conversions.N = 'Ñ|Ń|Ņ|Ň';
      conversions.n = 'ñ|ń|ņ|ň|ŉ';
      conversions.O = 'Ò|Ó|Ô|Õ|Ō|Ŏ|Ǒ|Ő|Ơ|Ø|Ǿ';
      conversions.o = 'ò|ó|ô|õ|ō|ŏ|ǒ|ő|ơ|ø|ǿ|º';
      conversions.R = 'Ŕ|Ŗ|Ř';
      conversions.r = 'ŕ|ŗ|ř';
      conversions.S = 'Ś|Ŝ|Ş|Š';
      conversions.s = 'ś|ŝ|ş|š|ſ';
      conversions.T = 'Ţ|Ť|Ŧ';
      conversions.t = 'ţ|ť|ŧ';
      conversions.U = 'Ù|Ú|Û|Ũ|Ū|Ŭ|Ů|Ű|Ų|Ư|Ǔ|Ǖ|Ǘ|Ǚ|Ǜ';
      conversions.u = 'ù|ú|û|ũ|ū|ŭ|ů|ű|ų|ư|ǔ|ǖ|ǘ|ǚ|ǜ';
      conversions.Y = 'Ý|Ÿ|Ŷ';
      conversions.y = 'ý|ÿ|ŷ';
      conversions.W = 'Ŵ';
      conversions.w = 'ŵ';
      conversions.Z = 'Ź|Ż|Ž';
      conversions.z = 'ź|ż|ž';
      conversions.AE = 'Æ|Ǽ';
      conversions.ss = 'ß';
      conversions.IJ = 'Ĳ';
      conversions.ij = 'ĳ';
      conversions.OE = 'Œ';
      conversions.f = 'ƒ';

      Object.keys(conversions).forEach((conversionKey) => {
        const re = new RegExp(conversions[conversionKey], 'g');
        str = str.replace(re, conversionKey);
      });

      return str;
    }
    function removeSpecials(str) {
      const lower = str.toLowerCase();
      const upper = str.toUpperCase();

      let res = '';
      for (let i = 0; i < lower.length; ++i) {
        if (lower[i] != upper[i] || lower[i].trim() === '') { res += str[i]; }
      }
      return res;
    }

    async function getAllKeywordStrings(keyword) {
      const sanitizedKeyword = removeSpecials(convertAccentedCharacters(keyword));

      // Skip the search if keyword was already searched for
      if (searchedKeywords.has(keyword) || searchedKeywords.has(sanitizedKeyword)) {
        return null;
      }


      const baseSearchRequestURL = `https://www.pinterest.de/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${sanitizedKeyword}&rs=typed&term_meta[]=${sanitizedKeyword}|typed&data={"options":{"query":"${sanitizedKeyword}","scope":"pins"},"context":{}}&_=${Date.now()}`;

      const advancedTypeaheadRequestURL = `https://www.pinterest.de/_ngjs/resource/AdvancedTypeaheadResource/get/?source_url=/&data={"options":{"count":5,"pin_scope":"pins","term":"${sanitizedKeyword}"}}&_=${Date.now()}"`;


      const baseSearchPromise = fetchPinterestAPIResource(baseSearchRequestURL);
      const advancedTypeaheadPromise = fetchPinterestAPIResource(advancedTypeaheadRequestURL);

      const [baseSearchResponse, advancedTypeaheadResponse] = await Promise.all([baseSearchPromise, advancedTypeaheadPromise]);

      const baseSearchKeywords = baseSearchResponse === false ? [] : processBaseSearchResponse(baseSearchResponse, keyword);
      const advancedTypeaheadKeywords = advancedTypeaheadResponse === false ? [] : processAdvancedTypeaheadResponse(advancedTypeaheadResponse);

      const keywordStrings = [].concat(...[baseSearchKeywords, advancedTypeaheadKeywords].filter(keywordArray => keywordArray !== null));

      searchedKeywords.add(keyword);

      return keywordStrings;
    }

    async function getAllPinterestKeywords(keyword, level = 1, maxLevels) {
      return new Promise(async (resolve, reject) => {
        if (level > maxLevels) {
          resolve(`Max level reached - ${maxLevels}`);
          return;
        }

        const allKeywordStrings = await getAllKeywordStrings(keyword);

        if (allKeywordStrings !== null) {
          allLevelKeywords = new Set([...allLevelKeywords, ...allKeywordStrings]);
          await processArray(allKeywordStrings, getAllPinterestKeywords, level + 1, maxLevels);
        }

        resolve(allLevelKeywords);
      });
    }

    const result = await getAllPinterestKeywords(keyword, 1, maxLevels);
    resolve(result);
  });
}

module.exports = processKeywordResearch;
