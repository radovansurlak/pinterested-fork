<template>
  <main class="application-main">
    <social-sharing
      url="https://pinterested-prototype.herokuapp.com"
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
    <v-app id="form-wrapper">
      <v-form class="keyword-form">
        <v-text-field
          class="keyword-input"
          label="Keyword"
          placeholder="Type in your Pinterest keyword"
          v-model="keywordInput"
        ></v-text-field>
        <v-select
          @change="clearData"
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
        >Get Keywords</v-btn>
      </v-form>
      <v-btn
        class="download-button"
        @click="downloadCSV"
        v-if="keywordData"
        color="success"
        type="submit"
      >Download as CSV</v-btn>
      <ul v-if="keywordData" class="keyword-list">
        <header class="keyword-header">
          <p>Keyword</p>
          <p v-if="selectedVersion === 1">Search Volume</p>
        </header>
        <template v-if="selectedVersion === 1">
          <li class="keyword-item" v-for="(keywordData, index) in keywordData" :key="index">
            <span class="keyword-title">{{keywordData.keyword}}</span>
            <span class="keyword-volume">{{keywordData.KEYWORD_QUERY_VOLUME}}</span>
          </li>
        </template>
        <template v-else-if="selectedVersion === 2">
          <li class="keyword-item" v-for="(keyword, index) in keywordData" :key="index">
            <span class="keyword-title">{{keyword}}</span>
          </li>
        </template>
      </ul>
    </v-app>
  </main>
</template>

<script>
import "babel-polyfill";

const { parse } = require("json2csv");

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
    keywordData: null,
    keywordInput: "",
    isLoading: false,
    selectedVersion: 1,
    countryVersions: [
      { name: "English (Advanced)", id: 1 },
      { name: "Global (Simple)", id: 2 }
    ]
  }),
  computed: {
    keywordInputIsEmpty() {
      return this.keywordInput.length === 0;
    }
  },
  methods: {
    clearData() {
      this.keywordData = null;
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
      const { keywordInput, selectedVersion, useOldKeywordAPI } = this;

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
      const flattenedData = parsedResponse.flat();
      const flattenedObjectData = flattenedData.map(flattenObject);
      this.keywordData = flattenedObjectData;
      this.isLoading = false;
    },
    downloadCSV() {
      let { keywordData } = this;

      const flattenedData = keywordData.map(flattenObject);

      const csvData = parse(flattenedData);
      console.log(csvData);

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
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#form-wrapper {
  border-radius: 5px;
  margin-top: 100px;
  margin-bottom: 20px;
  padding: 20px;
  font-family: Lato;
  max-width: 900px;
  text-align: center;
  & .application--wrap {
    min-height: auto;
  }
}

.social-sharing {
  display: inline-flex;
  justify-content: center;
  padding: 10px;
  background-color: rgb(250, 250, 250);
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.1);
}

.social-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  font-size: 40px;
  cursor: pointer;
  transition: all 250ms;
  &:hover {
    font-size: 50px;
  }
}

.social-network {
  outline: none;
}

.language-selector {
  max-width: 190px;
}

.keyword-form {
  display: flex;
  flex-wrap: wrap;
}

.v-btn.search-button,
.v-btn.download-button {
  font-weight: 600;
}

.v-btn.download-button {
  margin-bottom: 20px;
}

.keyword {
  &-header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    font-size: 17px;
  }
  &-item {
    display: flex;
    justify-content: space-between;

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
  }
}

.keyword-input {
  margin-right: 10px;
  min-width: 320px;
}
</style>


