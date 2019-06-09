<template>
  <v-app id="application-wrapper">
    <v-form class="keyword-form">
      <v-text-field
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

    <ul class="keyword-group" v-for="(keywordGroup, index) in keywordData" :key="index">
      <li v-for="keyword in keywordGroup" :key="keyword">{{keyword}}</li>
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
      fetch("http://localhost:3000/getKeywords", {
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
        response.json().then(jsonData => (this.keywordData = jsonData));
        this.isLoading = false;
      });
    }
  }
};
</script>

<style lang="scss">
#application-wrapper {
  border-radius: 5px;
  margin: 20px auto 0 auto;
  padding: 20px;
  font-family: Lato;
  max-width: 900px;
  & .application--wrap {
    min-height: auto;
  }
}

.keyword-form {
  display: flex;
}

.v-btn.search-button {
  font-weight: 600;
}

.keyword-group {
  display: block;
  list-style: none;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 10px 10px 0px rgba(0, 0, 0, 0.05);

  background-color: #fff;
  border-radius: 10px;
}
</style>


