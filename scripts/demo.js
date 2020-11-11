require('dotenv').config();
const RestClient = require("../lib").RestClient;

const client = new RestClient({
  graphName: "roam-js-extensions",
});

client
  .findOrCreatePage("roam/js")
  .then((parentUid) =>
    client.findOrCreateBlock({
      text: "{{[[roam/js]]}}",
      parentUid,
    })
  )
  .then((parentUid) =>
    client.upsertBlock({
      text: "some code",
      uid: "roamjs-uid",
      parentUid,
    })
  )
  .then((b) => console.log("Done", b))
  .catch((e) => console.error(e.response ? e.response.data.error : e.message));
