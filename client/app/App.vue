<template>
  <v-app id="application-wrapper">
    <v-form class="keyword-form">
      <v-text-field
        class="keyword-input"
        label="Keyword"
        placeholder="Type in your Pinterest keyword"
        v-model="keywordInput"
      ></v-text-field>
      <v-text-field
        label="Levels (How deep you want the keywords to go)"
        placeholder="Number of levels"
        v-model="numberOfLevels"
        type="number"
      ></v-text-field>
      <v-btn
        class="search-button"
        @click.prevent="getKeywords"
        :loading="isLoading"
        color="success"
        type="submit"
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
    numberOfLevels: 2,
    isLoading: false
  }),
  methods: {
    getKeywords() {
      this.isLoading = true;
      this.keywordData = null;
      const data = { keyword: this.keywordInput, levels: this.numberOfLevels };
      fetch("/getKeywords", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json"
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      }).then((response, error) => {
        response.json().then(jsonData => (this.keywordData = jsonData.flat()));
        this.isLoading = false;
      });
    },
    downloadCSV() {
      let data = this.keywordData;

      var csvContent = "";
      data.forEach(function(infoArray, index) {
        let dataString = infoArray.join(";");
        csvContent += index < data.length ? dataString + "\n" : dataString;
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


