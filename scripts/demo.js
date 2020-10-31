const RestClient = require("../lib").RestClient;

const client = new RestClient({
  graphName: "roam-js-extensions",
});

client
  .findOrCreateBlock({
    text: "testingerYo",
    parentUid: "10-ab-2020",
  })
  .then((b) => console.log("Done", b))
  .catch(e => console.error(e.response ? e.response.data.error : e.message));
