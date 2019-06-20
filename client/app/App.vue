<template>
  <main class="application-main">
    <social-sharing
      :url="shareURL"
      title="Awesome Pinterest Keyword Research tool"
      description="Keyword research tool that helps you find the best keyword ideas for Pinterest."
      quote="Keyword research tool that helps you find the best keyword ideas for Pinterest."
      hashtags="pinterest, marketing, keyword, research"
      twitter-user="pinterested"
      inline-template
    >
      <section class="social-sharing">
        <network class="social-network" network="facebook">
          <i class="social-icon icon-facebook"/>
        </network>
        <network class="social-network" network="linkedin">
          <i class="social-icon icon-linkedin"/>
        </network>
        <network class="social-network" network="reddit">
          <i class="social-icon icon-reddit"/>
        </network>
        <network class="social-network" network="pinterest">
          <i class="social-icon icon-pinterest-square"/>
        </network>
        <network class="social-network" network="twitter">
          <i class="social-icon icon-twitter"/>
        </network>
        <network class="social-network" network="whatsapp">
          <i class="social-icon icon-whatsapp"/>
        </network>
      </section>
    </social-sharing>
    <h1 class="app-headline">Pinterested</h1>
    <h2 class="app-subheadline">The ultimate Pinterest Keyword Research Tool</h2>
    <v-app id="form-wrapper">
      <v-form class="keyword-form">
        <v-text-field
          class="keyword-input"
          label="Keyword"
          placeholder="Type in your Pinterest keyword"
          v-model="keywordInput"
          append-icon="vpn_key"
          autofocus
        ></v-text-field>
        <v-select
          @change="clearKeywordData"
          class="language-selector"
          append-icon="language"
          v-model="selectedVersion"
          item-text="name"
          item-value="id"
          :items="countryVersions"
          label="Language"
        ></v-select>
        <v-btn
          class="search-button"
          @click.prevent="getKeywords"
          :loading="isLoading"
          color="success"
          type="submit"
          :disabled="keywordInputIsEmpty"
        >Get Keywords
      </v-form>
      <v-btn
        class="download-button"
        @click="downloadCSV"
        v-if="keywordData"
        color="success"
        type="submit"
      >
        Download as CSV
      </v-btn>
      <ul v-if="keywordData" class="keyword-list">
        <header class="keyword-header">
          <p class="header-label-keyword">Keyword</p>
          <template v-if="selectedVersion === 1">
            <p class="header-label-competition">Competition</p>
            <p class="header-label-search-volume">Search Volume</p>
          </template>
        </header>
        <template v-if="selectedVersion === 1">
          <li class="keyword-item keyword-item-grid" v-for="(keywordData, index) in keywordData" :key="index">
            <span class="keyword-title">{{keywordData.keyword}}</span>
            <span class="keyword-competition">{{keywordData.KEYWORD_COMPETITION_BAND}}</span>
            <span class="keyword-volume">{{keywordData.KEYWORD_QUERY_VOLUME}}</span>
          </li>
        </template>
        <template v-else-if="selectedVersion === 2">
          <li class="keyword-item" v-for="(keyword, index) in keywordData" :key="index">
            <span class="keyword-title">{{keyword}}</span>
          </li>
        </template>
      </ul>
      <template v-if="emptyResponse.isEmpty">
        <h3 class="no-response-message">Sorry, we received no suggestions for "{{emptyResponse.searchedKeyword}}"</h3>
      </template>
    </v-app>
  </main>
</template>

<script>
// Importing polyfill for async-await pattern
import "babel-polyfill";

const { parse: json2csv } = require("json2csv");

const flattenObject = obj =>
  Object.keys(obj).reduce((acc, k) => {
    if (typeof obj[k] === "object")
      Object.assign(acc, flattenObject(obj[k], k));
    else acc[k] = obj[k];
    return acc;
  }, {});

export default {
  name: "App",
  data: () => ({
    shareURL: window.location.origin,
    keywordData: null,
    keywordInput: "",
    isLoading: false,
    emptyResponse: {
      isEmpty: false,
      searchedKeyword: null
    },
    selectedVersion: 1,
    countryVersions: [
      { name: "English (Advanced)", id: 1 },
      { name: "Global", id: 2 }
    ]
  }),
  computed: {
    keywordInputIsEmpty() {
      return this.keywordInput.length === 0;
    }
  },
  methods: {
    clearKeywordData() {
      this.keywordData = null;
      this.emptyResponse.isEmpty = false;
      this.emptyResponse.searchedKeyword = null;
    },
    async useOldKeywordAPI() {
      const { keywordInput } = this;
      this.isLoading = true;

      const response = await fetch(`/analyse-global/${keywordInput}`, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      const parsedResponse = await response.json();
      const flattenedData = parsedResponse.flat();
      this.keywordData = flattenedData;
      this.isLoading = false;
    },
    async getKeywords() {
      const {
        keywordInput,
        selectedVersion,
        useOldKeywordAPI,
        clearKeywordData,
        handleEmptyResponse
      } = this;

      clearKeywordData();

      if (selectedVersion == 2) {
        // Using different API endpoint on Global version
        useOldKeywordAPI();
        return;
      }

      this.isLoading = true;

      const response = await fetch(`/analyse/${keywordInput}`, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      const parsedResponse = await response.json();

      if (parsedResponse === null) {
        handleEmptyResponse();
        return;
      }

      const flattenedData = parsedResponse.flat();
      const flattenedObjectData = flattenedData.map(flattenObject);
      this.keywordData = flattenedObjectData;
      this.isLoading = false;
      this.emptyResponse.isEmpty = false;
    },
    handleEmptyResponse() {
      const { keywordInput } = this;
      this.isLoading = false;
      this.emptyResponse.isEmpty = true;
      this.emptyResponse.searchedKeyword = keywordInput;
    },
    downloadCSV() {
      let { keywordData, selectedVersion } = this;

      let csvData = undefined;

      if (selectedVersion === 1) {
        keywordData = keywordData.map(flattenObject);
        csvData = json2csv(keywordData);
      } else if (selectedVersion === 2) {
        csvData = keywordData.join("\n");
      }

      var download = function(content, fileName, mimeType) {
        var a = document.createElement("a");
        mimeType = mimeType || "application/octet-stream";

        if (navigator.msSaveBlob) {
          // IE10
          navigator.msSaveBlob(
            new Blob([content], {
              type: mimeType
            }),
            fileName
          );
        } else if (URL && "download" in a) {
          //html5 A[download]
          a.href = URL.createObjectURL(
            new Blob([content], {
              type: mimeType
            })
          );
          a.setAttribute("download", fileName);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          location.href =
            "data:application/octet-stream," + encodeURIComponent(content); // only this mime type is supported
        }
      };
      download(csvData, "keywords.csv", "text/csv;encoding:utf-8");
    }
  }
};
</script>

<style lang="scss">
.application-main {
  padding: 0px 4px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-headline {
  margin-top: 120px;
  font-family: Montserrat, sans-serif;
  font-size: calc(40px + 1.5vw);
  color: #2f2f2f;
  font-weight: 800;
  text-shadow: 0px 5px 25px rgba(0,0,0,0.2);
}

.app-subheadline {
  margin-top: 20px;
  font-family: Montserrat, sans-serif;
  font-size: 30px;
  color: #2f2f2f;
  font-weight: 400  ;
  text-shadow: 0px 5px 25px rgba(0,0,0,0.2);
}

#form-wrapper {
  box-shadow: 0px 5px 25px rgba(0,0,0,0.3);
  border-radius: 5px;
  margin-top: 50px;
  margin-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 20px;
  padding-bottom: 10px;
  font-weight: 500;
  font-family: Montserrat;
  width: 92%;
  max-width: 900px;
  text-align: center;
  & .application--wrap {
    min-height: auto;
  }
}

.social-sharing {
  position: fixed;
  z-index: 1;
  display: inline-flex;
  justify-content: center;
  padding: 10px;
  background: rgba(255,255,255,1);
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.social-icon {
  $icon-size: 40px;
  display: flex;
  margin: 0 6px;
  justify-content: center;
  align-items: center;
  width: $icon-size;
  height: $icon-size;
  font-size: calc(#{$icon-size} - 10px);
  cursor: pointer;
  transition: all 250ms;
  &:hover {
    font-size: calc(#{$icon-size} + 10px);
  }
}

.social-network {
  outline: none;
}

.v-input {
  margin-left: 10px;
  margin-right: 10px;
  &.language-selector {
    flex-basis: 150px;
    white-space: nowrap;
  } 
  &.keyword-input {
    flex-basis: 260px;
  }
}


.keyword-form {
  display: flex;
  flex-wrap: wrap;
}

.v-btn {
  &.search-button,
  &.download-button {
    font-weight: 600;
  }
  &.search-button {
    flex-basis: 80px;
    flex-grow: 1;
    min-width: 135px;
  }
  &.download-button {
    margin-bottom: 20px;
  }
}

.keyword {
  &-header {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 10px;
    font-size: 17px;
  }
  &-item {
    &-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: center;
    }
    display: block;
    text-align: left;
    list-style: none;
    padding: 10px 15px;
    margin-bottom: 10px;
    box-shadow: 0 10px 10px 0px rgba(0, 0, 0, 0.05);

    background-color: #fff;
    border-radius: 10px;
  }
  &-list {
    padding-left: 0;
  }
  &-title {
    font-weight: 600;
    text-align: left;
  }
  &-competition {
    text-align: center;
  }
  &-volume {
    text-align: right;
  }
}


.header-label {
  &-keyword {
    text-align: left;
  }
  &-search-volume {
    text-align: right;
  }
}
.no-response-message {
  padding: 15px 0px;
}
</style>


