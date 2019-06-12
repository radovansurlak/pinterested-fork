<template>
  <v-app id="application-wrapper">
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
    <v-form class="keyword-form">
      <v-text-field
        class="keyword-input"
        label="Keyword"
        placeholder="Type in your Pinterest keyword"
        v-model="keywordInput"
      ></v-text-field>
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
    <ul class="keyword-group" v-for="(keyword, index) in keywordData" :key="index">
      <li :key="keyword">{{keyword}}</li>
    </ul>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    keywordData: null,
    keywordInput: "",
    isLoading: false
  }),
  computed: {
    keywordInputIsEmpty() {
      return this.keywordInput.length === 0;
    }
  },
  methods: {
    getKeywords() {
      this.isLoading = true;
      this.keywordData = null;
      const data = { keyword: this.keywordInput, levels: this.numberOfLevels };
      fetch("/getKeywords", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        redirect: "follow",
        referrer: "no-referrer",
        body: JSON.stringify(data)
      }).then((response, error) => {
        response.json().then(jsonData => (this.keywordData = jsonData.flat()));
        this.isLoading = false;
      });
    },
    downloadCSV() {
      let data = this.keywordData;

      let csvContent = "";
      data.forEach(function(keyword, index) {
        csvContent += index < data.length ? keyword + "\n" : keyword;
      });

      // The download function takes a CSV string, the filename and mimeType as parameters
      // Scroll/look down at the bottom of this snippet to see how download is called
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
      download(csvContent, "keywords.csv", "text/csv;encoding:utf-8");
    }
  }
};
</script>

<style lang="scss">
#application-wrapper {
  border-radius: 5px;
  margin-top: 50px;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  width: 100%;
  padding: 20px;
  font-family: Lato;
  max-width: 900px;
  & .application--wrap {
    min-height: auto;
  }
}

.social-sharing {
  display: flex;
  height: 60px;
}

.social-icon {
  display: inline-block;
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

.keyword-group {
  display: block;
  list-style: none;
  padding: 10px 15px;
  margin-bottom: 10px;
  box-shadow: 0 10px 10px 0px rgba(0, 0, 0, 0.05);

  background-color: #fff;
  border-radius: 10px;
}

.keyword-input {
  margin-right: 10px;
}
</style>


